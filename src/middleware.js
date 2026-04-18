import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const ROTAS_PROTEGIDAS = [
  "/home",
  "/clientes",
  "/por-ano",
  "/prazos",
  "/documentos",
  "/relatorios",
  "/auditoria",
  "/configuracoes",
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rotaProtegida = ROTAS_PROTEGIDAS.some((r) => pathname.startsWith(r));

  // Usuário autenticado tentando acessar login → redireciona para home
  if (user && pathname.startsWith("/auth/entrar")) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Rota protegida sem usuário → redireciona para login
  if (rotaProtegida && !user) {
    const url = new URL("/auth/entrar", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
