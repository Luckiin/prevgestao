import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { listarTodosPrazos, criarPrazo } from "@/lib/services/prazoService";

export async function GET(request) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);

    const concluidoParam = searchParams.get("concluido");
    const data = await listarTodosPrazos(supabase, {
      concluido: concluidoParam !== null ? concluidoParam === "true" : undefined,
      dias_ate:  searchParams.get("dias_ate") || undefined,
      limit:     Number(searchParams.get("limit")) || 100,
    });

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
    const data = await criarPrazo(
      supabase,
      payload,
      user.email,
      user.user_metadata?.nome || user.email
    );

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}
