"use client";

import { useState, useEffect } from "react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  contentType: string;
  publishedAt: string;
  impact: string;
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
  "Peterson Institute": { bg: "#FFFBEB", text: "#92400E", border: "#F59E0B" },
  "Economic Policy Institute": { bg: "#FFFBEB", text: "#92400E", border: "#F59E0B" },
  "WTO": { bg: "#EFF6FF", text: "#1D4ED8", border: "#3B82F6" },
  "ILO": { bg: "#EFF6FF", text: "#1D4ED8", border: "#3B82F6" },
  "United Nations": { bg: "#EFF6FF", text: "#1D4ED8", border: "#3B82F6" },
  "BIS": { bg: "#F1F5F9", text: "#1E293B", border: "#1E293B" },
  "US Treasury": { bg: "#F0FDF4", text: "#166534", border: "#16A34A" },
  "Congressional Budget Office": { bg: "#F1F5F9", text: "#1E293B", border: "#475569" },
  "Census Bureau": { bg: "#F1F5F9", text: "#1E293B", border: "#475569" },
  "CFR": { bg: "#FDF4FF", text: "#6B21A8", border: "#A855F7" },
  "Chatham House": { bg: "#FDF4FF", text: "#6B21A8", border: "#A855F7" },
  "CEPR": { bg: "#FDF4FF", text: "#6B21A8", border: "#A855F7" },
  "Bruegel": { bg: "#FDF4FF", text: "#6B21A8", border: "#A855F7" },
  "VoxDev": { bg: "#FDF4FF", text: "#6B21A8", border: "#A855F7" },
  "Asian Development Bank": { bg: "#EFF6FF", text: "#1D4ED8", border: "#3B82F6" },
};

const HIGH_IMPACT = { bg: "#FEE2E2", text: "#991B1B" };
const MEDIUM_IMPACT = { bg: "#FFF7ED", text: "#9A3412" };
const LOW_IMPACT = { bg: "#F0FDF4", text: "#166534" };

function getImpactStyle(impact: string) {
  if (impact === "HIGH") return HIGH_IMPACT;
  if (impact === "LOW") return LOW_IMPACT;
  return MEDIUM_IMPACT;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function NewsCard({ item }: { item: NewsItem }) {
  const [points, setPoints] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const sourceStyle = SOURCE_COLORS[item.source] ?? {
    bg: "#F1F5F9",
    text: "#475569",
    border: "#94A3B8",
  };
  const impactStyle = getImpactStyle(item.impact);
  const impactLabel = item.impact.charAt(0) + item.impact.slice(1).toLowerCase() + " impact";

  let hostname = item.source;
  try {
    hostname = new URL(item.url).hostname.replace("www.", "");
  } catch {
    hostname = item.source;
  }

  useEffect(() => {
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
      .then((r) => r.json())
      .then((data) => {
        const typed = data as { points?: string[] };
        if (!cancelled) {
          setPoints(typed.points ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [item.id, item.title, item.summary, item.source, item.contentType]);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E2E8F0",
        borderTop: "3px solid " + sourceStyle.border,
        borderRadius: "12px",
        fontFamily: "Inter, sans-serif",
        marginBottom: "0",
      }}
    >
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "6px", background: sourceStyle.bg, color: sourceStyle.text }}>
            {item.source}
          </span>
          <span style={{ fontSize: "11px", fontWeight: 500, padding: "3px 10px", borderRadius: "6px", background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0" }}>
            {item.contentType}
          </span>
          <span style={{ fontSize: "11px", fontWeight: 500, padding: "3px 10px", borderRadius: "6px", background: impactStyle.bg, color: impactStyle.text }}>
            {impactLabel}
          </span>
          <span style={{ fontSize: "11px", color: "#94A3B8", marginLeft: "auto" }}>
            {formatDate(item.publishedAt)}
          </span>
        </div>

        <h2 style={{ fontSize: "17px", fontWeight: 600, color: "#0F172A", lineHeight: 1.4, marginBottom: "10px" }}>
          {item.title}
        </h2>

        <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.65, marginBottom: "16px" }}>
          {item.summary}
        </p>

        <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "14px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#F43F5E", marginBottom: "10px" }}>
            What this means for you
          </p>
          {loading ? (
            <div>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#E2E8F0", flexShrink: 0, marginTop: "8px" }} />
                  <div style={{ height: "16px", background: "#F1F5F9", borderRadius: "4px", flex: 1 }} />
                </div>
              ))}
            </div>
          ) : points.length > 0 ? (
            <div>
              {points.map((pt, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#F43F5E", flexShrink: 0, marginTop: "8px" }} />
                  <p style={{ fontSize: "14px", color: "#0F172A", lineHeight: 1.55, margin: 0 }}>{pt}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "14px", marginTop: "14px" }}>
          <a href={item.url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "13px", fontWeight: 500, color: "#F43F5E", textDecoration: "none" }}>
            Read full {(item.contentType ?? "article").toLowerCase()} at {hostname} →
          </a>
        </div>
      </div>
    </div>
  );
}
