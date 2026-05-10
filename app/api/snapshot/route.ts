import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

interface SnapshotRow {
  library_name: string;
  floor_name: string | null;
  percent_full: number;
}

export async function POST(request: NextRequest) {
  let rows: unknown;
  try {
    rows = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "empty_payload" }, { status: 400 });
  }

  const validated: SnapshotRow[] = [];
  for (const r of rows) {
    if (
      typeof r !== "object" || r === null ||
      typeof (r as Record<string, unknown>).library_name !== "string" ||
      typeof (r as Record<string, unknown>).percent_full !== "number" ||
      (!((r as Record<string, unknown>).floor_name === null ||
         typeof (r as Record<string, unknown>).floor_name === "string"))
    ) {
      return NextResponse.json({ error: "invalid_rows" }, { status: 400 });
    }
    const row = r as Record<string, unknown>;
    validated.push({
      library_name: row.library_name as string,
      floor_name: (row.floor_name ?? null) as string | null,
      percent_full: row.percent_full as number,
    });
  }

  const { error } = await getSupabase().from("occupancy_snapshots").insert(validated);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inserted: validated.length });
}
