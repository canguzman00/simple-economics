"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EconEventCard } from "./EconEventCard";
import { NewsCard } from "./NewsCard";
import type { Pillar, Impact } from "@prisma/client";

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

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  contentType: string;
  publishedAt: string;
  pillar: Pillar;
  impact: Impact;
  tier: "GLOBAL" | "NATIONAL" | "REGIONAL";
}

type TierTab = "ALL" | "GLOBAL" | "NATIONAL" | "LOCAL";

const TIER_TABS: { value: TierTab; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "GLOBAL", label: "Global" },
  { value: "NATIONAL", label: "National" },
  { value: "LOCAL", label: "Local" },
];

const IMPACT_TABS: { value: Impact | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

function EmptyState() {
  return (
    <div
      className="rounded-xl flex flex-col items-center justify-center py-20 text-center gap-3"
      style={{ background: "#fff", border: "1px solid #E2E8F0" }}
    >
      <p
        className="font-semibold text-lg"
        style={{ color: "#0F172A", fontFamily: "Inter, sans-serif" }}
      >
        No recent stories
      </p>
      <p
        className="text-sm"
        style={{ color: "#94A3B8", fontFamily: "Inter, sans-serif" }}
      >
        Check back soon — we refresh every few hours.
      </p>
    </div>
  );
}

interface Props {
  initialEvents: SerializedEvent[];
  userCity?: string | null;
  userState?: string | null;
}

export function FeedClient({ initialEvents, userCity, userState }: Props) {
  const [tier, setTier] = useState<TierTab>("ALL");
  const [impact, setImpact] = useState<Impact | "ALL">("ALL");
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    setNewsLoading(true);

    const regional = userState
      ? fetch(
          "/api/news?tier=REGIONAL&region=" + encodeURIComponent(userState),
          { signal: ctrl.signal }
        )
          .then((r) => r.json())
          .catch(() => [])
      : Promise.resolve([]);

    Promise.all([
      fetch("/api/news?tier=GLOBAL", { signal: ctrl.signal })
        .then((r) => r.json())
        .catch(() => []),
      fetch("/api/news?tier=NATIONAL", { signal: ctrl.signal })
        .then((r) => r.json())
        .catch(() => []),
      regional,
    ])
      .then(([g, n, r]) => {
        const all = [
          ...(g as NewsItem[]),
          ...(n as NewsItem[]),
          ...(r as NewsItem[]),
        ];
        const seen = new Set<string>();
        const deduped = all.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setNewsItems(deduped);
        setNewsLoading(false);
      })
      .catch(() => setNewsLoading(false));

    return () => ctrl.abort();
  }, [userState]);

  const filtered = newsItems
    .filter((e) => {
      if (tier === "ALL") return true;
      if (tier === "LOCAL") return e.tier === "REGIONAL";
      return e.tier === tier;
    })
    .filter((e) => impact === "ALL" || e.impact === impact)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <div
        className="flex mb-6 overflow-hidden rounded-xl"
        style={{ border: "1px solid #E2E8F0", background: "#fff" }}
      >
        {TIER_TABS.map((tab, i) => (
          <button
            key={tab.value}
            onClick={() => setTier(tab.value)}
            className="flex-1 text-xs font-semibold uppercase tracking-wider py-3 transition-colors"
            style={{
              borderLeft: i > 0 ? "1px solid #E2E8F0" : "none",
              background: tier === tab.value ? "#1E293B" : "#fff",
              color: tier === tab.value ? "#F8FAFC" : "#64748B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tier === "LOCAL" && (userCity || userState) && (
        <div
          className="rounded-lg px-5 py-3 mb-5 flex items-center gap-3"
          style={{ background: "#1E293B", border: "1px solid #334155" }}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "#F43F5E" }}
          />
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#F8FAFC", fontFamily: "Inter, sans-serif" }}
          >
            Local Economy
            {userCity ? " — " + userCity : ""}
            {userState ? ", " + userState : ""}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <span
          className="text-xs font-semibold uppercase tracking-wider shrink-0"
          style={{ color: "#94A3B8", fontFamily: "Inter, sans-serif" }}
        >
          Impact:
        </span>
        <div className="flex gap-2">
          {IMPACT_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setImpact(tab.value)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{
                background: impact === tab.value ? "#1E293B" : "#fff",
                color: impact === tab.value ? "#F8FAFC" : "#64748B",
                border:
                  "1px solid " +
                  (impact === tab.value ? "#1E293B" : "#E2E8F0"),
                fontFamily: "Inter, sans-serif",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {filtered.length > 0 && (
          <span
            className="ml-auto text-xs"
            style={{ color: "#94A3B8", fontFamily: "Inter, sans-serif" }}
          >
            {filtered.length} {filtered.length === 1 ? "story" : "stories"}
          </span>
        )}
      </div>

      {initialEvents.length > 0 && (
        <div className="flex flex-col gap-4 mb-4">
          {initialEvents.map((item) => (
            <Link key={item.id} href={"/feed/" + item.slug}>
              <EconEventCard {...item} />
            </Link>
          ))}
        </div>
      )}

      {newsLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl animate-pulse"
              style={{ background: "#F1F5F9" }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
