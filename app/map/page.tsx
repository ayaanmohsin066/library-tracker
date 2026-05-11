import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";

const CampusMap = dynamic(() => import("@/components/CampusMap"), { ssr: false });

export default function MapPage() {
  return (
    <div style={{ height: "100vh", overflow: "hidden", backgroundColor: "var(--bg-base)" }}>
      <Navbar />
      <div style={{ height: "calc(100vh - 60px)", marginTop: 60 }}>
        <CampusMap />
      </div>
    </div>
  );
}
