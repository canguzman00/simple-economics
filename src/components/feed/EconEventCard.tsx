import type { Pillar, Impact } from "@prisma/client";

export interface EconEventCardProps {
  title: string;
  summary: string;
  fullExplanation: string;
  pillar: Pillar;
  impact: Impact;
  publishedAt: Date | string;
  slug: string;
}

const PILLAR_CONFIG: Record<Pillar, { label: string; bg: string; text: string }> = {
  GLOBAL_ECONOMICS:   { label: "Global Economics",     bg: "bg-primary-red",    text: "text-primary-white" },
  GEOPOLITICS_MONEY:  { label: "Geopolitics & Money",  bg: "bg-primary-black",  text: "text-primary-white" },
  DEVELOPMENT_POLICY: { label: "Development & Policy", bg: "bg-primary-blue",   text: "text-primary-white" },
  PERSONAL_FINANCE:   { label: "Personal Finance",     bg: "bg-primary-yellow", text: "text-primary-black" },
};

const IMPACT_CONFIG: Record<Impact, { label: string; bg: string; text: string }> = {
  HIGH:   { label: "HIGH",   bg: "bg-primary-red",    text: "text-primary-white" },
  MEDIUM: { label: "MEDIUM", bg: "bg-primary-yellow", text: "text-primary-black" },
  LOW:    { label: "LOW",    bg: "bg-gray-200",        text: "text-primary-black" },
};

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
    <article className="flex flex-col gap-5 bg-primary-white border-2 border-primary-black px-6 py-6 transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0A0A0A]">
      {/* Badges row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center font-display text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${pillarCfg.bg} ${pillarCfg.text}`}>
          {pillarCfg.label}
        </span>
        <span className={`inline-flex items-center font-display text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${impactCfg.bg} ${impactCfg.text}`}>
          {impactCfg.label} IMPACT
        </span>
        <span className="ml-auto font-sans text-[11px] text-gray-500">{formattedDate}</span>
      </div>

      {/* Title */}
      <h2 className="font-display font-bold text-xl sm:text-2xl text-primary-black leading-tight uppercase">
        {title}
      </h2>

      {/* Summary */}
      <p className="font-sans text-sm text-gray-700 leading-relaxed">
        {summary}
      </p>

      {/* "What this means for you" callout */}
      <div className="border-l-4 border-primary-black bg-primary-yellow px-4 py-4">
        <p className="font-display text-[10px] font-bold uppercase tracking-widest text-primary-black mb-2">
          What this means for you
        </p>
        <p className="font-sans text-sm text-primary-black leading-relaxed">
          {fullExplanation}
        </p>
      </div>
    </article>
  );
}
