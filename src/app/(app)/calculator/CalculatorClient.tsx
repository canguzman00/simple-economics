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
  positive: { bg: "#E8F5E9", border: "#2E7D32", text: "#1B5E20", label: "Positive Impact", dot: "#4CAF50" },
  negative: { bg: "#FFEBEE", border: "#C62828", text: "#B71C1C", label: "Negative Impact", dot: "#E63329" },
  neutral:  { bg: "#F5F5F5", border: "#424242", text: "#212121", label: "Neutral Impact", dot: "#757575" },
  mixed:    { bg: "#FFF8E1", border: "#F57F17", text: "#E65100", label: "Mixed Impact", dot: "#F5C800" },
};

const URGENCY_CONFIG = {
  now:      { bg: "#E63329", text: "#fff", label: "Act Now" },
  soon:     { bg: "#F5C800", text: "#0A0A0A", label: "Soon" },
  consider: { bg: "#F5F5F5", text: "#424242", label: "Consider" },
};

export default function CalculatorClient({ profile }: CalculatorClientProps) {
  const [policy, setPolicy] = useState("");
  const [financials, setFinancials] = useState({
    income: "",
    housingCost: "",
    homeValue: "",
    savings: "",
    investments: "",
    debtPayments: "",
  });
  const [result, setResult] = useState<ImpactResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runCalculator() {
    if (!policy.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

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
      const parsed = JSON.parse(jsonMatch[0]) as ImpactResult;
      setResult(parsed);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const vc = result ? VERDICT_CONFIG[result.verdict] : null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="border-b-2 border-black bg-black text-white px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-baseline gap-4">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#F5C800]">Simple Economics</span>
          <span className="text-[#666] text-xs tracking-widest uppercase">/ Impact Calculator</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10 border-b-2 border-black pb-6">
          <h1 className="text-3xl font-black uppercase tracking-tight leading-none mb-2">
            Personal Impact Calculator
          </h1>
          <p className="text-sm text-[#555] max-w-xl">
            Enter a policy or economic event. We analyze how it affects your specific situation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
          <div className="space-y-6">
            <div className="border-2 border-black bg-white p-5">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#888] mb-3">
                01 — Policy or Event
              </div>
              <textarea
                value={policy}
                onChange={(e) => setPolicy(e.target.value)}
                placeholder="e.g. Federal Reserve raises interest rates by 0.25%"
                className="w-full text-sm border border-[#DDD] p-3 resize-none focus:outline-none focus:border-black transition-colors"
                rows={3}
              />
              <div className="mt-3">
                <div className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#AAA] mb-2">Quick select</div>
                <div className="flex flex-wrap gap-2">
                  {HOT_TOPICS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setPolicy(t)}
                      className="text-[11px] px-2.5 py-1 border border-[#CCC] hover:border-black hover:bg-black hover:text-white transition-all"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-2 border-black bg-white p-5">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#888] mb-3">02 — Your Profile</div>
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
                  <div key={label} className="flex justify-between items-center text-sm py-1 border-b border-[#F0F0F0] last:border-0">
                    <span className="text-[#888] text-xs uppercase tracking-wider">{label}</span>
                    <span className="font-semibold text-xs text-right max-w-[180px]">
                      {value || <span className="text-[#CCC] font-normal italic">Not set</span>}
                    </span>
                  </div>
                ))}
              </div>
              <a href="/onboarding" className="mt-3 inline-block text-[11px] text-[#1B4FD8] underline">
                Update profile →
              </a>
            </div>

            <div className="border-2 border-black bg-white p-5">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#888] mb-3">
                03 — Financial Details
                <span className="ml-2 font-normal normal-case text-[#BBB]">(optional)</span>
              </div>
              <div className="space-y-3">
                {[
                  { key: "income", label: "Monthly take-home pay (after tax)", placeholder: "5000" },
                  { key: "housingCost", label: "Monthly rent or mortgage payment", placeholder: "1800" },
                  ...(profile.situation?.toLowerCase().includes("own") ? [{ key: "homeValue", label: "Estimated home value (current market)", placeholder: "450000" }] : []),
                  { key: "savings", label: "Cash savings total balance (checking + savings)", placeholder: "15000" },
                  { key: "investments", label: "Investment accounts total balance (401k, IRA, stocks, ETFs)", placeholder: "40000" },
                  { key: "debtPayments", label: "Total monthly debt payments (credit cards, loans)", placeholder: "400" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[11px] text-[#666] mb-1 uppercase tracking-wider">{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] text-sm">$</span>
                      <input
                        type="number"
                        value={financials[key as keyof typeof financials]}
                        onChange={(e) => setFinancials((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full pl-7 pr-3 py-2 text-sm border border-[#DDD] focus:outline-none focus:border-black transition-colors font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={runCalculator}
              disabled={loading || !policy.trim()}
              className="w-full py-4 font-black text-sm tracking-[0.15em] uppercase transition-all border-2 border-black"
              style={{
                background: loading ? "#888" : "#E63329",
                color: "#fff",
                cursor: loading || !policy.trim() ? "not-allowed" : "pointer",
                opacity: !policy.trim() ? 0.5 : 1,
              }}
            >
              {loading ? "Analyzing..." : "Calculate My Impact"}
            </button>
          </div>

          <div>
            {!result && !loading && !error && (
              <div className="border-2 border-dashed border-[#DDD] flex flex-col items-center justify-center min-h-[400px] text-center p-10">
                <div className="text-6xl font-black text-[#EEE] mb-4 leading-none">?</div>
                <p className="text-[#BBB] text-sm max-w-xs">
                  Choose a policy or event on the left, then hit Calculate to see your personalized impact.
                </p>
              </div>
            )}

            {loading && (
              <div className="border-2 border-black bg-black text-white flex flex-col items-center justify-center min-h-[400px] p-10">
                <div className="text-xs tracking-[0.3em] uppercase text-[#666] mb-8">Analyzing your situation</div>
                <div className="flex gap-2 mb-8">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-3 h-3 bg-[#E63329]"
                      style={{ animation: "pulse 1.2s ease-in-out infinite", animationDelay: i * 0.2 + "s" }}
                    />
                  ))}
                </div>
                <style>{`@keyframes pulse { 0%,100%{opacity:0.2} 50%{opacity:1} }`}</style>
              </div>
            )}

            {error && (
              <div className="border-2 border-[#E63329] bg-[#FFF5F5] p-6">
                <p className="text-[#C62828] text-sm">{error}</p>
              </div>
            )}

            {result && vc && (
              <div className="space-y-4">
                <div className="border-2 p-6" style={{ borderColor: vc.border, background: vc.bg }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: vc.dot }} />
                    <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: vc.text }}>
                      {vc.label}
                    </span>
                  </div>
                  <p className="text-base font-bold leading-snug mb-3" style={{ color: vc.text }}>
                    {result.headline}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: vc.text, opacity: 0.85 }}>
                    {result.overall_summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[result.short_term, result.long_term].map((section, idx) => (
                    <div key={idx} className="border-2 border-black bg-white p-5">
                      <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#888] mb-1">{section.label}</div>
                      {section.dollar_estimate && (
                        <div className="text-xl font-black text-[#E63329] mb-3 font-mono">{section.dollar_estimate}</div>
                      )}
                      <p className="text-sm text-[#444] leading-relaxed mb-4">{section.impact}</p>
                      <div className="space-y-2">
                        {section.key_points.map((pt, i) => (
                          <div key={i} className="flex gap-2 items-start">
                            <span className="text-[#F5C800] font-black text-xs mt-0.5 flex-shrink-0">▸</span>
                            <span className="text-xs text-[#555] leading-relaxed">{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-2 border-black bg-[#0A0A0A] text-white p-5">
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#F5C800] mb-3">Watch For</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {result.watch_for.map((item, i) => (
                      <div key={i} className="border border-[#333] p-3">
                        <span className="text-xs text-[#CCC] leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-2 border-black bg-white p-5">
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#888] mb-4">Action Steps</div>
                  <div className="space-y-3">
                    {result.action_steps.map((action, i) => {
                      const urg = URGENCY_CONFIG[action.urgency] || URGENCY_CONFIG.consider;
                      return (
                        <div key={i} className="flex gap-3 items-start">
                          <span
                            className="text-[10px] font-bold px-2 py-1 flex-shrink-0 mt-0.5"
                            style={{ background: urg.bg, color: urg.text }}
                          >
                            {urg.label}
                          </span>
                          <span className="text-sm text-[#333] leading-relaxed">{action.step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {result.sources?.length > 0 && (
                  <div className="border border-[#EEE] p-4">
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#AAA] mb-2">Sources</div>
                    <div className="flex flex-wrap gap-2">
                      {result.sources.map((src, i) => (
                        <span key={i} className="text-[11px] text-[#666] border border-[#EEE] px-2 py-1">{src}</span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { setResult(null); setPolicy(""); }}
                  className="w-full py-3 text-xs font-bold tracking-[0.2em] uppercase border-2 border-black hover:bg-black hover:text-white transition-all"
                >
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
