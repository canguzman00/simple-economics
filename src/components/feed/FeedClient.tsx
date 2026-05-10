"use client";

import { useState } from "react";
import { EconEventCard } from "./EconEventCard";
import type { Pillar, Impact } from "@prisma/client";

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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 border-2 border-primary-black text-center gap-3">
      <p className="font-display font-bold uppercase text-lg text-primary-black">No events yet</p>
      <p className="font-sans text-sm text-gray-500">Check back soon.</p>
    </div>
  );
}

export function FeedClient({ initialEvents }: { initialEvents: SerializedEvent[] }) {
  const [pillar, setPillar] = useState<Pillar | "ALL">("ALL");
  const [impact, setImpact] = useState<Impact | "ALL">("ALL");
  const [count, setCount]   = useState(PAGE_SIZE);

  const filtered = initialEvents
    .filter((e) => pillar === "ALL" || e.pillar === pillar)
    .filter((e) => impact === "ALL" || e.impact === impact);

  const visible = filtered.slice(0, count);
  const hasMore = filtered.length > count;

  return (
    <div>
      {/* ── Pillar tabs ── */}
      <div className="overflow-x-auto -mx-1 px-1 mb-4">
        <div className="flex gap-1.5 min-w-max">
          {PILLAR_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setPillar(tab.value); setCount(PAGE_SIZE); }}
              className={`font-display text-[10px] font-bold uppercase tracking-wider px-3 py-2 border-2 border-primary-black whitespace-nowrap transition-colors ${
                pillar === tab.value
                  ? "bg-primary-black text-primary-white"
                  : "bg-primary-white text-primary-black hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Impact filter ── */}
      <div className="flex items-center gap-3 mb-8">
        <span className="font-display text-[10px] font-bold uppercase tracking-widest text-gray-500 shrink-0">
          Impact:
        </span>
        <div className="flex gap-1.5">
          {IMPACT_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setImpact(tab.value); setCount(PAGE_SIZE); }}
              className={`font-display text-[10px] font-bold uppercase tracking-wider px-3 py-2 border-2 border-primary-black transition-colors ${
                impact === tab.value
                  ? "bg-primary-black text-primary-white"
                  : "bg-primary-white text-primary-black hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {filtered.length > 0 && (
          <span className="ml-auto font-sans text-xs text-gray-500">
            {filtered.length} {filtered.length === 1 ? "event" : "events"}
          </span>
        )}
      </div>

      {/* ── Cards ── */}
      {visible.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-4">
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
            className="font-display text-xs font-bold uppercase tracking-widest border-2 border-primary-black text-primary-black hover:bg-primary-black hover:text-primary-white transition-colors px-8 py-3"
          >
            Load more ({filtered.length - count} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
