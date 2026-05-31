"use client";

import React, { useState, useEffect } from "react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  contentType: string;
  publishedAt: string;
  impact: string;
  fullExplanation?: string;
}

const SOURCE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "The Guardian": { bg: "#FFF1F2", text: "#BE123C", border: "#F43F5E" },
  "Federal Reserve": { bg: "#F0FDF4", text: "#166534", border: "#16A34A" },
  "Bureau of Labor Statistics": { bg: "#F5F3FF", text: "#5B21B6", border: "#7C3AED" },
  "IMF": { bg: "#F1F5F9", text: "#1E293B", border: "#1E293B" },
  "World Bank": { bg: "#EFF6FF", text: "#1D4ED8", border: "#3B82F6" },
  "OECD": { bg: "#EFF6FF", text: "#1D4ED8", border: "#3B82F6" },
  "White House": { bg: "#F1F5F9", text: "#1E293B", border: "#475569" },
  "Brookings Institution": { bg: "#FFFBEB", text: "#92400E", border: "#F59E0B" },
  "NBER": { bg: "#FFFBEB", text: "#92400E", border: "#F59E0B" },
  "Journal of Economic Perspectives": { bg: "#FFFBEB", text: "#92400E", border: "#F59E0B" },
  "American Economic Review": { bg: "#FFFBEB", text: "#92400E", border: "#F59E0B" },
  "Quarterly Journal of Economics": { bg: "#FFFBEB", text: "#92400E", border: "#F59E0B" },
  "Review of Economic Studies": { bg: "#FFFBEB", text: "#92400E", border: "#F59E0B" },
  "Journal of Finance": { bg: "#FFFBEB", text: "#92400E", border: "#F59E0B" },
  "WTO": { bg: "#EFF6FF", text: "#1D4ED8", border: "#3B82F6" },
  "United Nations": { bg: "#EFF6FF", text: "#1D4ED8", border: "#3B82F6" },
  "CFR": { bg: "#FDF4FF", text: "#6B21A8", border: "#A855F7" },
};

function getImpactStyle(impact: string): { bg: string; text: string } {
  if (impact === "HIGH") return { bg: "#FEE2E2", text: "#991B1B" };
  if (impact === "LOW") return { bg: "#F0FDF4", text: "#166534" };
  return { bg: "#FFF7ED", text: "#9A3412" };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function getHostname(url: string, fallback: string): string {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return fallback; }
}

export function NewsCard(props: { item: NewsItem }) {
  const item = props.item;
  const [points, setPoints] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const sourceStyle = SOURCE_COLORS[item.source] ?? { bg: "#F1F5F9", text: "#475569", border: "#94A3B8" };
  const impactStyle = getImpactStyle(item.impact);
  const impactLabel = item.impact.charAt(0) + item.impact.slice(1).toLowerCase() + " impact";
  const hostname = getHostname(item.url, item.source);

  useEffect(function() {
    // Use pre-generated points if available
    if (item.fullExplanation) {
      try {
        const pre = JSON.parse(item.fullExplanation) as string[];
        if (pre.length > 0) { setPoints(pre); setLoading(false); return; }
      } catch { /* fall through to API */ }
    }

    let cancelled = false;
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
      .then(function(r) { return r.json() as Promise<{ points?: string[] }>; })
      .then(function(data) {
        if (!cancelled) {
          setPoints(data.points ?? []);
          setLoading(false);
        }
      })
      .catch(function() {
        if (!cancelled) setLoading(false);
      });
    return function() { cancelled = true; };
  }, [item.id, item.title, item.summary, item.source, item.contentType]);

  const showPersonalization = loading || points.length > 0;

  return React.createElement("div", {
    style: {
      background: "#fff",
      border: "1px solid #E2E8F0",
      borderTop: "3px solid " + sourceStyle.border,
      borderRadius: "12px",
      fontFamily: "Inter, sans-serif",
    }
  },
    React.createElement("div", { style: { padding: "20px 24px" } },

      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "16px" } },
        React.createElement("span", { style: { fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "6px", background: sourceStyle.bg, color: sourceStyle.text } }, item.source),
        React.createElement("span", { style: { fontSize: "11px", fontWeight: 500, padding: "3px 10px", borderRadius: "6px", background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0" } }, item.contentType),
        React.createElement("span", { style: { fontSize: "11px", fontWeight: 500, padding: "3px 10px", borderRadius: "6px", background: impactStyle.bg, color: impactStyle.text } }, impactLabel),
        React.createElement("span", { style: { fontSize: "11px", color: "#94A3B8", marginLeft: "auto" } }, formatDate(item.publishedAt))
      ),

      React.createElement("h2", { style: { fontSize: "17px", fontWeight: 600, color: "#0F172A", lineHeight: 1.4, marginBottom: "10px" } }, item.title),

      React.createElement("p", { style: { fontSize: "14px", color: "#64748B", lineHeight: 1.65, marginBottom: "16px" } }, item.summary),

      showPersonalization ? React.createElement("div", { style: { borderTop: "1px solid #F1F5F9", paddingTop: "14px", marginBottom: "14px" } },
        React.createElement("p", { style: { fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#F43F5E", marginBottom: "10px" } }, "What this means for you"),
        loading
          ? React.createElement("div", null,
              ...[1, 2, 3].map(function(i) {
                return React.createElement("div", { key: i, style: { display: "flex", gap: "8px", marginBottom: "8px" } },
                  React.createElement("div", { style: { width: "6px", height: "6px", borderRadius: "50%", background: "#E2E8F0", flexShrink: 0, marginTop: "8px" } }),
                  React.createElement("div", { style: { height: "16px", background: "#F1F5F9", borderRadius: "4px", flex: 1 } })
                );
              })
            )
          : React.createElement("div", null,
              ...points.map(function(pt, i) {
                return React.createElement("div", { key: i, style: { display: "flex", gap: "10px", marginBottom: "10px" } },
                  React.createElement("div", { style: { width: "6px", height: "6px", borderRadius: "50%", background: "#F43F5E", flexShrink: 0, marginTop: "8px" } }),
                  React.createElement("p", { style: { fontSize: "14px", color: "#0F172A", lineHeight: 1.55, margin: 0 } }, pt)
                );
              })
            )
      ) : null,

      React.createElement("div", { style: { borderTop: "1px solid #F1F5F9", paddingTop: "14px" } },
        React.createElement("a", {
          href: item.url,
          target: "_blank",
          rel: "noopener noreferrer",
          style: { fontSize: "13px", fontWeight: 500, color: "#F43F5E", textDecoration: "none" }
        }, "Read full " + item.contentType.toLowerCase() + " at " + hostname)
      )
    )
  );
}
