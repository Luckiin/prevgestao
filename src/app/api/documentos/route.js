import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { registrarDocumento, gerarUrlUpload } from "@/lib/services/documentoService";

export async function GET(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

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
    console.error("[GET /api/documentos]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro ao buscar documentos" : err.message;
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const payload = await request.json();
    
    if (!payload.cliente_id || !payload.nome_arquivo) {
      return NextResponse.json({ erro: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const data = await registrarDocumento(supabase, payload, user.email, user.user_metadata?.nome || user.email);

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[POST /api/documentos]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro ao registrar documento" : err.message;
    return NextResponse.json({ erro: msg }, { status: 400 });
  }
}
