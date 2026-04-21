import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(request) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const tipo    = searchParams.get("tipo");
    const status  = searchParams.get("status");
    const mes     = searchParams.get("mes"); // YYYY-MM
    const limit   = Number(searchParams.get("limit")) || 100;
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
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const payload = await request.json();
    
    // 1. Criar o lançamento
    const { data: lancamento, error: errorLanc } = await supabase
      .from("lancamentos")
      .insert(payload)
      .select("*, categorias_financeiras(id,nome,cor), contas(id,nome)")
      .single();
    
    if (errorLanc) throw errorLanc;

    // 2. Se estiver pago, criar a movimentação
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

    return NextResponse.json(lancamento, { status: 201 });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}
