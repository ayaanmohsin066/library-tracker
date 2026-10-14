/**
 * Single source of truth for how occupancy is classified and coloured.
 * Previously five components each had their own thresholds (some used
 * `> 80`, some `>= 0.8`), so the same library could be "busy" on one
 * page and "full" on another.
 *
 * Colours are CSS variables so they darken in the light theme (the bright
 * dark-mode values fail contrast on paper). The departure board pins the
 * dark values in its own scope because it is always a dark object.
 * Never append an alpha suffix to these — use color-mix() instead.
 */

export type Level = "quiet" | "busy" | "full" | "closed";

export const LEVEL_COLOR: Record<Level, string> = {
  quiet: "var(--quiet)",
  busy: "var(--busy)",
  full: "var(--full)",
  closed: "var(--closed)",
};

export const LEVEL_LABEL: Record<Level, string> = {
  quiet: "Quiet",
  busy: "Busy",
  full: "Packed",
  closed: "Closed",
};

/** pct is 0–100 */
export function levelFor(pct: number, isOpen = true): Level {
  if (!isOpen) return "closed";
  if (pct >= 80) return "full";
  if (pct >= 50) return "busy";
  return "quiet";
}

export function colorFor(pct: number, isOpen = true): string {
  return LEVEL_COLOR[levelFor(pct, isOpen)];
}

/** Clamp a Waitz 0–1 ratio to an integer percentage. */
export function toPct(ratio: unknown): number {
  const n = typeof ratio === "number" && Number.isFinite(ratio) ? ratio : 0;
  return Math.max(0, Math.min(100, Math.round(n * 100)));
}
