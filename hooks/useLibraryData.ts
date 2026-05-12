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
  return `Updated ${Math.floor(diffMin / 60)} hr ago`;
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
      queryFn: async () => {
        const res  = await fetch(`/api/live?uni=${uni}`);
        const text = await res.text();

        if (!res.ok) {
          console.error(`[useLibraryData] /api/live?uni=${uni} ${res.status}:`, text.slice(0, 500));
          throw new Error(`fetch_failed:${res.status}`);
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          console.error(`[useLibraryData] JSON parse error for ${uni}:`, e, "raw:", text.slice(0, 300));
          throw new Error("parse_failed");
        }

        const apiJson = parsed as Record<string, unknown>;
        const live: WaitzLocation[] = Array.isArray(apiJson?.live)
          ? (apiJson.live as WaitzLocation[])
          : [];

        console.log(`[useLibraryData] ${uni} live.length=${live.length}`, live[0] ?? "(empty)");

        // Fire-and-forget snapshot
        try {
          const snapshots = live.flatMap((loc) => [
            { library_name: loc.name, floor_name: null, percent_full: Math.round(loc.percentage * 100) },
            ...(loc.subLocs ?? []).map((sub) => ({
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
        } catch (e) {
          console.warn("[useLibraryData] snapshot build failed:", e);
        }

        return { live, compare: (apiJson?.compare as Record<string, unknown>) ?? {} };
      },
      refetchInterval: 300_000,
      staleTime:       300_000,
      gcTime:          600_000,
      retry: 1,
    });

  return {
    data,
    isLoading,
    isError,
    isStale: isError && data !== undefined,
    refetch,
    dataUpdatedAt: dataUpdatedAt ? formatUpdatedAt(dataUpdatedAt, now) : null,
  };
}
