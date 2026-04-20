import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { atualizarTipoAcao, excluirTipoAcao } from "@/lib/services/contratoService";

export async function PUT(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const data = await atualizarTipoAcao(supabase, params.id, body);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    await excluirTipoAcao(supabase, params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
