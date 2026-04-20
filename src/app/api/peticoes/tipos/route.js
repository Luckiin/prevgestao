import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { listarTiposPeticao, criarTipoPeticao } from "@/lib/services/peticaoService";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const data = await listarTiposPeticao(supabase);
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

    const { nome } = await request.json();
    if (!nome?.trim()) return NextResponse.json({ erro: "Nome é obrigatório" }, { status: 400 });

    const data = await criarTipoPeticao(supabase, { nome: nome.trim() });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
