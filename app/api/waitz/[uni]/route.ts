export const runtime = "edge";
export const dynamic = "force-dynamic";

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

export async function GET(
  _req: Request,
  { params }: { params: { uni: string } }
) {
  const { uni } = params;

  if (!SUPPORTED_UNIS.has(uni)) {
    return json({ error: "invalid_uni" }, 400);
  }

  try {
    const res = await fetch(`https://waitz.io/live/${uni}`, { headers: WAITZ_HEADERS });
    if (!res.ok) {
      const body = await res.text().catch(() => "(unreadable)");
      console.error(`[waitz proxy] upstream ${res.status} for ${uni}:`, body);
      return json({ error: "upstream_error", status: res.status }, 502);
    }
    const data = await res.json();
    return json(data);
  } catch (err) {
    console.error(`[waitz proxy] fetch failed for ${uni}:`, String(err));
    return json({ error: "fetch_failed" }, 500);
  }
}
