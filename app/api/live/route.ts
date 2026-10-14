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

/** Upstream request timeout. Waitz normally answers in <500 ms. */
const UPSTREAM_TIMEOUT_MS = 8_000;

function json(body: unknown, status = 200, cache = "no-store"): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": cache },
  });
}

function num(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

/**
 * Waitz returns some fields inconsistently — e.g. `subLocs` is `false`
 * for libraries without floor sensors (Musagetes at Waterloo), which
 * crashed every `.map()`/`.some()` on the client. It also ships large
 * pre-rendered HTML blobs we never use. Normalise to a stable shape.
 */
function normaliseSub(raw: unknown): WaitzSubLocation | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const name = str(r.name).trim();
  if (!name) return null;
  return {
    name,
    percentage: Math.max(0, Math.min(1, num(r.percentage))),
    people: Math.max(0, Math.round(num(r.people))),
    capacity: Math.max(0, Math.round(num(r.capacity))),
    isOpen: r.isOpen === true,
    hourSummary: str(r.hourSummary),
    busyness: num(r.busyness),
  };
}

function normaliseLocation(raw: unknown): WaitzLocation | null {
  const base = normaliseSub(raw);
  if (!base) return null;
  const subsRaw = (raw as Record<string, unknown>).subLocs;
  const subLocs = Array.isArray(subsRaw)
    ? subsRaw.map(normaliseSub).filter((s): s is WaitzSubLocation => s !== null)
    : [];
  return { ...base, subLocs };
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    return await fetch(url, { headers: WAITZ_HEADERS, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function GET(request: Request) {
  const uni = new URL(request.url).searchParams.get("uni");

  if (!uni || !SUPPORTED_UNIS.has(uni)) {
    return json({ error: "invalid_uni" }, 400);
  }

  try {
    const [liveRes, compareRes] = await Promise.all([
      fetchWithTimeout(`https://waitz.io/live/${uni}`),
      // compare is optional — never let it fail the whole request
      fetchWithTimeout(`https://waitz.io/compare/${uni}`).catch(() => null),
    ]);

    if (!liveRes.ok) {
      console.error(`[live] upstream ${liveRes.status} for ${uni}`);
      return json({ error: "fetch_failed" }, 502);
    }

    let liveJson: unknown;
    try {
      liveJson = await liveRes.json();
    } catch (e) {
      console.error(`[live] JSON parse failed for ${uni}: ${e}`);
      return json({ error: "parse_failed" }, 502);
    }

    let compare: unknown = {};
    if (compareRes?.ok) {
      try {
        compare = ((await compareRes.json()) as Record<string, unknown>)?.data ?? {};
      } catch {
        compare = {};
      }
    }

    const rawData = (liveJson as Record<string, unknown>)?.data;
    const live = (Array.isArray(rawData) ? rawData : [])
      .map(normaliseLocation)
      .filter((l): l is WaitzLocation => l !== null);

    // Cache at the CDN for 60 s and serve stale for 2 min while refreshing.
    // Every visitor previously triggered two Waitz requests; the client only
    // refreshes every 5 min, so a 60 s shared cache is invisible to users.
    return json(
      { live, compare, fetchedAt: new Date().toISOString() },
      200,
      "public, s-maxage=60, stale-while-revalidate=120",
    );
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    console.error(`[live] fetch error for ${uni}:`, String(err));
    return json({ error: aborted ? "upstream_timeout" : "fetch_failed" }, aborted ? 504 : 502);
  }
}
