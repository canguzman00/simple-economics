"use client";

import React, { useState, useEffect } from "react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  fullExplanation?: string;
  url: string;
  source: string;
  contentType: string;
  publishedAt: string;
  impact: string;
}

function isNewsSource(source: string): boolean {
  return ["The Guardian", "Reuters", "AP", "BBC"].includes(source);
}

function getImpactLabel(impact: string): string {
  if (impact === "HIGH") return "HIGH IMPACT";
  if (impact === "LOW") return "LOW IMPACT";
  return "MEDIUM IMPACT";
}

function getImpactColor(impact: string): string {
  if (impact === "HIGH") return "#E63329";
  if (impact === "LOW") return "#16A34A";
  return "#64748B";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getHostname(url: string, fallback: string): string {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return fallback; }
}

export function NewsCard(props: { item: NewsItem; featured?: boolean }) {
  const item = props.item;
  const featured = props.featured ?? false;
  const [expanded, setExpanded] = useState(featured);
  const [points, setPoints] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const isResearch = item.contentType === "Research Paper";
  const hostname = getHostname(item.url, item.source);
  const sourceBg = isNewsSource(item.source) ? "#E63329" : "#F5C800";
  const sourceColor = isNewsSource(item.source) ? "#fff" : "#0A0A0A";
  const sourceLabel = isResearch ? item.source : "The Guardian";

  useEffect(function() {
    if (item.fullExplanation) {
      try {
        const pre = JSON.parse(item.fullExplanation) as string[];
        if (pre.length > 0) { setPoints(pre); setLoading(false); return; }
      } catch { /* fall through */ }
    }
    let cancelled = false;
    fetch("/api/personalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: item.title, summary: item.summary, source: item.source, contentType: item.contentType }),
    })
      .then(function(r) { return r.json() as Promise<{ points?: string[] }>; })
      .then(function(data) { if (!cancelled) { setPoints(data.points ?? []); setLoading(false); } })
      .catch(function() { if (!cancelled) setLoading(false); });
    return function() { cancelled = true; };
  }, [item.id, item.title, item.summary, item.source, item.contentType, item.fullExplanation]);

  const F = { fontFamily: "Inter, sans-serif" };

  const skeletonRows = [1, 2, 3].map(function(i) {
    return React.createElement("div", { key: i, style: { display: "flex", gap: "8px", marginBottom: "8px" } },
      React.createElement("div", { style: { width: "6px", height: "6px", background: "#E2E8F0", flexShrink: 0, marginTop: "6px" } }),
      React.createElement("div", { style: { height: "14px", background: "#F1F5F9", flex: 1 } })
    );
  });

  const pointRows = points.map(function(pt, i) {
    return React.createElement("div", { key: i, style: { display: "flex", gap: "10px", marginBottom: "10px" } },
      React.createElement("div", { style: { width: "6px", height: "6px", background: "#E63329", flexShrink: 0, marginTop: "6px" } }),
      React.createElement("p", { style: { fontSize: "13px", color: "#111", lineHeight: 1.6, margin: 0, ...F } }, pt)
    );
  });

  const cardTop = React.createElement("div", {
    style: { padding: featured ? "18px 20px" : "14px 16px" }
  },
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", flexWrap: "wrap" } },
      React.createElement("span", { style: { fontSize: "10px", fontWeight: 700, padding: "2px 8px", background: sourceBg, color: sourceColor, letterSpacing: "0.04em", ...F } }, sourceLabel),
      isResearch ? React.createElement("span", { style: { fontSize: "10px", fontWeight: 700, padding: "2px 8px", background: "#0A0A0A", color: "#F5C800", letterSpacing: "0.04em", ...F } }, "RESEARCH") : null,
      React.createElement("span", { style: { fontSize: "10px", fontWeight: 700, color: getImpactColor(item.impact), ...F } }, getImpactLabel(item.impact)),
      React.createElement("span", { style: { fontSize: "10px", color: "#94A3B8", marginLeft: "auto", ...F } }, formatDate(item.publishedAt)),
      React.createElement("span", { style: { fontSize: "12px", color: "#94A3B8" } }, expanded ? "▲" : "▼")
    ),
    React.createElement("h2", { style: { fontSize: featured ? "17px" : "13px", fontWeight: 700, color: "#0A0A0A", lineHeight: 1.35, margin: 0, ...F } }, item.title),
    (featured || expanded) ? React.createElement("p", { style: { fontSize: "13px", color: "#555", lineHeight: 1.65, marginTop: "10px", marginBottom: 0, ...F } }, item.summary) : null
  );

  const expandedContent = expanded ? React.createElement("div", { style: { borderTop: "2px solid #0A0A0A" }, onClick: function(e: React.MouseEvent) { e.stopPropagation(); } },
    React.createElement("div", { style: { padding: "14px 16px", borderBottom: "1px solid #E2E8F0" } },
      React.createElement("div", { style: { display: "inline-block", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#0A0A0A", background: "#F5C800", padding: "2px 8px", marginBottom: "10px", ...F } }, "What this means for you"),
      loading ? React.createElement("div", null, ...skeletonRows) : points.length > 0 ? React.createElement("div", null, ...pointRows) : null
    ),
    React.createElement("div", { style: { padding: "10px 16px", background: "#0A0A0A" } },
      React.createElement("a", {
        href: item.url,
        target: "_blank",
        rel: "noopener noreferrer",
        style: { fontSize: "11px", fontWeight: 700, color: "#F5C800", textDecoration: "none", letterSpacing: "0.04em", ...F },
        onClick: function(e: React.MouseEvent) { e.stopPropagation(); }
      }, "READ FULL " + item.contentType.toUpperCase() + " AT " + hostname.toUpperCase() + " →")
    )
  ) : null;

  return React.createElement("div", {
    style: { background: "#fff", border: "2px solid #0A0A0A", fontFamily: "Inter, sans-serif", cursor: "pointer" },
    onClick: function() { setExpanded(function(v) { return !v; }); }
  }, cardTop, expandedContent);
}
