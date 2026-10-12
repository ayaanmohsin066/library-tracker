"use client";

import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">{children}</div>;
}

export function PageHeader({ title, sub, right }: { title: string; sub?: ReactNode; right?: ReactNode }) {
  return (
    <header className="flex flex-col gap-6 pb-8 pt-10 sm:pt-16 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl">{title}</h1>
        {sub && <p className="mt-3 max-w-xl text-[15px] text-[var(--fg-2)]">{sub}</p>}
      </div>
      {right}
    </header>
  );
}

export function FilterChips<K extends string>({
  options, value, onChange, counts,
}: {
  options: { key: K; label: string }[];
  value: K;
  onChange: (k: K) => void;
  counts?: Partial<Record<K, number>>;
}) {
  return (
    <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0" role="tablist">
      {options.map(({ key, label }) => {
        const sel = key === value;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={sel}
            onClick={() => onChange(key)}
            className={`h-8 shrink-0 rounded-full border px-3.5 text-[13px] transition-colors ${
              sel
                ? "border-[var(--fg)] bg-[var(--fg)] font-medium text-[var(--bg)]"
                : "border-[var(--line-strong)] text-[var(--fg-2)] hover:text-[var(--fg)]"
            }`}
          >
            {label}
            {counts?.[key] !== undefined && <span className="num ml-1.5 opacity-60">{counts[key]}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "ok" | "warn" | "bad" }) {
  const color = tone === "neutral" ? "var(--fg-2)" : `var(--${tone})`;
  return (
    <span
      className="inline-flex h-6 items-center rounded-md px-2 text-[12px]"
      style={{ color, background: tone === "neutral" ? "var(--surface-2)" : `color-mix(in srgb, ${color} 12%, transparent)` }}
    >
      {children}
    </span>
  );
}

export function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  );
}
