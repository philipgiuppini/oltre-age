import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/bootstrap-admin — crea il PRIMO admin (email già confermata).
// Consentito solo se non esiste ancora alcun admin.
export async function POST(req: Request) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase non configurato" }, { status: 500 });

  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  if ((count ?? 0) > 0) return NextResponse.json({ error: "Esiste già un amministratore." }, { status: 409 });

  const { email, password, nome, cognome } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Email e password obbligatorie" }, { status: 400 });

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome, cognome },
  });
  if (error || !data.user) return NextResponse.json({ error: error?.message ?? "Errore" }, { status: 400 });

  // il trigger crea il profilo come admin (primo utente)
  return NextResponse.json({ ok: true, id: data.user.id });
}
