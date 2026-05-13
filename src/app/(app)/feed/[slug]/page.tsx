import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Pillar, Impact } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { YouTubeEmbed } from "@/components/feed/YouTubeEmbed";

type RelatedEvent = {
  id: string;
  slug: string;
  title: string;
  pillar: Pillar;
  publishedAt: Date;
};

export const revalidate = 3600;
export const runtime = "nodejs";

const PILLAR_CONFIG: Record<Pillar, { label: string; badge: string }> = {
  GLOBAL_ECONOMICS:   { label: "Global Economics",     badge: "bg-blue-50 text-blue-700 border-blue-200" },
  GEOPOLITICS_MONEY:  { label: "Geopolitics & Money",  badge: "bg-red-50 text-primary-red border-red-200" },
  DEVELOPMENT_POLICY: { label: "Development & Policy", badge: "bg-green-50 text-green-700 border-green-200" },
  PERSONAL_FINANCE:   { label: "Personal Finance",     badge: "bg-yellow-50 text-primary-black border-yellow-300" },
};

const IMPACT_CONFIG: Record<Impact, { label: string; dot: string; text: string }> = {
  HIGH:   { label: "HIGH",   dot: "bg-primary-red",    text: "text-primary-red" },
  MEDIUM: { label: "MEDIUM", dot: "bg-yellow-400",     text: "text-yellow-700" },
  LOW:    { label: "LOW",    dot: "bg-green-500",       text: "text-green-700" },
};

export async function generateStaticParams() {
  try {
    const events = await prisma.econEvent.findMany({ where: { published: true }, select: { slug: true } });
    return events.map((e: { slug: string }) => ({ slug: e.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const event = await prisma.econEvent.findUnique({
    where: { slug: params.slug },
    select: { title: true, summary: true },
  });
  if (!event) return { title: "Event Not Found" };
  return {
    title: `${event.title} | Simple Economics`,
    description: event.summary,
    openGraph: { title: event.title, description: event.summary, type: "article" },
    twitter: { card: "summary", title: event.title, description: event.summary },
  };
}

function RelatedCard({ slug, title, pillar, publishedAt }: { slug: string; title: string; pillar: Pillar; publishedAt: Date }) {
  const cfg = PILLAR_CONFIG[pillar];
  return (
    <Link
      href={`/feed/${slug}`}
      className="flex flex-col gap-2 bg-primary-white border-2 border-primary-black hover:bg-gray-50 p-4 transition-colors"
    >
      <span className={`self-start inline-flex items-center font-sans text-[10px] font-medium px-2 py-0.5 border ${cfg.badge}`}>
        {cfg.label}
      </span>
      <p className="font-sans text-sm font-bold uppercase text-primary-black leading-snug line-clamp-2">{title}</p>
      <p className="font-mono text-xs text-gray-400">
        {new Date(publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </Link>
  );
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const [event, related] = await Promise.all([
    prisma.econEvent.findUnique({ where: { slug: params.slug, published: true } }),
    prisma.econEvent.findMany({
      where: { slug: { not: params.slug } },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, slug: true, title: true, pillar: true, publishedAt: true },
    }).then(async (candidates: RelatedEvent[]) => {
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
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <article className="max-w-2xl mx-auto">

      {/* Back link */}
      <Link
        href="/feed"
        className="inline-flex items-center gap-1.5 font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-primary-black transition-colors mb-8"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M8.5 3L5 7l3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to feed
      </Link>

      {/* 1. Hero */}
      <header className="mb-10">
        <div className="flex items-center gap-2.5 flex-wrap mb-5">
          <span className={`inline-flex items-center font-sans text-[11px] font-medium px-2.5 py-0.5 border ${pillarCfg.badge}`}>
            {pillarCfg.label}
          </span>
          <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-medium ${impactCfg.text}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${impactCfg.dot}`} />
            {impactCfg.label} IMPACT
          </span>
          <span className="font-mono text-[11px] text-gray-400">{formattedDate}</span>
        </div>
        <h1 className="font-sans font-black text-4xl sm:text-5xl text-primary-black uppercase leading-tight">
          {event.title}
        </h1>
      </header>

      {/* 2. What happened */}
      <section className="mb-10">
        <h2 className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">
          What happened
        </h2>
        <p className="font-sans text-lg text-gray-800 leading-relaxed">
          {event.summary}
        </p>
      </section>

      {/* 3. Full explanation */}
      <section className="mb-10">
        <h2 className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">
          Why it happened
        </h2>
        <div className="font-sans text-base text-gray-700 leading-relaxed space-y-4">
          {event.fullExplanation.split("\n\n").map((para: string, i: number) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {/* 4. The Economist's Take */}
      <section className="mb-10">
        <h2 className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">
          The Economist&apos;s Take
        </h2>
        <blockquote className="border-l-4 border-primary-yellow bg-yellow-50 px-6 py-5">
          <p className="font-sans text-lg text-primary-black leading-relaxed italic">
            &ldquo;{event.summary}&rdquo;
          </p>
          <footer className="mt-3 font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500">
            — The Economist
          </footer>
        </blockquote>
      </section>

      {/* 5. Sources */}
      {event.sources.length > 0 && (
        <section className="mb-10">
          <h2 className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">
            Sources
          </h2>
          <ol className="flex flex-col gap-2">
            {event.sources.map((source: string, i: number) => (
              <li key={i} className="flex gap-3 items-baseline">
                <span className="font-mono text-[11px] text-gray-400 shrink-0">{i + 1}.</span>
                {isUrl(source) ? (
                  <a
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-primary-red hover:text-primary-black underline underline-offset-2 transition-colors break-all"
                  >
                    {source}
                  </a>
                ) : (
                  <span className="font-mono text-[11px] text-gray-600">{source}</span>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 6. YouTube */}
      {event.youtubeUrl && (
        <section className="mb-12">
          <h2 className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">
            Watch
          </h2>
          <YouTubeEmbed url={event.youtubeUrl} title={event.title} />
        </section>
      )}

      {/* 7. Related */}
      {related.length > 0 && (
        <section className="mt-12 pt-10 border-t-2 border-primary-black">
          <h2 className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-5">
            Related Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r: RelatedEvent) => (
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
