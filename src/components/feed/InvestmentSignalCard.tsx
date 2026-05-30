"use client";

import React, { useState, useEffect } from "react";

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

interface SignalData {
  id: string;
  weekOf: string;
  eventTitle: string;
  eventSummary: string;
  sourceUrl: string;
  sourceLabel: string;
  signalsUp: SignalAsset[];
  signalsDown: SignalAsset[];
  historicalBars: HistoricalBar[];
  researchItems: ResearchItem[];
  impactGeneric: ImpactBullet[];
  disclaimer: string;
}

type Tab = "signals" | "history" | "research" | "impact";

function getStrengthColor(strength: string): string {
  if (strength === "Strong") return "#4ADE80";
  if (strength === "Moderate") return "#FCD34D";
  return "#94A3B8";
}

function ImpactTab(props: { signal: SignalData; userProfile?: { city?: string | null; situation?: string | null } | null }) {
  const sitLabel = props.userProfile?.situation === "RENTER" ? "Renter"
    : props.userProfile?.situation === "OWNER" ? "Homeowner"
    : props.userProfile?.situation ?? null;

  return (
    <div>
      {(sitLabel || props.userProfile?.city) && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" as const }}>
          {sitLabel && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", color: "#94A3B8" }}>{sitLabel}</span>}
          {props.userProfile?.city && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", color: "#94A3B8" }}>{props.userProfile.city}</span>}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: "12px" }}>
        {props.signal.impactGeneric.map(function(bullet, i) {
          return (
            <div key={i} style={{ display: "flex", gap: "10px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, marginTop: "6px", background: "#E63329", display: "block" }} />
              <p style={{ fontSize: "12px", lineHeight: "1.65", color: "#94A3B8", margin: 0 }}>
                <strong style={{ color: "#CBD5E1" }}>{bullet.bold}{": "}</strong>{bullet.text}
              </p>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: "16px", padding: "10px 12px", borderRadius: "8px", background: "rgba(245,200,0,0.08)", border: "1px solid rgba(245,200,0,0.2)" }}>
        <p style={{ fontSize: "10px", color: "#A0844A", lineHeight: "1.5" }}>{props.signal.disclaimer}</p>
      </div>
    </div>
  );
}

export function InvestmentSignalCard(props: {
  userProfile?: { city?: string | null; situation?: string | null } | null
}) {
  const [signal, setSignal] = useState<SignalData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("signals");
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    fetch("/api/investment-signal")
      .then(function(r) { return r.json() as Promise<SignalData | null>; })
      .then(function(data) { setSignal(data); setLoading(false); })
      .catch(function() { setLoading(false); });
  }, []);

  if (loading) {
    return <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "24px", background: "#1E293B", height: "200px" }} />;
  }

  if (!signal) return null;

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "signals", label: "Asset signals" },
    { id: "history", label: "Historical data" },
    { id: "research", label: "Research" },
    { id: "impact", label: "Your impact" },
  ];

  const maxBar = Math.max(...signal.historicalBars.map(function(b) { return Math.abs(b.value); }), 1);

  return (
    <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "24px", background: "#0A0A0A", border: "1px solid #1E293B" }}>

      <div style={{ padding: "20px 20px 0", borderBottom: "1px solid #1E293B" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" as const }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "20px", background: "rgba(245,200,0,0.1)", border: "1px solid rgba(245,200,0,0.25)" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#F5C800" }}>
              {"Investment Context"}
            </span>
          </div>
          <span style={{ fontSize: "10px", color: "#475569" }}>
            {signal.sourceLabel}{" · Week of "}{signal.weekOf}
          </span>
        </div>

        <h2 style={{ fontSize: "16px", fontWeight: 700, lineHeight: 1.35, marginBottom: "8px", color: "#F8FAFC" }}>
          {signal.eventTitle}
        </h2>
        <p style={{ fontSize: "12px", color: "#64748B", lineHeight: 1.65, marginBottom: "12px" }}>
          {signal.eventSummary}
        </p>

        <div style={{ display: "flex", borderBottom: "1px solid #1E293B" }}>
          {tabs.map(function(tab) {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={function() { setActiveTab(tab.id); }}
                style={{
                  fontSize: "11px", fontWeight: 600, padding: "8px 12px",
                  background: "transparent", border: "none",
                  borderBottom: isActive ? "2px solid #F5C800" : "2px solid transparent",
                  marginBottom: "-1px", cursor: "pointer",
                  color: isActive ? "#F8FAFC" : "#475569",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>

        {activeTab === "signals" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#4ADE80", marginBottom: "8px" }}>
                {"Historically benefits"}
              </div>
              {signal.signalsUp.map(function(asset, i) {
                return (
                  <div key={i} style={{ background: "#1E293B", borderRadius: "8px", padding: "10px 12px", marginBottom: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 500, color: "#CBD5E1" }}>{asset.name}</span>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: getStrengthColor(asset.strength) }}>{asset.strength}</span>
                    </div>
                    <p style={{ fontSize: "10px", color: "#475569", margin: 0, lineHeight: 1.4 }}>{asset.reason}</p>
                  </div>
                );
              })}
            </div>
            <div>
              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#F87171", marginBottom: "8px" }}>
                {"Historically struggles"}
              </div>
              {signal.signalsDown.map(function(asset, i) {
                return (
                  <div key={i} style={{ background: "#1E293B", borderRadius: "8px", padding: "10px 12px", marginBottom: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 500, color: "#CBD5E1" }}>{asset.name}</span>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: getStrengthColor(asset.strength) }}>{asset.strength}</span>
                    </div>
                    <p style={{ fontSize: "10px", color: "#475569", margin: 0, lineHeight: 1.4 }}>{asset.reason}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <p style={{ fontSize: "11px", color: "#475569", marginBottom: "14px" }}>
              {"Average returns in similar past episodes"}
            </p>
            {signal.historicalBars.map(function(bar, i) {
              const pct = Math.abs(bar.value) / maxBar * 100;
              const color = bar.direction === "up" ? "#4ADE80" : bar.direction === "down" ? "#F87171" : "#94A3B8";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", width: "160px", flexShrink: 0 }}>{bar.label}</span>
                  <div style={{ flex: 1, height: "8px", background: "#1E293B", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: "4px" }} />
                  </div>
                  <span style={{ fontSize: "11px", fontFamily: "monospace", width: "52px", textAlign: "right" as const, color }}>
                    {bar.direction === "down" ? "-" : "+"}{Math.abs(bar.value).toFixed(1)}{"% "}
                  </span>
                </div>
              );
            })}
            <p style={{ fontSize: "10px", color: "#334155", marginTop: "12px" }}>
              {"Based on historical episodes. Past performance does not guarantee future results."}
            </p>
          </div>
        )}

        {activeTab === "research" && (
          <div style={{ display: "flex", flexDirection: "column" as const, gap: "12px" }}>
            {signal.researchItems.map(function(item, i) {
              return (
                <div key={i} style={{ borderRadius: "8px", padding: "12px 14px", background: "#1E293B", borderLeft: "3px solid #1B4FD8" }}>
                  <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "6px", color: "#475569" }}>
                    {item.journal}{" · "}{item.year}
                  </div>
                  <p style={{ fontSize: "12px", lineHeight: 1.65, marginBottom: "8px", color: "#94A3B8" }}>{item.finding}</p>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "10px", color: "#F5C800" }}>
                    Read paper
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "impact" && (
          <ImpactTab signal={signal} userProfile={props.userProfile} />
        )}

      </div>

      <div style={{ padding: "0 20px 16px" }}>
        <a href={signal.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", fontWeight: 500, color: "#F5C800" }}>
          Read full story at {signal.sourceLabel}
        </a>
      </div>

    </div>
  );
}
