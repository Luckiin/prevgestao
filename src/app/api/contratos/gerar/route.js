import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { gerarDocx } from "@/lib/services/contratoService";


export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { cliente_id, tipo_acao, tipo_doc } = await request.json();
    if (!cliente_id || !tipo_acao || !tipo_doc) {
      return NextResponse.json({ erro: "cliente_id, tipo_acao e tipo_doc são obrigatórios" }, { status: 400 });
    }

    const { buffer, nomeArquivo } = await gerarDocx(supabase, cliente_id, tipo_acao, tipo_doc);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(nomeArquivo)}`,
      },
    });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
