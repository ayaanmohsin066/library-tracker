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

  const base = request.nextUrl.origin;

  try {
    const [liveRes, compareRes] = await Promise.all([
      fetch(`${base}/api/waitz/${uni}`, { cache: "no-store" }),
      fetch(`https://waitz.io/compare/${uni}`, { cache: "no-store" }),
    ]);

    if (!liveRes.ok || !compareRes.ok) {
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
