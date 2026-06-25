import { createAdminClient } from "@/lib/supabase/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Verifica il token Bearer del chiamante e che sia admin.
 *  Ritorna { admin } (client service_role) oppure { error }. */
export async function requireAdmin(req: Request): Promise<{ admin?: any; error?: string; status?: number }> {
  const admin = createAdminClient();
  if (!admin) return { error: "Supabase non configurato", status: 500 };

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return { error: "Non autenticato", status: 401 };

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return { error: "Token non valido", status: 401 };

  const { data: prof } = await admin.from("profiles").select("role").eq("id", data.user.id).single();
  if (prof?.role !== "admin") return { error: "Permesso negato (solo admin)", status: 403 };

  return { admin };
}
