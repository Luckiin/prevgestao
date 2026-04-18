import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { atualizarPrazo, excluirPrazo } from "@/lib/services/prazoService";

export async function PUT(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const payload = await request.json();
    const data = await atualizarPrazo(supabase, id, payload, user.email, user.user_metadata?.nome || user.email);

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    await excluirPrazo(supabase, id, user.email, user.user_metadata?.nome || user.email);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}
