import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import {
  listarDocumentosFinanceiro,
  gerarUrlUploadFinanceiro,
  registrarDocumentoFinanceiro,
  excluirDocumentoFinanceiro,
} from "@/lib/services/financeiroDocumentoService";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const data = await listarDocumentosFinanceiro(supabase, id);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const body = await request.json();

    if (body.action === "upload_url") {
      const data = await gerarUrlUploadFinanceiro(supabase, id, body.nome);
      return NextResponse.json(data);
    }

    const data = await registrarDocumentoFinanceiro(
      supabase,
      { ...body, lancamento_id: id },
      user.email,
      user.user_metadata?.nome || user.email
    );

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get("docId");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    await excluirDocumentoFinanceiro(
      supabase,
      docId,
      user.email,
      user.user_metadata?.nome || user.email
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}
