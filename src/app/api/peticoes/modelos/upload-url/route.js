import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { gerarUrlUploadModeloPeticao } from "@/lib/services/peticaoService";

export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { tipo_peticao, nome_arquivo } = await request.json();
    if (!tipo_peticao || !nome_arquivo)
      return NextResponse.json({ erro: "Campos obrigatórios ausentes" }, { status: 400 });

    const result = await gerarUrlUploadModeloPeticao(supabase, tipo_peticao, nome_arquivo);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
