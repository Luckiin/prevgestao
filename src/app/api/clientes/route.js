import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { listarClientes, criarCliente } from "@/lib/services/clienteService";

export async function GET(request) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);

    const resultado = await listarClientes(supabase, {
      status:         searchParams.get("status")         || undefined,
      tipo_processo:  searchParams.get("tipo_processo")  || undefined,
      subdivisao_id:  searchParams.get("subdivisao_id")  || undefined,
      ano_referencia: searchParams.get("ano_referencia") || undefined,
      busca:          searchParams.get("busca")          || undefined,
      limit:          Number(searchParams.get("limit"))  || 50,
      offset:         Number(searchParams.get("offset")) || 0,
    });

    return NextResponse.json(resultado);
  } catch (err) {
    console.error("[GET /api/clientes]", err.message);
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const payload = await request.json();
    const data = await criarCliente(
      supabase,
      payload,
      user.email,
      user.user_metadata?.nome || user.email
    );

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[POST /api/clientes]", err.message);
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}
