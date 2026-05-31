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
  negative: { bg: "#FFF1F2", border: "#F43F5E", text: "#881337", label: "Negative Impact", dot: "#F43F5E" },
  neutral:  { bg: "#F8FAFC", border: "#64748B", text: "#1E293B", label: "Neutral Impact",  dot: "#64748B" },
  mixed:    { bg: "#FFFBEB", border: "#F59E0B", text: "#78350F", label: "Mixed Impact",    dot: "#F59E0B" },
};

const URGENCY_CONFIG = {
  now:      { bg: "#F43F5E", text: "#fff",    label: "Act Now" },
  soon:     { bg: "#FEF3C7", text: "#92400E", label: "Soon" },
  consider: { bg: "#F1F5F9", text: "#475569", label: "Consider" },
};

function formatEnum(value: string | null): string {
  if (!value) return "Not set";
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatDebtTypes(types: string[]): string {
  if (!types || types.length === 0) return "None";
  return types.map((t) => formatEnum(t)).join(", ");
}

const S = { fontFamily: "Inter, sans-serif" };

export default function CalculatorClient({ profile }: { profile: UserProfile }) {
  const [policy, setPolicy] = useState("");
  const [financials, setFinancials] = useState({
    income: "", housingCost: "", homeValue: "",
    savings: "", investments: "", debtPayments: "",
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
      const data = await res.json();
      const jsonMatch = (data.result as string).match(/\{[\s\S]*\}/);
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

  return (
    <div style={{ ...S }}>

      <div className="mb-8 pb-6" style={{ borderBottom: "1px solid #E2E8F0" }}>
        <h1 className="font-bold mb-2" style={{ fontSize: "28px", color: "#0F172A", ...S }}>
          Personal Impact Calculator
        </h1>
        <p style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.6, ...S }}>
          Enter any economic event or policy. We analyze how it affects your specific situation using your profile.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">

        {/* LEFT */}
        <div className="space-y-4">

          {/* Policy input */}
          <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#94A3B8", marginBottom: "12px", ...S }}>
              What economic event do you want to analyze?
            </div>
            <textarea
              value={policy}
              onChange={(e) => setPolicy(e.target.value)}
              placeholder="e.g. Federal Reserve raises interest rates by 0.25%"
              rows={3}
              className="w-full text-sm resize-none outline-none rounded-lg"
              style={{ border: "1.5px solid #E2E8F0", padding: "10px 12px", color: "#0F172A", fontSize: "13px", lineHeight: 1.6, ...S }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#F43F5E"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; }}
            />
            <div className="mt-3">
              <div style={{ fontSize: "11px", color: "#CBD5E1", marginBottom: "8px", ...S }}>Quick select a topic</div>
              <div className="flex flex-wrap gap-2">
                {HOT_TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setPolicy(t)}
                    style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "20px", border: "1px solid #E2E8F0", color: "#64748B", background: "#fff", cursor: "pointer", ...S }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#F43F5E"; e.currentTarget.style.color = "#F43F5E"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#64748B"; }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#94A3B8", marginBottom: "12px", ...S }}>
              Your profile
            </div>
            <div className="space-y-2">
              {profileRows.map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-1.5" style={{ borderBottom: "1px solid #F8FAFC" }}>
                  <span style={{ fontSize: "12px", color: "#94A3B8", ...S }}>{label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 500, color: value === "Not set" ? "#CBD5E1" : "#0F172A", fontStyle: value === "Not set" ? "italic" : "normal", textAlign: "right" as const, maxWidth: "200px", ...S }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <a href="/onboarding" style={{ display: "inline-block", marginTop: "10px", fontSize: "11px", fontWeight: 500, color: "#F43F5E", ...S }}>
              Update profile
            </a>
          </div>

          {/* Financial details */}
          <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#94A3B8", marginBottom: "4px", ...S }}>
              Financial details
            </div>
            <div style={{ fontSize: "11px", color: "#CBD5E1", marginBottom: "14px", ...S }}>Optional — makes the analysis more precise</div>
            <div className="space-y-3">
              {[
                { key: "income",       label: "Monthly take-home pay (after tax)",         placeholder: "5000" },
                { key: "housingCost",  label: "Monthly rent or mortgage payment",           placeholder: "1800" },
                { key: "savings",      label: "Cash savings (checking + savings accounts)", placeholder: "15000" },
                { key: "investments",  label: "Investment accounts (401k, IRA, stocks)",    placeholder: "40000" },
                { key: "debtPayments", label: "Total monthly debt payments",                placeholder: "400" },
              ].map(function(field) {
                return (
                  <div key={field.key}>
                    <label style={{ display: "block", fontSize: "11px", color: "#64748B", marginBottom: "4px", ...S }}>{field.label}</label>
                    <div style={{ position: "relative" as const }}>
                      <span style={{ position: "absolute" as const, left: "10px", top: "50%", transform: "translateY(-50%)", color: "#CBD5E1", fontSize: "13px" }}>$</span>
                      <input
                        type="number"
                        value={financials[field.key as keyof typeof financials]}
                        onChange={(e) => setFinancials((f) => ({ ...f, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        style={{ width: "100%", paddingLeft: "26px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px", fontSize: "13px", border: "1.5px solid #E2E8F0", borderRadius: "8px", outline: "none", color: "#0F172A", fontFamily: "monospace" }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "#F43F5E"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={runCalculator}
            disabled={loading || !policy.trim()}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "13px",
              fontWeight: 600,
              borderRadius: "12px",
              border: "none",
              background: loading || !policy.trim() ? "#E2E8F0" : "#F43F5E",
              color: loading || !policy.trim() ? "#94A3B8" : "#fff",
              cursor: loading || !policy.trim() ? "not-allowed" : "pointer",
              ...S,
            }}
          >
            {loading ? "Analyzing your situation..." : "Calculate My Impact"}
          </button>
        </div>

        {/* RIGHT — Results */}
        <div>
          {!result && !loading && !error && (
            <div className="rounded-xl flex flex-col items-center justify-center text-center p-10"
              style={{ border: "1.5px dashed #E2E8F0", background: "#fff", minHeight: "400px" }}>
              <div style={{ fontSize: "48px", color: "#E2E8F0", marginBottom: "16px" }}>?</div>
              <p style={{ fontSize: "13px", color: "#CBD5E1", maxWidth: "260px", lineHeight: 1.6, ...S }}>
                Choose a policy or event on the left, then hit Calculate to see your personalized impact.
              </p>
            </div>
          )}

          {loading && (
            <div className="rounded-xl flex flex-col items-center justify-center p-10"
              style={{ background: "#1E293B", border: "1px solid #334155", minHeight: "400px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#475569", marginBottom: "24px", ...S }}>
                Analyzing your situation
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#F43F5E", animation: "pulse 1.2s ease-in-out infinite", animationDelay: i * 0.2 + "s" }} />
                ))}
              </div>
              <style>{`@keyframes pulse { 0%,100%{opacity:0.2} 50%{opacity:1} }`}</style>
            </div>
          )}

          {error && (
            <div className="rounded-xl p-6" style={{ background: "#FFF1F2", border: "1px solid #FECDD3" }}>
              <p style={{ fontSize: "13px", color: "#F43F5E", ...S }}>{error}</p>
            </div>
          )}

          {result && vc && (
            <div className="space-y-4">

              <div className="rounded-xl p-6" style={{ background: vc.bg, border: "1px solid " + vc.border }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: vc.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: vc.text, ...S }}>{vc.label}</span>
                </div>
                <p style={{ fontSize: "16px", fontWeight: 700, lineHeight: 1.3, marginBottom: "8px", color: vc.text, ...S }}>{result.headline}</p>
                <p style={{ fontSize: "13px", lineHeight: 1.7, color: vc.text, opacity: 0.8, ...S }}>{result.overall_summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[result.short_term, result.long_term].map((section, idx) => (
                  <div key={idx} className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #E2E8F0", borderTop: "3px solid #F43F5E" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#94A3B8", marginBottom: "8px", ...S }}>{section.label}</div>
                    {section.dollar_estimate && (
                      <div style={{ fontSize: "20px", fontWeight: 700, color: "#F43F5E", marginBottom: "10px", fontFamily: "monospace" }}>{section.dollar_estimate}</div>
                    )}
                    <p style={{ fontSize: "12px", lineHeight: 1.7, color: "#64748B", marginBottom: "12px", ...S }}>{section.impact}</p>
                    <div className="space-y-2">
                      {section.key_points.map((pt, i) => (
                        <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                          <span style={{ fontSize: "11px", color: "#F43F5E", flexShrink: 0, marginTop: "1px", fontWeight: 700 }}>▸</span>
                          <span style={{ fontSize: "12px", lineHeight: 1.6, color: "#475569", ...S }}>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-5" style={{ background: "#1E293B", border: "1px solid #334155" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#F43F5E", marginBottom: "12px", ...S }}>Watch For</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {result.watch_for.map((item, i) => (
                    <div key={i} className="rounded-lg p-3" style={{ background: "#0F172A", border: "1px solid #334155" }}>
                      <span style={{ fontSize: "12px", lineHeight: 1.5, color: "#94A3B8", ...S }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#94A3B8", marginBottom: "14px", ...S }}>Action Steps</div>
                <div className="space-y-3">
                  {result.action_steps.map((action, i) => {
                    const urg = URGENCY_CONFIG[action.urgency] || URGENCY_CONFIG.consider;
                    return (
                      <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "10px", fontWeight: 600, padding: "3px 8px", borderRadius: "4px", background: urg.bg, color: urg.text, flexShrink: 0, marginTop: "2px", ...S }}>{urg.label}</span>
                        <span style={{ fontSize: "13px", lineHeight: 1.6, color: "#374151", ...S }}>{action.step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {result.sources?.length > 0 && (
                <div className="rounded-xl p-4" style={{ border: "1px solid #F1F5F9", background: "#F8FAFC" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#CBD5E1", marginBottom: "8px", ...S }}>Sources</div>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((src, i) => (
                      <span key={i} style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "4px", color: "#64748B", background: "#fff", border: "1px solid #E2E8F0", ...S }}>{src}</span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => { setResult(null); setPolicy(""); }}
                style={{ width: "100%", padding: "12px", fontSize: "13px", fontWeight: 500, borderRadius: "12px", border: "1px solid #E2E8F0", color: "#64748B", background: "#fff", cursor: "pointer", ...S }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#1E293B"; e.currentTarget.style.color = "#F8FAFC"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748B"; }}
              >
                New Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
