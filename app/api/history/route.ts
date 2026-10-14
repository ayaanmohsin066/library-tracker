import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

const NOT_CONFIGURED_BODY = { error: "storage_not_configured", available: false };

/** Returns null (→ 503) instead of throwing when Supabase env vars are missing. */
function db(): SupabaseClient | null {
  try { return getSupabase(); } catch { return null; }
}

export async function GET(request: NextRequest) {
  const client = db();
  if (!client) return NextResponse.json(NOT_CONFIGURED_BODY, { status: 503 });
  const library = request.nextUrl.searchParams.get("library");
  if (!library || library.length > 120) {
    return NextResponse.json({ error: "missing_library" }, { status: 400 });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await client
    .from("occupancy_snapshots")
    .select("percent_full, recorded_at")
    .eq("library_name", library)
    .is("floor_name", null)
    .gte("recorded_at", since)
    .order("recorded_at", { ascending: false })
    .limit(24);

  if (error) {
    console.error("[history] query failed:", error.message);
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  return NextResponse.json((data ?? []).reverse());
}
