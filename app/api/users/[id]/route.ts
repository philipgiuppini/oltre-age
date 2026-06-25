import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/route-auth";

// DELETE /api/users/[id] — l'admin elimina un account (auth + profilo a cascata).
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error, status } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const { error: delErr } = await admin.auth.admin.deleteUser(id);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
