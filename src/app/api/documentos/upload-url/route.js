import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { gerarUrlUpload } from "@/lib/services/documentoService";

/** POST /api/documentos/upload-url – gera URL assinada para upload direto */
export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { cliente_id, nome_arquivo } = await request.json();
    if (!cliente_id || !nome_arquivo) {
      return NextResponse.json({ erro: "cliente_id e nome_arquivo obrigatórios" }, { status: 400 });
    }

    const result = await gerarUrlUpload(supabase, cliente_id, nome_arquivo);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
