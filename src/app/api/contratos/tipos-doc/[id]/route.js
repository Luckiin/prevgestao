import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { atualizarTipoDoc, excluirTipoDoc } from "@/lib/services/contratoService";

export async function PUT(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const campos = await request.json();

    const data = await atualizarTipoDoc(supabase, id, campos);
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

    const { id } = await params;
    await excluirTipoDoc(supabase, id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}
