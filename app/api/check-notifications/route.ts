import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

async function fetchUniOccupancy(uni: string): Promise<Record<string, number>> {
  try {
    const res = await fetch(`https://waitz.io/live/${uni}`, { cache: "no-store" });
    if (!res.ok) return {};
    const json = await res.json();
    const result: Record<string, number> = {};
    for (const loc of (json?.data ?? []) as { name: string; percentage: number }[]) {
      result[loc.name] = Math.round(loc.percentage * 100);
    }
    return result;
  } catch {
    return {};
  }
}

export async function GET() {
  const supabase = getSupabase();

  const { data: requests, error } = await supabase
    .from("notification_requests")
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!requests?.length) {
    return NextResponse.json({ checked: 0, triggered: 0 });
  }

  // Fetch occupancy once per unique uni
  const unis = Array.from(new Set(requests.map((r: { uni: string }) => r.uni)));
  const occupancy: Record<string, Record<string, number>> = {};
  await Promise.all(unis.map(async (uni) => {
    occupancy[uni] = await fetchUniOccupancy(uni);
  }));

  const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

  const triggeredIds: string[] = [];
  let emailsSent = 0;

  for (const req of requests as {
    id: string; library_name: string; uni: string;
    threshold: number; email: string;
  }[]) {
    const currentPct = occupancy[req.uni]?.[req.library_name];
    if (currentPct === undefined || currentPct > req.threshold) continue;

    triggeredIds.push(req.id);

    if (resend) {
      try {
        await resend.emails.send({
          from: "LibraryCheck <notifications@librarycheck.ca>",
          to: req.email,
          subject: `📚 ${req.library_name} is below ${req.threshold}% full`,
          html: `
<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0a0a0f;color:#e2e8f0;border-radius:12px;">
  <h2 style="margin:0 0 16px;color:#06b6d4;">Library occupancy alert</h2>
  <p style="margin:0 0 12px;">
    <strong>${req.library_name}</strong> is currently at
    <strong style="color:#10b981;">${currentPct}%</strong> full — below your
    threshold of ${req.threshold}%.
  </p>
  <p style="margin:0 0 24px;color:#94a3b8;">Now's a great time to head over and find a seat.</p>
  <a href="https://librarycheck.ca/${req.uni}"
     style="display:inline-block;padding:10px 20px;background:#06b6d4;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
    View live occupancy →
  </a>
  <p style="margin:24px 0 0;font-size:12px;color:#4a5568;">
    You set this alert on LibraryCheck. No further emails will be sent for this alert.
  </p>
</div>`,
        });
        emailsSent++;
      } catch (err) {
        console.error("Resend error for", req.email, err);
        triggeredIds.pop(); // don't delete if email failed
      }
    }
  }

  if (triggeredIds.length > 0) {
    await supabase
      .from("notification_requests")
      .delete()
      .in("id", triggeredIds);
  }

  return NextResponse.json({
    checked: requests.length,
    triggered: triggeredIds.length,
    emailsSent,
  });
}
