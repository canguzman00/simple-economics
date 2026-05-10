"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SITUATIONS = [
  { value: "RENTER",        emoji: "🏠", label: "Renter",        sub: "I pay rent every month" },
  { value: "OWNER",         emoji: "🔑", label: "Homeowner",     sub: "I own or have a mortgage" },
  { value: "EMPLOYED",      emoji: "💼", label: "Employed",      sub: "I work for a company" },
  { value: "SELF_EMPLOYED", emoji: "⚡", label: "Self-Employed", sub: "I run my own thing" },
  { value: "STUDENT",       emoji: "📚", label: "Student",       sub: "I'm in school" },
] as const;

const CONCERNS = [
  { value: "HOUSING",      emoji: "📈", label: "Housing Costs",    sub: "Rent, mortgages, buying" },
  { value: "JOB_SECURITY", emoji: "🛡️", label: "Job Security",    sub: "Layoffs, hiring, my industry" },
  { value: "SAVINGS",      emoji: "💰", label: "Building Savings", sub: "Growing what I have" },
  { value: "DEBT",         emoji: "🔗", label: "Debt Burden",      sub: "Loans, credit, interest" },
  { value: "RETIREMENT",   emoji: "🌅", label: "Retirement",       sub: "Long-term security" },
] as const;

type Situation = typeof SITUATIONS[number]["value"];
type Concern   = typeof CONCERNS[number]["value"];

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 mb-10">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`h-1 flex-1 transition-colors duration-300 ${
            n <= step ? "bg-primary-black" : "bg-gray-200"
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
      className={`w-full flex items-center gap-4 px-5 py-4 border-2 text-left transition-all duration-150 ${
        selected
          ? "border-primary-black bg-primary-black text-primary-white"
          : "border-primary-black bg-primary-white text-primary-black hover:bg-gray-100"
      }`}
    >
      <span className="text-2xl leading-none select-none">{emoji}</span>
      <div>
        <p className={`font-display text-sm font-bold uppercase tracking-wide ${selected ? "text-primary-white" : "text-primary-black"}`}>
          {label}
        </p>
        <p className={`font-sans text-xs mt-0.5 ${selected ? "text-gray-300" : "text-gray-500"}`}>
          {sub}
        </p>
      </div>
      {selected && (
        <span className="ml-auto shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="0.5" y="0.5" width="15" height="15" stroke="white" />
            <path d="M4 8l3 3 5-5.5" stroke="white" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </span>
      )}
    </button>
  );
}

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
    <div className="min-h-screen bg-primary-white flex flex-col items-center justify-start px-6 pt-14 pb-12">
      <div className="w-full max-w-md">
        <ProgressBar step={step} />

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div>
            <p className="font-display text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
              Step 1 of 3
            </p>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-primary-black uppercase leading-tight mb-8">
              What best describes your situation?
            </h1>
            <div className="flex flex-col gap-2">
              {SITUATIONS.map((s) => (
                <OptionCard key={s.value} {...s} selected={situation === s.value} onClick={() => setSituation(s.value)} />
              ))}
            </div>
            <button
              disabled={!situation}
              onClick={() => setStep(2)}
              className="mt-8 w-full font-display text-xs font-black uppercase tracking-widest bg-primary-black text-primary-white hover:bg-primary-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors py-4"
            >
              Continue
            </button>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div>
            <p className="font-display text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
              Step 2 of 3
            </p>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-primary-black uppercase leading-tight mb-8">
              What&apos;s your biggest financial concern?
            </h1>
            <div className="flex flex-col gap-2">
              {CONCERNS.map((c) => (
                <OptionCard key={c.value} {...c} selected={concern === c.value} onClick={() => setConcern(c.value)} />
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 font-display text-xs font-bold uppercase tracking-widest border-2 border-primary-black text-primary-black hover:bg-gray-100 transition-colors py-4"
              >
                Back
              </button>
              <button
                disabled={!concern}
                onClick={() => setStep(3)}
                className="flex-[2] font-display text-xs font-black uppercase tracking-widest bg-primary-black text-primary-white hover:bg-primary-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors py-4"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div>
            <p className="font-display text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
              Step 3 of 3
            </p>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-primary-black uppercase leading-tight mb-3">
              Where are you based?
            </h1>
            <p className="font-sans text-sm text-gray-500 mb-8">
              We&apos;ll highlight economic events relevant to your area.
            </p>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Boston, Chicago, Austin..."
              className="w-full bg-primary-white border-2 border-primary-black focus:border-primary-blue text-primary-black placeholder-gray-300 font-sans text-sm py-3.5 px-4 outline-none transition-colors"
              onKeyDown={(e) => e.key === "Enter" && finish(city)}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 font-display text-xs font-bold uppercase tracking-widest border-2 border-primary-black text-primary-black hover:bg-gray-100 transition-colors py-4"
              >
                Back
              </button>
              <button
                disabled={saving}
                onClick={() => finish(city)}
                className="flex-[2] font-display text-xs font-black uppercase tracking-widest bg-primary-black text-primary-white hover:bg-primary-red disabled:opacity-50 transition-colors py-4"
              >
                {saving ? "Saving…" : "Finish"}
              </button>
            </div>
            <button
              onClick={() => finish("")}
              className="mt-5 w-full text-center font-sans text-xs text-gray-500 hover:text-primary-black transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
