import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function PUT(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const body = await request.json();

    // Payload sanitizado — apenas campos permitidos
    const { descricao, valor, tipo, status, data_vencimento, conta_id, cliente_id, categoria_id, data_pagamento, valor_pago, recorrente, parcelas, observacoes } = body;

    const payload = {
      ...(descricao       !== undefined && { descricao: String(descricao).trim() }),
      ...(valor           !== undefined && { valor }),
      ...(tipo            !== undefined && { tipo }),
      ...(status          !== undefined && { status }),
      ...(data_vencimento !== undefined && { data_vencimento }),
      ...(conta_id        !== undefined && { conta_id }),
      ...(cliente_id      !== undefined && { cliente_id }),
      ...(categoria_id    !== undefined && { categoria_id }),
      ...(data_pagamento  !== undefined && { data_pagamento }),
      ...(valor_pago      !== undefined && { valor_pago }),
      ...(recorrente      !== undefined && { recorrente }),
      ...(parcelas        !== undefined && { parcelas }),
      ...(observacoes     !== undefined && { observacoes: String(observacoes).slice(0, 2000) }),
    };

    // Validações básicas
    if (payload.tipo   && !["receita", "despesa"].includes(payload.tipo))
      return NextResponse.json({ erro: "Tipo inválido" }, { status: 400 });
    if (payload.status && !["pendente", "pago", "cancelado"].includes(payload.status))
      return NextResponse.json({ erro: "Status inválido" }, { status: 400 });
    if (payload.valor !== undefined && (typeof payload.valor !== "number" || payload.valor <= 0))
      return NextResponse.json({ erro: "Valor inválido" }, { status: 400 });

    // 1. Atualizar o lançamento
    const { data: lancamento, error: errorLanc } = await supabase
      .from("lancamentos")
      .update(payload)
      .eq("id", params.id)
      .select("*, categorias_financeiras(id,nome,cor), contas(id,nome)")
      .single();

    if (errorLanc) throw errorLanc;

    // 2. Sincronizar com movimentacoes
    await supabase.from("movimentacoes").delete().eq("lancamento_id", params.id);

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
      if (errorMov) console.error("Erro ao sincronizar movimentação automática:", errorMov);
    }

    return NextResponse.json(lancamento);
  } catch (err) {
    console.error("[PUT /api/financeiro/lancamentos/[id]]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro interno ao atualizar lançamento" : err.message;
    return NextResponse.json({ erro: msg }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    // 1. Remover movimentações vinculadas
    await supabase.from("movimentacoes").delete().eq("lancamento_id", params.id);

    // 2. Remover o lançamento
    const { error } = await supabase.from("lancamentos").delete().eq("id", params.id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/financeiro/lancamentos/[id]]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro interno ao excluir lançamento" : err.message;
    return NextResponse.json({ erro: msg }, { status: 400 });
  }
}
