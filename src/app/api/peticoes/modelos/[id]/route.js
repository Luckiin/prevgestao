import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { gerarUrlDownloadModeloPeticao, excluirModeloPeticao } from "@/lib/services/peticaoService";

export async function GET(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const result = await gerarUrlDownloadModeloPeticao(supabase, params.id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    await excluirModeloPeticao(supabase, params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
