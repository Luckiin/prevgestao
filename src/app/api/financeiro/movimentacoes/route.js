import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(request) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const conta_id   = searchParams.get("conta_id");
    const data_inicio = searchParams.get("data_inicio");
    const data_fim    = searchParams.get("data_fim");
    const limit       = Number(searchParams.get("limit")) || 200;

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
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const payload  = await request.json();
    const { data, error } = await supabase.from("movimentacoes").insert(payload).select("*, contas(id,nome)").single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const lancamento_id = searchParams.get("lancamento_id");

    let query = supabase.from("movimentacoes").delete();
    if (id) query = query.eq("id", id);
    if (lancamento_id) query = query.eq("lancamento_id", lancamento_id);

    const { error } = await query;
    if (error) throw error;
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}
