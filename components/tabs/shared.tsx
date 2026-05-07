"use client";

export function SkeletonCard() {
  return (
    <div className="w-full animate-pulse rounded-2xl bg-white p-5 shadow-md ring-1 ring-gray-100 sm:p-6">
      <div className="flex items-start justify-between gap-2">
        <div className="h-5 w-40 rounded-full bg-gray-200" />
        <div className="h-5 w-12 rounded-full bg-gray-200" />
      </div>
      <div className="mt-2 h-3 w-24 rounded-full bg-gray-200" />
      <div className="mt-4 h-2 w-full rounded-full bg-gray-200" />
      <div className="mt-2 h-3 w-20 rounded-full bg-gray-200" />
      <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 w-28 rounded-full bg-gray-200" />
            <div className="h-2 flex-1 rounded-full bg-gray-200" />
            <div className="h-5 w-10 rounded-full bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl bg-red-50 px-5 py-4 ring-1 ring-red-200 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-center gap-2 text-sm font-medium text-red-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5 shrink-0"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
            clipRule="evenodd"
          />
        </svg>
        Live data unavailable — try refreshing
      </div>
      <button
        onClick={onRetry}
        className="inline-flex min-h-[44px] items-center rounded-lg bg-red-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 active:bg-red-800"
      >
        Retry
      </button>
    </div>
  );
}

export function StaleBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-amber-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 shrink-0"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
            clipRule="evenodd"
          />
        </svg>
        Showing last cached data · live feed unavailable
      </div>
      <button
        onClick={onRetry}
        className="inline-flex min-h-[44px] items-center self-start rounded-lg bg-amber-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 active:bg-amber-800 sm:self-auto"
      >
        Refresh
      </button>
    </div>
  );
}
