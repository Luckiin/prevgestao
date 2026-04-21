import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { listarTodosPrazos, criarPrazo } from "@/lib/services/prazoService";

export async function GET(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);

    const concluidoParam = searchParams.get("concluido");
    const data = await listarTodosPrazos(supabase, {
      concluido: concluidoParam !== null ? concluidoParam === "true" : undefined,
      dias_ate:  searchParams.get("dias_ate") || undefined,
      limit:     Math.min(Number(searchParams.get("limit")) || 100, 1000),
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/prazos]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro ao buscar prazos" : err.message;
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const payload = await request.json();

    if (!payload.descricao || !payload.data_vencimento) {
      return NextResponse.json({ erro: "Descrição e vencimento são obrigatórios" }, { status: 400 });
    }

    const data = await criarPrazo(
      supabase,
      payload,
      user.email,
      user.user_metadata?.nome || user.email
    );

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[POST /api/prazos]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro ao criar prazo" : err.message;
    return NextResponse.json({ erro: msg }, { status: 400 });
  }
}
