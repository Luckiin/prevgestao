import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function PUT(request, { params }) {
  try {
    const supabase = await createServerClient();
    const payload  = await request.json();
    
    // 1. Atualizar o lançamento
    const { data: lancamento, error: errorLanc } = await supabase
      .from("lancamentos")
      .update(payload)
      .eq("id", params.id)
      .select("*, categorias_financeiras(id,nome,cor), contas(id,nome)")
      .single();
    
    if (errorLanc) throw errorLanc;

    // 2. Sincronizar com movimentacoes
    // Removemos qualquer movimentação anterior vinculada a este lançamento para evitar duplicidade ou dados obsoletos
    await supabase.from("movimentacoes").delete().eq("lancamento_id", params.id);

    // Se o status for pago, criamos uma nova movimentação com os dados atualizados
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
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = await createServerClient();

    // 1. Remover movimentações vinculadas
    await supabase.from("movimentacoes").delete().eq("lancamento_id", params.id);

    // 2. Remover o lançamento
    const { error } = await supabase.from("lancamentos").delete().eq("id", params.id);
    
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}
