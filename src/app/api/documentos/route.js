import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { registrarDocumento, gerarUrlUpload } from "@/lib/services/documentoService";

/** GET /api/documentos?cliente_id=xxx&pasta=xxx */
export async function GET(request) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get("cliente_id");

    if (!clienteId) return NextResponse.json({ erro: "cliente_id obrigatório" }, { status: 400 });

    const { data, error } = await supabase
      .from("documentos")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("criado_em", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}

/** POST /api/documentos – registra no banco após upload */
export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const payload = await request.json();
    const data = await registrarDocumento(supabase, payload, user.email, user.user_metadata?.nome || user.email);

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}
