export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";
import { redirect } from "next/navigation";
import type { Pillar, Impact } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { situationLabel } from "@/components/onboarding/data";
import type { Situation } from "@/components/onboarding/data";
import { fetchAllIndicators } from "@/lib/economic-indicators";
import type { IndicatorResult } from "@/lib/economic-indicators";

// ─── Indicator display config (static metadata + meaning per situation) ───────

interface IndicatorMeta {
  key: string;
  name: string;
  source: string;
  fallbackValue: string;
  fallbackDate: string;
  meaning: (situation: string | null) => string;
}

const INDICATOR_META: IndicatorMeta[] = [
  {
    key: "CPI",
    name: "Inflation Rate (CPI)",
    source: "Bureau of Labor Statistics",
    fallbackValue: "2.4%",
    fallbackDate: "March 2025",
    meaning: (s) => {
      if (s === "RENTER")        return "Your rent and grocery costs are rising slower than last year, but prices aren't falling — they're just increasing less quickly.";
      if (s === "OWNER")         return "Slower inflation reduces pressure on the Fed to keep rates high, which could ease mortgage costs over time.";
      if (s === "STUDENT")       return "Tuition and everyday costs are stabilizing, but your dollar still buys less than it did two years ago.";
      if (s === "SELF_EMPLOYED") return "Input costs for your business are rising more slowly — a modest relief for margins.";
      return "Prices are rising more slowly than at the 2022 peak, but everyday goods still cost more than they did two years ago.";
    },
  },
  {
    key: "FEDFUNDS",
    name: "Federal Funds Rate",
    source: "Federal Reserve",
    fallbackValue: "4.25–4.50%",
    fallbackDate: "March 2025",
    meaning: (s) => {
      if (s === "RENTER")        return "High rates keep mortgage borrowing expensive, which reduces home buying competition and can hold rents steadier.";
      if (s === "OWNER")         return "Refinancing is still costly at this level. Most economists expect gradual cuts — watch Fed meeting dates.";
      if (s === "STUDENT")       return "Federal student loan rates are set separately, but private loan rates remain elevated alongside this benchmark.";
      if (s === "SELF_EMPLOYED") return "Business lines of credit and small business loans are expensive right now. Fixed-rate financing where possible is worth exploring.";
      return "This is the rate banks charge each other overnight — it ripples into mortgages, credit cards, and savings account yields.";
    },
  },
  {
    key: "UNRATE",
    name: "Unemployment Rate",
    source: "Bureau of Labor Statistics",
    fallbackValue: "4.2%",
    fallbackDate: "March 2025",
    meaning: (s) => {
      if (s === "RENTER")        return "A healthy job market means most renters have stable income, though wage growth has cooled from its peak.";
      if (s === "OWNER")         return "Low unemployment supports home values — fewer forced sales keep supply tight in most markets.";
      if (s === "STUDENT")       return "The job market remains competitive for new graduates in some fields. Entry-level hiring is softer than 2021–2022.";
      if (s === "SELF_EMPLOYED") return "Consumer spending holds up when employment is strong — a tailwind for businesses serving everyday customers.";
      return "Historically low — below 5% is considered full employment by most economists. Layoffs remain concentrated in specific sectors.";
    },
  },
  {
    key: "MORTGAGE30US",
    name: "30-Year Mortgage Rate",
    source: "Freddie Mac via FRED",
    fallbackValue: "6.65%",
    fallbackDate: "April 2025",
    meaning: (s) => {
      if (s === "RENTER")        return "Buying remains expensive, which keeps many potential buyers renting longer — putting upward pressure on rental demand.";
      if (s === "OWNER")         return "If your current rate is below 6%, you're in a strong position. Refinancing only makes sense if rates drop meaningfully.";
      if (s === "STUDENT")       return "Homeownership is further out of reach at this rate. Building credit and savings now positions you better when rates fall.";
      if (s === "SELF_EMPLOYED") return "Commercial property and home-office financing is expensive. Factor this into any real estate decisions.";
      return "Still more than double the pandemic-era lows. The monthly payment on a $400K loan at this rate is roughly $2,530 — about $900 more than at 3%.";
    },
  },
];

// ─── Pillar badge config ──────────────────────────────────────────────────────

const PILLAR_LABEL: Record<Pillar, string> = {
  GLOBAL_ECONOMICS:   "Global Economics",
  GEOPOLITICS_MONEY:  "Geopolitics & Money",
  DEVELOPMENT_POLICY: "Development & Policy",
  PERSONAL_FINANCE:   "Personal Finance",
};

const PILLAR_BADGE: Record<Pillar, string> = {
  GLOBAL_ECONOMICS:   "text-[#C49A52] border-[#C49A52]/30",
  GEOPOLITICS_MONEY:  "text-[#D4613C] border-[#D4613C]/30",
  DEVELOPMENT_POLICY: "text-[#3D8A55] border-[#3D8A55]/30",
  PERSONAL_FINANCE:   "text-blue-300 border-blue-400/30",
};

const IMPACT_DOT: Record<Impact, string> = {
  HIGH:   "bg-[#B84A2A]",
  MEDIUM: "bg-[#C49A52]",
  LOW:    "bg-[#3D8A55]",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MyEconomyPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/signin");

  const userId = session.user.id;

  const [user, topEvents, recentQuestions, savedEvents, liveIndicators] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { situation: true, city: true, onboardingComplete: true },
    }),
    prisma.econEvent.findMany({
      where: { published: true, impact: "HIGH" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, slug: true, title: true, pillar: true, impact: true, summary: true, publishedAt: true },
    }),
    prisma.userQuestion.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, question: true, answer: true, createdAt: true },
    }),
    prisma.savedEvent.findMany({
      where: { userId },
      orderBy: { savedAt: "desc" },
      take: 4,
      select: {
        id: true,
        savedAt: true,
        event: { select: { slug: true, title: true, pillar: true, publishedAt: true } },
      },
    }),
    fetchAllIndicators(),
  ]);

  const situation = user?.situation ?? null;
  const situationStr = situation ? situationLabel(situation as Situation) : null;
  const city = user?.city ?? null;

  return (
    <div className="flex flex-col gap-12">

      {/* ── 1. Header ── */}
      <section>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#FAF9F6] leading-tight">
          Your Economic Snapshot
        </h1>
        {user?.onboardingComplete && (situationStr || city) ? (
          <p className="mt-3 font-sans text-base text-[#7A6A52]">
            Here&apos;s what&apos;s moving the economy
            {situationStr && <> for <span className="text-[#C8B8A2]">{situationStr}</span></>}
            {city && <> in <span className="text-[#C8B8A2]">{city}</span></>}.
          </p>
        ) : (
          <div className="mt-6 border border-[#C49A52]/30 bg-[#C49A52]/5 rounded-xl px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-sans text-sm font-medium text-[#C8B8A2]">
                Personalize your dashboard
              </p>
              <p className="mt-1 font-sans text-xs text-[#7A6A52]">
                Tell us about your situation and we&apos;ll tailor every indicator to you.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="shrink-0 bg-[#C49A52] hover:bg-[#E2C27A] transition-colors text-[#1A1208] font-sans font-medium text-sm px-4 py-2 rounded-lg"
            >
              Complete profile
            </Link>
          </div>
        )}
      </section>

      {/* ── 2. Economic indicators ── */}
      <section>
        <h2 className="font-sans text-xs text-[#7A6A52] uppercase tracking-widest mb-5">
          Economic Indicators
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INDICATOR_META.map((meta) => {
            const live: IndicatorResult | undefined = liveIndicators[meta.key];
            const value = live?.value ?? meta.fallbackValue;
            const date  = live?.date  ?? meta.fallbackDate;
            const cached = live?.isCached ?? false;
            const unavailable = live !== undefined && live.value === null;

            return (
              <div
                key={meta.key}
                className="flex flex-col gap-3 bg-[#2C2417]/40 border border-[#2C2417] rounded-xl px-5 py-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-sans text-xs text-[#7A6A52] leading-snug">{meta.name}</p>
                  {unavailable ? (
                    <span className="font-sans text-xs text-[#4A3D2A] leading-none shrink-0">
                      unavailable
                    </span>
                  ) : (
                    <span className={`font-mono text-xl leading-none shrink-0 ${cached ? "text-[#7A6A52]" : "text-[#C49A52]"}`}>
                      {value}
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs text-[#C8B8A2] leading-relaxed">
                  {unavailable ? "Data temporarily unavailable." : meta.meaning(situation)}
                </p>
                <p className="font-sans text-[10px] text-[#4A3D2A]">
                  {meta.source} · {date}
                  {cached && <span className="ml-1 text-[#4A3D2A]">(cached)</span>}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. Top HIGH impact events ── */}
      <section>
        <h2 className="font-sans text-xs text-[#7A6A52] uppercase tracking-widest mb-5">
          What&apos;s affecting you right now
        </h2>
        {topEvents.length === 0 ? (
          <p className="font-sans text-sm text-[#4A3D2A]">No high-impact events published yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {topEvents.map((ev) => (
              <Link
                key={ev.id}
                href={`/feed/${ev.slug}`}
                className="flex flex-col gap-2 bg-[#2C2417]/40 border border-[#2C2417] hover:border-[#4A3D2A] rounded-xl px-5 py-4 transition-colors"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center font-sans text-[10px] font-medium px-2 py-0.5 rounded-full border ${PILLAR_BADGE[ev.pillar]}`}>
                    {PILLAR_LABEL[ev.pillar]}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#D4613C]">
                    <span className={`w-1.5 h-1.5 rounded-full ${IMPACT_DOT[ev.impact]}`} />
                    HIGH IMPACT
                  </span>
                </div>
                <p className="font-serif text-lg text-[#FAF9F6] leading-snug">{ev.title}</p>
                <p className="font-sans text-xs text-[#7A6A52] line-clamp-2">{ev.summary}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── 4. Recent questions ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-sans text-xs text-[#7A6A52] uppercase tracking-widest">
            Your recent questions
          </h2>
          <Link href="/ask" className="font-sans text-xs text-[#C49A52] hover:text-[#E2C27A] transition-colors">
            Ask a new question →
          </Link>
        </div>
        {recentQuestions.length === 0 ? (
          <div className="border border-[#2C2417] rounded-xl px-5 py-8 text-center">
            <p className="font-sans text-sm text-[#4A3D2A]">You haven&apos;t asked anything yet.</p>
            <Link href="/ask" className="mt-3 inline-block font-sans text-sm text-[#C49A52] hover:text-[#E2C27A] transition-colors">
              Ask the Economist →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#2C2417] border border-[#2C2417] rounded-xl overflow-hidden">
            {recentQuestions.map((q) => (
              <div key={q.id} className="px-5 py-4 hover:bg-[#2C2417]/20 transition-colors">
                <p className="font-sans text-sm text-[#C8B8A2] font-medium leading-snug">
                  {q.question}
                </p>
                <p className="mt-1.5 font-sans text-xs text-[#7A6A52] line-clamp-2 leading-relaxed">
                  {q.answer.slice(0, 160)}{q.answer.length > 160 ? "…" : ""}
                </p>
                <p className="mt-2 font-mono text-[10px] text-[#4A3D2A]">
                  {new Date(q.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 5. Saved events ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-sans text-xs text-[#7A6A52] uppercase tracking-widest">
            Saved events
          </h2>
          <Link href="/saved" className="font-sans text-xs text-[#C49A52] hover:text-[#E2C27A] transition-colors">
            See all →
          </Link>
        </div>
        {savedEvents.length === 0 ? (
          <div className="border border-[#2C2417] rounded-xl px-5 py-8 text-center">
            <p className="font-sans text-sm text-[#4A3D2A]">No saved events yet.</p>
            <Link href="/feed" className="mt-3 inline-block font-sans text-sm text-[#C49A52] hover:text-[#E2C27A] transition-colors">
              Browse the feed →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedEvents.map((se) => (
              <Link
                key={se.id}
                href={`/feed/${se.event.slug}`}
                className="flex flex-col gap-2 bg-[#2C2417]/40 border border-[#2C2417] hover:border-[#4A3D2A] rounded-xl px-4 py-4 transition-colors"
              >
                <span className={`self-start inline-flex items-center font-sans text-[10px] font-medium px-2 py-0.5 rounded-full border ${PILLAR_BADGE[se.event.pillar]}`}>
                  {PILLAR_LABEL[se.event.pillar]}
                </span>
                <p className="font-serif text-base text-[#FAF9F6] leading-snug line-clamp-2">
                  {se.event.title}
                </p>
                <p className="font-sans text-[10px] text-[#4A3D2A]">
                  Saved · {new Date(se.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
