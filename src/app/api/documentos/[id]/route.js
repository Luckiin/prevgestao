import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { excluirDocumento, gerarUrlDownload } from "@/lib/services/documentoService";

export async function GET(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { id } = await params;

    const { data: doc } = await supabase
      .from("documentos")
      .select("storage_path")
      .eq("id", id)
      .single();

    if (!doc) return NextResponse.json({ erro: "Documento não encontrado" }, { status: 404 });

    const url = await gerarUrlDownload(supabase, doc.storage_path);
    return NextResponse.json({ url });
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
    await excluirDocumento(supabase, id, user.email, user.user_metadata?.nome || user.email);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}
