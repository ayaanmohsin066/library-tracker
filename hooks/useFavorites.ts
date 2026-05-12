"use client";

import { useState, useEffect, useCallback } from "react";

const KEY = "lc_favorites";

function persist(names: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(names)); } catch { /* ignore */ }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setFavorites(JSON.parse(raw) as string[]);
    } catch { /* ignore */ }
  }, []);

  const addFavorite = useCallback((name: string) => {
    setFavorites((prev) => {
      if (prev.includes(name)) return prev;
      const next = [...prev, name];
      persist(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((name: string) => {
    setFavorites((prev) => {
      const next = prev.filter((n) => n !== name);
      persist(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (name: string) => favorites.includes(name),
    [favorites],
  );

  const toggleFavorite = useCallback((name: string) => {
    setFavorites((prev) => {
      const next = prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name];
      persist(next);
      return next;
    });
  }, []);

  return { favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite };
}
