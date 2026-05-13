"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EconEventCard } from "./EconEventCard";
import type { Pillar, Impact } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SerializedEvent {
  id: string;
  slug?: string | null;
  title: string;
  summary: string;
  fullExplanation: string;
  pillar: Pillar;
  impact: Impact;
  tier: "GLOBAL" | "NATIONAL" | "REGIONAL";
  region?: string | null;
  isNews: boolean;
  newsUrl?: string | null;
  newsSource?: string | null;
  publishedAt: string;
  youtubeUrl?: string | null;
  sources?: string[];
}

type TierTab = "ALL" | "GLOBAL" | "NATIONAL" | "LOCAL";

// ─── Filter config ────────────────────────────────────────────────────────────

const TIER_TABS: { value: TierTab; label: string }[] = [
  { value: "ALL",      label: "All" },
  { value: "GLOBAL",   label: "Global" },
  { value: "NATIONAL", label: "National" },
  { value: "LOCAL",    label: "Local" },
];

const PILLAR_TABS: { value: Pillar | "ALL"; label: string }[] = [
  { value: "ALL",                label: "All Pillars" },
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

// ─── Time-ago formatter ───────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor(diff / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}d ago`;
  if (h >= 1)  return `${h}h ago`;
  if (m >= 1)  return `${m}m ago`;
  return "just now";
}

// ─── News card ────────────────────────────────────────────────────────────────

function NewsFeedCard({ item }: { item: SerializedEvent }) {
  const PILLAR_BG: Record<Pillar, string> = {
    GLOBAL_ECONOMICS:   "bg-primary-blue text-primary-white",
    GEOPOLITICS_MONEY:  "bg-primary-red text-primary-white",
    DEVELOPMENT_POLICY: "bg-primary-yellow text-primary-black",
    PERSONAL_FINANCE:   "bg-primary-black text-primary-white",
  };
  const PILLAR_LABEL: Record<Pillar, string> = {
    GLOBAL_ECONOMICS:   "Global Economics",
    GEOPOLITICS_MONEY:  "Geopolitics & Money",
    DEVELOPMENT_POLICY: "Development & Policy",
    PERSONAL_FINANCE:   "Personal Finance",
  };
  const IMPACT_BG: Record<Impact, string> = {
    HIGH:   "bg-primary-red text-primary-white",
    MEDIUM: "bg-primary-yellow text-primary-black",
    LOW:    "bg-primary-blue text-primary-white",
  };

  return (
    <article className="flex flex-col gap-4 bg-primary-white border-2 border-primary-black px-6 py-6 transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0A0A0A]">
      {/* Badge row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-sans text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-primary-red text-primary-white">
          NEWS
        </span>
        <span className={`font-sans text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${PILLAR_BG[item.pillar]}`}>
          {PILLAR_LABEL[item.pillar]}
        </span>
        <span className={`font-sans text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${IMPACT_BG[item.impact]}`}>
          {item.impact} IMPACT
        </span>
        <span className="ml-auto font-sans text-[11px] text-primary-black">
          {item.newsSource && <strong>{item.newsSource}</strong>} · {timeAgo(item.publishedAt)}
        </span>
      </div>

      {/* Title */}
      <h2 className="font-sans font-bold text-xl text-primary-black leading-tight uppercase">
        {item.title}
      </h2>

      {/* Summary */}
      <p className="font-sans text-sm text-primary-black leading-relaxed">
        {item.summary}
      </p>

      {/* What this means callout */}
      <div className="border-l-4 border-primary-black bg-primary-yellow px-4 py-4">
        <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-primary-black mb-2">
          What this means for you
        </p>
        <p className="font-sans text-sm text-primary-black leading-relaxed">
          {item.fullExplanation}
        </p>
      </div>

      {/* Read more */}
      {item.newsUrl && (
        <a
          href={item.newsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start font-sans text-xs font-bold uppercase tracking-widest border-2 border-primary-black text-primary-black hover:bg-primary-black hover:text-primary-white transition-colors px-4 py-2"
        >
          Read full story →
        </a>
      )}
    </article>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 border-2 border-primary-black text-center gap-3">
      <p className="font-sans font-bold uppercase text-lg text-primary-black">No events yet</p>
      <p className="font-sans text-sm text-primary-black">Check back soon.</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  initialEvents: SerializedEvent[];
  userCity?: string | null;
  userState?: string | null;
}

export function FeedClient({ initialEvents, userCity, userState }: Props) {
  const [tier, setTier]     = useState<TierTab>("ALL");
  const [pillar, setPillar] = useState<Pillar | "ALL">("ALL");
  const [impact, setImpact] = useState<Impact | "ALL">("ALL");
  const [count, setCount]   = useState(PAGE_SIZE);
  const [newsItems, setNewsItems] = useState<SerializedEvent[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  // Fetch news when tier tab changes to a non-ALL value
  useEffect(() => {
    if (tier === "ALL") {
      setNewsItems([]);
      return;
    }
    const abortCtrl = new AbortController();
    setNewsLoading(true);

    const params = new URLSearchParams({ tier: tier === "LOCAL" ? "REGIONAL" : tier });
    if (tier === "LOCAL" && userState) params.set("region", userState);

    fetch(`/api/news?${params}`, { signal: abortCtrl.signal })
      .then((r) => r.json())
      .then((data: SerializedEvent[]) => {
        setNewsItems(data.map((a) => ({ ...a, isNews: true })));
        setNewsLoading(false);
      })
      .catch(() => setNewsLoading(false));

    return () => abortCtrl.abort();
  }, [tier, userState]);

  // Combine admin events + fetched news, then apply all filters independently
  const allItems: SerializedEvent[] = [
    ...initialEvents,
    ...newsItems,
  ];

  const filtered = allItems
    .filter((e) => {
      if (tier === "ALL") return true;
      if (tier === "LOCAL") return e.tier === "REGIONAL";
      return e.tier === tier;
    })
    .filter((e) => pillar === "ALL" || e.pillar === pillar)
    .filter((e) => impact === "ALL" || e.impact === impact);

  const visible = filtered.slice(0, count);
  const hasMore = filtered.length > count;

  return (
    <div>
      {/* ── Tier tabs ── */}
      <div className="flex gap-0 mb-6 border-2 border-primary-black overflow-hidden">
        {TIER_TABS.map((tab, i) => (
          <button
            key={tab.value}
            onClick={() => { setTier(tab.value); setCount(PAGE_SIZE); }}
            className={`flex-1 font-sans text-xs font-black uppercase tracking-widest py-3 transition-colors ${
              i > 0 ? "border-l-2 border-primary-black" : ""
            } ${
              tier === tab.value
                ? "bg-primary-black text-primary-white"
                : "bg-primary-white text-primary-black hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LOCAL banner */}
      {tier === "LOCAL" && (userCity || userState) && (
        <div className="border-2 border-primary-black bg-primary-blue px-5 py-3 mb-5 flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-primary-white shrink-0" />
          <span className="font-sans text-xs font-black uppercase tracking-widest text-primary-white">
            Local Economy{userCity ? ` — ${userCity}` : ""}{userState ? `, ${userState}` : ""}
          </span>
        </div>
      )}

      {/* ── Pillar tabs ── */}
      <div className="overflow-x-auto -mx-1 px-1 mb-4">
        <div className="flex gap-1.5 min-w-max">
          {PILLAR_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setPillar(tab.value); setCount(PAGE_SIZE); }}
              className={`font-sans text-[10px] font-bold uppercase tracking-wider px-3 py-2 border-2 border-primary-black whitespace-nowrap transition-colors ${
                pillar === tab.value
                  ? "bg-primary-red text-primary-white"
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
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-primary-black shrink-0">
          Impact:
        </span>
        <div className="flex gap-1.5">
          {IMPACT_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setImpact(tab.value); setCount(PAGE_SIZE); }}
              className={`font-sans text-[10px] font-bold uppercase tracking-wider px-3 py-2 border-2 border-primary-black transition-colors ${
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
          <span className="ml-auto font-sans text-xs text-primary-black">
            {filtered.length} {filtered.length === 1 ? "event" : "events"}
          </span>
        )}
      </div>

      {/* ── Cards ── */}
      {newsLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 border-2 border-primary-black animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((item) =>
            item.isNews ? (
              <NewsFeedCard key={item.id} item={item} />
            ) : (
              <Link key={item.id} href={`/feed/${item.slug}`}>
                <EconEventCard {...item} />
              </Link>
            )
          )}
        </div>
      )}

      {/* ── Load more ── */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setCount((c) => c + PAGE_SIZE)}
            className="font-sans text-xs font-bold uppercase tracking-widest border-2 border-primary-black text-primary-black hover:bg-primary-black hover:text-primary-white transition-colors px-8 py-3"
          >
            Load more ({filtered.length - count} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
