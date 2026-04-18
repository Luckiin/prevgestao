import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-server";
import { logout } from "@/lib/services/authService";

export async function POST(request) {
  try {
    const cookies  = [];
    const supabase = createRouteClient(request, cookies);

    const { data: { user } } = await supabase.auth.getUser();
    await logout(supabase, user?.email);

    const response = NextResponse.json({ ok: true });

    // Limpa cookies de sessão
    cookies.forEach(({ name }) =>
      response.cookies.set(name, "", { maxAge: 0, path: "/" })
    );

    // Garante limpeza dos cookies do Supabase
    request.cookies.getAll().forEach(({ name }) => {
      if (name.startsWith("sb-")) {
        response.cookies.set(name, "", { maxAge: 0, path: "/" });
      }
    });

    return response;
  } catch (err) {
    console.error("[POST /api/auth/logout]", err.message);
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
