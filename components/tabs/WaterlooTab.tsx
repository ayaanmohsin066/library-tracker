"use client";

import useLibraryData from "@/hooks/useLibraryData";
import LibraryCard from "@/components/LibraryCard";
import BestSpotCard from "@/components/BestSpotCard";
import { SkeletonCard, ErrorBanner, StaleBanner } from "./shared";

export default function WaterlooTab() {
  const { data, isLoading, isError, isStale, dataUpdatedAt, refetch } =
    useLibraryData("waterloo");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (isError && !data) {
    return <ErrorBanner onRetry={refetch} />;
  }

  const FLOOR_STACK_LIBS = new Set(["Dana Porter Library"]);

  const raw = Array.isArray(data?.live) ? data.live : [];
  const libraries = raw.map((loc) => ({
    name: loc.name,
    percentage: loc.percentage,
    people: loc.people,
    capacity: loc.capacity,
    isOpen: loc.isOpen,
    hourSummary: loc.hourSummary,
    subLocs: loc.subLocs ?? [],
    hasFloorStack: FLOOR_STACK_LIBS.has(loc.name),
  }));

  return (
    <div className="space-y-5">
      {isStale && <StaleBanner onRetry={refetch} />}

      {/* Meta bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {dataUpdatedAt ?? "Updating…"} · auto-refreshes every 5 min
        </p>
        <a
          href="https://libcal.uwaterloo.ca"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-1.5 self-start rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95 sm:self-auto"
          style={{
            backgroundColor: "var(--accent)",
            boxShadow: "0 0 14px var(--accent-glow)",
          }}
        >
          Book a Study Room
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <BestSpotCard libraries={libraries} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {libraries.map((lib) => (
          <LibraryCard key={lib.name} {...lib} />
        ))}
      </div>
    </div>
  );
}
