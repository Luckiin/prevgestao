import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { listarModelosPeticao, registrarModeloPeticao } from "@/lib/services/peticaoService";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const data = await listarModelosPeticao(supabase);
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

    const { tipo_peticao, nome, storage_path } = await request.json();
    if (!tipo_peticao || !nome || !storage_path)
      return NextResponse.json({ erro: "Campos obrigatórios ausentes" }, { status: 400 });

    const data = await registrarModeloPeticao(supabase, { tipo_peticao, nome, storage_path });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
