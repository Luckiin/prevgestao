import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function PUT(request, { params }) {
  try {
    const supabase = await createServerClient();
    const payload  = await request.json();
    const { data, error } = await supabase
      .from("lancamentos").update(payload).eq("id", params.id)
      .select("*, categorias_financeiras(id,nome,cor), contas(id,nome)").single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.from("lancamentos").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}
