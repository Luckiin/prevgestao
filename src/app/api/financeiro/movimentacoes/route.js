import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const conta_id   = searchParams.get("conta_id");
    const data_inicio = searchParams.get("data_inicio");
    const data_fim    = searchParams.get("data_fim");
    const limit       = Math.min(Number(searchParams.get("limit")) || 1000, 5000);

    let query = supabase
      .from("movimentacoes")
      .select("*, contas(id,nome)")
      .order("data_movimento", { ascending: false })
      .limit(limit);

    if (conta_id)    query = query.eq("conta_id", conta_id);
    if (data_inicio) query = query.gte("data_movimento", data_inicio);
    if (data_fim)    query = query.lte("data_movimento", data_fim);

    const { data, error, count } = await query;
    if (error) throw error;
    return NextResponse.json({ data, total: count });
  } catch (err) {
    console.error("[GET /api/financeiro/movimentacoes]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro interno ao buscar movimentações" : err.message;
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const payload  = await request.json();
    
    // Validação básica de campos
    if (!payload.conta_id || !payload.valor || !payload.tipo || !payload.data_movimento) {
      return NextResponse.json({ erro: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("movimentacoes")
      .insert({
        conta_id:       payload.conta_id,
        lancamento_id:  payload.lancamento_id || null,
        data_movimento: payload.data_movimento,
        descricao:      payload.descricao?.trim() || "Sem descrição",
        valor:          payload.valor,
        tipo:           payload.tipo,
        conciliado:     !!payload.conciliado
      })
      .select("*, contas(id,nome)")
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[POST /api/financeiro/movimentacoes]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro interno ao criar movimentação" : err.message;
    return NextResponse.json({ erro: msg }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const lancamento_id = searchParams.get("lancamento_id");

    // Segurança Crítica: Bloquear DELETE sem filtro
    if (!id && !lancamento_id) {
      return NextResponse.json({ erro: "ID ou Lancamento ID é obrigatório para exclusão" }, { status: 400 });
    }

    let query = supabase.from("movimentacoes").delete();
    if (id) query = query.eq("id", id);
    if (lancamento_id) query = query.eq("lancamento_id", lancamento_id);

    const { error } = await query;
    if (error) throw error;
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("[DELETE /api/financeiro/movimentacoes]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro interno ao excluir movimentação" : err.message;
    return NextResponse.json({ erro: msg }, { status: 400 });
  }
}
