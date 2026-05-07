"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const WaterlooTab = dynamic(() => import("@/components/tabs/WaterlooTab"));
const ReginaTab = dynamic(() => import("@/components/tabs/ReginaTab"));
const UoftTab = dynamic(() => import("@/components/tabs/UoftTab"));

type TabId = "waterloo" | "regina" | "uoft";

const TABS: { id: TabId; label: string }[] = [
  { id: "waterloo", label: "Waterloo 🟢" },
  { id: "regina", label: "Regina 🟢" },
  { id: "uoft", label: "UofT 📊" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("waterloo");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {/* Site header */}
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            LibraryCheck
          </h1>
          <p className="mt-1 hidden text-sm text-gray-500 min-[380px]:block">
            Find a seat before you walk over.
          </p>
        </header>

        {/* Tab bar */}
        <div className="mb-6 -mx-4 sm:mx-0">
          <div className="flex flex-nowrap gap-2 overflow-x-auto px-4 pb-1 sm:px-0 no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex min-h-[44px] shrink-0 items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active tab content */}
        <main>
          {activeTab === "waterloo" && <WaterlooTab />}
          {activeTab === "regina" && <ReginaTab />}
          {activeTab === "uoft" && <UoftTab />}
        </main>
      </div>
    </div>
  );
}
