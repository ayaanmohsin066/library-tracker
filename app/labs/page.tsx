"use client";

import Navbar from "@/components/Navbar";
import { labs, type Lab } from "@/lib/labData";

function BuildingBadge({ building }: { building: "MC" | "DC" }) {
  const colors: Record<"MC" | "DC", { bg: string; text: string; border: string }> = {
    MC: { bg: "rgba(6,182,212,0.12)",   text: "#06b6d4", border: "rgba(6,182,212,0.3)"   },
    DC: { bg: "rgba(129,140,248,0.12)", text: "#818cf8", border: "rgba(129,140,248,0.3)" },
  };
  const c = colors[building];
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
      padding: "2px 8px", borderRadius: 6,
      backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      {building}
    </span>
  );
}

function LaptopChip() {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
      padding: "2px 8px", borderRadius: 6,
      backgroundColor: "rgba(16,185,129,0.12)",
      color: "#10b981",
      border: "1px solid rgba(16,185,129,0.3)",
    }}>
      Laptop-friendly
    </span>
  );
}

function LabCard({ lab }: { lab: Lab }) {
  return (
    <div style={{
      backgroundColor: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "24px 28px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      {/* Room number + building badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{
          fontSize: "clamp(1.6rem, 3vw, 2rem)",
          fontWeight: 900,
          color: "var(--text-primary)",
          letterSpacing: "-0.03em",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}>
          {lab.room}
        </span>
        <BuildingBadge building={lab.building} />
      </div>

      {/* Lab name */}
      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", margin: 0, lineHeight: 1.3 }}>
        {lab.name}
      </p>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: "var(--border)" }} />

      {/* Details grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <DetailRow icon="🖥️" label="Type"    value={lab.type} />
        <DetailRow icon="🪑" label="Seats"   value={String(lab.seats)} />
        <DetailRow icon="🕐" label="Hours"   value={lab.hours} />
        <DetailRow icon="🔑" label="Access"  value={lab.access} />
      </div>

      {/* Chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
        {lab.laptopFriendly && <LaptopChip />}
      </div>

      {/* Notes */}
      {lab.notes && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.55 }}>
          {lab.notes}
        </p>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <span aria-hidden="true" style={{ fontSize: 13, flexShrink: 0, width: 18 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", flexShrink: 0, width: 52 }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>{value}</span>
    </div>
  );
}

export default function LabsPage() {
  const mcLabs = labs.filter((l) => l.building === "MC");
  const dcLabs = labs.filter((l) => l.building === "DC");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ position: "relative", overflow: "hidden", padding: "88px 24px 48px" }}>
        <div aria-hidden="true" style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(129,140,248,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 }}>
            Computer Labs
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)" }}>
            University of Waterloo — Math &amp; Computing (MC) and Davis Centre (DC)
          </p>
        </div>
      </section>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px 80px" }}>

        {/* MC section */}
        <Section title="Math & Computing (MC)" labs={mcLabs} />

        <div style={{ height: 40 }} />

        {/* DC section */}
        <Section title="Davis Centre (DC)" labs={dcLabs} />
      </div>
    </div>
  );
}

function Section({ title, labs }: { title: string; labs: Lab[] }) {
  return (
    <div>
      <h2 style={{
        fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em",
        color: "var(--text-muted)", marginBottom: 16,
      }}>
        {title}
      </h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16,
      }}>
        {labs.map((lab) => <LabCard key={lab.room} lab={lab} />)}
      </div>
    </div>
  );
}
