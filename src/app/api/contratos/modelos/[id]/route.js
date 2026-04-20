import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { excluirModelo, gerarUrlDownloadModelo } from "@/lib/services/contratoService";

/** GET /api/contratos/modelos/[id] – URL assinada para download/visualização */
export async function GET(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const result = await gerarUrlDownloadModelo(supabase, params.id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}

/** DELETE /api/contratos/modelos/[id] – remove modelo */
export async function DELETE(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    await excluirModelo(supabase, params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
