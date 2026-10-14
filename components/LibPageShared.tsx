"use client";

import { useState } from "react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { colorFor, LEVEL_COLOR, LEVEL_LABEL, levelFor, toPct } from "@/lib/occupancy";

// Kept for any external callers; delegates to the shared classification.
export function occupancyColor(pct: number): string {
  return colorFor(pct);
}

// ── Occupancy Ticker ────────────────────────────────────────────────
export type TickerLib = { name: string; percentage: number; isOpen: boolean };

/**
 * A slow marquee of every library on this campus. Duplicated once so the
 * loop is seamless; the copy is aria-hidden. Pauses on hover so it can be
 * read, and is static under reduced motion (global CSS).
 */
export function OccupancyTicker({ libs }: { libs: TickerLib[] }) {
  if (!libs.length) return null;
  const duration = Math.max(24, libs.length * 9);
  const item = (lib: TickerLib, i: number, hidden: boolean) => {
    const pct = toPct(lib.percentage);
    const lvl = levelFor(pct, lib.isOpen);
    return (
      <span key={`${hidden ? "b" : "a"}${i}`} className="ticker-item" aria-hidden={hidden || undefined}>
        <span className="ticker-dot" style={{ background: LEVEL_COLOR[lvl] }} />
        <span>{lib.name}</span>
        <span style={{ color: LEVEL_COLOR[lvl] }}>{lib.isOpen ? `${pct}%` : "Closed"}</span>
      </span>
    );
  };
  return (
    <div className="ticker" role="region" aria-label="All libraries at a glance">
      <div className="ticker-track" style={{ animationDuration: `${duration}s` }}>
        {libs.map((l, i) => item(l, i, false))}
        {libs.map((l, i) => item(l, i, true))}
      </div>
    </div>
  );
}

// ── Refresh button ──────────────────────────────────────────────────
function RefreshButton({ onClick }: { onClick: () => void }) {
  const [spinning, setSpinning] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={() => {
        onClick();
        setSpinning(true);
        setTimeout(() => setSpinning(false), 600);
      }}
    >
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        style={{ transform: spinning ? "rotate(360deg)" : "none", transition: spinning ? "transform 600ms var(--ease-out)" : "none" }}
      >
        <path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" />
      </svg>
      Refresh
    </button>
  );
}

// ── Live Page Header ────────────────────────────────────────────────
export function LivePageHeader({
  title,
  dataUpdatedAt,
  refetch,
  showMapLink,
  eyebrow = "Live occupancy",
  description,
}: {
  title: string;
  dataUpdatedAt: string | null;
  refetch: () => void;
  showMapLink?: boolean;
  eyebrow?: string;
  description?: string;
}) {
  return (
    <header className="campus-head">
      <div style={{ minWidth: 0 }}>
        <p className="eyebrow animate-fade-up" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="live-dot" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 className="display text-balance animate-fade-up" style={{ fontSize: "clamp(2.75rem, 7vw, 5.5rem)", margin: "16px 0 0", animationDelay: "60ms" }}>
          {title}
        </h1>
        {description && (
          <p className="animate-fade-up" style={{ margin: "16px 0 0", color: "var(--paper-1)", maxWidth: "54ch", animationDelay: "120ms" }}>
            {description}
          </p>
        )}
      </div>

      <div className="campus-head-actions animate-fade-up" style={{ animationDelay: "160ms" }}>
        {dataUpdatedAt && (
          <span className="eyebrow tabular" aria-live="polite">{dataUpdatedAt}</span>
        )}
        <RefreshButton onClick={refetch} />
        {showMapLink && (
          <Link href="/map" className="btn btn-ghost btn-sm">
            Campus map <span className="btn-arrow" aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </header>
  );
}

// ── Stat strip ──────────────────────────────────────────────────────
export function StatChipsRow({
  total, openNow, quietest, busiest,
}: {
  total: number;
  openNow: number;
  quietest: { name: string; pct: number } | null;
  busiest:  { name: string; pct: number } | null;
}) {
  const short = (n: string) => n.replace(/ Library$/i, "");
  const cells: { label: string; value: React.ReactNode }[] = [
    { label: "Libraries", value: total },
    { label: "Open now", value: openNow },
    {
      label: "Quietest",
      value: quietest
        ? <><span className="stat-name">{short(quietest.name)}</span><span style={{ color: colorFor(quietest.pct) }}>{quietest.pct}%</span></>
        : "—",
    },
    {
      label: "Busiest",
      value: busiest
        ? <><span className="stat-name">{short(busiest.name)}</span><span style={{ color: colorFor(busiest.pct) }}>{busiest.pct}%</span></>
        : "—",
    },
  ];
  return (
    <dl className="stat-strip">
      {cells.map((c, i) => (
        <Reveal key={c.label} delay={i * 60} className="stat-cell">
          <dt className="eyebrow">{c.label}</dt>
          <dd className="tabular">{c.value}</dd>
        </Reveal>
      ))}
    </dl>
  );
}

// ── Library Card ────────────────────────────────────────────────────
export interface LibProps {
  name: string;
  percentage: number;
  people: number;
  capacity: number;
  isOpen: boolean;
  hourSummary: string;
  subLocs: { name: string; percentage: number; people: number; capacity: number; isOpen: boolean }[];
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  /** position in the grid, used to stagger the entrance */
  index?: number;
}

export function LibraryCard({
  name, percentage, people, capacity, isOpen, hourSummary, subLocs,
  isFavorite = false, onToggleFavorite, index = 0,
}: LibProps) {
  const [floorsOpen, setFloorsOpen] = useState(true);
  const [justSaved, setJustSaved] = useState(false);
  const pct   = toPct(percentage);
  const level = levelFor(pct, isOpen);
  const color = LEVEL_COLOR[level];
  const floors = Array.isArray(subLocs) ? subLocs : [];
  const floorsId = `floors-${name.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <Reveal delay={Math.min(index, 8) * 70} as="article" className="lib-card" style={{ ["--lvl" as string]: color }}>
      <header className="lib-card-head">
        <h3 className="lib-card-name">{name}</h3>
        <span className="status-pill" style={{ color }}>
          <span className="status-dot" style={{ background: color }} aria-hidden="true" />
          {LEVEL_LABEL[level]}
        </span>
        {onToggleFavorite && (
          <button
            type="button"
            className="icon-btn"
            data-pop={justSaved ? "true" : "false"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
              if (!isFavorite) { setJustSaved(true); setTimeout(() => setJustSaved(false), 400); }
            }}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Remove ${name} from saved` : `Save ${name}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"
              fill={isFavorite ? "var(--brass)" : "none"} stroke={isFavorite ? "var(--brass)" : "currentColor"} strokeWidth="1.8" strokeLinejoin="round">
              <path d="M6 3h12v18l-6-4-6 4z" />
            </svg>
          </button>
        )}
      </header>

      <div className="lib-card-figure">
        {isOpen ? (
          <span className="display tabular lib-card-pct">
            {pct}<span className="lib-card-pct-unit">%</span>
          </span>
        ) : (
          <span className="display lib-card-pct" style={{ fontSize: 40, color: "var(--paper-2)" }}>Closed</span>
        )}
        <span className="lib-card-seats tabular">
          {people.toLocaleString()} <span style={{ color: "var(--paper-2)" }}>/ {capacity.toLocaleString()} seats</span>
        </span>
      </div>

      <div className="lib-bar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`${name} occupancy`}>
        <span style={{ width: `${isOpen ? pct : 0}%`, background: color }} />
      </div>
      <p className="lib-card-hours">{hourSummary}</p>

      {floors.length > 0 && (
        <div className="lib-floors">
          <button
            type="button"
            className="lib-floors-toggle"
            onClick={() => setFloorsOpen((v) => !v)}
            aria-expanded={floorsOpen}
            aria-controls={floorsId}
          >
            <span className="eyebrow">By floor · {floors.length}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"
              style={{ transform: floorsOpen ? "rotate(180deg)" : "none", transition: "transform var(--dur-2) var(--ease-out)" }}>
              <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>

          {/* grid-rows 0fr→1fr animates height without measuring */}
          <div id={floorsId} className="lib-floors-body" data-open={floorsOpen ? "true" : "false"}>
            <ul>
              {floors.map((loc) => {
                const lp = toPct(loc.percentage);
                const lc = colorFor(lp, loc.isOpen);
                return (
                  <li key={loc.name} className="floor-row">
                    <span className="floor-name" title={loc.name}>{loc.name}</span>
                    <span className="floor-bar" aria-hidden="true"><span style={{ width: `${loc.isOpen ? lp : 0}%`, background: lc }} /></span>
                    <span className="floor-pct tabular" style={{ color: loc.isOpen ? lc : "var(--paper-2)" }}>
                      {loc.isOpen ? `${lp}%` : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </Reveal>
  );
}

// ── Skeleton Card ───────────────────────────────────────────────────
export function SkeletonLibCard() {
  return (
    <div className="lib-card" aria-hidden="true" style={{ minHeight: 320 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 28 }}>
        <span className="animate-shimmer" style={{ height: 16, width: 160, borderRadius: 2 }} />
        <span className="animate-shimmer" style={{ height: 16, width: 56, borderRadius: 2 }} />
      </div>
      <span className="animate-shimmer" style={{ display: "block", height: 56, width: 120, borderRadius: 2, marginBottom: 16 }} />
      <span className="animate-shimmer" style={{ display: "block", height: 4, width: "100%", borderRadius: 2, marginBottom: 28 }} />
      {[1, 2, 3].map((i) => (
        <span key={i} className="animate-shimmer" style={{ display: "block", height: 10, width: `${90 - i * 12}%`, borderRadius: 2, marginBottom: 12 }} />
      ))}
    </div>
  );
}

// ── Saved libraries ─────────────────────────────────────────────────
function FavoriteMiniCard({ lib, onRemove }: { lib: LibProps; onRemove: () => void }) {
  const pct = toPct(lib.percentage);
  const color = colorFor(pct, lib.isOpen);
  return (
    <li className="fav-row">
      <span className="status-dot" style={{ background: color }} aria-hidden="true" />
      <span className="fav-name">{lib.name}</span>
      <span className="tabular" style={{ color: lib.isOpen ? color : "var(--paper-2)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
        {lib.isOpen ? `${pct}%` : "Closed"}
      </span>
      <button type="button" className="icon-btn" onClick={onRemove} aria-label={`Remove ${lib.name} from saved`}>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" /></svg>
      </button>
    </li>
  );
}

export function MyLibrariesSection({
  libs,
  favorites,
  removeFavorite,
}: {
  libs: LibProps[];
  favorites: string[];
  removeFavorite: (name: string) => void;
}) {
  const favLibs = libs.filter((l) => favorites.includes(l.name));
  if (!favLibs.length) return null;

  return (
    <section id="my-libraries" aria-labelledby="saved-title" style={{ marginBottom: 32, scrollMarginTop: 96 }}>
      <h2 id="saved-title" className="eyebrow" style={{ margin: "0 0 12px" }}>Your saved libraries</h2>
      <ul className="fav-list">
        {favLibs.map((lib) => (
          <FavoriteMiniCard key={lib.name} lib={lib} onRemove={() => removeFavorite(lib.name)} />
        ))}
      </ul>
    </section>
  );
}
