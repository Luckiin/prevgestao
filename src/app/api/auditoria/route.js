import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { buscarAuditoria } from "@/lib/services/auditService";

export async function GET(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);

    const data = await buscarAuditoria({
      tabela:        searchParams.get("tabela")        || undefined,
      registro_id:   searchParams.get("registro_id")   || undefined,
      entidade_id:   searchParams.get("entidade_id")   || undefined,
      usuario_email: searchParams.get("usuario_email") || undefined,
      limit:         Math.min(Number(searchParams.get("limit")) || 100, 1000),
      offset:        Number(searchParams.get("offset")) || 0,
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/auditoria]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro ao buscar logs de auditoria" : err.message;
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
