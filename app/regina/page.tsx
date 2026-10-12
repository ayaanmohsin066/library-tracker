"use client";

import { useRouter } from "next/navigation";
import CampusBoard from "@/components/CampusBoard";

export default function ReginaPage() {
  const router = useRouter();
  return (
    <CampusBoard
      campus="regina"
      title="Regina libraries"
      onCampusChange={(c) => router.push(`/${c}`)}
    />
  );
}
