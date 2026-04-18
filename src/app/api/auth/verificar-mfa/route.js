import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-server";
import { loginEtapa2, COOKIE_OPTS } from "@/lib/services/authService";

export async function POST(request) {
  try {
    const { factor_id, challenge_id, codigo } = await request.json();

    if (!factor_id || !challenge_id || !codigo) {
      return NextResponse.json({ erro: "Dados incompletos" }, { status: 400 });
    }

    const cookies  = [];
    const supabase = createRouteClient(request, cookies);

    const resultado = await loginEtapa2(supabase, factor_id, challenge_id, codigo);

    const response = NextResponse.json(resultado);

    cookies.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, { ...options, ...COOKIE_OPTS })
    );

    return response;
  } catch (err) {
    console.error("[POST /api/auth/verificar-mfa]", err.message);
    return NextResponse.json({ erro: err.message }, { status: 401 });
  }
}
