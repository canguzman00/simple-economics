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
  fullExplanation?: string;
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
  { value: "ALL", label: "ALL" },
  { value: "GLOBAL", label: "GLOBAL" },
  { value: "NATIONAL", label: "NATIONAL" },
  { value: "LOCAL", label: "LOCAL" },
];

const IMPACT_TABS: { value: Impact | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

interface Props {
  initialEvents: SerializedEvent[];
  userCity?: string | null;
  userState?: string | null;
}

export function FeedClient({ initialEvents, userState }: Props) {
  const [tier, setTier] = useState<TierTab>("ALL");
  const [impact, setImpact] = useState<Impact | "ALL">("ALL");
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(function() {
    const ctrl = new AbortController();
    setNewsLoading(true);

    const regional = userState
      ? fetch("/api/news?tier=REGIONAL&region=" + encodeURIComponent(userState), { signal: ctrl.signal })
          .then(function(r) { return r.json(); })
          .catch(function() { return []; })
      : Promise.resolve([]);

    Promise.all([
      fetch("/api/news?tier=GLOBAL", { signal: ctrl.signal }).then(function(r) { return r.json(); }).catch(function() { return []; }),
      fetch("/api/news?tier=NATIONAL", { signal: ctrl.signal }).then(function(r) { return r.json(); }).catch(function() { return []; }),
      regional,
    ])
      .then(function([g, n, r]) {
        const all = [...(g as NewsItem[]), ...(n as NewsItem[]), ...(r as NewsItem[])];
        const seen = new Set<string>();
        const deduped = all.filter(function(item) {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setNewsItems(deduped);
        setNewsLoading(false);
      })
      .catch(function() { setNewsLoading(false); });

    return function() { ctrl.abort(); };
  }, [userState]);

  const filtered = newsItems
    .filter(function(e) {
      if (tier === "ALL") return true;
      if (tier === "LOCAL") return e.tier === "REGIONAL";
      return e.tier === tier;
    })
    .filter(function(e) { return impact === "ALL" || e.impact === impact; })
    .sort(function(a, b) { return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(); });

  // Split into pairs for magazine grid
  const featured = filtered[0] ?? null;
  const rest = filtered.slice(1);

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>

      {/* Tier tabs — Bauhaus style */}
      <div style={{ display: "flex", marginBottom: "16px", border: "2px solid #0A0A0A" }}>
        {TIER_TABS.map(function(tab, i) {
          const isActive = tier === tab.value;
          return (
            <button
              key={tab.value}
              onClick={function() { setTier(tab.value); }}
              style={{
                flex: 1,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "10px 0",
                border: "none",
                borderLeft: i > 0 ? "2px solid #0A0A0A" : "none",
                background: isActive ? "#0A0A0A" : "#fff",
                color: isActive ? "#F5C800" : "#0A0A0A",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Impact filter */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#94A3B8" }}>
          IMPACT:
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          {IMPACT_TABS.map(function(tab) {
            const isActive = impact === tab.value;
            return (
              <button
                key={tab.value}
                onClick={function() { setImpact(tab.value); }}
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 12px",
                  border: "2px solid " + (isActive ? "#0A0A0A" : "#E2E8F0"),
                  background: isActive ? "#0A0A0A" : "#fff",
                  color: isActive ? "#F5C800" : "#64748B",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {filtered.length > 0 && (
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "#94A3B8" }}>
            {filtered.length} {filtered.length === 1 ? "story" : "stories"}
          </span>
        )}
      </div>

      {/* Published events */}
      {initialEvents.length > 0 && (
        <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column" as const, gap: "8px" }}>
          {initialEvents.map(function(item) {
            return (
              <Link key={item.id} href={"/feed/" + item.slug}>
                <EconEventCard {...item} />
              </Link>
            );
          })}
        </div>
      )}

      {/* News grid */}
      {newsLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[1, 2, 3, 4, 5, 6].map(function(i) {
            return (
              <div
                key={i}
                style={{
                  height: i === 1 ? "200px" : "140px",
                  gridColumn: i === 1 ? "span 2" : "span 1",
                  background: "#F1F5F9",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            );
          })}
          <style dangerouslySetInnerHTML={{ __html: "@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#fff", border: "2px solid #0A0A0A", padding: "48px", textAlign: "center" as const }}>
          <p style={{ fontSize: "16px", fontWeight: 700, color: "#0A0A0A", marginBottom: "8px" }}>No recent stories</p>
          <p style={{ fontSize: "13px", color: "#94A3B8" }}>Check back soon — we refresh every few hours.</p>
        </div>
      ) : (
        <div>
          {/* Featured card — full width */}
          {featured && (
            <div style={{ marginBottom: "8px" }}>
              <NewsCard item={featured} featured={true} />
            </div>
          )}
          {/* Grid of remaining cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {rest.map(function(item) {
              return <NewsCard key={item.id} item={item} featured={false} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
