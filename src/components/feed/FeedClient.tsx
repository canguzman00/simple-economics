"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EconEventCard } from "./EconEventCard";
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

type TierTab = "ALL" | "GLOBAL" | "NATIONAL" | "LOCAL";

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

const PILLAR_COLOR: Record<Pillar, string> = {
  GLOBAL_ECONOMICS:   "#3B82F6",
  GEOPOLITICS_MONEY:  "#F43F5E",
  DEVELOPMENT_POLICY: "#8B5CF6",
  PERSONAL_FINANCE:   "#0F172A",
};

const PILLAR_LABEL: Record<Pillar, string> = {
  GLOBAL_ECONOMICS:   "Global Economics",
  GEOPOLITICS_MONEY:  "Geopolitics & Money",
  DEVELOPMENT_POLICY: "Development & Policy",
  PERSONAL_FINANCE:   "Personal Finance",
};

const IMPACT_STYLE: Record<Impact, { bg: string; text: string }> = {
  HIGH:   { bg: "#FEE2E2", text: "#DC2626" },
  MEDIUM: { bg: "#FFF7ED", text: "#EA580C" },
  LOW:    { bg: "#F0FDF4", text: "#16A34A" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (h >= 24) return Math.floor(h / 24) + "d ago";
  if (h >= 1)  return h + "h ago";
  if (m >= 1)  return m + "m ago";
  return "just now";
}

function NewsFeedCard({ item }: { item: SerializedEvent }) {
  let bullets: string[] = [];
  try {
    const parsed = JSON.parse(item.fullExplanation);
    if (Array.isArray(parsed) && parsed.length > 0) bullets = parsed as string[];
  } catch (e) { void e; }
  if (bullets.length === 0) bullets = item.fullExplanation.split(". ").filter(Boolean).slice(0, 3);
  if (bullets.length === 0) bullets = [item.fullExplanation];

  const pillarColor = PILLAR_COLOR[item.pillar];
  const impactStyle = IMPACT_STYLE[item.impact];

  return (
    <article
      className="flex flex-col gap-4 bg-white rounded-xl transition-shadow hover:shadow-md"
      style={{ border: "1px solid #E2E8F0", borderTop: "3px solid " + pillarColor }}
    >
      <div className="px-6 pt-5 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded"
          style={{ background: "#FFF1F2", color: "#F43F5E", fontFamily: "Inter, sans-serif" }}>
          News
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded"
          style={{ background: "#F1F5F9", color: "#475569", fontFamily: "Inter, sans-serif" }}>
          {PILLAR_LABEL[item.pillar]}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded"
          style={{ background: impactStyle.bg, color: impactStyle.text, fontFamily: "Inter, sans-serif" }}>
          {item.impact} Impact
        </span>
        <span className="ml-auto text-[11px]" style={{ color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
          {item.newsSource ? item.newsSource + " · " : ""}{timeAgo(item.publishedAt)}
        </span>
      </div>

      <div className="px-6">
        {item.newsUrl ? (
          <a href={item.newsUrl} target="_blank" rel="noopener noreferrer" className="group">
            <h2 className="font-bold text-xl leading-snug group-hover:text-[#F43F5E] transition-colors"
              style={{ color: "#0F172A", fontFamily: "Inter, sans-serif" }}>
              {item.title}
            </h2>
          </a>
        ) : (
          <h2 className="font-bold text-xl leading-snug" style={{ color: "#0F172A", fontFamily: "Inter, sans-serif" }}>
            {item.title}
          </h2>
        )}
      </div>

      <div className="px-6">
        <p className="text-sm leading-relaxed" style={{ color: "#64748B", fontFamily: "Inter, sans-serif" }}>
          {item.summary}
        </p>
      </div>

      <div className="flex flex-col gap-2 px-6">
        {bullets.map((bullet, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="w-5 h-5 shrink-0 flex items-center justify-center text-[10px] font-bold rounded mt-0.5"
              style={{ background: "#1E293B", color: "#F8FAFC", fontFamily: "Inter, sans-serif" }}>
              {i + 1}
            </span>
            <p className="text-sm leading-relaxed" style={{ color: "#0F172A", fontFamily: "Inter, sans-serif" }}>
              {bullet}
            </p>
          </div>
        ))}
      </div>

      {item.newsUrl && (
        <div className="px-6 pb-5" style={{ borderTop: "1px solid #F1F5F9", paddingTop: "14px" }}>
          <a href={item.newsUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm font-semibold transition-colors"
            style={{ color: "#F43F5E", fontFamily: "Inter, sans-serif" }}>
            Read full article{item.newsSource ? " at " + item.newsSource : ""} →
          </a>
        </div>
      )}
    </article>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-xl text-center gap-3"
      style={{ border: "1px solid #E2E8F0", background: "#fff" }}>
      <p className="font-bold text-lg" style={{ color: "#0F172A", fontFamily: "Inter, sans-serif" }}>No events yet</p>
      <p className="text-sm" style={{ color: "#64748B", fontFamily: "Inter, sans-serif" }}>Check back soon.</p>
    </div>
  );
}

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
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    setNewsLoading(true);
    const regional = userState
      ? fetch("/api/news?tier=REGIONAL&region=" + encodeURIComponent(userState), { signal: ctrl.signal }).then((r) => r.json()).catch(() => [])
      : Promise.resolve([]);
    Promise.all([
      fetch("/api/news?tier=GLOBAL",   { signal: ctrl.signal }).then((r) => r.json()).catch(() => []),
      fetch("/api/news?tier=NATIONAL", { signal: ctrl.signal }).then((r) => r.json()).catch(() => []),
      regional,
    ]).then(([g, n, r]) => {
      const all = [...(g as SerializedEvent[]), ...(n as SerializedEvent[]), ...(r as SerializedEvent[])];
      setNewsItems(all.map((a) => ({
        ...a,
        isNews: true,
        newsUrl:    (a as unknown as {url?: string}).url    ?? a.newsUrl    ?? null,
        newsSource: (a as unknown as {source?: string}).source ?? a.newsSource ?? null,
      })));
      setNewsLoading(false);
    }).catch(() => setNewsLoading(false));
    return () => ctrl.abort();
  }, [userState]);

  const allItems = [...initialEvents, ...newsItems];
  const filtered = allItems
    .filter((e) => {
      if (tier === "ALL") return true;
      if (tier === "LOCAL") return e.tier === "REGIONAL";
      return e.tier === tier;
    })
    .filter((e) => pillar === "ALL" || e.pillar === pillar)
    .filter((e) => impact === "ALL" || e.impact === impact)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const visible = filtered.slice(0, count);
  const hasMore = filtered.length > count;

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>

      {/* Tier tabs */}
      <div className="flex gap-0 mb-6 overflow-hidden rounded-xl" style={{ border: "1px solid #E2E8F0", background: "#fff" }}>
        {TIER_TABS.map((tab, i) => (
          <button key={tab.value}
            onClick={() => { setTier(tab.value); setCount(PAGE_SIZE); }}
            className="flex-1 text-xs font-semibold uppercase tracking-wider py-3 transition-colors"
            style={{
              borderLeft: i > 0 ? "1px solid #E2E8F0" : "none",
              background: tier === tab.value ? "#1E293B" : "#fff",
              color: tier === tab.value ? "#F8FAFC" : "#64748B",
              fontFamily: "Inter, sans-serif",
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Local banner */}
      {tier === "LOCAL" && (userCity || userState) && (
        <div className="rounded-lg px-5 py-3 mb-5 flex items-center gap-3"
          style={{ background: "#1E293B", border: "1px solid #334155" }}>
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#F43F5E" }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#F8FAFC", fontFamily: "Inter, sans-serif" }}>
            Local Economy{userCity ? " — " + userCity : ""}{userState ? ", " + userState : ""}
          </span>
        </div>
      )}

      {/* Pillar filters */}
      <div className="overflow-x-auto -mx-1 px-1 mb-4">
        <div className="flex gap-2 min-w-max">
          {PILLAR_TABS.map((tab) => (
            <button key={tab.value}
              onClick={() => { setPillar(tab.value); setCount(PAGE_SIZE); }}
              className="text-[11px] font-medium uppercase tracking-wider px-3 py-2 rounded-lg whitespace-nowrap transition-colors"
              style={{
                background: pillar === tab.value ? "#F43F5E" : "#fff",
                color: pillar === tab.value ? "#fff" : "#64748B",
                border: "1px solid " + (pillar === tab.value ? "#F43F5E" : "#E2E8F0"),
                fontFamily: "Inter, sans-serif",
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Impact filters */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-[11px] font-semibold uppercase tracking-wider shrink-0" style={{ color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
          Impact:
        </span>
        <div className="flex gap-2">
          {IMPACT_TABS.map((tab) => (
            <button key={tab.value}
              onClick={() => { setImpact(tab.value); setCount(PAGE_SIZE); }}
              className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{
                background: impact === tab.value ? "#1E293B" : "#fff",
                color: impact === tab.value ? "#F8FAFC" : "#64748B",
                border: "1px solid " + (impact === tab.value ? "#1E293B" : "#E2E8F0"),
                fontFamily: "Inter, sans-serif",
              }}>
              {tab.label}
            </button>
          ))}
        </div>
        {filtered.length > 0 && (
          <span className="ml-auto text-xs" style={{ color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
            {filtered.length} {filtered.length === 1 ? "event" : "events"}
          </span>
        )}
      </div>

      {/* Cards */}
      {newsLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl animate-pulse" style={{ background: "#F1F5F9" }} />
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
              <Link key={item.id} href={"/feed/" + item.slug}>
                <EconEventCard {...item} />
              </Link>
            )
          )}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button onClick={() => setCount((c) => c + PAGE_SIZE)}
            className="text-sm font-semibold px-8 py-3 rounded-lg transition-colors"
            style={{
              border: "1px solid #1E293B",
              color: "#1E293B",
              background: "#fff",
              fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1E293B"; e.currentTarget.style.color = "#F8FAFC"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#1E293B"; }}>
            Load more ({filtered.length - count} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
