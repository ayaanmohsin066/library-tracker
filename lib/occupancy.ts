export type Level = "low" | "mid" | "high" | "closed";

/** pct is 0–100 */
export function level(pct: number, isOpen = true): Level {
  if (!isOpen) return "closed";
  return pct > 80 ? "high" : pct > 50 ? "mid" : "low";
}

export const LEVEL_COLOR: Record<Level, string> = {
  low: "var(--ok)",
  mid: "var(--warn)",
  high: "var(--bad)",
  closed: "var(--off)",
};

export function levelLabel(pct: number, isOpen = true): string {
  if (!isOpen) return "Closed";
  if (pct < 25) return "Plenty of seats";
  if (pct <= 50) return "Some seats";
  if (pct <= 80) return "Filling up";
  return "Nearly full";
}

/** Waitz's hourSummary is often just "open"; only show it when it says something useful. */
export function usefulHours(summary?: string | null): string | null {
  if (!summary) return null;
  const s = summary.trim();
  if (!s || /^open$/i.test(s) || /^closed$/i.test(s)) return null;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function mapsUrl(name: string, city: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${city}`)}`;
}

export type Campus = "waterloo" | "regina" | "uoft";

export const CAMPUSES: Record<Campus, { name: string; short: string; city: string; site: string; live: boolean }> = {
  waterloo: { name: "University of Waterloo", short: "Waterloo", city: "Waterloo, Ontario",    site: "https://lib.uwaterloo.ca",     live: true  },
  regina:   { name: "University of Regina",   short: "Regina",   city: "Regina, Saskatchewan", site: "https://www.uregina.ca/library/",   live: true  },
  uoft:     { name: "University of Toronto",  short: "UofT",     city: "Toronto, Ontario",     site: "https://library.utoronto.ca",  live: false },
};
