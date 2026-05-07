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

type OccupancyLevel = "low" | "medium" | "high";

function occupancyLevel(pct: number): OccupancyLevel {
  if (pct >= 0.8) return "high";
  if (pct >= 0.5) return "medium";
  return "low";
}

const LEVEL_BADGE: Record<OccupancyLevel, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-orange-100 text-orange-700",
  high: "bg-red-100 text-red-700",
};

const LEVEL_BAR: Record<OccupancyLevel, string> = {
  low: "bg-green-500",
  medium: "bg-orange-400",
  high: "bg-red-500",
};

function pctLabel(pct: number) {
  return `${Math.round(pct * 100)}%`;
}

function OccupancyBadge({ pct }: { pct: number }) {
  const level = occupancyLevel(pct);
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${LEVEL_BADGE[level]}`}
    >
      {pctLabel(pct)}
    </span>
  );
}

function ProgressBar({ pct, className = "" }: { pct: number; className?: string }) {
  const level = occupancyLevel(pct);
  const clamped = Math.min(1, Math.max(0, pct));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-gray-100 ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${LEVEL_BAR[level]}`}
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}

function SubLocRow({ loc }: { loc: SubLocation }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 truncate text-sm text-gray-600 sm:w-40">
        {loc.name}
      </span>
      <ProgressBar pct={loc.percentage} className="flex-1" />
      <OccupancyBadge pct={loc.percentage} />
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
    <div className="w-full rounded-2xl bg-white p-5 shadow-md ring-1 ring-gray-100 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-lg font-bold leading-tight text-gray-900 sm:text-xl">
          {name}
        </h2>
        <OccupancyBadge pct={percentage} />
      </div>

      {/* Open / closed status */}
      <p className="mt-1.5 text-sm font-medium">
        {isOpen ? (
          <span className="text-green-600">Open · {hourSummary}</span>
        ) : (
          <span className="text-red-500">Closed · {hourSummary}</span>
        )}
      </p>

      {/* Compare summary */}
      {compareSummary && (
        <p className="mt-1 text-xs italic text-gray-400">{compareSummary}</p>
      )}

      {/* Overall progress bar */}
      <ProgressBar pct={percentage} className="mt-3" />

      {/* People / capacity */}
      <p className="mt-1.5 text-xs text-gray-400 tabular-nums">
        {people} / {capacity} people
      </p>

      {/* Sub-locations */}
      {subLocs.length > 0 && (
        <div className="mt-4 space-y-2.5 border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            By floor / area
          </p>
          {subLocs.map((loc) => (
            <SubLocRow key={loc.name} loc={loc} />
          ))}
        </div>
      )}
    </div>
  );
}
