"use client";

import { useState } from "react";
import { EconEventCard } from "./EconEventCard";
import type { Pillar, Impact } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SerializedEvent {
  id: string;
  slug: string;
  title: string;
  summary: string;
  fullExplanation: string;
  pillar: Pillar;
  impact: Impact;
  publishedAt: string;
  youtubeUrl: string | null;
  sources: string[];
}

// ─── Filter config ────────────────────────────────────────────────────────────

const PILLAR_TABS: { value: Pillar | "ALL"; label: string }[] = [
  { value: "ALL",                label: "All" },
  { value: "GLOBAL_ECONOMICS",   label: "Global Economics" },
  { value: "GEOPOLITICS_MONEY",  label: "Geopolitics & Money" },
  { value: "DEVELOPMENT_POLICY", label: "Development & Policy" },
  { value: "PERSONAL_FINANCE",   label: "Personal Finance" },
];

const IMPACT_TABS: { value: Impact | "ALL"; label: string }[] = [
  { value: "ALL",    label: "All" },
  { value: "HIGH",   label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW",    label: "Low" },
];

const PAGE_SIZE = 10;

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 border border-[#C49A52]/20 rounded-xl text-center gap-3">
      <p className="font-serif text-xl text-[#7A6A52]">No events yet</p>
      <p className="font-sans text-sm text-[#4A3D2A]">Check back soon.</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FeedClient({ initialEvents }: { initialEvents: SerializedEvent[] }) {
  const [pillar, setPillar]   = useState<Pillar | "ALL">("ALL");
  const [impact, setImpact]   = useState<Impact | "ALL">("ALL");
  const [count, setCount]     = useState(PAGE_SIZE);

  const filtered = initialEvents
    .filter((e) => pillar === "ALL" || e.pillar === pillar)
    .filter((e) => impact === "ALL" || e.impact === impact);

  const visible = filtered.slice(0, count);
  const hasMore = filtered.length > count;

  return (
    <div>
      {/* ── Pillar tabs ── */}
      <div className="overflow-x-auto -mx-1 px-1 mb-4">
        <div className="flex gap-1 min-w-max">
          {PILLAR_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setPillar(tab.value); setCount(PAGE_SIZE); }}
              className={`font-sans text-xs px-3.5 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                pillar === tab.value
                  ? "bg-[#C49A52]/15 border-[#C49A52]/50 text-[#C49A52]"
                  : "border-[#2C2417] text-[#7A6A52] hover:border-[#4A3D2A] hover:text-[#C8B8A2]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Impact filter ── */}
      <div className="flex items-center gap-2 mb-8">
        <span className="font-sans text-xs text-[#4A3D2A] shrink-0">Impact:</span>
        <div className="flex gap-1.5">
          {IMPACT_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setImpact(tab.value); setCount(PAGE_SIZE); }}
              className={`font-mono text-[11px] px-3 py-1 rounded border transition-colors ${
                impact === tab.value
                  ? "bg-[#C49A52]/15 border-[#C49A52]/50 text-[#C49A52]"
                  : "border-[#2C2417] text-[#7A6A52] hover:border-[#4A3D2A] hover:text-[#C8B8A2]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {filtered.length > 0 && (
          <span className="ml-auto font-sans text-xs text-[#4A3D2A]">
            {filtered.length} {filtered.length === 1 ? "event" : "events"}
          </span>
        )}
      </div>

      {/* ── Cards ── */}
      {visible.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-5">
          {visible.map((event) => (
            <EconEventCard key={event.id} {...event} />
          ))}
        </div>
      )}

      {/* ── Load more ── */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setCount((c) => c + PAGE_SIZE)}
            className="font-sans text-sm text-[#C49A52] hover:text-[#E2C27A] border border-[#4A3D2A] hover:border-[#C49A52] transition-colors px-6 py-2.5 rounded-lg"
          >
            Load more ({filtered.length - count} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
