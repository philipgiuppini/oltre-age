import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/route-auth";
import { accountPatchToRow } from "@/lib/supabase/mappers";

// POST /api/users — l'admin crea un nuovo account (auth user + profilo).
export async function POST(req: Request) {
  const { admin, error, status } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status });

  const body = await req.json();
  const { email, password, nome, cognome, role } = body;
  if (!email || !password) return NextResponse.json({ error: "Email e password obbligatorie" }, { status: 400 });

  // 1) crea l'utente di autenticazione (email già confermata per la demo)
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome, cognome, role },
  });
  if (createErr || !created.user) {
    return NextResponse.json({ error: createErr?.message ?? "Creazione fallita" }, { status: 400 });
  }

  // 2) il trigger ha creato il profilo: aggiorna gli altri campi
  const patch = accountPatchToRow(body);
  delete (patch as Record<string, unknown>).role; // già impostato dal trigger via metadata
  const { error: updErr } = await admin.from("profiles").update(patch).eq("id", created.user.id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });

  return NextResponse.json({ ok: true, id: created.user.id });
}
