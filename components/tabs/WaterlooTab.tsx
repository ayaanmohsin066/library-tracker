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

  const libraries = (data?.live ?? []).map((loc) => ({
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-400">
          {dataUpdatedAt ?? "Updating…"} · auto-refreshes every 5 min
        </p>
        <a
          href="https://libcal.uwaterloo.ca"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-1.5 self-start rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 active:bg-teal-800 sm:self-auto"
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
