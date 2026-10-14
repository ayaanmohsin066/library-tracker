/**
 * UofT has no live occupancy feed. These are hand-entered "typical
 * busyness" curves (0–10 per hour, 9am–9pm) used to show an ESTIMATE.
 * Anything rendering them must label the value as an estimate.
 */
export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

export const POPULAR_TIMES: Record<DayKey, number[]> = {
  mon: [1, 2, 3, 5, 7, 8, 5, 5, 5, 4, 4, 3, 2],
  tue: [1, 2, 4, 6, 8, 9, 10, 8, 7, 6, 5, 3, 2],
  wed: [1, 2, 4, 6, 8, 9, 10, 8, 6, 5, 5, 4, 3],
  thu: [1, 3, 5, 7, 8, 9, 10, 8, 7, 4, 3, 2, 1],
  fri: [1, 2, 3, 4, 5, 5, 5, 5, 4, 3, 2, 1, 1],
  sat: [1, 1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 2, 1],
  sun: [0, 1, 1, 2, 2, 3, 3, 3, 4, 3, 3, 3, 2],
};

export const UOFT_LIBRARIES = [
  { name: "Robarts Library",            description: "Main research library with 14 floors of collections.",         hours: "Mon–Thu 8am–10pm · Fri 8am–8pm · Sat–Sun 10am–8pm", bookingUrl: "https://libcal.library.utoronto.ca/r/search/robarts" },
  { name: "Gerstein Library",           description: "Health sciences library open 24/7 during the semester.",        hours: "Open 24/7 during term",                                 bookingUrl: "https://libcal.library.utoronto.ca/reserve/gerstein" },
  { name: "OISE Library",               description: "Specializes in education and social work resources.",           hours: "Mon–Fri 9am–8pm · Sat 10am–5pm",                        bookingUrl: "https://libcal.library.utoronto.ca/r/search/OISE" },
  { name: "Engineering & CS Library",   description: "Technical resources for engineering and computer science.",    hours: "Mon–Fri 8:30am–8pm · Sat 10am–5pm",                     bookingUrl: "https://libcal.library.utoronto.ca/reserve/engineering" },
  { name: "University College Library", description: "Intimate reading rooms in a historic building.",               hours: "Mon–Fri 9am–7pm",                                       bookingUrl: "https://libcal.library.utoronto.ca/r/search/uclibrary" },
  { name: "Chemistry Library",          description: "Specialized chemistry and materials science collection.",       hours: "Mon–Fri 9am–5pm",                                       bookingUrl: "https://libcal.library.utoronto.ca/reserve/chemistry" },
  { name: "John W. Graham Library",     description: "Trinity College library with rare book holdings.",             hours: "Mon–Fri 9am–6pm",                                       bookingUrl: "https://libcal.library.utoronto.ca/r/search/graham" },
  { name: "John M. Kelly Library",      description: "St. Michael's College library with theology collections.",     hours: "Mon–Fri 9am–7pm · Sat 12pm–5pm",                        bookingUrl: "https://libcal.library.utoronto.ca/r/search/kelly" },
  { name: "UTSC Library",               description: "Full-service library at the Scarborough campus.",              hours: "Mon–Thu 8am–10pm · Fri 8am–7pm · Sat–Sun 10am–6pm",    bookingUrl: "https://libcal.library.utoronto.ca/reserve/spaces/utsclibrary" },
];



export const JS_DAY_TO_KEY: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
export function todayKey(): DayKey { return JS_DAY_TO_KEY[new Date().getDay()]; }
export function currentHourIndex(): number | null {
  const h = new Date().getHours();
  if (h < 9 || h > 21) return null;
  return h - 9;
}
export function hourLabel(i: number): string {
  const h = 9 + i;
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}


/** Typical busyness right now (0–10), or null outside 9am–9pm. */
export function typicalNow(date = new Date()): number | null {
  const idx = currentHourIndex();
  if (idx === null) return null;
  return POPULAR_TIMES[JS_DAY_TO_KEY[date.getDay()]][idx] ?? null;
}
