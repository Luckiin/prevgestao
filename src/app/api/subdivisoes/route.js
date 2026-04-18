import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { listarSubdivisoes, criarSubdivisao } from "@/lib/services/subdivisaoService";

export async function GET(request) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const data = await listarSubdivisoes(supabase, searchParams.get("tipo") || undefined);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const payload = await request.json();
    const data = await criarSubdivisao(supabase, payload, user.email, user.user_metadata?.nome || user.email);

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}
