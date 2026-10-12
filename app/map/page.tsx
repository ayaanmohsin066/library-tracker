import dynamic from "next/dynamic";

const CampusMap = dynamic(() => import("@/components/CampusMap"), { ssr: false });

export default function MapPage() {
  return (
    <div style={{ height: "calc(100dvh - 56px)", overflow: "hidden", background: "var(--bg)" }}>
      <CampusMap />
    </div>
  );
}
