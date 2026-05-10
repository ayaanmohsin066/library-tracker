import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPPORTED_UNIS = new Set(["waterloo", "regina"]);

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "invalid_body" }, { status: 400 }); }

  const { library_name, uni, threshold, email } =
    (body ?? {}) as Record<string, unknown>;

  if (
    typeof library_name !== "string" || !library_name ||
    typeof uni !== "string" || !SUPPORTED_UNIS.has(uni) ||
    typeof email !== "string" || !EMAIL_RE.test(email) ||
    typeof threshold !== "number" || !Number.isInteger(threshold) ||
    threshold < 0 || threshold > 100
  ) {
    return NextResponse.json({ error: "invalid_fields" }, { status: 400 });
  }

  const { error } = await getSupabase()
    .from("notification_requests")
    .insert({ library_name, uni, threshold, email });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
