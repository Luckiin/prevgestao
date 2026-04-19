import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(request) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");
    let query = supabase.from("categorias_financeiras").select("*").eq("ativo", true).order("nome");
    if (tipo) query = query.eq("tipo", tipo);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
