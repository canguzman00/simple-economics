"use client";
import React from "react";

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
  { value: "ALL",      label: "All" },
  { value: "GLOBAL",   label: "Global" },
  { value: "NATIONAL", label: "National" },
  { value: "LOCAL",    label: "Local" },
];

const IMPACT_TABS: { value: Impact | "ALL"; label: string }[] = [
  { value: "ALL",    label: "All" },
  { value: "HIGH",   label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW",    label: "Low" },
];

const SOURCE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "The Guardian":               { bg: "#FFF1F2", text: "#BE123C", border: "#F43F5E" },
  "Federal Reserve":            { bg: "#F0FDF4", text: "#166534", border: "#16A34A" },
  "Bureau of Labor Statistics": { bg: "#F5F3FF", text: "#5B21B6", border: "#7C3AED" },
  "IMF":                        { bg: "#F1F5F9", text: "#1E293B", border: "#1E293B" },
  "World Bank":                 { bg: "#EFF6FF", text: "#1D4ED8", border: "#3B82F6" },
  "OECD":                       { bg: "#EFF6FF", text: "#1D4ED8", border: "#3B82F6" },
  "White House":                { bg: "#F1F5F9", text: "#1E293B", border: "#475569" },
  "Brookings Institution":      { bg: "#FFFBEB", text: "#92400E", border: "#F59E0B" },
  "NBER":                       { bg: "#FFFBEB", text: "#92400E", border: "#F59E0B" },
  "Peterson Institute":         { bg: "#FFFBEB", text: "#92400E", border: "#F59E0B" },
  "Economic Policy Institute":  { bg: "#FFFBEB", text: "#92400E", border: "#F59E0B" },
  "WTO":                        { bg: "#EFF6FF", text: "#1D4ED8", border: "#3B82F6" },
  "ILO":                        { bg: "#EFF6FF", text: "#1D4ED8", border: "#3B82F6" },
  "United Nations":             { bg: "#EFF6FF", text: "#1D4ED8", border: "#3B82F6" },
  "BIS":                        { bg: "#F1F5F9", text: "#1E293B", border: "#1E293B" },
  "US Treasury":                { bg: "#F0FDF4", text: "#166534", border: "#16A34A" },
  "Congressional Budget Office":{ bg: "#F1F5F9", text: "#1E293B", border: "#475569" },
  "Census Bureau":              { bg: "#F1F5F9", text: "#1E293B", border: "#475569" },
  "CFR":                        { bg: "#FDF4FF", text: "#6B21A8", border: "#A855F7" },
  "Chatham House":              { bg: "#FDF4FF", text: "#6B21A8", border: "#A855F7" },
  "CEPR":                       { bg: "#FDF4FF", text: "#6B21A8", border: "#A855F7" },
  "Bruegel":                    { bg: "#FDF4FF", text: "#6B21A8", border: "#A855F7" },
  "VoxDev":                     { bg: "#FDF4FF", text: "#6B21A8", border: "#A855F7" },
  "Asian Development Bank":     { bg: "#EFF6FF", text: "#1D4ED8", border: "#3B82F6" },
};

const IMPACT_STYLE: Record<Impact, { bg: string; text: string }> = {
  HIGH:   { bg: "#FEE2E2", text: "#991B1B" },
  MEDIUM: { bg: "#FFF7ED", text: "#9A3412" },
  LOW:    { bg: "#F0FDF4", text: "#166534" },
};

const S = { fontFamily: "Inter, sans-serif" };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function NewsCard({ item }: { item: NewsItem }) {
  const [points, setPoints] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const sourceStyle = SOURCE_COLORS[item.source] ?? { bg: "#F1F5F9", text: "#475569", border: "#94A3B8" };
  const impactStyle = IMPACT_STYLE[item.impact];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch("/api/personalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: item.title,
        summary: item.summary,
        source: item.source,
        contentType: item.contentType,
      }),
    })
      .then((r) => r.json())
      .then((data: { points?: string[] }) => {
        if (!cancelled) {
          setPoints(data.points ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [item.id]);

  return (
    <article
      className="rounded-xl transition-shadow hover:shadow-md"
      style={{ background: "#fff", border: "1px solid #E2E8F0", borderTop: "3px solid " + sourceStyle.border }}
    >
      <div className="px-6 pt-5 pb-4">
        {/* Badge row: SOURCE · TYPE · IMPACT · DATE */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md" style={{ background: sourceStyle.bg, color: sourceStyle.text, ...S }}>
            {item.source}
          </span>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-md" style={{ background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0", ...S }}>
            {item.contentType}
          </span>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-md" style={{ background: impactStyle.bg, color: impactStyle.text, ...S }}>
            {item.impact.charAt(0) + item.impact.slice(1).toLowerCase()} impact
          </span>
          <span className="text-[11px] ml-auto" style={{ color: "#94A3B8", ...S }}>
            {formatDate(item.publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-semibold text-lg leading-snug mb-3" style={{ color: "#0F172A", ...S }}>
          {item.title}
        </h2>

        {/* Summary */}
        <p className="text-sm leading-relaxed mb-4" style={{ color: "#64748B", ...S }}>
          {item.summary}
        </p>

        {/* Talking points */}
        <div className="pt-4" style={{ borderTop: "1px solid #F1F5F9" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#F43F5E", ...S }}>
            What this means for you
          </p>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 animate-pulse" style={{ background: "#E2E8F0" }} />
                  <div className="h-4 rounded animate-pulse flex-1" style={{ background: "#F1F5F9" }} />
                </div>
              ))}
            </div>
          ) : points.length > 0 ? (
            <div className="space-y-2.5">
              {points.map((pt, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: "#F43F5E" }} />
                  <p className="text-sm leading-relaxed" style={{ color: "#0F172A", ...S }}>{pt}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "#94A3B8", ...S }}>Unable to generate talking points.</p>
          )}
        </div>

        {/* Source link */}
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid #F1F5F9" }}>
          
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium transition-colors"
            style={{ color: "#F43F5E", ...S }}
          >
            Read full {item.contentType.toLowerCase()} at {new URL(item.url).hostname.replace("www.", "")} →
          </a>
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl flex flex-col items-center justify-center py-20 text-center gap-3"
      style={{ background: "#fff", border: "1px solid #E2E8F0" }}>
      <p className="font-semibold text-lg" style={{ color: "#0F172A", ...S }}>No recent stories</p>
      <p className="text-sm" style={{ color: "#94A3B8", ...S }}>Check back soon — we refresh every few hours.</p>
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
  const [impact, setImpact] = useState<Impact | "ALL">("ALL");
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
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
      const all = [...(g as NewsItem[]), ...(n as NewsItem[]), ...(r as NewsItem[])];
      // Deduplicate by id
      const seen = new Set<string>();
      const deduped = all.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
      setNewsItems(deduped);
      setNewsLoading(false);
    }).catch(() => setNewsLoading(false));

    return () => ctrl.abort();
  }, [userState]);

  const filtered = newsItems
    .filter((e) => {
      if (tier === "ALL") return true;
      if (tier === "LOCAL") return e.tier === "REGIONAL";
      return e.tier === tier;
    })
    .filter((e) => impact === "ALL" || e.impact === impact)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div style={{ ...S }}>

      {/* Tier tabs */}
      <div className="flex mb-6 overflow-hidden rounded-xl" style={{ border: "1px solid #E2E8F0", background: "#fff" }}>
        {TIER_TABS.map((tab, i) => (
          <button key={tab.value}
            onClick={() => setTier(tab.value)}
            className="flex-1 text-xs font-semibold uppercase tracking-wider py-3 transition-colors"
            style={{
              borderLeft: i > 0 ? "1px solid #E2E8F0" : "none",
              background: tier === tab.value ? "#1E293B" : "#fff",
              color: tier === tab.value ? "#F8FAFC" : "#64748B",
              ...S,
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
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#F8FAFC", ...S }}>
            Local Economy{userCity ? " — " + userCity : ""}{userState ? ", " + userState : ""}
          </span>
        </div>
      )}

      {/* Impact filters */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-[11px] font-semibold uppercase tracking-wider shrink-0" style={{ color: "#94A3B8", ...S }}>Impact:</span>
        <div className="flex gap-2">
          {IMPACT_TABS.map((tab) => (
            <button key={tab.value}
              onClick={() => setImpact(tab.value)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{
                background: impact === tab.value ? "#1E293B" : "#fff",
                color: impact === tab.value ? "#F8FAFC" : "#64748B",
                border: "1px solid " + (impact === tab.value ? "#1E293B" : "#E2E8F0"),
                ...S,
              }}>
              {tab.label}
            </button>
          ))}
        </div>
        {filtered.length > 0 && (
          <span className="ml-auto text-xs" style={{ color: "#94A3B8", ...S }}>
            {filtered.length} {filtered.length === 1 ? "story" : "stories"}
          </span>
        )}
      </div>

      {/* Admin events */}
      {initialEvents.length > 0 && (
        <div className="flex flex-col gap-4 mb-4">
          {initialEvents.map((item) => (
            <Link key={item.id} href={"/feed/" + item.slug}>
              <EconEventCard {...item} />
            </Link>
          ))}
        </div>
      )}

      {/* News cards */}
      {newsLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: "#F1F5F9" }} />
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
