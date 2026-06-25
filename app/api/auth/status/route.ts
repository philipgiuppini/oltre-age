import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/auth/status → { hasAdmin } — usato dalla login per il primo avvio.
export async function GET() {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ hasAdmin: false, configured: false });
  const { count, error } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  if (error) return NextResponse.json({ hasAdmin: false, error: error.message }, { status: 500 });
  return NextResponse.json({ hasAdmin: (count ?? 0) > 0, configured: true });
}
