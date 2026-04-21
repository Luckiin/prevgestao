import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { estatisticasDashboard, resumoAnual, clientesPorAno, prazosProximos } from "@/lib/services/relatorioService";

export async function GET(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo") || "dashboard";

    let data;
    switch (tipo) {
      case "dashboard":
        data = await estatisticasDashboard(supabase);
        break;
      case "anual":
        data = await resumoAnual(supabase);
        break;
      case "por-ano":
        data = await clientesPorAno(supabase, Number(searchParams.get("ano")), {
          limit:  Math.min(Number(searchParams.get("limit")) || 200, 1000),
          offset: Number(searchParams.get("offset")) || 0,
          busca:  searchParams.get("busca") || undefined,
        });
        break;
      case "prazos":
        data = await prazosProximos(supabase, Number(searchParams.get("dias")) || 30);
        break;
      default:
        return NextResponse.json({ erro: "Tipo de relatório inválido" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/relatorios]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro ao gerar relatório" : err.message;
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
