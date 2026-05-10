"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HOUSING_OPTIONS, EMPLOYMENT_OPTIONS, CONCERNS } from "@/components/onboarding/data";
import type { HousingStatus, EmploymentStatus, Concern } from "@/components/onboarding/data";

const TOTAL_STEPS = 4;

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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]                   = useState(1);
  const [housingStatus, setHousing]       = useState<HousingStatus | null>(null);
  const [employmentStatus, setEmployment] = useState<EmploymentStatus | null>(null);
  const [concern, setConcern]             = useState<Concern | null>(null);
  const [city, setCity]                   = useState("");
  const [saving, setSaving]               = useState(false);

  async function finish(finalCity: string) {
    setSaving(true);
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        housingStatus,
        employmentStatus,
        concern,
        city: finalCity.trim() || undefined,
        onboardingComplete: true,
      }),
    });
    router.push("/feed");
  }

  const btnCls = (enabled: boolean) =>
    `font-display text-xs font-black uppercase tracking-widest transition-colors py-4 ${
      enabled
        ? "bg-primary-red text-primary-white hover:bg-primary-black cursor-pointer"
        : "bg-gray-200 text-gray-300 cursor-not-allowed"
    }`;

  const backCls = "flex-1 font-display text-xs font-bold uppercase tracking-widest border-2 border-primary-black text-primary-black hover:bg-gray-100 transition-colors py-4";

  return (
    <div className="min-h-screen bg-primary-white flex flex-col items-center justify-start px-6 pt-14 pb-12">
      <div className="w-full max-w-md">
        <ProgressBar step={step} />

        {/* ── Step 1: Housing ── */}
        {step === 1 && (
          <div>
            <p className="font-display text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
              Step 1 of {TOTAL_STEPS}
            </p>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-primary-black uppercase leading-tight mb-8">
              Do you rent or own your home?
            </h1>
            <div className="flex flex-col gap-2">
              {HOUSING_OPTIONS.map((o) => (
                <OptionCard
                  key={o.value}
                  {...o}
                  selected={housingStatus === o.value}
                  onClick={() => setHousing(o.value)}
                />
              ))}
            </div>
            <button
              disabled={!housingStatus}
              onClick={() => setStep(2)}
              className={`mt-8 w-full ${btnCls(!!housingStatus)}`}
            >
              Continue
            </button>
          </div>
        )}

        {/* ── Step 2: Employment ── */}
        {step === 2 && (
          <div>
            <p className="font-display text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
              Step 2 of {TOTAL_STEPS}
            </p>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-primary-black uppercase leading-tight mb-8">
              What&apos;s your employment situation?
            </h1>
            <div className="flex flex-col gap-2">
              {EMPLOYMENT_OPTIONS.map((o) => (
                <OptionCard
                  key={o.value}
                  {...o}
                  selected={employmentStatus === o.value}
                  onClick={() => setEmployment(o.value)}
                />
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className={backCls}>Back</button>
              <button
                disabled={!employmentStatus}
                onClick={() => setStep(3)}
                className={`flex-[2] ${btnCls(!!employmentStatus)}`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Concern ── */}
        {step === 3 && (
          <div>
            <p className="font-display text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
              Step 3 of {TOTAL_STEPS}
            </p>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-primary-black uppercase leading-tight mb-8">
              What&apos;s your biggest financial concern?
            </h1>
            <div className="flex flex-col gap-2">
              {CONCERNS.map((o) => (
                <OptionCard
                  key={o.value}
                  {...o}
                  selected={concern === o.value}
                  onClick={() => setConcern(o.value)}
                />
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(2)} className={backCls}>Back</button>
              <button
                disabled={!concern}
                onClick={() => setStep(4)}
                className={`flex-[2] ${btnCls(!!concern)}`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: City ── */}
        {step === 4 && (
          <div>
            <p className="font-display text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
              Step 4 of {TOTAL_STEPS}
            </p>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-primary-black uppercase leading-tight mb-3">
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
              onKeyDown={(e) => e.key === "Enter" && finish(city)}
            />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(3)} className={backCls}>Back</button>
              <button
                disabled={saving}
                onClick={() => finish(city)}
                className={`flex-[2] ${btnCls(!saving)}`}
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
