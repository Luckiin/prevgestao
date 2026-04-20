import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { gerarUrlUploadModelo } from "@/lib/services/contratoService";

/** POST /api/contratos/modelos/upload-url – URL assinada para upload de modelo */
export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { tipo_acao, tipo_doc, nome_arquivo } = await request.json();
    if (!tipo_acao || !tipo_doc || !nome_arquivo) {
      return NextResponse.json({ erro: "tipo_acao, tipo_doc e nome_arquivo são obrigatórios" }, { status: 400 });
    }

    const result = await gerarUrlUploadModelo(supabase, tipo_acao, tipo_doc, nome_arquivo);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
