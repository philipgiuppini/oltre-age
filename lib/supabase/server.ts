// Supabase per Server Components / Route Handlers (App Router).
// NB: questo modulo è importato SOLO da codice server (route handlers),
// mai da componenti client → l'import di supabase-js non finisce nel bundle browser.
import { createServerClient } from "@supabase/ssr";
import { createClient as createSb } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null; // demo mode

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // chiamato da un Server Component: ignorabile se c'è il middleware
        }
      },
    },
  });
}

/** Client con privilegi service_role (SOLO server, mai esposto al browser). */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !svc) return null;
  return createSb(url, svc, { auth: { autoRefreshToken: false, persistSession: false } });
}
