import { NextRequest, NextResponse } from "next/server";

export const revalidate = 300;

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

  try {
    const [liveRes, compareRes] = await Promise.all([
      fetch(`https://waitz.io/live/${uni}`, { next: { revalidate: 300 } }),
      fetch(`https://waitz.io/compare/${uni}`, { next: { revalidate: 300 } }),
    ]);

    if (!liveRes.ok || !compareRes.ok) {
      return NextResponse.json(
        { error: "fetch_failed", cached: false },
        { status: 500 }
      );
    }

    const [liveJson, compareJson]: [WaitzLiveResponse, WaitzCompareResponse] =
      await Promise.all([liveRes.json(), compareRes.json()]);

    return NextResponse.json(
      { live: liveJson.data, compare: compareJson.data },
      { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch {
    return NextResponse.json(
      { error: "fetch_failed", cached: false },
      { status: 500 }
    );
  }
}
