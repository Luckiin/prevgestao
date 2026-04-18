import { createServerClient as _createServerClient } from "@supabase/ssr";
import { createClient as _createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/** Cliente Supabase para Server Components e Route Handlers (usa cookies de sessão) */
export async function createServerClient() {
  const cookieStore = await cookies();

  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorado em Server Components (somente leitura)
          }
        },
      },
    }
  );
}

export { createServerClient as createClient };

/** Cliente admin com service_role (acesso total, bypass RLS) */
export function createAdminClient() {
  return _createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession:   false,
      },
    }
  );
}

/** Cria cliente Supabase para Route Handlers (lê/escreve cookies do request/response) */
export function createRouteClient(request, cookieCollector) {
  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((c) => cookieCollector.push(c));
        },
      },
    }
  );
}
