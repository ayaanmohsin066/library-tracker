import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

function fmtHour(h: number): string {
  const h12 = h % 12 || 12;
  return `${h12}${h < 12 ? "am" : "pm"}`;
}

export async function GET(request: NextRequest) {
  const library   = request.nextUrl.searchParams.get("library");
  const dowParam  = request.nextUrl.searchParams.get("dow");
  const tzParam   = request.nextUrl.searchParams.get("tz"); // minutes behind UTC (getTimezoneOffset())

  if (!library || dowParam === null) {
    return NextResponse.json({ available: false });
  }

  const dow      = parseInt(dowParam, 10);
  const tzOffset = tzParam !== null ? parseInt(tzParam, 10) : 0;

  if (isNaN(dow) || dow < 0 || dow > 6) {
    return NextResponse.json({ available: false });
  }

  const since = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await getSupabase()
    .from("occupancy_snapshots")
    .select("percent_full, recorded_at")
    .eq("library_name", library)
    .is("floor_name", null)
    .gte("recorded_at", since);

  if (error || !data?.length) {
    return NextResponse.json({ available: false });
  }

  // Require at least 7 distinct calendar days of data across all time
  const uniqueDays = new Set(
    data.map((r) => {
      // Shift UTC timestamp to local time so day boundaries are correct
      const localMs = new Date(r.recorded_at).getTime() - tzOffset * 60_000;
      const d = new Date(localMs);
      return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
    })
  );
  if (uniqueDays.size < 7) {
    return NextResponse.json({ available: false });
  }

  // Group by local hour for rows whose local day-of-week matches
  const byHour: Record<number, number[]> = {};
  for (const row of data) {
    const localMs  = new Date(row.recorded_at).getTime() - tzOffset * 60_000;
    const localDate = new Date(localMs);
    if (localDate.getUTCDay() !== dow) continue;
    const hour = localDate.getUTCHours();
    (byHour[hour] ??= []).push(row.percent_full);
  }

  const entries = Object.entries(byHour).map(([h, vals]) => ({
    hour: +h,
    avg: vals.reduce((a, b) => a + b, 0) / vals.length,
  }));

  if (!entries.length) {
    return NextResponse.json({ available: false });
  }

  entries.sort((a, b) => a.avg - b.avg);
  const best = entries[0];

  return NextResponse.json({
    available: true,
    label: `${fmtHour(best.hour)}–${fmtHour(best.hour + 1)}`,
  });
}
