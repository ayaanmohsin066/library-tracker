"use client";

import { useQuery } from "@tanstack/react-query";

interface HistoryPoint {
  percent_full: number;
  recorded_at: string;
}

interface BestTime {
  available: boolean;
  label?: string;
}

function Sparkline({ data }: { data: HistoryPoint[] }) {
  const W = 200, H = 36, PAD = 2;
  const n = data.length;

  const toX = (i: number) => PAD + (i / Math.max(n - 1, 1)) * (W - 2 * PAD);
  const toY = (pct: number) => PAD + (1 - pct / 100) * (H - 2 * PAD);

  const linePts  = data.map((d, i) => `${toX(i).toFixed(1)},${toY(d.percent_full).toFixed(1)}`).join(" ");
  const fillPts  = `${toX(0).toFixed(1)},${H} ${linePts} ${toX(n - 1).toFixed(1)},${H}`;

  const lastX = toX(n - 1);
  const lastY = toY(data[n - 1].percent_full);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#06b6d4" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill="url(#spark-fill)" />
      <polyline
        points={linePts}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r={2.5} fill="var(--accent)" />
    </svg>
  );
}

export default function OccupancyHistory({ libraryName }: { libraryName: string }) {
  const enc = encodeURIComponent(libraryName);
  const dow = typeof window !== "undefined" ? new Date().getDay() : 0;
  const tz  = typeof window !== "undefined" ? new Date().getTimezoneOffset() : 0;

  const { data: history, isLoading: histLoading } = useQuery<HistoryPoint[]>({
    queryKey: ["history", libraryName],
    queryFn:  () => fetch(`/api/history?library=${enc}`).then((r) => r.json()),
    staleTime: 5 * 60_000,
    gcTime:   10 * 60_000,
  });

  const { data: bestTime } = useQuery<BestTime>({
    queryKey: ["besttime", libraryName, dow],
    queryFn:  () => fetch(`/api/besttime?library=${enc}&dow=${dow}&tz=${tz}`).then((r) => r.json()),
    staleTime: 60 * 60_000,
    gcTime:    2 * 60 * 60_000,
  });

  const points = history ?? [];
  const hasEnough = points.length >= 3;

  return (
    <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
      {/* Sparkline header */}
      <p style={{
        fontSize: 10, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: 6,
      }}>
        Last 24h
      </p>

      {/* Loading shimmer */}
      {histLoading && (
        <div
          className="animate-shimmer"
          style={{ height: 36, borderRadius: 4, backgroundColor: "var(--bg-elevated)" }}
        />
      )}

      {/* Not enough data yet */}
      {!histLoading && !hasEnough && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
          Collecting data…
        </p>
      )}

      {/* Sparkline */}
      {!histLoading && hasEnough && <Sparkline data={points} />}

      {/* Best time */}
      {bestTime?.available && bestTime.label && (
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8 }}>
          <span style={{ color: "var(--text-muted)" }}>Quietest today: </span>
          typically {bestTime.label}
        </p>
      )}
    </div>
  );
}
