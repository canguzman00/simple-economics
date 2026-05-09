"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useState, useEffect } from "react";
import { SITUATIONS, CONCERNS, situationLabel, type Situation, type Concern } from "@/components/onboarding/data";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { toast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const [situation, setSituation] = useState<Situation | null>(null);
  const [concern, setConcern]     = useState<Concern | null>(null);
  const [city, setCity]           = useState("");
  const [saving, setSaving]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.situation)  setSituation(data.situation);
        if (data.concern)    setConcern(data.concern);
        if (data.city)       setCity(data.city);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setConfirmation(null);

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ situation, concern, city: city.trim() || null }),
    });

    setSaving(false);

    if (!res.ok) {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
      return;
    }

    const sitLabel = situationLabel(situation);
    const msg = city.trim()
      ? `Your feed is personalized for ${sitLabel} in ${city.trim()}.`
      : `Your feed is personalized for ${sitLabel}.`;

    setConfirmation(msg);
    toast({ title: "Profile saved", description: msg, variant: "success" });
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-xl animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-[#2C2417]" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="font-serif text-3xl text-[#FAF9F6]">Your Profile</h1>
        <p className="mt-2 font-sans text-sm text-[#7A6A52]">
          Update your situation and preferences to keep your feed relevant.
        </p>
      </div>

      {/* Section: Situation */}
      <section className="mb-8">
        <h2 className="font-sans text-xs text-[#7A6A52] uppercase tracking-widest mb-4">
          Your Situation
        </h2>
        <div className="flex flex-col gap-2">
          {SITUATIONS.map((s) => (
            <OptionCard
              key={s.value}
              {...s}
              selected={situation === s.value}
              onClick={() => setSituation(s.value)}
            />
          ))}
        </div>
      </section>

      {/* Section: Concern */}
      <section className="mb-8">
        <h2 className="font-sans text-xs text-[#7A6A52] uppercase tracking-widest mb-4">
          Your Biggest Concern
        </h2>
        <div className="flex flex-col gap-2">
          {CONCERNS.map((c) => (
            <OptionCard
              key={c.value}
              {...c}
              selected={concern === c.value}
              onClick={() => setConcern(c.value)}
            />
          ))}
        </div>
      </section>

      {/* Section: City */}
      <section className="mb-10">
        <h2 className="font-sans text-xs text-[#7A6A52] uppercase tracking-widest mb-4">
          Your City
        </h2>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Boston, Chicago, Austin..."
          className="w-full bg-[#2C2417] border border-[#4A3D2A] focus:border-[#C49A52] text-[#C8B8A2] placeholder-[#4A3D2A] font-sans text-sm py-3.5 px-4 rounded-lg outline-none transition-colors"
        />
      </section>

      {/* Confirmation message */}
      {confirmation && (
        <p className="mb-5 font-sans text-sm text-[#C49A52] border border-[#C49A52]/30 bg-[#C49A52]/5 rounded-lg px-4 py-3">
          {confirmation}
        </p>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full sm:w-auto bg-[#C49A52] hover:bg-[#E2C27A] disabled:opacity-50 transition-colors text-[#1A1208] font-sans font-medium text-sm px-10 py-3.5 rounded-lg"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
