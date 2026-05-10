import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPPORTED_UNIS = new Set(["waterloo", "regina"]);

export async function GET(
  _req: NextRequest,
  { params }: { params: { uni: string } }
) {
  const { uni } = params;

  if (!SUPPORTED_UNIS.has(uni)) {
    return NextResponse.json({ error: "invalid_uni" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://waitz.io/live/${uni}`, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: "upstream_error", status: res.status },
        { status: 502 }
      );
    }
    const json = await res.json();
    return NextResponse.json(json, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error(`[waitz proxy] fetch failed for ${uni}:`, err);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}
