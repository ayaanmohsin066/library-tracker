"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import useLibraryData from "@/hooks/useLibraryData";
import { useFavorites } from "@/hooks/useFavorites";
import {
  CAMPUSES, LEVEL_COLOR, level, levelLabel, mapsUrl, usefulHours, type Campus,
} from "@/lib/occupancy";
import { POPULAR_TIMES, todayKey, currentHourIndex } from "@/lib/uoftData";

/* ── Types ─────────────────────────────────────────────────────────── */

type Area = { name: string; percentage: number; people: number; capacity: number; isOpen: boolean };
export type Lib = Area & { hourSummary: string; subLocs: Area[] };

/* ── Small pieces ──────────────────────────────────────────────────── */

export function StatusDot({ pct, isOpen, live = false }: { pct: number; isOpen: boolean; live?: boolean }) {
  const color = LEVEL_COLOR[level(pct, isOpen)];
  return (
    <span className="relative inline-flex h-2 w-2 shrink-0">
      {live && isOpen && <span className="animate-live-ring absolute inset-0 rounded-full" style={{ background: color }} />}
      <span className="relative h-2 w-2 rounded-full" style={{ background: color }} />
    </span>
  );
}

export function Bar({ pct, isOpen, className = "" }: { pct: number; isOpen: boolean; className?: string }) {
  return (
    <div className={`bar ${className}`} role="presentation">
      <span style={{ width: `${Math.max(pct, isOpen ? 2 : 0)}%`, background: LEVEL_COLOR[level(pct, isOpen)] }} />
    </div>
  );
}

function StarButton({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      aria-label={on ? `Unsave ${label}` : `Save ${label}`}
      title={on ? "Saved" : "Save"}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-[var(--surface-2)] ${
        on ? "text-[var(--fg)]" : "text-[var(--muted)] hover:text-[var(--fg)]"
      }`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
      </svg>
    </button>
  );
}

export function CampusSwitcher({ value, onChange }: { value: Campus; onChange: (c: Campus) => void }) {
  return (
    <div role="tablist" aria-label="Campus" className="inline-flex rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1">
      {(Object.keys(CAMPUSES) as Campus[]).map((c) => {
        const active = c === value;
        return (
          <button
            key={c}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(c)}
            className={`h-8 rounded-lg px-3.5 text-sm transition-colors sm:px-4 ${
              active ? "bg-[var(--fg)] font-medium text-[var(--bg)]" : "text-[var(--fg-2)] hover:text-[var(--fg)]"
            }`}
          >
            {CAMPUSES[c].short}
          </button>
        );
      })}
    </div>
  );
}

/* ── Best bet ──────────────────────────────────────────────────────── */

function BestBet({ lib, city }: { lib: Lib; city: string }) {
  const pct = Math.round(lib.percentage * 100);
  const color = LEVEL_COLOR[level(pct)];
  const quietArea = [...lib.subLocs].filter((s) => s.isOpen).sort((a, b) => a.percentage - b.percentage)[0];

  return (
    <section className="card animate-rise overflow-hidden" aria-labelledby="best-bet">
      <div className="grid gap-x-6 gap-y-5 p-5 sm:p-7 md:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <p className="eyebrow mb-3">Best bet right now</p>
          <h2 id="best-bet" className="text-balance text-[28px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-4xl">
            {lib.name}
          </h2>
          {quietArea && (
            <p className="mt-3 text-[15px] text-[var(--fg-2)]">
              Quietest spot: <span className="text-[var(--fg)]">{quietArea.name}</span>{" "}
              <span className="num text-[var(--muted)]">· {Math.round(quietArea.percentage * 100)}%</span>
            </p>
          )}
        </div>

        <div className="md:row-span-2 md:self-end md:text-right">
          <div className="flex items-baseline gap-2 md:justify-end">
            <span className="num text-6xl font-medium leading-none sm:text-7xl" style={{ color }}>{pct}%</span>
            <span className="text-sm text-[var(--muted)]">full</span>
          </div>
          <p className="mt-2 text-sm text-[var(--fg-2)]">
            {levelLabel(pct)} · <span className="num">{lib.people.toLocaleString()}</span>
            <span className="text-[var(--muted)]"> / </span>
            <span className="num">{lib.capacity.toLocaleString()}</span> seats taken
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a href={mapsUrl(lib.name, city)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Directions
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9" /></svg>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Library row ───────────────────────────────────────────────────── */

function LibraryRow({
  lib, saved, onToggleSave, defaultOpen,
}: { lib: Lib; saved: boolean; onToggleSave: () => void; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const pct = Math.round(lib.percentage * 100);
  const hours = usefulHours(lib.hourSummary);
  const areas = [...lib.subLocs].sort((a, b) => Number(b.isOpen) - Number(a.isOpen) || a.percentage - b.percentage);
  const hasAreas = areas.length > 0;
  const panelId = `areas-${lib.name.replace(/\W+/g, "-")}`;

  return (
    <li className="border-t border-[var(--line)] first:border-t-0">
      <div className="flex items-center gap-2 pr-2 sm:pr-3">
        <button
          onClick={() => hasAreas && setOpen((v) => !v)}
          aria-expanded={hasAreas ? open : undefined}
          aria-controls={hasAreas ? panelId : undefined}
          disabled={!hasAreas}
          className="group grid min-w-0 flex-1 grid-cols-[auto_1fr_auto] items-center gap-x-3 py-4 pl-4 text-left sm:grid-cols-[auto_1fr_160px_56px] sm:pl-5 disabled:cursor-default"
        >
          <StatusDot pct={pct} isOpen={lib.isOpen} />
          <span className="min-w-0">
            <span className={`block truncate text-[15px] font-medium ${lib.isOpen ? "" : "text-[var(--muted)]"}`}>{lib.name}</span>
            <span className="block truncate text-[13px] text-[var(--muted)]">
              {lib.isOpen ? levelLabel(pct) : "Closed"}
              {hours ? ` · ${hours}` : ""}
              {hasAreas ? ` · ${areas.length} areas` : ""}
            </span>
          </span>
          <Bar pct={pct} isOpen={lib.isOpen} className="hidden sm:block" />
          <span className="num text-right text-[15px]" style={{ color: lib.isOpen ? "var(--fg)" : "var(--muted)" }}>
            {lib.isOpen ? `${pct}%` : "—"}
          </span>
        </button>
        <StarButton on={saved} onClick={onToggleSave} label={lib.name} />
        <span
          aria-hidden="true"
          className={`hidden h-8 w-5 items-center justify-center text-[var(--muted)] transition-transform sm:flex ${open ? "rotate-180" : ""} ${hasAreas ? "" : "invisible"}`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M3 4.5l3 3 3-3" /></svg>
        </span>
      </div>

      {hasAreas && open && (
        <ul id={panelId} className="animate-rise mx-4 mb-4 grid gap-x-8 gap-y-2.5 rounded-xl bg-[var(--surface-2)] p-4 sm:mx-5 md:grid-cols-2">
          {areas.map((a) => {
            const ap = Math.round(a.percentage * 100);
            return (
              <li key={a.name} className="grid grid-cols-[1fr_40px] sm:grid-cols-[1fr_72px_36px] items-center gap-3">
                <span className={`truncate text-[13px] ${a.isOpen ? "text-[var(--fg-2)]" : "text-[var(--muted)]"}`} title={a.name}>{a.name}</span>
                <Bar pct={ap} isOpen={a.isOpen} className="!hidden !h-1 !bg-[var(--line-strong)] sm:!block" />
                <span className="num text-right text-[13px] text-[var(--fg-2)]">{a.isOpen ? `${ap}%` : "—"}</span>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

function SkeletonBoard() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading live data">
      <div className="card p-7">
        <div className="animate-shimmer mb-4 h-3 w-28 rounded" />
        <div className="animate-shimmer mb-3 h-9 w-2/3 rounded-lg" />
        <div className="animate-shimmer h-4 w-1/2 rounded" />
      </div>
      <div className="card divide-y divide-[var(--line)]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 p-5">
            <div className="animate-shimmer h-2 w-2 rounded-full" />
            <div className="animate-shimmer h-4 flex-1 rounded" />
            <div className="animate-shimmer hidden h-1.5 w-40 rounded-full sm:block" />
            <div className="animate-shimmer h-4 w-10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Live board (Waterloo / Regina) ────────────────────────────────── */

function LiveBoard({ campus }: { campus: "waterloo" | "regina" }) {
  const meta = CAMPUSES[campus];
  const { data, isLoading, isError, dataUpdatedAt, refetch } = useLibraryData(campus);
  const { favorites, toggleFavorite } = useFavorites();

  const libs: Lib[] = useMemo(() => {
    const raw = Array.isArray(data?.live) ? data.live : [];
    return raw.map((l) => ({
      name: l.name,
      percentage: l.percentage ?? 0,
      people: l.people ?? 0,
      capacity: l.capacity ?? 0,
      isOpen: !!l.isOpen,
      hourSummary: l.hourSummary,
      subLocs: Array.isArray(l.subLocs) ? l.subLocs : [],
    }));
  }, [data]);

  const open = libs.filter((l) => l.isOpen).sort((a, b) => a.percentage - b.percentage);
  const sorted = [...open, ...libs.filter((l) => !l.isOpen)];
  const best = open[0];
  const savedHere = sorted.filter((l) => favorites.includes(l.name));

  if (isLoading) return <SkeletonBoard />;

  if (isError && !libs.length) {
    return (
      <div className="card p-7">
        <p className="font-medium">Couldn&apos;t reach the occupancy feed.</p>
        <p className="mt-1 text-sm text-[var(--muted)]">This usually clears up in a minute.</p>
        <button onClick={() => refetch()} className="btn btn-ghost mt-4">Try again</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-[var(--muted)]">
        <span className="inline-flex items-center gap-2">
          <StatusDot pct={0} isOpen live />
          <span>
            Live · {open.length} of {libs.length} open
            {dataUpdatedAt ? ` · ${dataUpdatedAt.replace("Updated ", "updated ")}` : ""}
          </span>
        </span>
        <button onClick={() => refetch()} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-[var(--surface-2)] hover:text-[var(--fg)]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5" /></svg>
          Refresh
        </button>
      </div>

      {best ? (
        <BestBet lib={best} city={meta.city} />
      ) : (
        <div className="card p-7">
          <p className="eyebrow mb-3">Right now</p>
          <p className="text-2xl font-semibold tracking-tight">Every library is closed.</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Check opening hours below, or try a 24/7 study room.</p>
          <Link href="/study-rooms" className="btn btn-ghost mt-4">Find a study room</Link>
        </div>
      )}

      {savedHere.length > 0 && (
        <section aria-labelledby="saved-h">
          <h3 id="saved-h" className="eyebrow mb-3">Saved</h3>
          <ul className="card">
            {savedHere.map((l) => (
              <LibraryRow key={l.name} lib={l} saved onToggleSave={() => toggleFavorite(l.name)} defaultOpen={false} />
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="all-h">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 id="all-h" className="eyebrow">All libraries · emptiest first</h3>
          {campus === "waterloo" && (
            <Link href="/map" className="text-[13px] text-[var(--muted)] underline-offset-4 hover:text-[var(--fg)] hover:underline">Campus map</Link>
          )}
        </div>
        <ul className="card">
          {sorted.map((l, i) => (
            <LibraryRow
              key={l.name}
              lib={l}
              saved={favorites.includes(l.name)}
              onToggleSave={() => toggleFavorite(l.name)}
              defaultOpen={i === 0 && l.isOpen}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ── UofT (no live sensors) ────────────────────────────────────────── */

export function UoftNow() {
  const day = todayKey();
  const idx = currentHourIndex();
  const value = idx !== null ? POPULAR_TIMES[day][idx] : null;
  const pct = value !== null ? value * 10 : 0;
  const label =
    value === null ? "Most libraries are closed or quiet at this hour"
    : value <= 3 ? "Usually quiet around now"
    : value <= 6 ? "Usually moderately busy around now"
    : "Usually busy around now";

  return (
    <div className="space-y-8">
      <div className="text-[13px] text-[var(--muted)]">No live sensors at UofT · showing typical patterns</div>
      <section className="card animate-rise overflow-hidden">
        <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow mb-3">Typical for this hour</p>
            <h2 className="text-balance text-[28px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-4xl">{label}</h2>
            <p className="mt-3 text-[15px] text-[var(--fg-2)]">
              Based on historical busyness, not a live count. Book a room to guarantee a seat.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/uoft" className="btn btn-primary">See libraries &amp; book</Link>
            </div>
          </div>
          {value !== null && (
            <div className="md:text-right">
              <div className="flex items-baseline gap-2 md:justify-end">
                <span className="num text-6xl font-medium leading-none sm:text-7xl" style={{ color: LEVEL_COLOR[level(pct)] }}>{value}</span>
                <span className="text-sm text-[var(--muted)]">/ 10 busy</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ── Board ─────────────────────────────────────────────────────────── */

export default function CampusBoard({
  campus, onCampusChange, title,
}: { campus: Campus; onCampusChange: (c: Campus) => void; title?: string }) {
  const meta = CAMPUSES[campus];

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <header className="flex flex-col gap-6 pb-8 pt-10 sm:pt-16 md:flex-row md:items-end md:justify-between">
        <h1 className="text-balance text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl">
          {title ?? <>Find a seat<br className="hidden sm:block" /> before you walk over.</>}
        </h1>
        <CampusSwitcher value={campus} onChange={onCampusChange} />
      </header>

      {meta.live ? <LiveBoard key={campus} campus={campus as "waterloo" | "regina"} /> : <UoftNow />}

      <footer className="mt-16 border-t border-[var(--line)] pt-5 text-[13px] text-[var(--muted)]">
        {meta.live ? "Occupancy data from Waitz. This page refreshes every 5 minutes." : "Historical estimates only."} Not affiliated with the {meta.name}.{" "}
        <a href={meta.site} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--fg)]">
          Official library site
        </a>
      </footer>
    </div>
  );
}
