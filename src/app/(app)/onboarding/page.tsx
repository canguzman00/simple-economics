"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SITUATIONS = [
  { value: "RENTER",        emoji: "🏠", label: "Renter",        sub: "I pay rent every month" },
  { value: "OWNER",         emoji: "🔑", label: "Homeowner",     sub: "I own or have a mortgage" },
  { value: "EMPLOYED",      emoji: "💼", label: "Employed",      sub: "I work for a company" },
  { value: "SELF_EMPLOYED", emoji: "⚡", label: "Self-Employed", sub: "I run my own thing" },
  { value: "STUDENT",       emoji: "📚", label: "Student",       sub: "I'm in school" },
] as const;

const CONCERNS = [
  { value: "HOUSING",     emoji: "📈", label: "Housing Costs",     sub: "Rent, mortgages, buying" },
  { value: "JOB_SECURITY",emoji: "🛡️", label: "Job Security",     sub: "Layoffs, hiring, my industry" },
  { value: "SAVINGS",     emoji: "💰", label: "Building Savings",  sub: "Growing what I have" },
  { value: "DEBT",        emoji: "🔗", label: "Debt Burden",       sub: "Loans, credit, interest" },
  { value: "RETIREMENT",  emoji: "🌅", label: "Retirement",        sub: "Long-term security" },
] as const;

type Situation = typeof SITUATIONS[number]["value"];
type Concern   = typeof CONCERNS[number]["value"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-2 mb-10">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
            n <= step ? "bg-[#C49A52]" : "bg-[#2C2417]"
          }`}
        />
      ))}
    </div>
  );
}

function OptionCard({
  emoji,
  label,
  sub,
  selected,
  onClick,
}: {
  emoji: string;
  label: string;
  sub: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg border text-left transition-all duration-150 ${
        selected
          ? "border-[#C49A52] bg-[#C49A52]/10"
          : "border-[#2C2417] bg-[#2C2417]/40 hover:border-[#4A3D2A]"
      }`}
    >
      <span className="text-2xl leading-none select-none">{emoji}</span>
      <div>
        <p className={`font-sans text-sm font-medium ${selected ? "text-[#C49A52]" : "text-[#C8B8A2]"}`}>
          {label}
        </p>
        <p className="font-sans text-xs text-[#7A6A52] mt-0.5">{sub}</p>
      </div>
      {selected && (
        <span className="ml-auto text-[#C49A52]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7.5" stroke="currentColor" />
            <path d="M4.5 8l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]           = useState(1);
  const [situation, setSituation] = useState<Situation | null>(null);
  const [concern, setConcern]     = useState<Concern | null>(null);
  const [city, setCity]           = useState("");
  const [saving, setSaving]       = useState(false);

  async function finish(finalCity: string) {
    setSaving(true);
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        situation,
        concern,
        city: finalCity.trim() || undefined,
        onboardingComplete: true,
      }),
    });
    router.push("/feed");
  }

  return (
    <div className="min-h-screen bg-[#1A1208] flex flex-col items-center justify-start px-6 pt-14 pb-12">
      <div className="w-full max-w-md">
        <ProgressBar step={step} />

        {/* ── Step 1: Situation ── */}
        {step === 1 && (
          <div>
            <p className="font-sans text-xs text-[#7A6A52] uppercase tracking-widest mb-3">
              Step 1 of 3
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#FAF9F6] leading-tight mb-8">
              What best describes your situation?
            </h1>
            <div className="flex flex-col gap-3">
              {SITUATIONS.map((s) => (
                <OptionCard
                  key={s.value}
                  {...s}
                  selected={situation === s.value}
                  onClick={() => setSituation(s.value)}
                />
              ))}
            </div>
            <button
              disabled={!situation}
              onClick={() => setStep(2)}
              className="mt-8 w-full bg-[#C49A52] hover:bg-[#E2C27A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[#1A1208] font-sans font-medium text-sm py-3.5 rounded-lg"
            >
              Continue
            </button>
          </div>
        )}

        {/* ── Step 2: Concern ── */}
        {step === 2 && (
          <div>
            <p className="font-sans text-xs text-[#7A6A52] uppercase tracking-widest mb-3">
              Step 2 of 3
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#FAF9F6] leading-tight mb-8">
              What&apos;s your biggest financial concern right now?
            </h1>
            <div className="flex flex-col gap-3">
              {CONCERNS.map((c) => (
                <OptionCard
                  key={c.value}
                  {...c}
                  selected={concern === c.value}
                  onClick={() => setConcern(c.value)}
                />
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-[#2C2417] hover:border-[#4A3D2A] text-[#7A6A52] hover:text-[#C8B8A2] font-sans text-sm py-3.5 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                disabled={!concern}
                onClick={() => setStep(3)}
                className="flex-[2] bg-[#C49A52] hover:bg-[#E2C27A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[#1A1208] font-sans font-medium text-sm py-3.5 rounded-lg"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: City ── */}
        {step === 3 && (
          <div>
            <p className="font-sans text-xs text-[#7A6A52] uppercase tracking-widest mb-3">
              Step 3 of 3
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#FAF9F6] leading-tight mb-3">
              Where are you based?
            </h1>
            <p className="font-sans text-sm text-[#7A6A52] mb-8">
              We&apos;ll highlight economic events relevant to your area.
            </p>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Boston, Chicago, Austin..."
              className="w-full bg-[#2C2417] border border-[#4A3D2A] focus:border-[#C49A52] text-[#C8B8A2] placeholder-[#4A3D2A] font-sans text-sm py-3.5 px-4 rounded-lg outline-none transition-colors"
              onKeyDown={(e) => e.key === "Enter" && finish(city)}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-[#2C2417] hover:border-[#4A3D2A] text-[#7A6A52] hover:text-[#C8B8A2] font-sans text-sm py-3.5 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                disabled={saving}
                onClick={() => finish(city)}
                className="flex-[2] bg-[#C49A52] hover:bg-[#E2C27A] disabled:opacity-50 transition-colors text-[#1A1208] font-sans font-medium text-sm py-3.5 rounded-lg"
              >
                {saving ? "Saving…" : "Finish"}
              </button>
            </div>
            <button
              onClick={() => finish("")}
              className="mt-4 w-full text-center font-sans text-xs text-[#4A3D2A] hover:text-[#7A6A52] transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
