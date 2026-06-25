import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/auth/status → { hasAdmin } — usato dalla login per il primo avvio.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // diagnostica sicura: solo presenza/host, mai i valori segreti
  const debug = {
    hasUrl: !!url,
    urlHost: url ? (() => { try { return new URL(url).host; } catch { return "URL_NON_VALIDO"; } })() : null,
    hasAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ hasAdmin: false, configured: false, debug });

  try {
    const { count, error } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (error) return NextResponse.json({ hasAdmin: false, error: error.message, debug }, { status: 500 });
    return NextResponse.json({ hasAdmin: (count ?? 0) > 0, configured: true, debug });
  } catch (e) {
    return NextResponse.json({ hasAdmin: false, error: String(e), debug }, { status: 500 });
  }
}
