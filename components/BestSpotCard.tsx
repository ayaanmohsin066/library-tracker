"use client";

interface SubLocation {
  name: string;
  percentage: number;
  isOpen: boolean;
}

interface Library {
  name: string;
  percentage: number;
  isOpen: boolean;
  subLocs: SubLocation[];
}

interface BestSpotCardProps {
  libraries: Library[];
}

export default function BestSpotCard({ libraries }: BestSpotCardProps) {
  const safeLibraries = Array.isArray(libraries) ? libraries : [];
  const openLibraries = safeLibraries.filter((l) => l.isOpen);

  if (openLibraries.length === 0) {
    return (
      <div
        className="w-full rounded-2xl px-5 py-4 text-center text-sm font-medium"
        style={{
          backgroundColor: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
        }}
      >
        All libraries currently closed
      </div>
    );
  }

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
      {/* Ambient glow blob */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full opacity-25 blur-3xl"
        style={{ backgroundColor: "var(--accent)" }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: label + name + floor */}
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

        {/* Right: big percentage */}
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
