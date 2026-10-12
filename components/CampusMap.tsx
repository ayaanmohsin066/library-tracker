"use client";

import { useState, useEffect } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { buildings, type Building, type StudySpace } from "@/lib/buildingData";
import { FilterChips, Tag, ExternalIcon } from "@/components/ui";

// ── Category system ───────────────────────────────────────────────────────────

type Category = "library" | "college-library" | "lab" | "study" | "cafe";
type FilterKey = "all" | "libraries" | "labs" | "study" | "cafes";

const BUILDING_CATEGORY: Record<string, Category> = {
  "dana-porter":      "library",
  "davis-centre":     "library",
  "musagetes":        "library",
  "conrad-grebel":    "college-library",
  "renison":          "college-library",
  "st-jeromes":       "college-library",
  "pharmacy":         "study",
  "needles-hall":     "study",
  "slc":              "study",
  "tatham-centre":    "study",
  "hagey-hall":       "study",
  "stc":              "study",
  "qnc":              "study",
  "e2":               "lab",
  "cph":              "lab",
  "physics":          "lab",
  "e5":               "lab",
  "mc":               "lab",
  "modern-languages": "cafe",
  "ev1":              "cafe",
  "ev3":              "cafe",
};

const CATEGORY_META: Record<Category, { filterKey: FilterKey; badge: string }> = {
  "library":         { filterKey: "libraries", badge: "Library"         },
  "college-library": { filterKey: "libraries", badge: "College library" },
  "lab":             { filterKey: "labs",      badge: "Lab"             },
  "study":           { filterKey: "study",     badge: "Study space"     },
  "cafe":            { filterKey: "cafes",     badge: "Café"            },
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",       label: "All"          },
  { key: "libraries", label: "Libraries"    },
  { key: "labs",      label: "Labs"         },
  { key: "study",     label: "Study spaces" },
  { key: "cafes",     label: "Cafés"        },
];

function getCategory(b: Building): Category {
  return BUILDING_CATEGORY[b.id] ?? "study";
}

function matchesFilter(b: Building, f: FilterKey): boolean {
  if (f === "all") return true;
  return CATEGORY_META[getCategory(b)].filterKey === f;
}

const NOISE_LABEL: Record<StudySpace["noiseLevel"], string> = {
  silent: "Silent",
  quiet: "Quiet",
  collaborative: "Talking OK",
};

const TYPE_LABEL: Record<StudySpace["type"], string> = {
  individual: "Individual",
  group: "Group",
  lounge: "Lounge",
  classroom: "Classroom",
};

// ── Theme ─────────────────────────────────────────────────────────────────────

/** Follows the `light` class that ThemeToggle sets on <html>. */
function useIsLight() {
  const [isLight, setIsLight] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setIsLight(root.classList.contains("light"));
    read();
    const obs = new MutationObserver(read);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isLight;
}

// ── Space row ─────────────────────────────────────────────────────────────────

function SpaceRow({ space }: { space: StudySpace }) {
  const notes = space.notes && space.notes !== "Bookable online" ? space.notes : null;
  return (
    <li className="border-t border-[var(--line)] py-4 first:border-t-0 first:pt-0">
      <p className="text-[15px] font-medium">{space.name}</p>
      <p className="mt-0.5 text-[13px] text-[var(--muted)]">{space.floor}</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <Tag>{TYPE_LABEL[space.type]}</Tag>
        <Tag>{NOISE_LABEL[space.noiseLevel]}</Tag>
        {space.outlets && <Tag>Outlets</Tag>}
        {space.printer && <Tag>Printer</Tag>}
        {space.keycardRequired && <Tag>Keycard</Tag>}
      </div>
      {notes && <p className="mt-2 text-[13px] text-[var(--muted)]">{notes}</p>}
      {space.bookingUrl && (
        <a href={space.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-3 !h-9 !px-3 !text-[13px]">
          Book <ExternalIcon />
        </a>
      )}
    </li>
  );
}

// ── Side panel (desktop) / bottom sheet (mobile) ──────────────────────────────

function Panel({ building, onClose }: { building: Building; onClose: () => void }) {
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${building.coords[0]},${building.coords[1]}`;

  return (
    <>
      <div onClick={onClose} aria-hidden="true" className="fixed inset-0 top-14 z-30 bg-black/40 md:hidden" />
      <aside
        aria-label={building.name}
        className="animate-rise fixed inset-x-0 bottom-0 z-40 max-h-[65dvh] overflow-y-auto rounded-t-[var(--radius)] border-t border-[var(--line-strong)] bg-[var(--surface)] md:inset-x-auto md:bottom-0 md:right-0 md:top-14 md:max-h-none md:w-[380px] md:rounded-none md:border-l md:border-t-0"
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] text-[var(--muted)]">{CATEGORY_META[getCategory(building)].badge}</p>
              <h2 className="mt-1 text-xl font-semibold leading-tight tracking-[-0.02em]">{building.name}</h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>

          <p className="mt-3 text-[14px] leading-relaxed text-[var(--fg-2)]">{building.description}</p>

          <a href={directions} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-4">
            Directions <ExternalIcon />
          </a>

          <h3 className="eyebrow mb-4 mt-7">
            {building.studySpaces.length} study {building.studySpaces.length === 1 ? "space" : "spaces"}
          </h3>
          <ul>
            {building.studySpaces.map((space, i) => (
              <SpaceRow key={i} space={space} />
            ))}
          </ul>

          <a
            href="https://uwaterloo.ca/map/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-[var(--muted)] underline underline-offset-4 hover:text-[var(--fg)]"
          >
            Official campus map
          </a>
        </div>
      </aside>
    </>
  );
}

// ── Building marker ───────────────────────────────────────────────────────────

function BuildingMarker({
  building, isSelected, isDimmed, onSelect,
}: {
  building: Building;
  isSelected: boolean;
  isDimmed: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      aria-label={`${building.name}, ${building.studySpaces.length} study spaces`}
      aria-pressed={isSelected}
      title={building.name}
      className={`num flex h-7 min-w-9 items-center justify-center rounded-md border px-1.5 text-[11px] font-medium shadow-sm transition-opacity ${
        isSelected
          ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]"
          : "border-[var(--line-strong)] bg-[var(--surface)] text-[var(--fg)] hover:border-[var(--fg)]"
      } ${isDimmed ? "opacity-25" : ""}`}
    >
      {building.shortName}
    </button>
  );
}

// ── Token guard ───────────────────────────────────────────────────────────────

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const TOKEN_MISSING = !TOKEN || TOKEN === "pk.eyJ1IjoiZXhhbXBsZSJ9.example";
if (TOKEN_MISSING) {
  console.warn("Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local (free token at mapbox.com)");
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CampusMap() {
  const [selected,     setSelected]     = useState<Building | null>(null);
  const [isMobile,     setIsMobile]     = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const isLight = useIsLight();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const shown = buildings.filter((b) => matchesFilter(b, activeFilter));
  const spaceCount = shown.reduce((sum, b) => sum + b.studySpaces.length, 0);
  const counts = Object.fromEntries(
    FILTERS.map((f) => [f.key, buildings.filter((b) => matchesFilter(b, f.key)).length]),
  ) as Record<FilterKey, number>;

  if (TOKEN_MISSING) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-8 text-center">
        <h2 className="text-lg font-semibold">Map unavailable</h2>
        <p className="max-w-sm text-sm text-[var(--muted)]">
          Add a Mapbox token as <code className="num text-[var(--fg-2)]">NEXT_PUBLIC_MAPBOX_TOKEN</code> in{" "}
          <code className="num text-[var(--fg-2)]">.env.local</code> to turn the map on.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="shrink-0 border-b border-[var(--line)] bg-[var(--bg)] py-2.5">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <FilterChips
              options={FILTERS}
              value={activeFilter}
              onChange={(k) => { setActiveFilter(k); setSelected(null); }}
              counts={counts}
            />
          </div>
          <p className="hidden shrink-0 text-[13px] text-[var(--muted)] lg:block">
            <span className="num text-[var(--fg-2)]">{spaceCount}</span> study spaces in{" "}
            <span className="num text-[var(--fg-2)]">{shown.length}</span> buildings
          </p>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
      <Map
        mapboxAccessToken={TOKEN}
        initialViewState={{ longitude: -80.5435, latitude: 43.4710, zoom: 15.8 }}
        minZoom={14}
        maxZoom={19}
        scrollZoom={!isMobile}
        style={{ width: "100%", height: "100%" }}
        mapStyle={isLight ? "mapbox://styles/mapbox/light-v11" : "mapbox://styles/mapbox/dark-v11"}
        onClick={() => setSelected(null)}
      >
        {buildings.map((b) => (
          <Marker key={b.id} longitude={b.coords[1]} latitude={b.coords[0]} anchor="center">
            <BuildingMarker
              building={b}
              isSelected={selected?.id === b.id}
              isDimmed={!matchesFilter(b, activeFilter)}
              onSelect={() => setSelected((prev) => (prev?.id === b.id ? null : b))}
            />
          </Marker>
        ))}
      </Map>

      </div>

      {selected && <Panel building={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
