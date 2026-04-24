import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const ROTAS_PROTEGIDAS = [
  "/home",
  "/clientes",
  "/prazos",
  "/relatorios",
  "/auditoria",
  "/configuracoes",
  "/financeiro",
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;


  const isApi = pathname.startsWith("/api/");

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
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;
  const rotaProtegida = ROTAS_PROTEGIDAS.some((r) => pathname.startsWith(r));


  if (user && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/home", request.url));
  }


  if (rotaProtegida && !user) {
    const url = new URL("/login", request.url);
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
