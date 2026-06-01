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

function getSourceTag(source: string): { bg: string; color: string } {
  if (isNewsSource(source)) return { bg: "#E63329", color: "#fff" };
  return { bg: "#F5C800", color: "#0A0A0A" };
}

function getImpactLabel(impact: string): string {
  if (impact === "HIGH") return "High impact";
  if (impact === "LOW") return "Low impact";
  return "Medium impact";
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

  const sourceTag = getSourceTag(item.source);
  const hostname = getHostname(item.url, item.source);
  const isResearch = item.contentType === "Research Paper";

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

  return (
    <div
      style={{
        background: "#fff",
        border: "2px solid #0A0A0A",
        fontFamily: "Inter, sans-serif",
        cursor: "pointer",
      }}
      onClick={function() { setExpanded(function(v) { return !v; }); }}
    >
      {/* Card top */}
      <div style={{ padding: featured ? "18px 20px" : "14px 16px" }}>

        {/* Source + meta row */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" as const }}>
          <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", background: sourceTag.bg, color: sourceTag.color, letterSpacing: "0.04em" }}>
            {isResearch ? item.source : "The Guardian"}
          </span>
          {isResearch && (
            <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", background: "#0A0A0A", color: "#F5C800", letterSpacing: "0.04em" }}>
              RESEARCH
            </span>
          )}
          <span style={{ fontSize: "10px", fontWeight: 700, color: getImpactColor(item.impact), marginLeft: "2px" }}>
            {getImpactLabel(item.impact).toUpperCase()}
          </span>
          <span style={{ fontSize: "10px", color: "#94A3B8", marginLeft: "auto" }}>
            {formatDate(item.publishedAt)}
          </span>
          <span style={{ fontSize: "12px", color: "#94A3B8", marginLeft: "4px" }}>
            {expanded ? "▲" : "▼"}
          </span>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: featured ? "17px" : "13px",
          fontWeight: 700,
          color: "#0A0A0A",
          lineHeight: 1.35,
          margin: 0,
        }}>
          {item.title}
        </h2>

        {/* Summary — only show in featured or expanded */}
        {(featured || expanded) && (
          <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.65, marginTop: "10px", marginBottom: 0 }}>
            {item.summary}
          </p>
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div
          style={{ borderTop: "2px solid #0A0A0A" }}
          onClick={function(e) { e.stopPropagation(); }}
        >
          {/* What this means for you */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #E2E8F0" }}>
            <div style={{ display: "inline-block", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#0A0A0A", background: "#F5C800", padding: "2px 8px", marginBottom: "10px" }}>
              What this means for you
            </div>
            {loading ? (
              <div>
                {[1, 2, 3].map(function(i) {
                  return (
                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                      <div style={{ width: "6px", height: "6px", background: "#E2E8F0", flexShrink: 0, marginTop: "6px" }} />
                      <div style={{ height: "14px", background: "#F1F5F9", flex: 1 }} />
                    </div>
                  );
                })}
              </div>
            ) : points.length > 0 ? (
              <div>
                {points.map(function(pt, i) {
                  return (
                    <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ width: "6px", height: "6px", background: "#E63329", flexShrink: 0, marginTop: "6px" }} />
                      <p style={{ fontSize: "13px", color: "#111", lineHeight: 1.6, margin: 0 }}>{pt}</p>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Read link */}
          <div style={{ padding: "10px 16px", background: "#0A0A0A" }}>
            
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "11px", fontWeight: 700, color: "#F5C800", textDecoration: "none", letterSpacing: "0.04em" }}
              onClick={function(e) { e.stopPropagation(); }}
            >
              READ FULL {item.contentType.toUpperCase()} AT {hostname.toUpperCase()} →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
