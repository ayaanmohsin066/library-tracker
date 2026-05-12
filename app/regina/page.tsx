"use client";

import useLibraryData from "@/hooks/useLibraryData";
import { ErrorBanner, StaleBanner } from "@/components/tabs/shared";

/* ── Circular SVG progress ring ─────────────────────────────────────────── */

function ProgressRing({ pct, isOpen }: { pct: number; isOpen: boolean }) {
  const circumference = 251.2;
  const offset = circumference - (circumference * pct) / 100;
  const stroke = !isOpen
    ? "#3b494b"
    : pct > 80
    ? "#ffb4ab"
    : pct > 50
    ? "#00dbe9"
    : "#2ae500";

  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32" aria-hidden="true">
      <circle cx="50" cy="50" r="40" fill="transparent" strokeWidth="8" stroke="#282a2e" />
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="transparent"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="251.2"
        strokeDashoffset={offset}
        className="progress-ring-circle"
        style={{ stroke }}
      />
    </svg>
  );
}

/* ── Library card ──────────────────────────────────────────────────────── */

interface LibProps {
  name: string;
  percentage: number;
  people: number;
  capacity: number;
  isOpen: boolean;
  hourSummary: string;
  subLocs: { name: string; percentage: number; people: number; capacity: number; isOpen: boolean }[];
}

function LibraryCard({ name, percentage, people, capacity, isOpen, hourSummary, subLocs }: LibProps) {
  const pct = Math.round(percentage * 100);
  const accentColor = pct > 80 ? "#ffb4ab" : pct > 50 ? "#00dbe9" : "#2ae500";

  return (
    <div
      className="glass-panel glass-highlight rounded-2xl p-8 relative flex flex-col gap-6"
      style={{ opacity: isOpen ? 1 : 0.6 }}
    >
      {/* Sensors icon */}
      <span
        className="material-symbols-outlined absolute top-6 right-6"
        style={{ color: "#849495", fontSize: 20 }}
      >
        sensors
      </span>

      {/* Library name */}
      <h3
        className="text-base font-semibold pr-8"
        style={{ color: "#e2e2e8", fontFamily: "Sora, sans-serif" }}
      >
        {name}
      </h3>

      {/* Circular ring + stats */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-32 h-32">
          <ProgressRing pct={pct} isOpen={isOpen} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-2xl font-bold tabular-nums"
              style={{
                color: isOpen ? accentColor : "#849495",
                fontFamily: "Sora, sans-serif",
              }}
            >
              {pct}%
            </span>
            <span className="text-xs" style={{ color: "#849495" }}>
              occupied
            </span>
          </div>
        </div>

        {/* Seat count */}
        <p
          className="text-sm tabular-nums"
          style={{ color: "#b9cacb", fontFamily: "var(--font-geist-mono), monospace" }}
        >
          {people.toLocaleString()} / {capacity.toLocaleString()} seats
        </p>

        {/* Open / closed */}
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
              background: isOpen ? "#2ae500" : "#ffb4ab",
              boxShadow: isOpen ? "0 0 6px rgba(42,229,0,0.6)" : "none",
            }}
          />
          <span className="text-xs font-semibold" style={{ color: isOpen ? "#2ae500" : "#ffb4ab" }}>
            {isOpen ? "Open" : "Closed"}
          </span>
          <span className="text-xs" style={{ color: "#849495" }}>· {hourSummary}</span>
        </div>
      </div>

      {/* Sub-locations (floors) */}
      {subLocs.length > 0 && (
        <div className="pt-4" style={{ borderTop: "1px solid rgba(59, 73, 75, 0.4)" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#849495" }}>
            By Floor
          </p>
          <div className="flex flex-col gap-2">
            {subLocs.map((loc) => {
              const locPct = Math.round(loc.percentage * 100);
              const locColor = locPct > 80 ? "#ffb4ab" : locPct > 50 ? "#00dbe9" : "#2ae500";
              return (
                <div key={loc.name} className="flex items-center gap-3">
                  <span
                    className="text-xs shrink-0 truncate"
                    style={{ width: 112, color: "#b9cacb" }}
                  >
                    {loc.name}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(59,73,75,0.4)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${locPct}%`,
                        background: locColor,
                        transition: "width 0.65s ease",
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-semibold tabular-nums shrink-0"
                    style={{ color: locColor }}
                  >
                    {locPct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Skeleton card ─────────────────────────────────────────────────────── */

function SkeletonLibCard() {
  return (
    <div className="glass-panel rounded-2xl p-8 flex flex-col gap-6" style={{ minHeight: 280 }}>
      <div className="animate-shimmer h-4 w-40 rounded-lg" />
      <div className="flex flex-col items-center gap-3">
        <div className="animate-shimmer w-32 h-32 rounded-full" />
        <div className="animate-shimmer h-3 w-28 rounded-md" />
        <div className="animate-shimmer h-3 w-20 rounded-md" />
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function ReginaPage() {
  const { data, isLoading, isError, isStale, dataUpdatedAt, refetch } =
    useLibraryData("regina");

  const raw = Array.isArray(data?.live) ? data.live : [];
  const libraries = raw.map((loc) => ({
    name:        loc.name,
    percentage:  loc.percentage,
    people:      loc.people,
    capacity:    loc.capacity,
    isOpen:      loc.isOpen,
    hourSummary: loc.hourSummary,
    subLocs:     Array.isArray(loc.subLocs) ? loc.subLocs : [],
  }));

  const openLibs   = libraries.filter((l) => l.isOpen).sort((a, b) => a.percentage - b.percentage);
  const closedLibs = libraries.filter((l) => !l.isOpen);
  const sorted     = [...openLibs, ...closedLibs];
  const hasData    = libraries.length > 0;
  const quietest   = openLibs[0] ?? null;
  const busiest    = openLibs[openLibs.length - 1] ?? null;

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "#111318" }}>

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <h1
          className="text-3xl md:text-4xl font-bold tracking-tight"
          style={{ color: "#e2e2e8", fontFamily: "Sora, sans-serif" }}
        >
          University of Regina
        </h1>
        <div
          className="pulse-dot w-3 h-3 rounded-full flex-shrink-0"
          style={{ background: "#2ae500" }}
          title="Live data"
        />
      </div>
      <p className="text-sm mb-6" style={{ color: "#849495", fontFamily: "Sora, sans-serif" }}>
        Global Study Intelligence Dashboard
      </p>

      {/* ── Summary chips ─────────────────────────────────────── */}
      {hasData && (
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { label: "Total",    value: String(libraries.length) },
            { label: "Open Now", value: String(openLibs.length), accent: "#2ae500" },
            {
              label: "Quietest",
              value: quietest
                ? `${quietest.name.split(" ")[0]} · ${Math.round(quietest.percentage * 100)}%`
                : "None",
              accent: "#2ae500",
            },
            {
              label: "Busiest",
              value: busiest
                ? `${busiest.name.split(" ")[0]} · ${Math.round(busiest.percentage * 100)}%`
                : "None",
              accent: busiest && busiest.percentage >= 0.8 ? "#ffb4ab" : busiest ? "#00dbe9" : undefined,
            },
          ].map(({ label, value, accent }) => (
            <div key={label} className="stat-chip">
              <span className="text-xs font-bold uppercase" style={{ letterSpacing: "0.11em", color: "#849495" }}>
                {label}
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: accent ?? "#e2e2e8", fontFamily: "var(--font-geist-mono), monospace" }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Last updated + refresh ────────────────────────────── */}
      <div className="flex items-center gap-3 mb-8">
        {dataUpdatedAt && (
          <span className="text-xs" style={{ color: "#849495", fontFamily: "var(--font-geist-mono), monospace" }}>
            {dataUpdatedAt}
          </span>
        )}
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          style={{
            background: "rgba(0,219,233,0.08)",
            border: "1px solid rgba(0,219,233,0.25)",
            color: "#00dbe9",
            cursor: "pointer",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>
          Refresh
        </button>
      </div>

      {/* ── Stale banner ─────────────────────────────────────── */}
      {isStale && (
        <div className="mb-6">
          <StaleBanner onRetry={refetch} />
        </div>
      )}

      {/* ── Library card grid ─────────────────────────────────── */}
      {hasData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {sorted.map((lib) => (
            <LibraryCard key={lib.name} {...lib} />
          ))}
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[1, 2].map((i) => <SkeletonLibCard key={i} />)}
        </div>
      ) : isError ? (
        <ErrorBanner onRetry={refetch} />
      ) : (
        <p className="text-sm" style={{ color: "#849495" }}>No data available.</p>
      )}

      {/* ── Footer attribution ────────────────────────────────── */}
      <div className="mt-12 pt-6" style={{ borderTop: "1px solid rgba(59,73,75,0.3)" }}>
        <p className="text-xs" style={{ color: "#849495" }}>
          Data via Waitz · Not affiliated with the University of Regina ·{" "}
          <a
            href="https://www.uregina.ca/library/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#00dbe9", textDecoration: "none" }}
          >
            Official library site →
          </a>
        </p>
      </div>
    </div>
  );
}
