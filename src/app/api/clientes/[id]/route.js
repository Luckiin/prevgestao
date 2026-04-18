import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import {
  buscarCliente,
  atualizarCliente,
  excluirCliente,
  buscarHistoricoAnual,
} from "@/lib/services/clienteService";

export async function GET(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { id } = await params;

    const { searchParams } = new URL(request.url);

    if (searchParams.get("historico") === "1") {
      const data = await buscarHistoricoAnual(supabase, id);
      return NextResponse.json(data);
    }

    const data = await buscarCliente(supabase, id);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/clientes/[id]]", err.message);
    return NextResponse.json({ erro: err.message }, { status: 404 });
  }
}

export async function PUT(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const payload = await request.json();

    const data = await atualizarCliente(
      supabase,
      id,
      payload,
      user.email,
      user.user_metadata?.nome || user.email
    );

    return NextResponse.json(data);
  } catch (err) {
    console.error("[PUT /api/clientes/[id]]", err.message);
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    await excluirCliente(
      supabase,
      id,
      user.email,
      user.user_metadata?.nome || user.email
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/clientes/[id]]", err.message);
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}
