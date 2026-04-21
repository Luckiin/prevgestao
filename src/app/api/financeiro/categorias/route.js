import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");

    let query = supabase.from("categorias_financeiras").select("*").eq("ativo", true).order("nome");
    if (tipo) query = query.eq("tipo", tipo);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/financeiro/categorias]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro ao buscar categorias" : err.message;
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
