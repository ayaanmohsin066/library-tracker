"use client";

import useLibraryData from "@/hooks/useLibraryData";
import LibraryCard from "@/components/LibraryCard";
import BestSpotCard from "@/components/BestSpotCard";
import { SkeletonCard, ErrorBanner, StaleBanner } from "./shared";

export default function ReginaTab() {
  const { data, isLoading, isError, isStale, dataUpdatedAt, refetch } =
    useLibraryData("regina");

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

  const raw = Array.isArray(data?.live) ? data.live : [];
  const libraries = raw.map((loc) => ({
    name: loc.name,
    percentage: loc.percentage,
    people: loc.people,
    capacity: loc.capacity,
    isOpen: loc.isOpen,
    hourSummary: loc.hourSummary,
    subLocs: loc.subLocs ?? [],
  }));

  return (
    <div className="space-y-5">
      {isStale && <StaleBanner onRetry={refetch} />}

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {dataUpdatedAt ?? "Updating…"} · auto-refreshes every 5 min
      </p>

      <BestSpotCard libraries={libraries} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {libraries.map((lib) => (
          <LibraryCard key={lib.name} {...lib} />
        ))}
      </div>

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        Room booking available through the University of Regina library website
      </p>
    </div>
  );
}
