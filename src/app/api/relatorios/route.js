import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { estatisticasDashboard, resumoAnual, clientesPorAno, prazosProximos } from "@/lib/services/relatorioService";

export async function GET(request) {
  try {
    const supabase = await createServerClient();
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
          limit:  Number(searchParams.get("limit"))  || 200,
          offset: Number(searchParams.get("offset")) || 0,
          busca:  searchParams.get("busca") || undefined,
        });
        break;
      case "prazos":
        data = await prazosProximos(supabase, Number(searchParams.get("dias")) || 30);
        break;
      default:
        return NextResponse.json({ erro: "Tipo inválido" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/relatorios]", err.message);
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
