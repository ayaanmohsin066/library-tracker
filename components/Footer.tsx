"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function getMostRecentFetch(queryClient: ReturnType<typeof useQueryClient>): number {
  let mostRecent = 0;
  for (const q of queryClient.getQueryCache().getAll()) {
    if (q.queryKey[0] === "library" && q.state.dataUpdatedAt > mostRecent) {
      mostRecent = q.state.dataUpdatedAt;
    }
  }
  return mostRecent > 0 ? mostRecent : Date.now();
}

const LINK: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text-secondary)",
  textDecoration: "none",
  transition: "color 150ms ease",
};

export default function Footer() {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setLastUpdated(formatTime(getMostRecentFetch(queryClient)));
    return queryClient.getQueryCache().subscribe(() =>
      setLastUpdated(formatTime(getMostRecentFetch(queryClient)))
    );
  }, [queryClient]);

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        backgroundColor: "var(--bg-base)",
        padding: "36px 24px 40px",
      }}
    >
      <div
        className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between"
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
        {/* Left — brand */}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            © 2026 LibraryCheck
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Real-time library occupancy for Canadian universities.
          </p>
        </div>

        {/* Center — links */}
        <nav
          className="flex flex-wrap gap-x-6 gap-y-2"
          style={{ alignItems: "center" }}
        >
          <a href="/about" style={LINK}>About</a>
          <a href="mailto:suggest@librarycheck.ca" style={LINK}>Suggest a university</a>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...LINK, display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </nav>

        {/* Right — timestamp */}
        <p style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          {lastUpdated ? `Last updated: ${lastUpdated}` : ""}
        </p>
      </div>
    </footer>
  );
}
