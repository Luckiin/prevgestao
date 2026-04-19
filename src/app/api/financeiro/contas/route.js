import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.from("contas").select("*").eq("ativo", true).order("nome");
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const payload  = await request.json();
    const { data, error } = await supabase.from("contas").insert({ ...payload, saldo_atual: payload.saldo_inicial || 0 }).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}
