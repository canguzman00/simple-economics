"use client";

import { useState } from "react";

interface UserProfile {
  situation: string | null;
  employmentStatus: string | null;
  concern: string | null;
  city: string | null;
  lifeStage: string | null;
  debtTypes: string[];
  industry: string | null;
}

interface ActionStep {
  step: string;
  urgency: "now" | "soon" | "consider";
}

interface ImpactSection {
  label: string;
  impact: string;
  dollar_estimate: string | null;
  key_points: string[];
}

interface ImpactResult {
  verdict: "positive" | "negative" | "neutral" | "mixed";
  headline: string;
  overall_summary: string;
  short_term: ImpactSection;
  long_term: ImpactSection;
  watch_for: string[];
  action_steps: ActionStep[];
  sources: string[];
}

const HOT_TOPICS = [
  "Federal Reserve interest rate decision",
  "US tariffs and trade war",
  "AI and automation job displacement",
  "Housing market affordability crisis",
  "Inflation and consumer prices",
  "Student loan forgiveness policy",
  "Healthcare cost reforms",
  "Minimum wage increase proposals",
];

const VERDICT_CONFIG = {
  positive: { bg: "#F0FDF4", border: "#16A34A", text: "#14532D", label: "Positive Impact", dot: "#16A34A" },
  negative: { bg: "#FFF1F2", border: "#E63329", text: "#7F1D1D", label: "Negative Impact", dot: "#E63329" },
  neutral:  { bg: "#F8FAFC", border: "#334155", text: "#1E293B", label: "Neutral Impact",  dot: "#334155" },
  mixed:    { bg: "#FFFBEB", border: "#D97706", text: "#78350F", label: "Mixed Impact",    dot: "#D97706" },
};

const URGENCY_CONFIG = {
  now:      { bg: "#E63329", text: "#fff",    label: "Act Now" },
  soon:     { bg: "#F5C800", text: "#0A0A0A", label: "Soon" },
  consider: { bg: "#F1F5F9", text: "#334155", label: "Consider" },
};

function formatEnum(value: string | null): string {
  if (!value) return "Not set";
  return value
    .split("_")
    .map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); })
    .join(" ");
}

function formatDebtTypes(types: string[]): string {
  if (!types || types.length === 0) return "None";
  return types.map(function(t) { return formatEnum(t); }).join(", ");
}

export default function CalculatorClient({ profile }: { profile: UserProfile }) {
  const [policy, setPolicy] = useState("");
  const [financials, setFinancials] = useState({
    income: "", housingCost: "", savings: "", investments: "", debtPayments: "",
  });
  const [result, setResult] = useState<ImpactResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runCalculator() {
    if (!policy.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy, profile, financials }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json() as { result: string };
      const jsonMatch = data.result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse response");
      setResult(JSON.parse(jsonMatch[0]) as ImpactResult);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const vc = result ? VERDICT_CONFIG[result.verdict] : null;

  const profileRows: [string, string][] = [
    ["Housing", formatEnum(profile.situation)],
    ["Employment", formatEnum(profile.employmentStatus)],
    ["City", profile.city ? profile.city.charAt(0).toUpperCase() + profile.city.slice(1) : "Not set"],
    ["Life stage", formatEnum(profile.lifeStage)],
    ["Industry", formatEnum(profile.industry)],
    ["Main concern", formatEnum(profile.concern)],
    ["Debt", formatDebtTypes(profile.debtTypes)],
  ];

  const F = { fontFamily: "Inter, sans-serif" };

  return (
    <div style={{ ...F }}>

      <div style={{ background: "#E63329", padding: "24px 28px", border: "2px solid #0A0A0A", borderBottom: "none" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "6px", ...F }}>
          Personal Impact Calculator
        </h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, ...F }}>
          Enter any economic event or policy. We analyze exactly how it affects your specific situation.
        </p>
      </div>

      <div style={{ border: "2px solid #0A0A0A", borderTop: "none", padding: "24px 28px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">

          <div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "inline-block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#0A0A0A", background: "#F5C800", padding: "3px 8px", marginBottom: "10px", ...F }}>
                What economic event?
              </div>
              <textarea
                value={policy}
                onChange={function(e) { setPolicy(e.target.value); }}
                placeholder="e.g. Federal Reserve raises interest rates by 0.25%"
                rows={3}
                style={{ width: "100%", border: "2px solid #0A0A0A", padding: "10px 12px", fontSize: "14px", color: "#0A0A0A", fontFamily: "Inter, sans-serif", resize: "none" as const, outline: "none", display: "block" }}
              />
              <div style={{ marginTop: "10px" }}>
                <div style={{ fontSize: "11px", color: "#666", marginBottom: "8px", ...F }}>Quick select</div>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "6px" }}>
                  {HOT_TOPICS.map(function(t) {
                    return (
                      <button
                        key={t}
                        onClick={function() { setPolicy(t); }}
                        style={{ fontSize: "11px", padding: "5px 12px", border: "2px solid #0A0A0A", background: "#fff", color: "#0A0A0A", cursor: "pointer", fontFamily: "Inter, sans-serif", fontWeight: 500 }}
                        onMouseEnter={function(e) { e.currentTarget.style.background = "#0A0A0A"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={function(e) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#0A0A0A"; }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "inline-block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#0A0A0A", background: "#F5C800", padding: "3px 8px", marginBottom: "10px", ...F }}>
                Your profile
              </div>
              <div style={{ border: "2px solid #0A0A0A" }}>
                {profileRows.map(function([label, value]) {
                  return (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", borderBottom: "1px solid #E2E8F0" }}>
                      <span style={{ fontSize: "12px", color: "#555", ...F }}>{label}</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: value === "Not set" ? "#aaa" : "#0A0A0A", fontStyle: value === "Not set" ? "italic" : "normal", ...F }}>{value}</span>
                    </div>
                  );
                })}
                <div style={{ padding: "8px 12px" }}>
                  <a href="/onboarding" style={{ fontSize: "11px", fontWeight: 600, color: "#E63329", textDecoration: "none", ...F }}>Update profile</a>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "inline-block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#0A0A0A", background: "#F5C800", padding: "3px 8px", marginBottom: "4px", ...F }}>
                Financial details
              </div>
              <div style={{ fontSize: "11px", color: "#888", marginBottom: "10px", ...F }}>Optional — makes the analysis more precise</div>
              <div style={{ border: "2px solid #0A0A0A", padding: "14px" }}>
                {[
                  { key: "income",       label: "Monthly take-home pay (after tax)",      placeholder: "5000" },
                  { key: "housingCost",  label: "Monthly rent or mortgage payment",        placeholder: "1800" },
                  { key: "savings",      label: "Cash savings (checking + savings)",       placeholder: "15000" },
                  { key: "investments",  label: "Investment accounts (401k, IRA, stocks)", placeholder: "40000" },
                  { key: "debtPayments", label: "Total monthly debt payments",             placeholder: "400" },
                ].map(function(field) {
                  return (
                    <div key={field.key} style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", fontSize: "11px", color: "#555", marginBottom: "4px", ...F }}>{field.label}</label>
                      <div style={{ position: "relative" as const }}>
                        <span style={{ position: "absolute" as const, left: "10px", top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: "13px" }}>$</span>
                        <input
                          type="number"
                          value={financials[field.key as keyof typeof financials]}
                          onChange={function(e) { setFinancials(function(f) { return { ...f, [field.key]: e.target.value }; }); }}
                          placeholder={field.placeholder}
                          style={{ width: "100%", paddingLeft: "26px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px", fontSize: "13px", border: "2px solid #0A0A0A", outline: "none", color: "#0A0A0A", fontFamily: "monospace" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={runCalculator}
              disabled={loading || !policy.trim()}
              style={{
                width: "100%", padding: "14px", fontSize: "14px", fontWeight: 700,
                border: "2px solid #0A0A0A",
                background: loading || !policy.trim() ? "#E2E8F0" : "#0A0A0A",
                color: loading || !policy.trim() ? "#94A3B8" : "#fff",
                cursor: loading || !policy.trim() ? "not-allowed" : "pointer",
                letterSpacing: "0.04em", fontFamily: "Inter, sans-serif",
              }}
            >
              {loading ? "ANALYZING YOUR SITUATION..." : "CALCULATE MY IMPACT"}
            </button>
          </div>

          <div>
            {!result && !loading && !error && (
              <div style={{ border: "2px dashed #0A0A0A", padding: "60px 40px", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", minHeight: "400px", textAlign: "center" as const }}>
                <div style={{ fontSize: "48px", color: "#E2E8F0", marginBottom: "16px" }}>?</div>
                <p style={{ fontSize: "13px", color: "#94A3B8", maxWidth: "240px", lineHeight: 1.6, ...F }}>
                  Choose an event on the left and hit Calculate to see your personalized impact.
                </p>
              </div>
            )}

            {loading && (
              <div style={{ background: "#0A0A0A", border: "2px solid #0A0A0A", padding: "60px 40px", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#475569", marginBottom: "24px", ...F }}>
                  Analyzing your situation
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[0, 1, 2, 3].map(function(i) {
                    return <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E63329", animation: "pulse 1.2s ease-in-out infinite", animationDelay: i * 0.2 + "s" }} />;
                  })}
                </div>
                <style>{`@keyframes pulse { 0%,100%{opacity:0.2} 50%{opacity:1} }`}</style>
              </div>
            )}

            {error && (
              <div style={{ background: "#FFF1F2", border: "2px solid #E63329", padding: "20px" }}>
                <p style={{ fontSize: "13px", color: "#7F1D1D", ...F }}>{error}</p>
              </div>
            )}

            {result && vc && (
              <div style={{ display: "flex", flexDirection: "column" as const, gap: "16px" }}>

                <div style={{ background: vc.bg, border: "2px solid " + vc.border, padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: vc.dot }} />
                    <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: vc.text, ...F }}>{vc.label}</span>
                  </div>
                  <p style={{ fontSize: "17px", fontWeight: 700, color: vc.text, marginBottom: "8px", lineHeight: 1.3, ...F }}>{result.headline}</p>
                  <p style={{ fontSize: "13px", color: vc.text, lineHeight: 1.7, opacity: 0.9, ...F }}>{result.overall_summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[result.short_term, result.long_term].map(function(section, idx) {
                    return (
                      <div key={idx} style={{ border: "2px solid #0A0A0A", padding: "16px" }}>
                        <div style={{ display: "inline-block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#0A0A0A", background: "#F5C800", padding: "2px 8px", marginBottom: "10px", ...F }}>
                          {section.label}
                        </div>
                        {section.dollar_estimate && (
                          <div style={{ fontSize: "22px", fontWeight: 700, color: "#E63329", marginBottom: "10px", fontFamily: "monospace" }}>{section.dollar_estimate}</div>
                        )}
                        <p style={{ fontSize: "12px", color: "#333", lineHeight: 1.7, marginBottom: "12px", ...F }}>{section.impact}</p>
                        <div style={{ display: "flex", flexDirection: "column" as const, gap: "6px" }}>
                          {section.key_points.map(function(pt, i) {
                            return (
                              <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                                <span style={{ fontSize: "11px", color: "#E63329", flexShrink: 0, fontWeight: 700 }}>▸</span>
                                <span style={{ fontSize: "12px", color: "#333", lineHeight: 1.6, ...F }}>{pt}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ background: "#0A0A0A", border: "2px solid #0A0A0A", padding: "16px" }}>
                  <div style={{ display: "inline-block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#0A0A0A", background: "#F5C800", padding: "2px 8px", marginBottom: "12px", ...F }}>
                    Watch For
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {result.watch_for.map(function(item, i) {
                      return (
                        <div key={i} style={{ border: "1px solid #1E293B", padding: "10px 12px" }}>
                          <span style={{ fontSize: "12px", color: "#CBD5E1", lineHeight: 1.5, ...F }}>{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ border: "2px solid #0A0A0A", padding: "16px" }}>
                  <div style={{ display: "inline-block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#0A0A0A", background: "#F5C800", padding: "2px 8px", marginBottom: "14px", ...F }}>
                    Action Steps
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: "10px" }}>
                    {result.action_steps.map(function(action, i) {
                      const urg = URGENCY_CONFIG[action.urgency] || URGENCY_CONFIG.consider;
                      return (
                        <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", background: urg.bg, color: urg.text, flexShrink: 0, marginTop: "2px", border: "1px solid rgba(0,0,0,0.1)", ...F }}>{urg.label}</span>
                          <span style={{ fontSize: "13px", color: "#111", lineHeight: 1.6, ...F }}>{action.step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {result.sources?.length > 0 && (
                  <div style={{ border: "1px solid #E2E8F0", padding: "14px", background: "#F8FAFC" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#94A3B8", marginBottom: "8px", ...F }}>Sources</div>
                    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "6px" }}>
                      {result.sources.map(function(src, i) {
                        return <span key={i} style={{ fontSize: "11px", padding: "3px 8px", border: "1px solid #E2E8F0", color: "#333", background: "#fff", ...F }}>{src}</span>;
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={function() { setResult(null); setPolicy(""); }}
                  style={{ width: "100%", padding: "12px", fontSize: "13px", fontWeight: 600, border: "2px solid #0A0A0A", color: "#0A0A0A", background: "#fff", cursor: "pointer", letterSpacing: "0.04em", ...F }}
                  onMouseEnter={function(e) { e.currentTarget.style.background = "#0A0A0A"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={function(e) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#0A0A0A"; }}
                >
                  NEW ANALYSIS
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
