import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { registrarAuditoria } from "@/lib/services/auditService";

export async function GET(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const tipo    = searchParams.get("tipo");
    const status  = searchParams.get("status");
    const mes     = searchParams.get("mes");
    const limit   = Math.min(Number(searchParams.get("limit")) || 100, 2000);
    const offset  = Number(searchParams.get("offset")) || 0;

    let query = supabase
      .from("lancamentos")
      .select("*, categorias_financeiras(id,nome,cor), contas(id,nome), clientes(id,nome)", { count: "exact" })
      .order("data_vencimento", { ascending: true })
      .range(offset, offset + limit - 1);

    if (tipo)   query = query.eq("tipo", tipo);
    if (status) query = query.eq("status", status);
    if (mes) {
      const [ano, m] = mes.split("-");
      const fim = new Date(Number(ano), Number(m), 0).toISOString().split("T")[0];
      query = query.gte("data_vencimento", `${mes}-01`).lte("data_vencimento", fim);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return NextResponse.json({ data, total: count });
  } catch (err) {
    console.error("[GET /api/financeiro/lancamentos]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro interno ao buscar lançamentos" : err.message;
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const body = await request.json();


    const { descricao, valor, tipo, status, data_vencimento, conta_id, cliente_id, categoria_id, data_pagamento, valor_pago, recorrente, parcelas, observacoes } = body;

    if (!descricao || typeof descricao !== "string" || descricao.trim().length === 0)
      return NextResponse.json({ erro: "Descrição obrigatória" }, { status: 400 });
    if (typeof valor !== "number" || valor <= 0)
      return NextResponse.json({ erro: "Valor inválido" }, { status: 400 });
    if (!["receita", "despesa"].includes(tipo))
      return NextResponse.json({ erro: "Tipo inválido" }, { status: 400 });
    if (!["pendente", "pago", "cancelado"].includes(status))
      return NextResponse.json({ erro: "Status inválido" }, { status: 400 });
    if (!data_vencimento)
      return NextResponse.json({ erro: "Data de vencimento obrigatória" }, { status: 400 });


    const payload = {
      descricao: descricao.trim(),
      valor,
      tipo,
      status,
      data_vencimento,
      ...(conta_id        && { conta_id }),
      ...(cliente_id      && { cliente_id }),
      ...(categoria_id    && { categoria_id }),
      ...(data_pagamento  && { data_pagamento }),
      ...(valor_pago      && { valor_pago }),
      ...(recorrente !== undefined && { recorrente }),
      ...(parcelas        && { parcelas }),
      ...(observacoes     && { observacoes: String(observacoes).slice(0, 2000) }),
    };


    const { data: lancamento, error: errorLanc } = await supabase
      .from("lancamentos")
      .insert(payload)
      .select("*, categorias_financeiras(id,nome,cor), contas(id,nome)")
      .single();

    if (errorLanc) throw errorLanc;


    if (lancamento.status === "pago") {
      const { error: errorMov } = await supabase.from("movimentacoes").insert({
        lancamento_id:  lancamento.id,
        conta_id:       lancamento.conta_id || "00000000-0000-0000-0000-000000000001",
        data_movimento: lancamento.data_pagamento || lancamento.data_vencimento,
        descricao:      lancamento.descricao,
        valor:          lancamento.valor_pago || lancamento.valor,
        tipo:           lancamento.tipo === "receita" ? "entrada" : "saida",
        conciliado:     false
      });
      if (errorMov) console.error("Erro ao criar movimentação automática:", errorMov);
    }

    await registrarAuditoria({
      tabela:        "lancamentos",
      registro_id:   lancamento.id,
      acao:          "INSERT",
      dados_novos:   {
        descricao: lancamento.descricao,
        valor:     lancamento.valor,
        tipo:      lancamento.tipo,
        status:    lancamento.status
      },
      usuario_email: user.email,
      usuario_nome:  user.user_metadata?.nome || user.email
    });

    return NextResponse.json(lancamento, { status: 201 });
  } catch (err) {
    console.error("[POST /api/financeiro/lancamentos]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro interno ao criar lançamento" : err.message;
    return NextResponse.json({ erro: msg }, { status: 400 });
  }
}
