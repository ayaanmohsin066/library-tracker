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
        }).then((json) => ({
          live: Array.isArray(json?.live) ? json.live : [],
          compare: json?.compare ?? {},
        })),
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
