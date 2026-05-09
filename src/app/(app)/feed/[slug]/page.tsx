import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Pillar, Impact } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { YouTubeEmbed } from "@/components/feed/YouTubeEmbed";

export const revalidate = 3600;
export const runtime = "nodejs";

// ─── Config maps (duplicated from EconEventCard to keep this page self-contained) ──

const PILLAR_CONFIG: Record<Pillar, { label: string; badge: string }> = {
  GLOBAL_ECONOMICS:   { label: "Global Economics",     badge: "bg-gold-100/20 text-[#C49A52] border-[#C49A52]/30" },
  GEOPOLITICS_MONEY:  { label: "Geopolitics & Money",  badge: "bg-signal-700/10 text-[#D4613C] border-[#D4613C]/30" },
  DEVELOPMENT_POLICY: { label: "Development & Policy", badge: "bg-growth-700/10 text-[#3D8A55] border-[#3D8A55]/30" },
  PERSONAL_FINANCE:   { label: "Personal Finance",     badge: "bg-blue-900/20 text-blue-300 border-blue-400/30" },
};

const IMPACT_CONFIG: Record<Impact, { label: string; dot: string; text: string }> = {
  HIGH:   { label: "HIGH",   dot: "bg-[#B84A2A]", text: "text-[#D4613C]" },
  MEDIUM: { label: "MEDIUM", dot: "bg-[#C49A52]", text: "text-[#C49A52]" },
  LOW:    { label: "LOW",    dot: "bg-[#3D8A55]", text: "text-[#3D8A55]" },
};

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const events = await prisma.econEvent.findMany({ where: { published: true }, select: { slug: true } });
    return events.map((e) => ({ slug: e.slug }));
  } catch {
    return [];
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const event = await prisma.econEvent.findUnique({
    where: { slug: params.slug },
    select: { title: true, summary: true },
  });
  if (!event) return { title: "Event Not Found" };

  return {
    title: `${event.title} | Simple Economics`,
    description: event.summary,
    openGraph: {
      title: event.title,
      description: event.summary,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: event.title,
      description: event.summary,
    },
  };
}

// ─── Related event card ───────────────────────────────────────────────────────

function RelatedCard({
  slug,
  title,
  pillar,
  publishedAt,
}: {
  slug: string;
  title: string;
  pillar: Pillar;
  publishedAt: Date;
}) {
  const cfg = PILLAR_CONFIG[pillar];
  return (
    <Link
      href={`/feed/${slug}`}
      className="flex flex-col gap-2 bg-[#2C2417]/40 border border-[#2C2417] hover:border-[#4A3D2A] rounded-xl p-4 transition-colors"
    >
      <span className={`self-start inline-flex items-center font-sans text-[10px] font-medium px-2 py-0.5 rounded-full border ${cfg.badge}`}>
        {cfg.label}
      </span>
      <p className="font-serif text-base text-[#FAF9F6] leading-snug line-clamp-2">{title}</p>
      <p className="font-sans text-xs text-[#4A3D2A]">
        {new Date(publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [event, related] = await Promise.all([
    prisma.econEvent.findUnique({ where: { slug: params.slug, published: true } }),
    prisma.econEvent.findMany({
      where: { slug: { not: params.slug } },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, slug: true, title: true, pillar: true, publishedAt: true },
    }).then(async (candidates) => {
      // prefer same pillar; fall back to candidates already fetched
      const event = await prisma.econEvent.findUnique({
        where: { slug: params.slug },
        select: { pillar: true },
      });
      if (!event) return candidates;
      const samePillar = await prisma.econEvent.findMany({
        where: { pillar: event.pillar, slug: { not: params.slug } },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: { id: true, slug: true, title: true, pillar: true, publishedAt: true },
      });
      return samePillar.length >= 3 ? samePillar : [...samePillar, ...candidates].slice(0, 3);
    }),
  ]);

  if (!event) notFound();

  const pillarCfg = PILLAR_CONFIG[event.pillar];
  const impactCfg = IMPACT_CONFIG[event.impact];
  const formattedDate = new Date(event.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="max-w-2xl mx-auto">

      {/* ── Back link ── */}
      <Link
        href="/feed"
        className="inline-flex items-center gap-1.5 font-sans text-xs text-[#7A6A52] hover:text-[#C8B8A2] transition-colors mb-8"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M8.5 3L5 7l3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to feed
      </Link>

      {/* ── 1. Hero ── */}
      <header className="mb-10">
        <div className="flex items-center gap-2.5 flex-wrap mb-5">
          <span className={`inline-flex items-center font-sans text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${pillarCfg.badge}`}>
            {pillarCfg.label}
          </span>
          <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-medium ${impactCfg.text}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${impactCfg.dot}`} />
            {impactCfg.label} IMPACT
          </span>
          <span className="font-sans text-[11px] text-[#4A3D2A]">{formattedDate}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#FAF9F6] leading-tight">
          {event.title}
        </h1>
      </header>

      {/* ── 2. What happened ── */}
      <section className="mb-10">
        <h2 className="font-sans text-xs text-[#7A6A52] uppercase tracking-widest mb-4">
          What happened
        </h2>
        <p className="font-sans text-lg text-[#C8B8A2] leading-relaxed">
          {event.summary}
        </p>
      </section>

      {/* ── 3. Why it happened ── */}
      <section className="mb-10">
        <h2 className="font-sans text-xs text-[#7A6A52] uppercase tracking-widest mb-4">
          Why it happened
        </h2>
        <div className="font-sans text-base text-[#C8B8A2] leading-relaxed space-y-4">
          {event.fullExplanation.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        {event.sources.length > 0 && (
          <p className="mt-4 font-sans text-xs text-[#4A3D2A]">
            Sources: {event.sources.map((s, i) => (
              <span key={i}>
                {isUrl(s) ? (
                  <a href={s} target="_blank" rel="noopener noreferrer" className="text-[#7A6A52] hover:text-[#C49A52] underline underline-offset-2 transition-colors">
                    [{i + 1}]
                  </a>
                ) : (
                  <span className="text-[#7A6A52]">[{s}]</span>
                )}
                {i < event.sources.length - 1 && " "}
              </span>
            ))}
          </p>
        )}
      </section>

      {/* ── 4. Carlos's Take ── */}
      <section className="mb-10">
        <h2 className="font-sans text-xs text-[#7A6A52] uppercase tracking-widest mb-4">
          Carlos&apos;s Take
        </h2>
        <blockquote className="border-l-2 border-[#C49A52] bg-[#C49A52]/5 rounded-r-xl px-6 py-5">
          <p className="font-serif text-xl sm:text-2xl text-[#FAF9F6] leading-relaxed italic">
            &ldquo;{event.summary}&rdquo;
          </p>
          <footer className="mt-3 font-sans text-xs text-[#7A6A52]">— Carlos</footer>
        </blockquote>
      </section>

      {/* ── 5. Sources list ── */}
      {event.sources.length > 0 && (
        <section className="mb-10">
          <h2 className="font-sans text-xs text-[#7A6A52] uppercase tracking-widest mb-4">
            Sources
          </h2>
          <ol className="flex flex-col gap-2">
            {event.sources.map((source, i) => (
              <li key={i} className="flex gap-3 items-baseline">
                <span className="font-mono text-[11px] text-[#4A3D2A] shrink-0">{i + 1}.</span>
                {isUrl(source) ? (
                  <a
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-[#7A6A52] hover:text-[#C49A52] underline underline-offset-2 transition-colors break-all"
                  >
                    {source}
                  </a>
                ) : (
                  <span className="font-mono text-[11px] text-[#7A6A52]">{source}</span>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── 6. YouTube embed ── */}
      {event.youtubeUrl && (
        <section className="mb-12">
          <h2 className="font-sans text-xs text-[#7A6A52] uppercase tracking-widest mb-4">
            Watch
          </h2>
          <YouTubeEmbed url={event.youtubeUrl} title={event.title} />
        </section>
      )}

      {/* ── 7. Related events ── */}
      {related.length > 0 && (
        <section className="mt-12 pt-10 border-t border-[#2C2417]">
          <h2 className="font-sans text-xs text-[#7A6A52] uppercase tracking-widest mb-5">
            Related events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <RelatedCard key={r.id} {...r} />
            ))}
          </div>
        </section>
      )}

    </article>
  );
}

function isUrl(s: string): boolean {
  return s.startsWith("http://") || s.startsWith("https://");
}
