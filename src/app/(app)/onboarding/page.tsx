"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HOUSING_OPTIONS, EMPLOYMENT_OPTIONS, CONCERNS,
  LIFE_STAGE_OPTIONS, DEBT_OPTIONS, INDUSTRY_OPTIONS,
} from "@/components/onboarding/data";
import type {
  HousingStatus, EmploymentStatus, Concern,
  LifeStage, DebtType, Industry,
} from "@/components/onboarding/data";

const TOTAL_STEPS = 7;

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 mb-10">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
        <div
          key={n}
          className={`h-1 flex-1 transition-colors duration-300 ${
            n <= step ? "bg-primary-red" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Single-select card ───────────────────────────────────────────────────────

function OptionCard({
  emoji, label, sub, selected, onClick,
}: {
  emoji: string; label: string; sub: string;
  selected: boolean; onClick: () => void;
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
      <div className="min-w-0">
        <p className={`font-sans text-sm font-bold uppercase tracking-wide ${selected ? "text-primary-white" : "text-primary-black"}`}>
          {label}
        </p>
        <p className={`font-sans text-xs mt-0.5 ${selected ? "text-gray-300" : "text-gray-700"}`}>
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

// ─── Multi-select checkbox card ───────────────────────────────────────────────

function CheckboxCard({
  emoji, label, sub, checked, onChange,
}: {
  emoji: string; label: string; sub: string;
  checked: boolean; onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-full flex items-start gap-4 px-5 py-4 border-2 text-left transition-all duration-150 ${
        checked
          ? "border-primary-black bg-primary-black text-primary-white"
          : "border-primary-black bg-primary-white text-primary-black hover:bg-gray-100"
      }`}
    >
      <span className="text-2xl leading-none select-none shrink-0 mt-0.5">{emoji}</span>
      <div className="min-w-0 flex-1">
        <p className={`font-sans text-sm font-bold uppercase tracking-wide ${checked ? "text-primary-white" : "text-primary-black"}`}>
          {label}
        </p>
        <p className={`font-sans text-xs mt-0.5 ${checked ? "text-gray-300" : "text-gray-700"}`}>
          {sub}
        </p>
      </div>
      <span className={`shrink-0 mt-0.5 w-5 h-5 border-2 flex items-center justify-center transition-colors ${
        checked ? "border-primary-white bg-primary-white" : "border-primary-black"
      }`}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1.5 5l2.5 2.5 4.5-5" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        )}
      </span>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]                   = useState(1);
  const [housingStatus, setHousing]       = useState<HousingStatus | null>(null);
  const [employmentStatus, setEmployment] = useState<EmploymentStatus | null>(null);
  const [concerns, setConcerns]           = useState<Concern[]>([]);
  const [city, setCity]                   = useState("");
  const [lifeStage, setLifeStage]         = useState<LifeStage | null>(null);
  const [debtTypes, setDebtTypes]         = useState<DebtType[]>([]);
  const [industry, setIndustry]           = useState<Industry | null>(null);
  const [saving, setSaving]               = useState(false);

  function toggleDebt(value: DebtType) {
    if (value === "NO_SIGNIFICANT_DEBT") {
      setDebtTypes(["NO_SIGNIFICANT_DEBT"]);
    } else {
      setDebtTypes((prev) => {
        const without = prev.filter((d) => d !== "NO_SIGNIFICANT_DEBT");
        return without.includes(value)
          ? without.filter((d) => d !== value)
          : [...without, value];
      });
    }
  }

  function toggleConcern(value: Concern) {
    setConcerns((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  }

  async function finish() {
    setSaving(true);
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        housingStatus,
        employmentStatus,
        concerns,
        city: city.trim() || undefined,
        lifeStage,
        debtTypes,
        industry,
        onboardingComplete: true,
      }),
    });
    router.push("/feed");
  }

  const btnCls = (enabled: boolean) =>
    `font-sans text-xs font-black uppercase tracking-widest transition-colors py-4 ${
      enabled
        ? "bg-primary-red text-primary-white hover:bg-primary-black cursor-pointer"
        : "bg-gray-200 text-gray-300 cursor-not-allowed"
    }`;
  const backCls = "flex-1 font-sans text-xs font-bold uppercase tracking-widest border-2 border-primary-black text-primary-black hover:bg-gray-100 transition-colors py-4";
  const stepLabel = (n: number) => (
    <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
      Step {n} of {TOTAL_STEPS}
    </p>
  );

  return (
    <div className="min-h-screen bg-primary-white flex flex-col items-center justify-start px-6 pt-14 pb-12">
      <div className="w-full max-w-md">
        <ProgressBar step={step} />

        {/* ── Step 1: Housing ── */}
        {step === 1 && (
          <div>
            {stepLabel(1)}
            <h1 className="font-sans font-black text-3xl sm:text-4xl text-primary-black uppercase leading-tight mb-8">
              Do you rent or own your home?
            </h1>
            <div className="flex flex-col gap-2">
              {HOUSING_OPTIONS.map((o) => (
                <OptionCard key={o.value} {...o} selected={housingStatus === o.value} onClick={() => setHousing(o.value)} />
              ))}
            </div>
            <button disabled={!housingStatus} onClick={() => setStep(2)} className={`mt-8 w-full ${btnCls(!!housingStatus)}`}>
              Continue
            </button>
          </div>
        )}

        {/* ── Step 2: Employment ── */}
        {step === 2 && (
          <div>
            {stepLabel(2)}
            <h1 className="font-sans font-black text-3xl sm:text-4xl text-primary-black uppercase leading-tight mb-8">
              What&apos;s your employment situation?
            </h1>
            <div className="flex flex-col gap-2">
              {EMPLOYMENT_OPTIONS.map((o) => (
                <OptionCard key={o.value} {...o} selected={employmentStatus === o.value} onClick={() => setEmployment(o.value)} />
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className={backCls}>Back</button>
              <button disabled={!employmentStatus} onClick={() => setStep(3)} className={`flex-[2] ${btnCls(!!employmentStatus)}`}>Continue</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Concern ── */}
        {step === 3 && (
          <div>
            {stepLabel(3)}
            <h1 className="font-sans font-black text-3xl sm:text-4xl text-primary-black uppercase leading-tight mb-8">
              What are your biggest financial concerns?
            </h1>
            <p className="font-sans text-sm text-gray-700 mb-8">Select all that apply — you can have more than one.</p>
            <div className="flex flex-col gap-2">
              {CONCERNS.map((o) => (
                <CheckboxCard key={o.value} {...o} checked={concerns.includes(o.value)} onChange={() => toggleConcern(o.value)} />
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(2)} className={backCls}>Back</button>
              <button disabled={concerns.length === 0} onClick={() => setStep(4)} className={`flex-[2] ${btnCls(concerns.length > 0)}`}>Continue</button>
            </div>
          </div>
        )}

        {/* ── Step 4: City ── */}
        {step === 4 && (
          <div>
            {stepLabel(4)}
            <h1 className="font-sans font-black text-3xl sm:text-4xl text-primary-black uppercase leading-tight mb-3">
              Where are you based?
            </h1>
            <p className="font-sans text-sm text-gray-700 mb-8">
              We&apos;ll highlight economic events relevant to your area.
            </p>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Boston, Chicago, Austin..."
              className="w-full bg-primary-white border-2 border-primary-black focus:border-primary-red text-primary-black placeholder-gray-300 font-sans text-sm py-3.5 px-4 outline-none transition-colors"
              onKeyDown={(e) => e.key === "Enter" && setStep(5)}
            />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(3)} className={backCls}>Back</button>
              <button onClick={() => setStep(5)} className={`flex-[2] ${btnCls(true)}`}>Continue</button>
            </div>
            <button onClick={() => setStep(5)} className="mt-5 w-full text-center font-sans text-xs text-gray-500 hover:text-primary-black transition-colors">
              Skip for now
            </button>
          </div>
        )}

        {/* ── Step 5: Life Stage ── */}
        {step === 5 && (
          <div>
            {stepLabel(5)}
            <h1 className="font-sans font-black text-3xl sm:text-4xl text-primary-black uppercase leading-tight mb-3">
              Which best describes where you are in life?
            </h1>
            <p className="font-sans text-sm text-gray-700 mb-8">
              This helps us focus on what matters most at your stage.
            </p>
            <div className="flex flex-col gap-2">
              {LIFE_STAGE_OPTIONS.map((o) => (
                <OptionCard key={o.value} {...o} selected={lifeStage === o.value} onClick={() => setLifeStage(o.value)} />
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(4)} className={backCls}>Back</button>
              <button disabled={!lifeStage} onClick={() => setStep(6)} className={`flex-[2] ${btnCls(!!lifeStage)}`}>Continue</button>
            </div>
          </div>
        )}

        {/* ── Step 6: Debt Types (multi-select) ── */}
        {step === 6 && (
          <div>
            {stepLabel(6)}
            <h1 className="font-sans font-black text-3xl sm:text-4xl text-primary-black uppercase leading-tight mb-3">
              Do you carry any of these types of debt?
            </h1>
            <p className="font-sans text-sm text-gray-700 mb-8">
              Select all that apply — this shapes how interest rate changes affect you personally.
            </p>
            <div className="flex flex-col gap-2">
              {DEBT_OPTIONS.map((o) => (
                <CheckboxCard
                  key={o.value}
                  {...o}
                  checked={debtTypes.includes(o.value)}
                  onChange={() => toggleDebt(o.value)}
                />
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(5)} className={backCls}>Back</button>
              <button disabled={debtTypes.length === 0} onClick={() => setStep(7)} className={`flex-[2] ${btnCls(debtTypes.length > 0)}`}>Continue</button>
            </div>
          </div>
        )}

        {/* ── Step 7: Industry ── */}
        {step === 7 && (
          <div>
            {stepLabel(7)}
            <h1 className="font-sans font-black text-3xl sm:text-4xl text-primary-black uppercase leading-tight mb-3">
              What industry do you work in?
            </h1>
            <p className="font-sans text-sm text-gray-700 mb-8">
              Different sectors are hit differently by economic shifts — layoffs, AI, tariffs, and policy don&apos;t affect everyone equally.
            </p>
            <div className="flex flex-col gap-2">
              {INDUSTRY_OPTIONS.map((o) => (
                <OptionCard key={o.value} {...o} selected={industry === o.value} onClick={() => setIndustry(o.value)} />
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(6)} className={backCls}>Back</button>
              <button disabled={!industry || saving} onClick={finish} className={`flex-[2] ${btnCls(!!industry && !saving)}`}>
                {saving ? "Saving…" : "Finish"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
