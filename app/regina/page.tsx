"use client";

import useLibraryData from "@/hooks/useLibraryData";
import { useFavorites } from "@/hooks/useFavorites";
import { ErrorBanner, StaleBanner } from "@/components/tabs/shared";
import {
  OccupancyTicker,
  LivePageHeader,
  StatChipsRow,
  LibraryCard,
  SkeletonLibCard,
  MyLibrariesSection,
} from "@/components/LibPageShared";

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
  const { favorites, toggleFavorite, removeFavorite } = useFavorites();

  return (
    <div>

      {/* ── Occupancy Ticker ─────────────────────────────────────── */}
      {hasData && <OccupancyTicker libs={libraries} />}

      {/* ── Page content ─────────────────────────────────────────── */}
      <div className="container-lc" style={{ paddingBottom: "var(--s-16)" }}>

        <LivePageHeader
          title="University of Regina"
          description="Live occupancy for University of Regina libraries, floor by floor."
          dataUpdatedAt={dataUpdatedAt}
          refetch={refetch}
        />

        {/* Stale banner */}
        {isStale && (
          <div style={{ marginBottom: 20 }}>
            <StaleBanner onRetry={refetch} />
          </div>
        )}

        {/* My Libraries */}
        <MyLibrariesSection libs={libraries} favorites={favorites} removeFavorite={removeFavorite} />

        {/* Summary chips */}
        {hasData && (
          <StatChipsRow
            total={libraries.length}
            openNow={openLibs.length}
            quietest={quietest ? { name: quietest.name, pct: Math.round(quietest.percentage * 100) } : null}
            busiest={busiest  ? { name: busiest.name,  pct: Math.round(busiest.percentage  * 100) } : null}
          />
        )}

        {/* Library card grid */}
        {hasData ? (
          <div className="lib-grid">
            {sorted.map((lib, i) => (
              <LibraryCard
                key={lib.name}
                {...lib}
                index={i}
                isFavorite={favorites.includes(lib.name)}
                onToggleFavorite={() => toggleFavorite(lib.name)}
              />
            ))}
          </div>
        ) : isLoading ? (
          <div className="lib-grid">
            {[1, 2].map((i) => <SkeletonLibCard key={i} />)}
          </div>
        ) : isError ? (
          <ErrorBanner onRetry={refetch} />
        ) : (
          <p style={{ fontSize: 14, color: "var(--paper-2)" }}>No data available.</p>
        )}

        {/* Footer */}
        <div className="page-note">
          <p style={{ margin: 0 }}>
            Data via Waitz · Not affiliated with the University of Regina ·{" "}
            <a
              href="https://www.uregina.ca/library/"
              target="_blank"
              rel="noopener noreferrer"
              className="link-u" style={{ color: "var(--paper-1)" }}
            >
              Official library site →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
