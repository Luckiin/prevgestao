import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { listarClientes, criarCliente } from "@/lib/services/clienteService";

export async function GET(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);

    const resultado = await listarClientes(supabase, {
      status:         searchParams.get("status")         || undefined,
      tipo_processo:  searchParams.get("tipo_processo")  || undefined,
      situacao:       searchParams.get("situacao")       || undefined,
      subdivisao_id:  searchParams.get("subdivisao_id")  || undefined,
      subdivisao_nome: searchParams.get("subdivisao_nome") || undefined,
      ano_referencia: searchParams.get("ano_referencia") || undefined,
      busca:          searchParams.get("busca")          || undefined,
      limit:          Math.min(Number(searchParams.get("limit")) || 50, 500),
      offset:         Number(searchParams.get("offset")) || 0,
    });

    return NextResponse.json(resultado);
  } catch (err) {
    console.error("[GET /api/clientes]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro ao buscar clientes" : err.message;
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const payload = await request.json();


    if (!payload.nome) {
      return NextResponse.json({ erro: "Nome do cliente é obrigatório" }, { status: 400 });
    }

    const data = await criarCliente(
      supabase,
      payload,
      user.email,
      user.user_metadata?.nome || user.email
    );

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[POST /api/clientes]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro ao criar cliente" : err.message;
    return NextResponse.json({ erro: msg }, { status: 400 });
  }
}
