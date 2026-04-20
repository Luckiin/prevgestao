import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { gerarPeticao } from "@/lib/services/peticaoService";

export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { cliente_id, tipo_peticao } = await request.json();
    if (!cliente_id || !tipo_peticao)
      return NextResponse.json({ erro: "Campos obrigatórios ausentes" }, { status: 400 });

    const { buffer, nomeArquivo } = await gerarPeticao(supabase, cliente_id, tipo_peticao);

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
