"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

const PILLARS = [
  { value: "GLOBAL_ECONOMICS",   label: "Global Economics" },
  { value: "GEOPOLITICS_MONEY",  label: "Geopolitics & Money" },
  { value: "DEVELOPMENT_POLICY", label: "Development & Policy" },
  { value: "PERSONAL_FINANCE",   label: "Personal Finance" },
];

const IMPACTS = [
  { value: "HIGH",   label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW",    label: "Low" },
];

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputCls =
  "w-full bg-[#2C2417] border border-[#4A3D2A] focus:border-[#C49A52] text-[#C8B8A2] placeholder-[#4A3D2A] font-sans text-sm py-2.5 px-3.5 rounded-lg outline-none transition-colors";

const textareaCls =
  "w-full bg-[#2C2417] border border-[#4A3D2A] focus:border-[#C49A52] text-[#C8B8A2] placeholder-[#4A3D2A] font-sans text-sm py-2.5 px-3.5 rounded-lg outline-none transition-colors resize-y";

const labelCls = "block font-sans text-xs text-[#7A6A52] uppercase tracking-widest mb-2";

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {hint && <p className="mt-1.5 font-sans text-xs text-[#4A3D2A]">{hint}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewEventPage() {
  const router = useRouter();

  const [title, setTitle]               = useState("");
  const [slug, setSlug]                 = useState("");
  const [slugManual, setSlugManual]     = useState(false);
  const [summary, setSummary]           = useState("");
  const [fullExplanation, setFullExp]   = useState("");
  const [pillar, setPillar]             = useState("GLOBAL_ECONOMICS");
  const [impact, setImpact]             = useState("HIGH");
  const [youtubeUrl, setYoutubeUrl]     = useState("");
  const [sources, setSources]           = useState<string[]>([""]);
  const [published, setPublished]       = useState(false);
  const [publishedAt, setPublishedAt]   = useState(() => toDatetimeLocal(new Date()));
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const slugRef = useRef(false);

  // Auto-generate slug from title unless manually edited
  useEffect(() => {
    if (!slugRef.current) {
      setSlug(slugify(title));
    }
  }, [title]);

  function handleSlugChange(v: string) {
    slugRef.current = true;
    setSlugManual(true);
    setSlug(v);
  }

  // ── Sources helpers ──────────────────────────────────────────────────────
  function addSource() {
    if (sources.length < 10) setSources((s) => [...s, ""]);
  }
  function removeSource(i: number) {
    setSources((s) => s.filter((_, idx) => idx !== i));
  }
  function updateSource(i: number, v: string) {
    setSources((s) => s.map((x, idx) => (idx === i ? v : x)));
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        summary,
        fullExplanation,
        pillar,
        impact,
        youtubeUrl: youtubeUrl.trim() || null,
        sources: sources.filter(Boolean),
        published,
        publishedAt,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    router.push("/admin/events");
  }

  const isDirty = !slugManual;

  return (
    <div className="max-w-2xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#FAF9F6]">New Event</h1>
        <p className="mt-1 font-sans text-sm text-[#7A6A52]">
          Create a new economic event for the feed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* ── Title ── */}
        <Field label="Title" hint="Keep it under 80 characters — readers scan headlines.">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The Fed Raises Rates by 0.25%"
            className={inputCls}
          />
        </Field>

        {/* ── Slug ── */}
        <Field
          label="Slug"
          hint={isDirty ? "Auto-generated from title. Edit to override." : "Manually set."}
        >
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="fed-raises-rates-0-25"
            className={inputCls}
          />
        </Field>

        {/* ── Summary ── */}
        <Field label="Summary" hint="2–3 plain sentences. Written for the reader, not the market.">
          <textarea
            required
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="The Federal Reserve raised interest rates by 0.25%..."
            className={textareaCls}
          />
        </Field>

        {/* ── Full Explanation ── */}
        <Field label="Full Explanation" hint="Detailed breakdown. Cite sources inline as [1], [2], etc.">
          <textarea
            required
            rows={8}
            value={fullExplanation}
            onChange={(e) => setFullExp(e.target.value)}
            placeholder="The rate increase was driven by persistent inflation data from the Bureau of Labor Statistics [1]..."
            className={textareaCls}
          />
        </Field>

        {/* ── Pillar + Impact ── */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Pillar">
            <select
              required
              value={pillar}
              onChange={(e) => setPillar(e.target.value)}
              className={inputCls}
            >
              {PILLARS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Impact">
            <select
              required
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              className={inputCls}
            >
              {IMPACTS.map((i) => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* ── YouTube URL ── */}
        <Field label="YouTube URL (optional)">
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className={inputCls}
          />
        </Field>

        {/* ── Sources ── */}
        <div>
          <label className={labelCls}>Sources</label>
          <div className="flex flex-col gap-2">
            {sources.map((src, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="font-mono text-xs text-[#4A3D2A] w-5 shrink-0 text-right">{i + 1}.</span>
                <input
                  type="text"
                  value={src}
                  onChange={(e) => updateSource(i, e.target.value)}
                  placeholder="https://... or publication name"
                  className={`${inputCls} flex-1`}
                />
                {sources.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSource(i)}
                    className="shrink-0 font-sans text-xs text-[#4A3D2A] hover:text-[#D4613C] transition-colors px-2 py-1"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          {sources.length < 10 && (
            <button
              type="button"
              onClick={addSource}
              className="mt-3 font-sans text-xs text-[#7A6A52] hover:text-[#C49A52] transition-colors border border-[#2C2417] hover:border-[#4A3D2A] px-3 py-1.5 rounded-lg"
            >
              + Add source
            </button>
          )}
        </div>

        {/* ── Published + Published At ── */}
        <div className="flex flex-col gap-4 border border-[#2C2417] rounded-xl p-5 bg-[#2C2417]/20">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 rounded-full bg-[#2C2417] border border-[#4A3D2A] peer-checked:bg-[#C49A52]/30 peer-checked:border-[#C49A52] transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#4A3D2A] peer-checked:bg-[#C49A52] peer-checked:translate-x-4 transition-all" />
            </div>
            <span className="font-sans text-sm text-[#C8B8A2]">
              {published ? "Published — visible on the feed" : "Draft — hidden from the feed"}
            </span>
          </label>

          <Field label="Published At">
            <input
              type="datetime-local"
              required
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className={`${inputCls} [color-scheme:dark]`}
            />
          </Field>
        </div>

        {/* ── Error ── */}
        {error && (
          <p className="font-sans text-sm text-[#D4613C] border border-[#D4613C]/30 bg-[#D4613C]/5 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-none bg-[#C49A52] hover:bg-[#E2C27A] disabled:opacity-50 transition-colors text-[#1A1208] font-sans font-medium text-sm px-8 py-3 rounded-lg"
          >
            {saving ? "Creating…" : published ? "Publish event" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/events")}
            className="font-sans text-sm text-[#7A6A52] hover:text-[#C8B8A2] transition-colors border border-[#2C2417] hover:border-[#4A3D2A] px-5 py-3 rounded-lg"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}

// ── Helper ───────────────────────────────────────────────────────────────────

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
