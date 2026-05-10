"use client";

import { useState, useEffect } from "react";

interface SubLocation {
  name: string;
  percentage: number;
  isOpen: boolean;
}

interface Library {
  name: string;
  percentage: number;
  isOpen: boolean;
  hourSummary?: string;
  subLocs: SubLocation[];
}

interface BestSpotCardProps {
  libraries: Library[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseTimeStr(s: string): { hour: number; min: number } | null {
  const m = s.match(/(\d+)(?::(\d+))?\s*(am|pm)/i);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const min = parseInt(m[2] ?? "0", 10);
  const ampm = m[3].toLowerCase();
  if (ampm === "pm" && hour !== 12) hour += 12;
  if (ampm === "am" && hour === 12) hour = 0;
  return { hour, min };
}

const DAY_MAP: Record<string, number> = {
  sun: 0, sunday: 0, mon: 1, monday: 1, tue: 2, tuesday: 2,
  wed: 3, wednesday: 3, thu: 4, thursday: 4, fri: 5, friday: 5,
  sat: 6, saturday: 6,
};

function parseNextOpeningTime(hourSummary: string): Date | null {
  if (!hourSummary) return null;
  const now = new Date();

  // "Opens at 9am" / "Opens at 10:30pm"
  const todayMatch = hourSummary.match(/opens\s+at\s+([\d:]+\s*(?:am|pm))/i);
  if (todayMatch) {
    const t = parseTimeStr(todayMatch[1]);
    if (t) {
      const d = new Date(now);
      d.setHours(t.hour, t.min, 0, 0);
      if (d > now) return d;
      d.setDate(d.getDate() + 1);
      return d;
    }
  }

  // "Opens tomorrow at 9am"
  const tomorrowMatch = hourSummary.match(/opens\s+tomorrow\s+at\s+([\d:]+\s*(?:am|pm))/i);
  if (tomorrowMatch) {
    const t = parseTimeStr(tomorrowMatch[1]);
    if (t) {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      d.setHours(t.hour, t.min, 0, 0);
      return d;
    }
  }

  // "Opens Mon at 9am" / "Opens Monday at 9am"
  const dayMatch = hourSummary.match(/opens\s+(\w+)\s+at\s+([\d:]+\s*(?:am|pm))/i);
  if (dayMatch) {
    const targetDow = DAY_MAP[dayMatch[1].toLowerCase()];
    if (targetDow !== undefined) {
      const t = parseTimeStr(dayMatch[2]);
      if (t) {
        const d = new Date(now);
        let daysUntil = (targetDow - d.getDay() + 7) % 7;
        if (daysUntil === 0) daysUntil = 7;
        d.setDate(d.getDate() + daysUntil);
        d.setHours(t.hour, t.min, 0, 0);
        return d;
      }
    }
  }

  return null;
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function fmtCountdown(ms: number): string {
  if (ms <= 0) return "now";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BestSpotCard({ libraries }: BestSpotCardProps) {
  const safeLibraries = Array.isArray(libraries) ? libraries : [];
  const openLibraries = safeLibraries.filter((l) => l.isOpen);
  const allClosed     = openLibraries.length === 0;

  // `now` stays 0 until client hydration — avoids server/client mismatch
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── All libraries closed ─────────────────────────────────────────────────────
  if (allClosed) {
    // Only compute next-opening client-side (now > 0) to stay SSR-safe
    const candidates =
      now > 0
        ? safeLibraries
            .map((lib) => ({ lib, openAt: parseNextOpeningTime(lib.hourSummary ?? "") }))
            .filter((x): x is { lib: Library; openAt: Date } => x.openAt !== null)
            .sort((a, b) => a.openAt.getTime() - b.openAt.getTime())
        : [];

    const next   = candidates[0] ?? null;
    const msLeft = next ? next.openAt.getTime() - now : 0;

    return (
      <div
        className="w-full rounded-2xl px-5 py-4 text-center"
        style={{
          backgroundColor: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
        }}
      >
        {next ? (
          <>
            <p style={{ fontSize: 14, fontWeight: 500 }}>
              All closed — next opening:{" "}
              <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>
                {next.lib.name}
              </span>
              {" "}at{" "}
              <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>
                {fmtTime(next.openAt)}
              </span>
            </p>
            <p style={{ fontSize: 12, marginTop: 6, fontWeight: 500 }}>
              Opens in{" "}
              <span style={{ color: "var(--accent)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {fmtCountdown(msLeft)}
              </span>
            </p>
          </>
        ) : (
          <p style={{ fontSize: 14, fontWeight: 500 }}>All libraries currently closed</p>
        )}
      </div>
    );
  }

  // ── Best open library ────────────────────────────────────────────────────────
  const best = openLibraries.reduce((a, b) =>
    a.percentage <= b.percentage ? a : b
  );

  const bestFloor = (best.subLocs ?? [])
    .filter((s) => s.isOpen)
    .reduce<SubLocation | null>(
      (lowest, s) =>
        lowest === null || s.percentage < lowest.percentage ? s : lowest,
      null
    );

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl px-5 py-5 sm:px-7 sm:py-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(6,182,212,0.09) 0%, rgba(129,140,248,0.07) 100%)",
        border: "1px solid rgba(6,182,212,0.22)",
        boxShadow:
          "0 0 40px rgba(6,182,212,0.07), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full opacity-25 blur-3xl"
        style={{ backgroundColor: "var(--accent)" }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--accent)" }}
          >
            ✦ Best spot right now
          </p>
          <p
            className="mt-1 truncate text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            {best.name}
          </p>
          {bestFloor && (
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              Quietest floor:{" "}
              <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                {bestFloor.name}
              </span>
              {" · "}
              <span className="tabular-nums">
                {Math.round(bestFloor.percentage * 100)}% full
              </span>
            </p>
          )}
        </div>

        <div className="shrink-0 sm:text-right">
          <span
            className="text-5xl font-extrabold tabular-nums leading-none sm:text-6xl"
            style={{
              color: "var(--accent)",
              textShadow: "0 0 30px var(--accent-glow)",
            }}
          >
            {Math.round(best.percentage * 100)}%
          </span>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            full
          </p>
        </div>
      </div>
    </div>
  );
}
