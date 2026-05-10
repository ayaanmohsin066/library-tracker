export const runtime = "edge";
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

const SUPPORTED_UNIS = new Set(["waterloo", "regina"]);

const WAITZ_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Referer": "https://waitz.io/",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function GET(request: Request) {
  const uni = new URL(request.url).searchParams.get("uni");

  if (!uni || !SUPPORTED_UNIS.has(uni)) {
    return json({ error: "invalid_uni" }, 400);
  }

  try {
    const [liveRes, compareRes] = await Promise.all([
      fetch(`https://waitz.io/live/${uni}`,    { headers: WAITZ_HEADERS }),
      fetch(`https://waitz.io/compare/${uni}`, { headers: WAITZ_HEADERS }),
    ]);

    if (!liveRes.ok || !compareRes.ok) {
      if (!liveRes.ok)    console.error(`[live] waitz live ${liveRes.status} for ${uni}`);
      if (!compareRes.ok) console.error(`[live] waitz compare ${compareRes.status} for ${uni}`);
      return json({ error: "fetch_failed" }, 500);
    }

    const [liveJson, compareJson] = await Promise.all([liveRes.json(), compareRes.json()]);
    const liveData    = Array.isArray(liveJson?.data) ? liveJson.data : [];
    const compareData = compareJson?.data ?? {};

    return json({ live: liveData, compare: compareData });
  } catch (err) {
    console.error(`[live] fetch error for ${uni}:`, String(err));
    return json({ error: "fetch_failed" }, 500);
  }
}
