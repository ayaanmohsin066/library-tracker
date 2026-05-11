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

  const liveUrl    = `https://waitz.io/live/${uni}`;
  const compareUrl = `https://waitz.io/compare/${uni}`;
  console.log(`[live] fetching ${liveUrl}`);

  try {
    const [liveRes, compareRes] = await Promise.all([
      fetch(liveUrl,    { headers: WAITZ_HEADERS }),
      fetch(compareUrl, { headers: WAITZ_HEADERS }),
    ]);

    console.log(`[live] Waitz status: live=${liveRes.status} compare=${compareRes.status}`);

    if (!liveRes.ok || !compareRes.ok) {
      const errBody = await (!liveRes.ok ? liveRes : compareRes).text().catch(() => "(unreadable)");
      console.error(`[live] upstream error for ${uni}. body: ${errBody.slice(0, 500)}`);
      return json({ error: "fetch_failed" }, 500);
    }

    // Read as text first — Edge Runtime response body can only be consumed once
    const [liveText, compareText] = await Promise.all([liveRes.text(), compareRes.text()]);
    console.log(`[live] Waitz response body (first 500): ${liveText.slice(0, 500)}`);

    let liveJson: unknown;
    let compareJson: unknown;

    try {
      liveJson = JSON.parse(liveText);
    } catch (e) {
      console.error(`[live] JSON parse failed for ${uni}: ${e}. Raw: ${liveText.slice(0, 300)}`);
      return json({ error: "parse_failed" }, 500);
    }

    try {
      compareJson = JSON.parse(compareText);
    } catch {
      compareJson = { data: {} };
    }

    const raw = (liveJson as Record<string, unknown>);
    const liveData = Array.isArray(raw?.data) ? raw.data : [];
    const compareData = (compareJson as Record<string, unknown>)?.data ?? {};

    const liveArr = liveData as unknown[];
    console.log(`[live] liveData length=${liveArr.length} firstItem=${JSON.stringify(liveArr[0] ?? null).slice(0, 200)}`);

    return json({
      live:    liveData,
      compare: compareData,
      debug: {
        liveStatus:       liveRes.status,
        compareStatus:    compareRes.status,
        liveUrl:          liveUrl,
        liveLength:       liveArr.length,
        rawBodyFirst300:  liveText.slice(0, 300),
      },
    });
  } catch (err) {
    console.error(`[live] fetch error for ${uni}:`, String(err));
    return json({ error: "fetch_failed" }, 500);
  }
}
