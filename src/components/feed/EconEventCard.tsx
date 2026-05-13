import Link from "next/link";
import type { Pillar, Impact } from "@prisma/client";

export interface EconEventCardProps {
  title: string;
  summary: string;
  fullExplanation: string;
  pillar: Pillar;
  impact: Impact;
  publishedAt: Date | string;
  slug?: string | null;
  sources?: string[];
  isNews?: boolean;
  newsUrl?: string | null;
}

const PILLAR_CONFIG: Record<Pillar, { label: string; bg: string; text: string }> = {
  GLOBAL_ECONOMICS:   { label: "Global Economics",     bg: "bg-primary-blue",   text: "text-primary-white" },
  GEOPOLITICS_MONEY:  { label: "Geopolitics & Money",  bg: "bg-primary-red",    text: "text-primary-white" },
  DEVELOPMENT_POLICY: { label: "Development & Policy", bg: "bg-primary-yellow", text: "text-primary-black" },
  PERSONAL_FINANCE:   { label: "Personal Finance",     bg: "bg-primary-black",  text: "text-primary-white" },
};

const IMPACT_CONFIG: Record<Impact, { label: string; bg: string; text: string }> = {
  HIGH:   { label: "HIGH",   bg: "bg-primary-red",    text: "text-primary-white" },
  MEDIUM: { label: "MEDIUM", bg: "bg-primary-yellow", text: "text-primary-black" },
  LOW:    { label: "LOW",    bg: "bg-primary-blue",   text: "text-primary-white" },
};

function sourceDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function isUrl(s: string): boolean {
  return s.startsWith("http://") || s.startsWith("https://");
}

export function EconEventCard({
  title,
  summary,
  fullExplanation,
  pillar,
  impact,
  publishedAt,
  slug,
  sources = [],
  isNews = false,
  newsUrl,
}: EconEventCardProps) {
  const pillarCfg = PILLAR_CONFIG[pillar];
  const impactCfg = IMPACT_CONFIG[impact];

  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const urlSources = sources.filter(isUrl);

  return (
    <article className="flex flex-col gap-5 bg-primary-white border-2 border-primary-black px-6 py-6 transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0A0A0A]">
      {/* Badges row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center font-sans text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${pillarCfg.bg} ${pillarCfg.text}`}>
          {pillarCfg.label}
        </span>
        <span className={`inline-flex items-center font-sans text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${impactCfg.bg} ${impactCfg.text}`}>
          {impactCfg.label} IMPACT
        </span>
        <span className="ml-auto font-sans text-[11px] text-primary-black">{formattedDate}</span>
      </div>

      {/* Title — Inter bold, newspaper style, mixed case */}
      <h2 className="font-sans font-bold text-2xl text-primary-black leading-snug">
        {title}
      </h2>

      {/* Summary */}
      <p className="font-sans text-sm text-primary-black leading-relaxed">
        {summary}
      </p>

      {/* "What this means for you" callout */}
      <div className="border-l-4 border-primary-black bg-primary-yellow px-4 py-4">
        <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-primary-black mb-2">
          What this means for you
        </p>
        <p className="font-sans text-sm text-primary-black leading-relaxed">
          {fullExplanation}
        </p>
      </div>

      {/* Footer links */}
      <div className="border-t-2 border-primary-black pt-4 flex flex-col gap-2.5">
        {/* Full breakdown link for admin events */}
        {!isNews && slug && (
          <Link
            href={`/feed/${slug}`}
            className="font-sans font-bold text-sm text-primary-black hover:text-primary-red transition-colors"
          >
            Read full breakdown →
          </Link>
        )}

        {/* Original story link for news items */}
        {isNews && newsUrl && (
          <a
            href={newsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans font-bold text-sm text-primary-black hover:text-primary-red transition-colors"
          >
            Read original story →
          </a>
        )}

        {/* Source URL links */}
        {urlSources.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-primary-black">
              Sources
            </p>
            {urlSources.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-xs text-primary-black hover:underline underline-offset-2 transition-colors"
              >
                ↗ {sourceDomain(url)}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
