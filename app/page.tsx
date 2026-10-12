"use client";

import { useEffect, useState } from "react";
import CampusBoard from "@/components/CampusBoard";
import type { Campus } from "@/lib/occupancy";

const KEY = "lc-campus";

export default function Home() {
  const [campus, setCampus] = useState<Campus>("waterloo");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as Campus | null;
      if (saved === "waterloo" || saved === "regina" || saved === "uoft") setCampus(saved);
    } catch { /* ignore */ }
  }, []);

  function change(c: Campus) {
    setCampus(c);
    try { localStorage.setItem(KEY, c); } catch { /* ignore */ }
  }

  return <CampusBoard campus={campus} onCampusChange={change} />;
}
