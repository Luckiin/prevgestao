import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { listarModelos, registrarModelo } from "@/lib/services/contratoService";

/** GET /api/contratos/modelos – lista todos os modelos */
export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const data = await listarModelos(supabase);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}

/** POST /api/contratos/modelos – registra modelo após upload */
export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const payload = await request.json();
    const data = await registrarModelo(supabase, payload);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
