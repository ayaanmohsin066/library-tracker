"use client";

import { useRouter } from "next/navigation";
import CampusBoard from "@/components/CampusBoard";

export default function WaterlooPage() {
  const router = useRouter();
  return (
    <CampusBoard
      campus="waterloo"
      title="Waterloo libraries"
      onCampusChange={(c) => router.push(`/${c}`)}
    />
  );
}
