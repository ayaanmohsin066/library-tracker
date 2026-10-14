import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

const NOT_CONFIGURED_BODY = { error: "storage_not_configured", available: false };

/** Returns null (→ 503) instead of throwing when Supabase env vars are missing. */
function db(): SupabaseClient | null {
  try { return getSupabase(); } catch { return null; }
}

const MAX_ROWS = 100;
const MAX_NAME = 120;

interface SnapshotRow {
  library_name: string;
  floor_name: string | null;
  percent_full: number;
}

export async function POST(request: NextRequest) {
  const client = db();
  if (!client) return NextResponse.json(NOT_CONFIGURED_BODY, { status: 503 });
  let rows: unknown;
  try {
    rows = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "empty_payload" }, { status: 400 });
  }
  // A real payload is one row per library + one per floor (~40 max today).
  if (rows.length > MAX_ROWS) {
    return NextResponse.json({ error: "too_many_rows" }, { status: 413 });
  }

  const validated: SnapshotRow[] = [];
  for (const r of rows) {
    if (typeof r !== "object" || r === null) {
      return NextResponse.json({ error: "invalid_rows" }, { status: 400 });
    }
    const row = r as Record<string, unknown>;
    const name = typeof row.library_name === "string" ? row.library_name.trim() : "";
    const floor = row.floor_name === null || row.floor_name === undefined
      ? null
      : typeof row.floor_name === "string" ? row.floor_name.trim() : undefined;
    const pct = row.percent_full;

    if (
      !name || name.length > MAX_NAME ||
      floor === undefined || (floor !== null && floor.length > MAX_NAME) ||
      typeof pct !== "number" || !Number.isInteger(pct) || pct < 0 || pct > 100
    ) {
      return NextResponse.json({ error: "invalid_rows" }, { status: 400 });
    }
    validated.push({ library_name: name, floor_name: floor || null, percent_full: pct });
  }

  const { error } = await client.from("occupancy_snapshots").insert(validated);

  if (error) {
    // Don't leak database error text to anonymous callers.
    console.error("[snapshot] insert failed:", error.message);
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ inserted: validated.length });
}
