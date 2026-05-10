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
  {
    key: "PRIMERATE",
    name: "Prime Rate",
    source: "Federal Reserve via FRED",
    fallbackValue: "7.50%",
    fallbackDate: "April 2025",
    meaning: (s) => {
      if (s === "RENTER")        return "Credit card rates and personal loans are directly tied to this rate. Every point up means more interest on any variable-rate debt you carry.";
      if (s === "OWNER")         return "Home equity lines of credit (HELOCs) float with the prime rate. If you have one, your monthly payments move when this does.";
      if (s === "STUDENT")       return "Private student loans and most credit cards are priced off the prime rate. High prime means borrowing for school costs more.";
      if (s === "SELF_EMPLOYED") return "Business lines of credit are typically priced as prime plus a spread. When prime is high, short-term business borrowing gets expensive.";
      return "The prime rate is what banks charge their best customers — it sets the floor for consumer credit cards, car loans, and personal loans. Currently elevated alongside the federal funds rate.";
    },
  },
  {
    key: "REALWAGES",
    name: "Wage Growth (YoY)",
    source: "Bureau of Labor Statistics via FRED",
    fallbackValue: "3.8%",
    fallbackDate: "March 2025",
    meaning: (s) => {
      if (s === "RENTER")        return "If wage growth is above inflation, your real purchasing power is rising. Compare this number to the CPI above — the gap is your real raise (or real cut).";
      if (s === "OWNER")         return "Wage growth above inflation supports home values by keeping buyer purchasing power stable, even at high mortgage rates.";
      if (s === "STUDENT")       return "This is the wage growth you're entering into. Whether it keeps up with inflation determines whether your first paycheck feels like a real wage or a step backward.";
      if (s === "SELF_EMPLOYED") return "When wage growth for employees runs hot, customers have more to spend — which supports demand for services and small businesses.";
      return "Year-over-year change in average hourly earnings for production workers. Compare this to the CPI inflation rate above — if wages are growing faster than prices, workers are gaining real purchasing power.";
    },
  },
];

const PILLAR_LABEL: Record<Pillar, string> = {
  GLOBAL_ECONOMICS:   "Global Economics",
  GEOPOLITICS_MONEY:  "Geopolitics & Money",
  DEVELOPMENT_POLICY: "Development & Policy",
  PERSONAL_FINANCE:   "Personal Finance",
};

const PILLAR_BG: Record<Pillar, string> = {
  GLOBAL_ECONOMICS:   "bg-primary-blue text-primary-white",
  GEOPOLITICS_MONEY:  "bg-primary-red text-primary-white",
  DEVELOPMENT_POLICY: "bg-primary-yellow text-primary-black",
  PERSONAL_FINANCE:   "bg-primary-black text-primary-white",
};

const IMPACT_BG: Record<Impact, string> = {
  HIGH:   "bg-primary-red text-primary-white",
  MEDIUM: "bg-primary-yellow text-primary-black",
  LOW:    "bg-primary-blue text-primary-white",
};

const INDICATOR_BORDER: Record<string, string> = {
  CPI:          "border-l-4 border-primary-red",
  FEDFUNDS:     "border-l-4 border-primary-blue",
  UNRATE:       "border-l-4 border-primary-yellow",
  PRIMERATE:    "border-l-4 border-primary-red",
  REALWAGES:    "border-l-4 border-primary-blue",
  MORTGAGE30US: "border-l-4 border-primary-black",
};

const NATIONAL_KEYS = ["CPI", "FEDFUNDS", "UNRATE", "PRIMERATE", "REALWAGES"];
const LOCAL_KEYS    = ["MORTGAGE30US"];

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
        <h1 className="font-display font-black text-4xl sm:text-5xl text-primary-black uppercase leading-tight">
          Your Economic Snapshot
        </h1>
        {user?.onboardingComplete && (situationStr || city) ? (
          <p className="mt-3 font-sans text-base text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary-red shrink-0" />
            Personalized for{situationStr && <strong className="text-primary-black"> {situationStr}</strong>}
            {city && <span> in <strong className="text-primary-black">{city}</strong></span>}
          </p>
        ) : (
          <div className="mt-6 border-2 border-primary-black bg-primary-yellow px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-wide text-primary-black">
                Personalize your dashboard
              </p>
              <p className="mt-1 font-sans text-xs text-gray-700">
                Tell us about your situation and we&apos;ll tailor every indicator to you.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="shrink-0 font-display text-xs font-bold uppercase tracking-widest bg-primary-black text-primary-white hover:bg-primary-red transition-colors px-4 py-2"
            >
              Complete profile
            </Link>
          </div>
        )}
      </section>

      {/* ── 2a. National indicators ── */}
      <section>
        {/* Section banner */}
        <div className="border-2 border-primary-black bg-primary-yellow px-5 py-3 mb-4 flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-primary-black shrink-0" />
          <span className="font-display text-xs font-black uppercase tracking-widest text-primary-black">
            National Economy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INDICATOR_META.filter((m) => NATIONAL_KEYS.includes(m.key)).map((meta) => {
            const live: IndicatorResult | undefined = liveIndicators[meta.key];
            const value       = live?.value ?? meta.fallbackValue;
            const date        = live?.date  ?? meta.fallbackDate;
            const cached      = live?.isCached ?? false;
            const unavailable = live !== undefined && live.value === null;

            return (
              <div key={meta.key} className={`flex flex-col gap-3 bg-primary-white border-2 border-primary-black px-5 py-5 ${INDICATOR_BORDER[meta.key] ?? ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-xs font-bold uppercase tracking-wide text-gray-500 leading-snug">
                    {meta.name}
                  </p>
                  {unavailable ? (
                    <span className="font-sans text-xs text-gray-300 leading-none shrink-0">unavailable</span>
                  ) : (
                    <span className={`font-mono text-2xl leading-none shrink-0 ${cached ? "text-gray-500" : "text-primary-black"}`}>
                      {value}
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs text-primary-black leading-relaxed">
                  {unavailable ? "Data temporarily unavailable." : meta.meaning(situation)}
                </p>
                <p className="font-sans text-[10px] text-gray-300">
                  {meta.source} · {date}
                  {cached && <span className="ml-1">(cached)</span>}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 2b. Local indicators ── */}
      <section>
        {/* Section banner */}
        <div className="border-2 border-primary-black bg-primary-blue px-5 py-3 mb-4 flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-primary-white shrink-0" />
          <span className="font-display text-xs font-black uppercase tracking-widest text-primary-white">
            Your Local Economy{city ? ` — ${city}` : ""}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mortgage rate with local housing context */}
          {INDICATOR_META.filter((m) => LOCAL_KEYS.includes(m.key)).map((meta) => {
            const live: IndicatorResult | undefined = liveIndicators[meta.key];
            const value       = live?.value ?? meta.fallbackValue;
            const date        = live?.date  ?? meta.fallbackDate;
            const cached      = live?.isCached ?? false;
            const unavailable = live !== undefined && live.value === null;

            return (
              <div key={meta.key} className={`flex flex-col gap-3 bg-primary-white border-2 border-primary-black px-5 py-5 ${INDICATOR_BORDER[meta.key] ?? ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-xs font-bold uppercase tracking-wide text-gray-500 leading-snug">
                    {meta.name}
                  </p>
                  {unavailable ? (
                    <span className="font-sans text-xs text-gray-300 leading-none shrink-0">unavailable</span>
                  ) : (
                    <span className={`font-mono text-2xl leading-none shrink-0 ${cached ? "text-gray-500" : "text-primary-black"}`}>
                      {value}
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs text-primary-black leading-relaxed">
                  {unavailable ? "Data temporarily unavailable." : meta.meaning(situation)}
                </p>
                <p className="font-sans text-[10px] text-gray-300">
                  {meta.source} · {date}
                  {cached && <span className="ml-1">(cached)</span>}
                </p>
              </div>
            );
          })}

          {/* Local job market card */}
          <div className="flex flex-col gap-3 bg-primary-white border-2 border-primary-black px-5 py-5 border-l-4 border-l-primary-yellow">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-xs font-bold uppercase tracking-wide text-gray-500 leading-snug">
                Local Job Market
              </p>
              <span className="font-sans text-xs text-gray-300 leading-none shrink-0 text-right">
                {city ?? "Your area"}
              </span>
            </div>
            <p className="font-sans text-xs text-primary-black leading-relaxed">
              {city
                ? `Local unemployment data for ${city} is published by your state's labor department, which tracks conditions more precisely than national averages. National unemployment is ${liveIndicators["UNRATE"]?.value ?? "4.2%"} — your local rate may differ significantly depending on your industry.`
                : "Add your city in your profile to get a link to your local labor market data."}
            </p>
            <p className="font-sans text-[10px] text-gray-300">
              {city
                ? `For ${city} figures, check your state's labor department`
                : "Update your profile to personalize"}
            </p>
          </div>
        </div>

        <p className="mt-3 font-sans text-[10px] text-gray-300">
          Local data is estimated based on your city. For precise local figures, check your state&apos;s labor department website.
        </p>
      </section>

      {/* ── 3. Top HIGH impact events ── */}
      <section>
        <h2 className="font-display text-xs font-bold uppercase tracking-widest text-primary-black mb-5 flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-primary-blue shrink-0" />
          What&apos;s affecting you right now
        </h2>
        {topEvents.length === 0 ? (
          <p className="font-sans text-sm text-gray-500">No high-impact events published yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {topEvents.map((ev) => (
              <Link
                key={ev.id}
                href={`/feed/${ev.slug}`}
                className="flex flex-col gap-2 bg-primary-white border-2 border-primary-black px-5 py-4 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0A0A0A] transition-all"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-display text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${PILLAR_BG[ev.pillar]}`}>
                    {PILLAR_LABEL[ev.pillar]}
                  </span>
                  <span className={`font-display text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${IMPACT_BG[ev.impact]}`}>
                    HIGH IMPACT
                  </span>
                </div>
                <p className="font-display font-bold text-base text-primary-black uppercase leading-snug">{ev.title}</p>
                <p className="font-sans text-xs text-gray-500 line-clamp-2">{ev.summary}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── 4. Recent questions ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xs font-bold uppercase tracking-widest text-primary-black flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-primary-yellow shrink-0" />
            Your recent questions
          </h2>
          <Link href="/ask" className="font-display text-xs font-bold uppercase tracking-widest text-primary-black hover:text-primary-red transition-colors">
            Ask new →
          </Link>
        </div>
        {recentQuestions.length === 0 ? (
          <div className="border-2 border-primary-black px-5 py-8 text-center">
            <p className="font-sans text-sm text-gray-500">You haven&apos;t asked anything yet.</p>
            <Link href="/ask" className="mt-3 inline-block font-display text-xs font-bold uppercase tracking-widest text-primary-black hover:text-primary-red transition-colors">
              Ask the Economist →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y-2 divide-primary-black border-2 border-primary-black">
            {recentQuestions.map((q) => (
              <div key={q.id} className="px-5 py-4 hover:bg-gray-100 transition-colors">
                <p className="font-sans text-sm text-primary-black font-semibold leading-snug">
                  {q.question}
                </p>
                <p className="mt-1.5 font-sans text-xs text-primary-black line-clamp-2 leading-relaxed">
                  {q.answer.slice(0, 160)}{q.answer.length > 160 ? "…" : ""}
                </p>
                <p className="mt-2 font-mono text-[10px] text-gray-300">
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
          <h2 className="font-display text-xs font-bold uppercase tracking-widest text-primary-black flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-primary-black shrink-0 border border-gray-300" />
            Saved events
          </h2>
          <Link href="/saved" className="font-display text-xs font-bold uppercase tracking-widest text-primary-black hover:text-primary-red transition-colors">
            See all →
          </Link>
        </div>
        {savedEvents.length === 0 ? (
          <div className="border-2 border-primary-black px-5 py-8 text-center">
            <p className="font-sans text-sm text-gray-500">No saved events yet.</p>
            <Link href="/feed" className="mt-3 inline-block font-display text-xs font-bold uppercase tracking-widest text-primary-black hover:text-primary-red transition-colors">
              Browse the feed →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedEvents.map((se) => (
              <Link
                key={se.id}
                href={`/feed/${se.event.slug}`}
                className="flex flex-col gap-2 bg-primary-white border-2 border-primary-black px-4 py-4 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0A0A0A] transition-all"
              >
                <span className={`self-start font-display text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${PILLAR_BG[se.event.pillar]}`}>
                  {PILLAR_LABEL[se.event.pillar]}
                </span>
                <p className="font-display font-bold text-sm text-primary-black uppercase leading-snug line-clamp-2">
                  {se.event.title}
                </p>
                <p className="font-sans text-[10px] text-gray-300">
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
