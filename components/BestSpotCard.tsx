"use client";

interface SubLocation {
  name: string;
  percentage: number;
  isOpen: boolean;
}

interface Library {
  name: string;
  percentage: number;
  isOpen: boolean;
  subLocs: SubLocation[];
}

interface BestSpotCardProps {
  libraries: Library[];
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6 shrink-0"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M2.25 12a9.75 9.75 0 1 1 19.5 0 9.75 9.75 0 0 1-19.5 0Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53-1.722-1.722a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.848-5.152Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function BestSpotCard({ libraries }: BestSpotCardProps) {
  const openLibraries = libraries.filter((l) => l.isOpen);

  if (openLibraries.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-gray-100 px-5 py-4 text-center text-sm font-medium text-gray-500 ring-1 ring-gray-200 sm:px-6">
        All libraries currently closed
      </div>
    );
  }

  const best = openLibraries.reduce((a, b) =>
    a.percentage <= b.percentage ? a : b
  );

  const bestFloor = best.subLocs
    .filter((s) => s.isOpen)
    .reduce<SubLocation | null>(
      (lowest, s) =>
        lowest === null || s.percentage < lowest.percentage ? s : lowest,
      null
    );

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-4 ring-1 ring-green-200 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
        <span className="text-green-500 sm:mt-0.5">
          <CheckIcon />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
            Best spot right now
          </p>

          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-xl font-bold text-gray-900 sm:text-2xl">
              {best.name}
            </span>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-semibold text-green-700 tabular-nums">
              {Math.round(best.percentage * 100)}% full
            </span>
          </div>

          {bestFloor && (
            <p className="mt-1 text-sm text-gray-500">
              Least busy floor:{" "}
              <span className="font-medium text-gray-700">{bestFloor.name}</span>
              {" · "}
              <span className="tabular-nums">
                {Math.round(bestFloor.percentage * 100)}% full
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
