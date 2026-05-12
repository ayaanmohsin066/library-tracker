import dynamic from "next/dynamic";

const CampusMap = dynamic(() => import("@/components/CampusMap"), { ssr: false });

export default function MapPage() {
  return (
    <div style={{ height: "calc(100vh - 80px)", overflow: "hidden", background: "#111318" }}>
      <CampusMap />
    </div>
  );
}
