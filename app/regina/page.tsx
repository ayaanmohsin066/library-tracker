import Navbar from "@/components/Navbar";
import ReginaTab from "@/components/tabs/ReginaTab";

export default function ReginaPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "88px 16px 80px" }}>
        <h1
          style={{
            fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "28px",
          }}
        >
          University of Regina
        </h1>
        <ReginaTab />
      </div>
    </div>
  );
}
