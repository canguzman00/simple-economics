"use client";

import React, { useState } from "react";

interface SignalAsset {
  name: string;
  reason: string;
  strength: string;
}

interface HistoricalBar {
  label: string;
  value: number;
  direction: "up" | "down" | "neutral";
}

interface ResearchItem {
  source: string;
  journal: string;
  year: number;
  finding: string;
  url: string;
}

interface ImpactBullet {
  bold: string;
  text: string;
}

interface SignalResult {
  eventTitle: string;
  eventSummary: string;
  signalsUp: SignalAsset[];
  signalsDown: SignalAsset[];
  historicalBars: HistoricalBar[];
  researchItems: ResearchItem[];
  impactBullets: ImpactBullet[];
  disclaimer: string;
}

type Tab = "signals" | "history" | "research" | "impact";

type UserProfile = {
  situation?: string | null;
  city?: string | null;
  industry?: string | null;
  lifeStage?: string | null;
  concern?: string | null;
  debtTypes?: string[];
} | null;

const HOT_EVENTS = [
  "Oil price spike due to conflict",
  "Federal Reserve raises interest rates",
  "US tariffs and trade war escalation",
  "Inflation surge above 4%",
  "Recession signals and slowdown",
  "Dollar strengthens significantly",
  "Immigration policy restrictions",
  "Government tech spending increase",
];

const TAB_LABELS: Record<Tab, string> = {
  signals: "ASSET SIGNALS",
  history: "HISTORICAL DATA",
  research: "RESEARCH",
  impact: "YOUR IMPACT",
};

const TABS: Tab[] = ["signals", "history", "research", "impact"];

function formatEnum(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .split("_")
    .map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); })
    .join(" ");
}

export function InvestmentSignalCard(props: { userProfile?: UserProfile }) {
  const [event, setEvent] = useState("");
  const [result, setResult] = useState<SignalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("signals");

  async function analyze() {
    if (!event.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveTab("signals");
    try {
      const res = await fetch("/api/investment-signal/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: event, profile: props.userProfile }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json() as SignalResult;
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const bars = result ? result.historicalBars : [];
  const maxBar = bars.length > 0
    ? Math.max(...bars.map(function(b) { return Math.abs(b.value); }), 1)
    : 1;

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>

      <div style={{ background: "#0A0A0A", padding: "24px 28px", border: "2px solid #0A0A0A", borderBottom: "none" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#F5C800", marginBottom: "6px" }}>
          Investment Context
        </h1>
        <p style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.6 }}>
          Enter any economic event. See what history says about how asset classes respond.
        </p>
      </div>

      <div style={{ border: "2px solid #0A0A0A", borderTop: "none", padding: "24px 28px", background: "#fff" }}>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "inline-block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#0A0A0A", background: "#F5C800", padding: "3px 8px", marginBottom: "10px" }}>
            What economic event?
          </div>
          <textarea
            value={event}
            onChange={function(e) { setEvent(e.target.value); }}
            placeholder="e.g. US-Iran conflict pushes oil above $120/barrel"
            rows={2}
            style={{ width: "100%", border: "2px solid #0A0A0A", padding: "10px 12px", fontSize: "14px", color: "#0A0A0A", fontFamily: "Inter, sans-serif", resize: "none" as const, outline: "none", display: "block", marginBottom: "10px" }}
          />
          <div style={{ fontSize: "11px", color: "#666", marginBottom: "8px" }}>Quick select</div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "6px", marginBottom: "14px" }}>
            {HOT_EVENTS.map(function(t) {
              const isSelected = event === t;
              return (
                <button
                  key={t}
                  onClick={function() { setEvent(t); }}
                  style={{ fontSize: "11px", padding: "5px 12px", border: "2px solid #0A0A0A", background: isSelected ? "#0A0A0A" : "#fff", color: isSelected ? "#fff" : "#0A0A0A", cursor: "pointer", fontFamily: "Inter, sans-serif", fontWeight: 500 }}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: "11px", color: "#888", background: "#FFFBEB", border: "1px solid #F5C800", padding: "8px 12px", marginBottom: "14px", lineHeight: 1.5 }}>
            Educational only. Not financial advice. Historical patterns do not guarantee future results. Consult a licensed financial advisor before making investment decisions.
          </div>
          <button
            onClick={analyze}
            disabled={loading || !event.trim()}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "14px",
              fontWeight: 700,
              border: "2px solid #0A0A0A",
              background: loading || !event.trim() ? "#E2E8F0" : "#0A0A0A",
              color: loading || !event.trim() ? "#94A3B8" : "#fff",
              cursor: loading || !event.trim() ? "not-allowed" : "pointer",
              letterSpacing: "0.06em",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {loading ? "ANALYZING..." : "ANALYZE INVESTMENT CONTEXT"}
          </button>
        </div>

        {error !== null && (
          <div style={{ background: "#FFF1F2", border: "2px solid #E63329", padding: "14px", marginBottom: "16px" }}>
            <p style={{ fontSize: "13px", color: "#7F1D1D" }}>{error}</p>
          </div>
        )}

        {loading && (
          <div style={{ background: "#0A0A0A", border: "2px solid #0A0A0A", padding: "48px", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "16px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#475569" }}>
              Analyzing historical patterns
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {[0, 1, 2, 3].map(function(i) {
                return (
                  <div
                    key={i}
                    style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#F5C800", animation: "pulse 1.2s ease-in-out infinite", animationDelay: String(i * 0.2) + "s" }}
                  />
                );
              })}
            </div>
            <style dangerouslySetInnerHTML={{ __html: "@keyframes pulse{0%,100%{opacity:0.2}50%{opacity:1}}" }} />
          </div>
        )}

        {!result && !loading && error === null && (
          <div style={{ border: "2px dashed #0A0A0A", padding: "48px", display: "flex", flexDirection: "column" as const, alignItems: "center", textAlign: "center" as const }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>{"[ chart ]"}</div>
            <p style={{ fontSize: "13px", color: "#94A3B8", maxWidth: "260px", lineHeight: 1.6 }}>
              Enter any economic event above and hit Analyze to see historical investment patterns.
            </p>
          </div>
        )}

        {result !== null && !loading && (
          <div style={{ border: "2px solid #0A0A0A" }}>

            <div style={{ background: "#F5C800", borderBottom: "2px solid #0A0A0A", padding: "14px 18px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0A0A0A", marginBottom: "4px" }}>{result.eventTitle}</h2>
              <p style={{ fontSize: "12px", color: "#444", lineHeight: 1.6 }}>{result.eventSummary}</p>
            </div>

            <div style={{ display: "flex", borderBottom: "2px solid #0A0A0A" }}>
              {TABS.map(function(tab) {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={function() { setActiveTab(tab); }}
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "10px 14px",
                      border: "none",
                      borderRight: "1px solid #0A0A0A",
                      background: isActive ? "#0A0A0A" : "#fff",
                      color: isActive ? "#F5C800" : "#555",
                      cursor: "pointer",
                      letterSpacing: "0.08em",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {TAB_LABELS[tab]}
                  </button>
                );
              })}
            </div>

            <div style={{ padding: "20px" }}>

              {activeTab === "signals" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#166534", marginBottom: "10px" }}>
                      Historically Benefits
                    </div>
                    {result.signalsUp.map(function(asset, i) {
                      const isStrong = asset.strength === "Strong";
                      return (
                        <div key={i} style={{ border: "2px solid #0A0A0A", padding: "10px 12px", marginBottom: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0A0A0A" }}>{asset.name}</span>
                            <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 6px", background: isStrong ? "#DCFCE7" : "#FEF3C7", color: isStrong ? "#166534" : "#92400E" }}>
                              {asset.strength}
                            </span>
                          </div>
                          <p style={{ fontSize: "11px", color: "#555", lineHeight: 1.4 }}>{asset.reason}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#991B1B", marginBottom: "10px" }}>
                      Historically Struggles
                    </div>
                    {result.signalsDown.map(function(asset, i) {
                      const isStrong = asset.strength === "Strong";
                      return (
                        <div key={i} style={{ border: "2px solid #0A0A0A", padding: "10px 12px", marginBottom: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0A0A0A" }}>{asset.name}</span>
                            <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 6px", background: isStrong ? "#FEE2E2" : "#FEF3C7", color: isStrong ? "#991B1B" : "#92400E" }}>
                              {asset.strength}
                            </span>
                          </div>
                          <p style={{ fontSize: "11px", color: "#555", lineHeight: 1.4 }}>{asset.reason}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div>
                  <p style={{ fontSize: "11px", color: "#666", marginBottom: "16px" }}>Average returns in similar historical episodes</p>
                  {result.historicalBars.map(function(bar, i) {
                    const pct = Math.abs(bar.value) / maxBar * 100;
                    const color = bar.direction === "up" ? "#166534" : bar.direction === "down" ? "#991B1B" : "#475569";
                    const bg = bar.direction === "up" ? "#DCFCE7" : bar.direction === "down" ? "#FEE2E2" : "#F1F5F9";
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "12px", color: "#333", width: "160px", flexShrink: 0 }}>{bar.label}</span>
                        <div style={{ flex: 1, height: "12px", background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
                          <div style={{ height: "100%", width: String(pct) + "%", background: bg, borderRight: "2px solid " + color }} />
                        </div>
                        <span style={{ fontSize: "11px", fontFamily: "monospace", width: "54px", textAlign: "right" as const, color: color, fontWeight: 700 }}>
                          {bar.direction === "down" ? "-" : "+"}{Math.abs(bar.value).toFixed(1)}{"%"}
                        </span>
                      </div>
                    );
                  })}
                  <p style={{ fontSize: "10px", color: "#94A3B8", marginTop: "12px" }}>Based on historical episodes. Past performance does not guarantee future results.</p>
                </div>
              )}

              {activeTab === "research" && (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: "12px" }}>
                  {result.researchItems.map(function(item, i) {
                    return (
                      <div key={i} style={{ border: "2px solid #0A0A0A", borderLeft: "4px solid #0A0A0A", padding: "12px 14px" }}>
                        <div style={{ display: "inline-block", fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#0A0A0A", background: "#F5C800", padding: "2px 6px", marginBottom: "6px" }}>
                          {item.journal}{" "}{String(item.year)}
                        </div>
                        <p style={{ fontSize: "12px", color: "#222", lineHeight: 1.65, marginBottom: "8px" }}>{item.finding}</p>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "10px", color: "#0A0A0A", fontWeight: 700, textDecoration: "underline" }}>
                          Read paper
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === "impact" && (
                <div>
                  {props.userProfile !== null && props.userProfile !== undefined && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" as const, marginBottom: "14px" }}>
                      {[
                        formatEnum(props.userProfile.situation),
                        props.userProfile.city ?? "",
                        formatEnum(props.userProfile.industry),
                        formatEnum(props.userProfile.lifeStage),
                      ].filter(function(tag) { return tag !== ""; }).map(function(tag, i) {
                        return (
                          <span key={i} style={{ fontSize: "10px", padding: "3px 8px", border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#333" }}>{tag}</span>
                        );
                      })}
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: "12px" }}>
                    {result.impactBullets.map(function(bullet, i) {
                      return (
                        <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <div style={{ width: "8px", height: "8px", background: "#F5C800", border: "2px solid #0A0A0A", flexShrink: 0, marginTop: "4px" }} />
                          <p style={{ fontSize: "13px", color: "#111", lineHeight: 1.65, fontFamily: "Inter, sans-serif" }}>
                            <strong style={{ color: "#0A0A0A" }}>{bullet.bold}{": "}</strong>
                            {bullet.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: "16px", fontSize: "10px", color: "#888", background: "#FFFBEB", border: "1px solid #F5C800", padding: "8px 12px", lineHeight: 1.5 }}>
                    {result.disclaimer}
                  </div>
                </div>
              )}

            </div>

            <div style={{ borderTop: "2px solid #0A0A0A", padding: "14px 20px" }}>
              <button
                onClick={function() { setResult(null); setEvent(""); setActiveTab("signals"); }}
                style={{ fontSize: "12px", fontWeight: 700, padding: "8px 20px", border: "2px solid #0A0A0A", background: "#fff", color: "#0A0A0A", cursor: "pointer", letterSpacing: "0.06em", fontFamily: "Inter, sans-serif" }}
                onMouseEnter={function(e) { e.currentTarget.style.background = "#0A0A0A"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={function(e) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#0A0A0A"; }}
              >
                NEW ANALYSIS
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
