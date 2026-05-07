"use client";

interface SubLocation {
  name: string;
  percentage: number;
  people: number;
  capacity: number;
  isOpen: boolean;
}

interface LibraryCardProps {
  name: string;
  percentage: number;
  people: number;
  capacity: number;
  isOpen: boolean;
  hourSummary: string;
  subLocs: SubLocation[];
  compareSummary?: string;
}

type Level = "low" | "medium" | "high";

function level(pct: number): Level {
  if (pct >= 0.8) return "high";
  if (pct >= 0.5) return "medium";
  return "low";
}

const BADGE_STYLE: Record<Level, React.CSSProperties> = {
  low:    { color: "var(--green)", backgroundColor: "var(--green-dim)", border: "1px solid rgba(16,185,129,0.2)" },
  medium: { color: "var(--amber)", backgroundColor: "var(--amber-dim)", border: "1px solid rgba(245,158,11,0.2)" },
  high:   { color: "var(--red)",   backgroundColor: "var(--red-dim)",   border: "1px solid rgba(239,68,68,0.2)" },
};

const BAR_CLASS: Record<Level, string> = {
  low:    "bar-fill-green",
  medium: "bar-fill-amber",
  high:   "bar-fill-red",
};

function Badge({ pct }: { pct: number }) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums"
      style={BADGE_STYLE[level(pct)]}
    >
      {Math.round(pct * 100)}%
    </span>
  );
}

function GlowBar({ pct }: { pct: number }) {
  const clamped = Math.min(1, Math.max(0, pct));
  return (
    <div className="bar-track">
      <div className={BAR_CLASS[level(pct)]} style={{ width: `${clamped * 100}%` }} />
    </div>
  );
}

function SubLocRow({ loc }: { loc: SubLocation }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-28 shrink-0 truncate text-xs sm:w-36"
        style={{ color: "var(--text-secondary)" }}
      >
        {loc.name}
      </span>
      <div className="flex-1">
        <GlowBar pct={loc.percentage} />
      </div>
      <Badge pct={loc.percentage} />
    </div>
  );
}

export default function LibraryCard({
  name,
  percentage,
  people,
  capacity,
  isOpen,
  hourSummary,
  subLocs,
  compareSummary,
}: LibraryCardProps) {
  return (
    <div className="card-base w-full p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2
          className="text-base font-semibold leading-tight sm:text-lg"
          style={{ color: "var(--text-primary)" }}
        >
          {name}
        </h2>
        <Badge pct={percentage} />
      </div>

      {/* Status */}
      <p className="mt-2 text-xs font-medium">
        {isOpen
          ? <span style={{ color: "var(--green)" }}>● Open · {hourSummary}</span>
          : <span style={{ color: "var(--red)" }}>● Closed · {hourSummary}</span>
        }
      </p>

      {compareSummary && (
        <p className="mt-0.5 text-xs italic" style={{ color: "var(--text-muted)" }}>
          {compareSummary}
        </p>
      )}

      {/* Progress */}
      <div className="mt-3">
        <GlowBar pct={percentage} />
      </div>
      <p className="mt-1.5 text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
        {people} / {capacity} people
      </p>

      {/* Sub-locations */}
      {subLocs.length > 0 && (
        <div
          className="mt-4 space-y-2.5 pt-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            By floor
          </p>
          {subLocs.map((loc) => (
            <SubLocRow key={loc.name} loc={loc} />
          ))}
        </div>
      )}
    </div>
  );
}
