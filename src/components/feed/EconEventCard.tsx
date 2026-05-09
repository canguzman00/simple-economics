import type { Pillar, Impact } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EconEventCardProps {
  title: string;
  summary: string;
  fullExplanation: string;
  pillar: Pillar;
  impact: Impact;
  publishedAt: Date | string;
  slug: string;
}

// ─── Pillar config ────────────────────────────────────────────────────────────

const PILLAR_CONFIG: Record<Pillar, { label: string; badge: string }> = {
  GLOBAL_ECONOMICS: {
    label: "Global Economics",
    badge: "bg-gold-100/20 text-[#C49A52] border-[#C49A52]/30",
  },
  GEOPOLITICS_MONEY: {
    label: "Geopolitics & Money",
    badge: "bg-signal-700/10 text-[#D4613C] border-[#D4613C]/30",
  },
  DEVELOPMENT_POLICY: {
    label: "Development & Policy",
    badge: "bg-growth-700/10 text-[#3D8A55] border-[#3D8A55]/30",
  },
  PERSONAL_FINANCE: {
    label: "Personal Finance",
    badge: "bg-blue-900/20 text-blue-300 border-blue-400/30",
  },
};

// ─── Impact config ────────────────────────────────────────────────────────────

const IMPACT_CONFIG: Record<Impact, { label: string; dot: string; text: string }> = {
  HIGH:   { label: "HIGH",   dot: "bg-[#B84A2A]", text: "text-[#D4613C]" },
  MEDIUM: { label: "MEDIUM", dot: "bg-[#C49A52]", text: "text-[#C49A52]" },
  LOW:    { label: "LOW",    dot: "bg-[#3D8A55]", text: "text-[#3D8A55]" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function EconEventCard({
  title,
  summary,
  fullExplanation,
  pillar,
  impact,
  publishedAt,
}: EconEventCardProps) {
  const pillarCfg = PILLAR_CONFIG[pillar];
  const impactCfg = IMPACT_CONFIG[impact];

  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="flex flex-col gap-5 bg-[#2C2417]/40 border border-[#2C2417] rounded-xl px-6 py-6 hover:border-[#4A3D2A] transition-colors">
      {/* Badges row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center font-sans text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${pillarCfg.badge}`}>
          {pillarCfg.label}
        </span>

        <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-medium ${impactCfg.text}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${impactCfg.dot}`} />
          {impactCfg.label} IMPACT
        </span>

        <span className="ml-auto font-sans text-[11px] text-[#4A3D2A]">{formattedDate}</span>
      </div>

      {/* Title */}
      <h2 className="font-serif text-2xl sm:text-3xl text-[#FAF9F6] leading-snug">
        {title}
      </h2>

      {/* Summary */}
      <p className="font-sans text-sm text-[#C8B8A2] leading-relaxed">
        {summary}
      </p>

      {/* "What this means for you" callout */}
      <div className="border-l-2 border-[#C49A52] bg-[#C49A52]/5 rounded-r-lg px-4 py-4">
        <p className="font-sans text-xs text-[#C49A52] uppercase tracking-widest mb-2">
          What this means for you
        </p>
        <p className="font-sans text-sm text-[#C8B8A2] leading-relaxed">
          {fullExplanation}
        </p>
      </div>
    </article>
  );
}
