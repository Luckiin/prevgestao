import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-server";
import { loginEtapa1, COOKIE_OPTS } from "@/lib/services/authService";

export async function POST(request) {
  try {
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json({ erro: "E-mail e senha são obrigatórios" }, { status: 400 });
    }

    const cookies = [];
    const supabase = createRouteClient(request, cookies);

    const resultado = await loginEtapa1(supabase, email, senha);

    const response = NextResponse.json(resultado);


    cookies.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, { ...options, ...COOKIE_OPTS })
    );

    return response;
  } catch (err) {
    console.error("[POST /api/auth/login]", err.message);
    return NextResponse.json(
      { erro: err.message || "Credenciais inválidas" },
      { status: 401 }
    );
  }
}
