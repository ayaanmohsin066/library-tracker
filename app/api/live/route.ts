import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface WaitzSubLocation {
  name: string;
  percentage: number;
  people: number;
  capacity: number;
  isOpen: boolean;
  hourSummary: string;
  busyness: number;
}

export interface WaitzLocation extends WaitzSubLocation {
  subLocs: WaitzSubLocation[];
}

interface WaitzLiveResponse {
  data: WaitzLocation[];
}

interface WaitzCompareResponse {
  data: Record<string, unknown>;
}

type SupportedUni = "waterloo" | "regina";

const SUPPORTED_UNIS = new Set<SupportedUni>(["waterloo", "regina"]);

export async function GET(request: NextRequest) {
  const uni = request.nextUrl.searchParams.get("uni");

  if (!uni || !SUPPORTED_UNIS.has(uni as SupportedUni)) {
    return NextResponse.json(
      { error: "invalid_uni", cached: false },
      { status: 400 }
    );
  }

  const WAITZ_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Referer": "https://waitz.io/",
    "Accept": "application/json, text/plain, */*",
  };

  try {
    const [liveRes, compareRes] = await Promise.all([
      fetch(`https://waitz.io/live/${uni}`,    { headers: WAITZ_HEADERS, cache: "no-store" }),
      fetch(`https://waitz.io/compare/${uni}`, { headers: WAITZ_HEADERS, cache: "no-store" }),
    ]);

    if (!liveRes.ok || !compareRes.ok) {
      const liveBody    = !liveRes.ok    ? await liveRes.text().catch(() => "(unreadable)")    : null;
      const compareBody = !compareRes.ok ? await compareRes.text().catch(() => "(unreadable)") : null;
      if (liveBody    !== null) console.error(`[live] waitz live ${liveRes.status} for ${uni}:`,    liveBody);
      if (compareBody !== null) console.error(`[live] waitz compare ${compareRes.status} for ${uni}:`, compareBody);
      return NextResponse.json(
        { error: "fetch_failed", cached: false },
        { status: 500 }
      );
    }

    const [liveJson, compareJson]: [WaitzLiveResponse, WaitzCompareResponse] =
      await Promise.all([liveRes.json(), compareRes.json()]);

    const liveData = Array.isArray(liveJson?.data) ? liveJson.data : [];
    const compareData = compareJson?.data ?? {};

    return NextResponse.json(
      { live: liveData, compare: compareData },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "fetch_failed", cached: false },
      { status: 500 }
    );
  }
}
