"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { WaitzLocation } from "@/app/api/live/route";

type Uni = "waterloo" | "regina";

interface LibraryApiResponse {
  live: WaitzLocation[];
  compare: Record<string, unknown>;
}

function formatUpdatedAt(timestamp: number, now: number): string {
  const diffSec = Math.floor((now - timestamp) / 1000);

  if (diffSec < 60) return "Updated just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Updated ${diffMin} min ago`;

  const diffHr = Math.floor(diffMin / 60);
  return `Updated ${diffHr} hr ago`;
}

export default function useLibraryData(uni: Uni) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { data, isLoading, isError, dataUpdatedAt, refetch } =
    useQuery<LibraryApiResponse>({
      queryKey: ["library", uni],
      queryFn: () =>
        fetch(`/api/live?uni=${uni}`).then((res) => {
          if (!res.ok) throw new Error("fetch_failed");
          return res.json();
        }).then((json) => {
          const live: WaitzLocation[] = Array.isArray(json?.live) ? json.live : [];

          // Fire-and-forget: record a snapshot without blocking the UI
          const snapshots = live.flatMap((loc) => [
            { library_name: loc.name, floor_name: null,     percent_full: Math.round(loc.percentage * 100) },
            ...loc.subLocs.map((sub) => ({
              library_name: loc.name,
              floor_name:   sub.name,
              percent_full: Math.round(sub.percentage * 100),
            })),
          ]);
          if (snapshots.length > 0) {
            fetch("/api/snapshot", {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify(snapshots),
            }).catch(() => {});
          }

          return { live, compare: json?.compare ?? {} };
        }),
      refetchInterval: 300_000,
      staleTime: 300_000,
      gcTime: 600_000,
      retry: 1,
    });

  return {
    data,
    isLoading,
    isError,
    // true when a background refetch failed but we still have previous data to show
    isStale: isError && data !== undefined,
    refetch,
    dataUpdatedAt: dataUpdatedAt ? formatUpdatedAt(dataUpdatedAt, now) : null,
  };
}
