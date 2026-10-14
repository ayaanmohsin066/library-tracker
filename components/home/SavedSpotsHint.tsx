"use client";

import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";

/** Only rendered after localStorage hydration, and only if the user saved libraries. */
export default function SavedSpotsHint() {
  const { favorites } = useFavorites();
  if (!favorites.length) return null;
  return (
    <p style={{ marginTop: 20, fontSize: "var(--text-sm)", color: "var(--paper-1)" }}>
      You have {favorites.length} saved {favorites.length === 1 ? "library" : "libraries"} ·{" "}
      <Link href="/waterloo#my-libraries" className="link-u">Open saved</Link>
    </p>
  );
}
