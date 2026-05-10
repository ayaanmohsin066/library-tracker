import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const library = request.nextUrl.searchParams.get("library");
  if (!library) {
    return NextResponse.json({ error: "missing_library" }, { status: 400 });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await getSupabase()
    .from("occupancy_snapshots")
    .select("percent_full, recorded_at")
    .eq("library_name", library)
    .is("floor_name", null)
    .gte("recorded_at", since)
    .order("recorded_at", { ascending: false })
    .limit(24);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).reverse());
}
