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

const PILLAR_CONFIG: Record<Pillar, { label: string; color: string }> = {
  GLOBAL_ECONOMICS:   { label: "Global Economics",     color: "#3B82F6" },
  GEOPOLITICS_MONEY:  { label: "Geopolitics & Money",  color: "#F43F5E" },
  DEVELOPMENT_POLICY: { label: "Development & Policy", color: "#8B5CF6" },
  PERSONAL_FINANCE:   { label: "Personal Finance",     color: "#0F172A" },
};

const IMPACT_CONFIG: Record<Impact, { label: string; bg: string; text: string }> = {
  HIGH:   { label: "High Impact",   bg: "#FEE2E2", text: "#DC2626" },
  MEDIUM: { label: "Medium Impact", bg: "#FFF7ED", text: "#EA580C" },
  LOW:    { label: "Low Impact",    bg: "#F0FDF4", text: "#16A34A" },
};

function sourceDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

function isUrl(s: string): boolean {
  return s.startsWith("http://") || s.startsWith("https://");
}

export function EconEventCard({
  title, summary, fullExplanation, pillar, impact,
  publishedAt, slug, sources = [], isNews = false, newsUrl,
}: EconEventCardProps) {
  const pillarCfg = PILLAR_CONFIG[pillar];
  const impactCfg = IMPACT_CONFIG[impact];
  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  const urlSources = sources.filter(isUrl);

  return (
    <article
      className="flex flex-col gap-4 bg-white rounded-xl transition-shadow hover:shadow-md"
      style={{ border: "1px solid #E2E8F0", borderTop: "3px solid " + pillarCfg.color }}
    >
      <div className="px-6 pt-5 flex items-center gap-2 flex-wrap">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded"
          style={{ background: "#F1F5F9", color: "#475569", fontFamily: "Inter, sans-serif" }}
        >
          {pillarCfg.label}
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded"
          style={{ background: impactCfg.bg, color: impactCfg.text, fontFamily: "Inter, sans-serif" }}
        >
          {impactCfg.label}
        </span>
        <span className="ml-auto text-[11px]" style={{ color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
          {formattedDate}
        </span>
      </div>

      <div className="px-6">
        <h2 className="font-bold text-xl leading-snug" style={{ color: "#0F172A", fontFamily: "Inter, sans-serif" }}>
          {title}
        </h2>
      </div>

      <div className="px-6">
        <p className="text-sm leading-relaxed" style={{ color: "#64748B", fontFamily: "Inter, sans-serif" }}>
          {summary}
        </p>
      </div>

      <div className="mx-6 rounded-lg px-4 py-3" style={{ background: "#FFF1F2", border: "1px solid #FECDD3" }}>
        <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#F43F5E", fontFamily: "Inter, sans-serif" }}>
          What this means for you
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "#0F172A", fontFamily: "Inter, sans-serif" }}>
          {fullExplanation}
        </p>
      </div>

      <div className="px-6 pb-5 flex flex-col gap-2" style={{ borderTop: "1px solid #F1F5F9", paddingTop: "14px" }}>
        {!isNews && slug && (
          <Link href={"/feed/" + slug}
            className="text-sm font-semibold transition-colors"
            style={{ color: "#F43F5E", fontFamily: "Inter, sans-serif" }}>
            Read full breakdown →
          </Link>
        )}
        {isNews && newsUrl && (
          <a href={newsUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm font-semibold transition-colors"
            style={{ color: "#F43F5E", fontFamily: "Inter, sans-serif" }}>
            Read original story →
          </a>
        )}
        {urlSources.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
              Sources
            </p>
            {urlSources.map((url) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                className="text-xs hover:underline"
                style={{ color: "#64748B", fontFamily: "Inter, sans-serif" }}>
                ↗ {sourceDomain(url)}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
