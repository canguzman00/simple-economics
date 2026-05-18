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

interface CalculatorClientProps {
  profile: UserProfile;
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
  now:      { bg: "#F43F5E", text: "#fff",     label: "Act Now" },
  soon:     { bg: "#FEF3C7", text: "#92400E",  label: "Soon" },
  consider: { bg: "#F1F5F9", text: "#475569",  label: "Consider" },
};

const S = { fontFamily: "Inter, sans-serif" };

export default function CalculatorClient({ profile }: CalculatorClientProps) {
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

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC", ...S }}>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-10 pb-6" style={{ borderBottom: "1px solid #E2E8F0" }}>
          <h1 className="font-bold mb-2" style={{ fontSize: "30px", color: "#0F172A", ...S }}>
            Personal Impact Calculator
          </h1>
          <p className="text-sm" style={{ color: "#64748B", ...S }}>
            Enter a policy or economic event. We analyze how it affects your specific situation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">

          {/* LEFT — Inputs */}
          <div className="space-y-5">

            {/* Policy input */}
            <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #E2E8F0" }}>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#94A3B8", ...S }}>
                01 — Policy or Event
              </div>
              <textarea
                value={policy}
                onChange={(e) => setPolicy(e.target.value)}
                placeholder="e.g. Federal Reserve raises interest rates by 0.25%"
                className="w-full text-sm resize-none outline-none rounded-lg transition-colors"
                style={{ border: "1.5px solid #E2E8F0", padding: "10px 12px", color: "#0F172A", ...S }}
                rows={3}
                onFocus={e => e.currentTarget.style.borderColor = "#F43F5E"}
                onBlur={e => e.currentTarget.style.borderColor = "#E2E8F0"}
              />
              <div className="mt-3">
                <div className="text-[11px] font-medium mb-2" style={{ color: "#CBD5E1", ...S }}>Quick select</div>
                <div className="flex flex-wrap gap-2">
                  {HOT_TOPICS.map((t) => (
                    <button key={t} onClick={() => setPolicy(t)}
                      className="text-[11px] px-2.5 py-1 rounded-lg transition-all"
                      style={{ border: "1px solid #E2E8F0", color: "#64748B", background: "#fff", ...S }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#F43F5E"; e.currentTarget.style.color = "#F43F5E"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#64748B"; }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile */}
            <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #E2E8F0" }}>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#94A3B8", ...S }}>
                02 — Your Profile
              </div>
              <div className="space-y-2">
                {([
                  ["Housing", profile.situation],
                  ["Employment", profile.employmentStatus],
                  ["City", profile.city],
                  ["Life Stage", profile.lifeStage],
                  ["Industry", profile.industry],
                  ["Concern", profile.concern],
                  ["Debt Types", profile.debtTypes?.join(", ") || null],
                ] as [string, string | null][]).map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-1.5" style={{ borderBottom: "1px solid #F8FAFC" }}>
                    <span className="text-xs uppercase tracking-wider" style={{ color: "#94A3B8", ...S }}>{label}</span>
                    <span className="text-xs font-medium text-right max-w-[180px]" style={{ color: value ? "#0F172A" : "#CBD5E1", fontStyle: value ? "normal" : "italic", ...S }}>
                      {value || "Not set"}
                    </span>
                  </div>
                ))}
              </div>
              <a href="/onboarding" className="mt-3 inline-block text-xs font-medium" style={{ color: "#F43F5E", ...S }}>
                Update profile →
              </a>
            </div>

            {/* Financial details */}
            <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #E2E8F0" }}>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#94A3B8", ...S }}>
                03 — Financial Details
              </div>
              <div className="text-[11px] mb-4" style={{ color: "#CBD5E1", ...S }}>Optional — makes estimates more precise</div>
              <div className="space-y-3">
                {[
                  { key: "income",       label: "Monthly take-home pay (after tax)",              placeholder: "5000"   },
                  { key: "housingCost",  label: "Monthly rent or mortgage payment",               placeholder: "1800"   },
                  ...(profile.situation?.toLowerCase().includes("own") ? [{ key: "homeValue", label: "Estimated home value (current market)", placeholder: "450000" }] : []),
                  { key: "savings",      label: "Cash savings total balance (checking + savings)", placeholder: "15000"  },
                  { key: "investments",  label: "Investment accounts total balance (401k, IRA, stocks)", placeholder: "40000" },
                  { key: "debtPayments", label: "Total monthly debt payments (cards, loans)",     placeholder: "400"    },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[11px] mb-1 uppercase tracking-wider" style={{ color: "#64748B", ...S }}>{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#CBD5E1" }}>$</span>
                      <input
                        type="number"
                        value={financials[key as keyof typeof financials]}
                        onChange={(e) => setFinancials((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full pl-7 pr-3 py-2 text-sm rounded-lg outline-none transition-colors font-mono"
                        style={{ border: "1.5px solid #E2E8F0", color: "#0F172A" }}
                        onFocus={e => e.currentTarget.style.borderColor = "#F43F5E"}
                        onBlur={e => e.currentTarget.style.borderColor = "#E2E8F0"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={runCalculator}
              disabled={loading || !policy.trim()}
              className="w-full py-3.5 text-sm font-semibold rounded-xl transition-all"
              style={{
                background: loading || !policy.trim() ? "#E2E8F0" : "#F43F5E",
                color: loading || !policy.trim() ? "#94A3B8" : "#fff",
                cursor: loading || !policy.trim() ? "not-allowed" : "pointer",
                ...S,
              }}>
              {loading ? "Analyzing..." : "Calculate My Impact →"}
            </button>
          </div>

          {/* RIGHT — Results */}
          <div>
            {!result && !loading && !error && (
              <div className="rounded-xl flex flex-col items-center justify-center min-h-[400px] text-center p-10"
                style={{ border: "1.5px dashed #E2E8F0", background: "#fff" }}>
                <div className="text-5xl font-bold mb-4" style={{ color: "#E2E8F0" }}>?</div>
                <p className="text-sm max-w-xs" style={{ color: "#CBD5E1", ...S }}>
                  Choose a policy or event on the left, then hit Calculate to see your personalized impact.
                </p>
              </div>
            )}

            {loading && (
              <div className="rounded-xl flex flex-col items-center justify-center min-h-[400px] p-10"
                style={{ background: "#1E293B", border: "1px solid #334155" }}>
                <div className="text-xs font-medium uppercase tracking-widest mb-8" style={{ color: "#475569", ...S }}>
                  Analyzing your situation
                </div>
                <div className="flex gap-2 mb-8">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full"
                      style={{ background: "#F43F5E", animation: "pulse 1.2s ease-in-out infinite", animationDelay: i * 0.2 + "s" }} />
                  ))}
                </div>
                <style>{`@keyframes pulse { 0%,100%{opacity:0.2} 50%{opacity:1} }`}</style>
              </div>
            )}

            {error && (
              <div className="rounded-xl p-6" style={{ background: "#FFF1F2", border: "1px solid #FECDD3" }}>
                <p className="text-sm" style={{ color: "#F43F5E", ...S }}>{error}</p>
              </div>
            )}

            {result && vc && (
              <div className="space-y-4">

                {/* Verdict */}
                <div className="rounded-xl p-6" style={{ background: vc.bg, border: "1px solid " + vc.border }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: vc.dot }} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: vc.text, ...S }}>
                      {vc.label}
                    </span>
                  </div>
                  <p className="text-base font-bold leading-snug mb-2" style={{ color: vc.text, ...S }}>
                    {result.headline}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: vc.text, opacity: 0.8, ...S }}>
                    {result.overall_summary}
                  </p>
                </div>

                {/* Short / Long term */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[result.short_term, result.long_term].map((section, idx) => (
                    <div key={idx} className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #E2E8F0", borderTop: "3px solid #F43F5E" }}>
                      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#94A3B8", ...S }}>
                        {section.label}
                      </div>
                      {section.dollar_estimate && (
                        <div className="text-xl font-bold mb-3 font-mono" style={{ color: "#F43F5E" }}>
                          {section.dollar_estimate}
                        </div>
                      )}
                      <p className="text-sm leading-relaxed mb-4" style={{ color: "#64748B", ...S }}>{section.impact}</p>
                      <div className="space-y-2">
                        {section.key_points.map((pt, i) => (
                          <div key={i} className="flex gap-2 items-start">
                            <span className="text-xs mt-0.5 flex-shrink-0 font-bold" style={{ color: "#F43F5E" }}>▸</span>
                            <span className="text-xs leading-relaxed" style={{ color: "#475569", ...S }}>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Watch for */}
                <div className="rounded-xl p-5" style={{ background: "#1E293B", border: "1px solid #334155" }}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#F43F5E", ...S }}>
                    Watch For
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {result.watch_for.map((item, i) => (
                      <div key={i} className="rounded-lg p-3" style={{ background: "#0F172A", border: "1px solid #334155" }}>
                        <span className="text-xs leading-relaxed" style={{ color: "#94A3B8", ...S }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action steps */}
                <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #E2E8F0" }}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: "#94A3B8", ...S }}>
                    Action Steps
                  </div>
                  <div className="space-y-3">
                    {result.action_steps.map((action, i) => {
                      const urg = URGENCY_CONFIG[action.urgency] || URGENCY_CONFIG.consider;
                      return (
                        <div key={i} className="flex gap-3 items-start">
                          <span className="text-[10px] font-semibold px-2 py-1 rounded flex-shrink-0 mt-0.5"
                            style={{ background: urg.bg, color: urg.text, ...S }}>
                            {urg.label}
                          </span>
                          <span className="text-sm leading-relaxed" style={{ color: "#374151", ...S }}>{action.step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sources */}
                {result.sources?.length > 0 && (
                  <div className="rounded-xl p-4" style={{ border: "1px solid #F1F5F9", background: "#F8FAFC" }}>
                    <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#CBD5E1", ...S }}>Sources</div>
                    <div className="flex flex-wrap gap-2">
                      {result.sources.map((src, i) => (
                        <span key={i} className="text-[11px] px-2 py-1 rounded" style={{ color: "#64748B", background: "#fff", border: "1px solid #E2E8F0", ...S }}>
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reset */}
                <button
                  onClick={() => { setResult(null); setPolicy(""); }}
                  className="w-full py-3 text-sm font-medium rounded-xl transition-all"
                  style={{ border: "1px solid #E2E8F0", color: "#64748B", background: "#fff", ...S }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#1E293B"; e.currentTarget.style.color = "#F8FAFC"; e.currentTarget.style.borderColor = "#1E293B"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748B"; e.currentTarget.style.borderColor = "#E2E8F0"; }}>
                  New Analysis
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
