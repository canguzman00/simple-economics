export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";
import { redirect } from "next/navigation";
import type { Pillar } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { situationLabel } from "@/components/onboarding/data";
import type { Situation } from "@/components/onboarding/data";
import { fetchAllIndicators } from "@/lib/economic-indicators";
import { fetchGlobalIndicators, formatGlobalValue } from "@/lib/global-indicators";
import { fetchMetroUnemployment, fetchFairMarketRent } from "@/lib/local-indicators";
import type { LocalIndicator, RentIndicator } from "@/lib/local-indicators";
import type { GlobalIndicators } from "@/lib/global-indicators";
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
  { key: "CPI", name: "Inflation Rate (CPI)", source: "Bureau of Labor Statistics", fallbackValue: "2.4%", fallbackDate: "March 2025", meaning: (s) => { if (s === "RENTER") return "Your rent and grocery costs are rising slower than last year, but prices aren't falling — they're just increasing less quickly."; if (s === "OWNER") return "Slower inflation reduces pressure on the Fed to keep rates high, which could ease mortgage costs over time."; if (s === "STUDENT") return "Tuition and everyday costs are stabilizing, but your dollar still buys less than it did two years ago."; if (s === "SELF_EMPLOYED") return "Input costs for your business are rising more slowly — a modest relief for margins."; return "Prices are rising more slowly than at the 2022 peak, but everyday goods still cost more than they did two years ago."; } },
  { key: "FEDFUNDS", name: "Federal Funds Rate", source: "Federal Reserve", fallbackValue: "4.25–4.50%", fallbackDate: "March 2025", meaning: (s) => { if (s === "RENTER") return "High rates keep mortgage borrowing expensive, which reduces home buying competition and can hold rents steadier."; if (s === "OWNER") return "Refinancing is still costly at this level. Most economists expect gradual cuts — watch Fed meeting dates."; if (s === "STUDENT") return "Federal student loan rates are set separately, but private loan rates remain elevated alongside this benchmark."; if (s === "SELF_EMPLOYED") return "Business lines of credit and small business loans are expensive right now. Fixed-rate financing where possible is worth exploring."; return "This is the rate banks charge each other overnight — it ripples into mortgages, credit cards, and savings account yields."; } },
  { key: "UNRATE", name: "Unemployment Rate", source: "Bureau of Labor Statistics", fallbackValue: "4.2%", fallbackDate: "March 2025", meaning: (s) => { if (s === "RENTER") return "A healthy job market means most renters have stable income, though wage growth has cooled from its peak."; if (s === "OWNER") return "Low unemployment supports home values — fewer forced sales keep supply tight in most markets."; if (s === "STUDENT") return "The job market remains competitive for new graduates in some fields. Entry-level hiring is softer than 2021–2022."; if (s === "SELF_EMPLOYED") return "Consumer spending holds up when employment is strong — a tailwind for businesses serving everyday customers."; return "Historically low — below 5% is considered full employment by most economists. Layoffs remain concentrated in specific sectors."; } },
  { key: "MORTGAGE30US", name: "30-Year Mortgage Rate", source: "Freddie Mac via FRED", fallbackValue: "6.65%", fallbackDate: "April 2025", meaning: (s) => { if (s === "RENTER") return "Buying remains expensive, which keeps many potential buyers renting longer — putting upward pressure on rental demand."; if (s === "OWNER") return "If your current rate is below 6%, you're in a strong position. Refinancing only makes sense if rates drop meaningfully."; if (s === "STUDENT") return "Homeownership is further out of reach at this rate. Building credit and savings now positions you better when rates fall."; if (s === "SELF_EMPLOYED") return "Commercial property and home-office financing is expensive. Factor this into any real estate decisions."; return "Still more than double the pandemic-era lows. The monthly payment on a $400K loan at this rate is roughly $2,530 — about $900 more than at 3%."; } },
  { key: "CONSCONF", name: "Consumer Confidence", source: "University of Michigan via FRED", fallbackValue: "68.0", fallbackDate: "March 2025", meaning: (s) => { if (s === "RENTER") return "When consumers feel pessimistic, landlords face pressure to hold rents steady or offer concessions. Falling confidence often precedes job market softening by 6–12 months."; if (s === "OWNER") return "Low consumer confidence typically precedes lower home sales volume — fewer buyers means longer days on market and more negotiating room for buyers."; if (s === "STUDENT") return "Consumer sentiment predicts hiring. When confidence falls, businesses cut hiring budgets first. A reading below 70 historically signals tighter job markets within a year."; if (s === "SELF_EMPLOYED") return "Consumer confidence is a direct leading indicator for small business revenue. When people feel financially insecure, discretionary spending drops first — which hits small businesses hardest."; return "The University of Michigan Consumer Sentiment Index measures how optimistic Americans feel about their finances. Readings above 80 signal expansion; below 70 often precede recessions."; } },
  { key: "PRIMERATE", name: "Prime Rate", source: "Federal Reserve via FRED", fallbackValue: "7.50%", fallbackDate: "April 2025", meaning: (s) => { if (s === "RENTER") return "Credit card rates and personal loans are directly tied to this rate. Every point up means more interest on any variable-rate debt you carry."; if (s === "OWNER") return "Home equity lines of credit (HELOCs) float with the prime rate. If you have one, your monthly payments move when this does."; if (s === "STUDENT") return "Private student loans and most credit cards are priced off the prime rate. High prime means borrowing for school costs more."; if (s === "SELF_EMPLOYED") return "Business lines of credit are typically priced as prime plus a spread. When prime is high, short-term business borrowing gets expensive."; return "The prime rate is what banks charge their best customers — it sets the floor for consumer credit cards, car loans, and personal loans."; } },
  { key: "REALWAGES", name: "Avg. Hourly Earnings", source: "Bureau of Labor Statistics via FRED", fallbackValue: "$30.15", fallbackDate: "March 2025", meaning: (s) => { if (s === "RENTER") return "This is the average hourly wage for production workers nationally. If your wages are below this, you're earning less than the median."; if (s === "OWNER") return "Rising wages support home values by keeping more buyers in the market. If wage growth outpaces inflation, purchasing power is improving."; if (s === "STUDENT") return "This is the wage floor you're entering. Whether your starting salary is above or below this benchmark signals how your field pays relative to the broader workforce."; if (s === "SELF_EMPLOYED") return "When average wages rise, consumer spending tends to follow — which supports demand for independent businesses and services."; return "The average hourly wage for production and nonsupervisory workers. Compare this to CPI — if wages are rising faster than prices, workers are gaining real purchasing power."; } },
];

const PILLAR_LABEL: Record<Pillar, string> = {
  GLOBAL_ECONOMICS: "Global Economics",
  GEOPOLITICS_MONEY: "Geopolitics & Money",
  DEVELOPMENT_POLICY: "Development & Policy",
  PERSONAL_FINANCE: "Personal Finance",
};

const NATIONAL_KEYS = ["CPI", "FEDFUNDS", "UNRATE", "CONSCONF", "PRIMERATE", "REALWAGES"];

export default async function MyEconomyPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/signin");
  const userId = session.user.id;

  const [user, topEvents, recentQuestions, savedEvents, liveIndicators, globalIndicators] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { situation: true, city: true, onboardingComplete: true } }),
    prisma.econEvent.findMany({ where: { published: true, impact: "HIGH" }, orderBy: { publishedAt: "desc" }, take: 3, select: { id: true, slug: true, title: true, pillar: true, impact: true, summary: true, publishedAt: true } }),
    prisma.userQuestion.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, question: true, answer: true, createdAt: true } }),
    prisma.savedEvent.findMany({ where: { userId }, orderBy: { savedAt: "desc" }, take: 4, select: { id: true, savedAt: true, event: { select: { slug: true, title: true, pillar: true, publishedAt: true } } } }),
    fetchAllIndicators(),
    fetchGlobalIndicators(),
  ]);

  const situation = user?.situation ?? null;
  const city = user?.city ?? null;
  const situationStr = situation ? situationLabel(situation as Situation) : null;
  const [metroUnemployment, fairMarketRent] = await Promise.all([
    fetchMetroUnemployment(city) as Promise<LocalIndicator>,
    fetchFairMarketRent(city) as Promise<RentIndicator>,
  ]);

  return (
    <div className="flex flex-col gap-12">

      <section>
        <h1 className="font-bold leading-tight" style={{fontSize:"36px",color:"#0F172A",fontFamily:"Inter,sans-serif"}}>Your Economic Snapshot</h1>
        {user?.onboardingComplete && (situationStr || city) ? (
          <p className="mt-3 text-base flex items-center gap-2" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{background:"#F43F5E"}} />
            Personalized for{situationStr && <strong className="text-primary-black"> {situationStr}</strong>}
            {city && <span> in <strong className="text-primary-black">{city}</strong></span>}
          </p>
        ) : (
          <div className="mt-6 rounded-xl px-6 py-5 flex items-center justify-between gap-4" style={{background:"#FFF1F2",border:"1px solid #FECDD3"}}>
            <div>
              <p className="text-sm font-semibold" style={{color:"#0F172A",fontFamily:"Inter,sans-serif"}}>Personalize your dashboard</p>
              <p className="mt-1 text-xs" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>Tell us about your situation and we&apos;ll tailor every indicator to you.</p>
            </div>
            <Link href="/onboarding" className="shrink-0 text-xs font-semibold px-4 py-2 rounded-lg transition-colors" style={{background:"#F43F5E",color:"#fff",fontFamily:"Inter,sans-serif"}}>Complete profile</Link>
          </div>
        )}
      </section>

      <section>
        <div className="rounded-lg px-5 py-3 mb-4 flex items-center gap-3" style={{background:"#1E293B",border:"1px solid #334155"}}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{background:"#F43F5E"}} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{color:"#F8FAFC",fontFamily:"Inter,sans-serif"}}>National Economy</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INDICATOR_META.filter((m) => NATIONAL_KEYS.includes(m.key)).map((meta) => {
            const live: IndicatorResult | undefined = liveIndicators[meta.key];
            const value = live?.value ?? meta.fallbackValue;
            const date = live?.date ?? meta.fallbackDate;
            const cached = live?.isCached ?? false;
            const unavailable = live !== undefined && live.value === null;

            if (meta.key === "CONSCONF") {
              const raw = parseFloat(value);
              const validRaw = !isNaN(raw);
              const sentiment = !validRaw ? null : raw >= 90 ? { label: "HIGH" } : raw >= 70 ? { label: "MODERATE" } : { label: "LOW" };
              const HIST_AVG = 86;
              const diff = validRaw ? Math.abs(Math.round(raw - HIST_AVG)) : 0;
              const direction = validRaw && raw >= HIST_AVG ? "above" : "below";
              const spending = !validRaw ? "spending patterns are unclear." : raw >= 90 ? "suggests strong spending ahead." : raw >= 70 ? "suggests stable but cautious spending." : "means consumers are cutting back spending.";
              const sentiment_word = !validRaw ? "uncertain" : raw >= 90 ? "optimistic" : raw >= 70 ? "cautious" : "pessimistic";
              const markerPct = validRaw ? Math.min(100, Math.max(0, (raw / 140) * 100)) : 0;
              const avgPct = (HIST_AVG / 140) * 100;
              return (
                <div key={meta.key} className="flex flex-col gap-3 rounded-xl px-5 py-5" style={{background:"#fff",border:"1px solid #E2E8F0",borderTop:"3px solid #F43F5E"}}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider leading-snug" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>{meta.name}</p>
                    {unavailable ? <span className="text-xs leading-none shrink-0" style={{color:"#CBD5E1",fontFamily:"Inter,sans-serif"}}>unavailable</span>
                    : sentiment ? <span className="font-mono text-sm font-bold leading-none shrink-0 whitespace-nowrap" style={{color: cached ? "#94A3B8" : "#0F172A"}}>{sentiment.label} ({value})</span>
                    : <span className="font-mono text-2xl leading-none shrink-0 text-primary-black">{value}</span>}
                  </div>
                  {validRaw && !unavailable && (
                    <div>
                      <div className="relative h-3 flex rounded overflow-hidden" style={{border:"1px solid #E2E8F0"}}>
                        <div className="bg-primary-red" style={{ width: "42.8%" }} />
                        <div className="bg-primary-yellow border-x border-primary-black" style={{ width: "21.4%" }} />
                        <div className="bg-[#3D8A55] flex-1" />
                        <div className="absolute top-0 bottom-0 w-px bg-primary-black opacity-60" style={{ left: `${avgPct}%` }} />
                        <div className="absolute top-0 bottom-0 w-0.5 bg-primary-black" style={{ left: `${markerPct}%` }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="font-sans text-[9px] text-primary-black">0 (pessimistic)</span>
                        <span className="font-sans text-[9px] text-primary-black">avg: 86</span>
                        <span className="font-sans text-[9px] text-primary-black">140 (optimistic)</span>
                      </div>
                    </div>
                  )}
                  <p className="text-xs leading-relaxed" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>
                    {unavailable ? "Data temporarily unavailable." : validRaw ? `Americans are feeling ${sentiment_word} about the economy right now. The index runs from 0 to 140 — the long-run average is 86. At ${raw.toFixed(1)}, consumers are ${diff} points ${direction} the historical average, which ${spending}` : meta.meaning(situation)}
                  </p>
                  <div>
                    <p className="text-[10px]" style={{color:"#94A3B8",fontFamily:"Inter,sans-serif"}}>{meta.source} · {date}{cached && <span className="ml-1">(cached)</span>}</p>
                    <p className="text-[10px]" style={{color:"#94A3B8",fontFamily:"Inter,sans-serif"}}>Historical average: ~86</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={meta.key} className="flex flex-col gap-3 rounded-xl px-5 py-5" style={{background:"#fff",border:"1px solid #E2E8F0",borderTop:"3px solid #F43F5E"}}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider leading-snug" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>{meta.name}</p>
                  {unavailable ? <span className="text-xs leading-none shrink-0" style={{color:"#CBD5E1",fontFamily:"Inter,sans-serif"}}>unavailable</span>
                  : <span className="font-mono text-2xl leading-none shrink-0 font-bold" style={{color: cached ? "#94A3B8" : "#0F172A"}}>{value}</span>}
                </div>
                <p className="text-xs leading-relaxed" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>{unavailable ? "Data temporarily unavailable." : meta.meaning(situation)}</p>
                <p className="text-[10px]" style={{color:"#94A3B8",fontFamily:"Inter,sans-serif"}}>{meta.source} · {date}{cached && <span className="ml-1">(cached)</span>}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="rounded-lg px-5 py-3 mb-4 flex items-center gap-3" style={{background:"#1E293B",border:"1px solid #334155"}}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{background:"#F43F5E"}} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{color:"#F8FAFC",fontFamily:"Inter,sans-serif"}}>
            Your Local Economy{city ? ` — ${city.toUpperCase()}` : ""}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(() => {
            const mortgageLive = liveIndicators["MORTGAGE30US"];
            const mortgageRateStr = mortgageLive?.value ?? "6.65%";
            const annualRate = parseFloat(mortgageRateStr) / 100;
            const monthlyRate = annualRate / 12;
            const monthlyPayment = monthlyRate > 0 ? Math.round((monthlyRate * 400_000) / (1 - Math.pow(1 + monthlyRate, -360))) : null;
            const cached = mortgageLive?.isCached ?? false;
            return (
              <div className="flex flex-col gap-3 rounded-xl px-5 py-5" style={{background:"#fff",border:"1px solid #E2E8F0",borderTop:"3px solid #0F172A"}}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider leading-snug" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>Local Housing Market</p>
                  <span className="font-mono text-2xl leading-none shrink-0 font-bold" style={{color: cached ? "#94A3B8" : "#0F172A"}}>{mortgageRateStr}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>
                  {city && monthlyPayment ? `In ${city}, this rate means a $400K home costs approximately $${monthlyPayment.toLocaleString()} per month. Local rental markets typically move in the same direction as mortgage rates.` : `At this rate, a $400K home costs approximately $${monthlyPayment?.toLocaleString() ?? "—"} per month.`}
                </p>
                <p className="text-[10px]" style={{color:"#94A3B8",fontFamily:"Inter,sans-serif"}}>30-Year Fixed · Freddie Mac via FRED{cached && " (cached)"}</p>
              </div>
            );
          })()}

          {fairMarketRent.rent_2br && (
            <div className="flex flex-col gap-3 rounded-xl px-5 py-5" style={{background:"#fff",border:"1px solid #E2E8F0",borderTop:"3px solid #F43F5E"}}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider leading-snug" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>Fair Market Rent (2BR)</p>
                <span className="font-mono text-2xl leading-none shrink-0 font-bold" style={{color:"#0F172A"}}>${fairMarketRent.rent_2br.toLocaleString()}</span>
              </div>
              <span className="self-start text-[10px] font-semibold px-2 py-1 rounded" style={{background:"#FFF1F2",color:"#BE123C",fontFamily:"Inter,sans-serif"}}>{fairMarketRent.areaname}</span>
              <p className="text-xs leading-relaxed" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>
                HUD&apos;s official fair market rent for a 2-bedroom in your area. Anything above this means you&apos;re paying a market premium.
                {fairMarketRent.rent_1br && ` 1BR: $${fairMarketRent.rent_1br.toLocaleString()} · Studio: $${fairMarketRent.rent_0br?.toLocaleString()}`}
              </p>
              <p className="text-[10px]" style={{color:"#94A3B8",fontFamily:"Inter,sans-serif"}}>HUD Fair Market Rents{fairMarketRent.year ? ` · FY${fairMarketRent.year}` : ""}</p>
            </div>
          )}

          {metroUnemployment.value && (
            <div className="flex flex-col gap-3 rounded-xl px-5 py-5" style={{background:"#fff",border:"1px solid #E2E8F0",borderTop:"3px solid #1B4FD8"}}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider leading-snug" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>Local Unemployment</p>
                <span className="font-mono text-2xl leading-none shrink-0 font-bold" style={{color:"#0F172A"}}>{metroUnemployment.value}%</span>
              </div>
              <span className="self-start text-[10px] font-semibold px-2 py-1 rounded" style={{background:"#EFF6FF",color:"#1E40AF",fontFamily:"Inter,sans-serif"}}>{metroUnemployment.metro}</span>
              <p className="text-xs leading-relaxed" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>The actual unemployment rate for your metro area — not the national average. This tells you how tight or loose the local job market really is where you live.</p>
              <p className="text-[10px]" style={{color:"#94A3B8",fontFamily:"Inter,sans-serif"}}>{metroUnemployment.source}{metroUnemployment.period ? ` · ${metroUnemployment.period}` : ""}</p>
            </div>
          )}
        </div>
        <p className="mt-3 text-[10px]" style={{color:"#94A3B8",fontFamily:"Inter,sans-serif"}}>Local data is based on your city. For the most accurate figures, check your state&apos;s labor department website.</p>
      </section>

      <section>
        <div className="rounded-lg px-5 py-3 mb-4 flex items-center gap-3" style={{background:"#1E293B",border:"1px solid #334155"}}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{background:"#F43F5E"}} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{color:"#F8FAFC",fontFamily:"Inter,sans-serif"}}>Global Context · IMF &amp; World Bank</span>
        </div>
        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{background:"#1B4FD8"}}/><span className="text-[10px]" style={{color:"#94A3B8",fontFamily:"Inter,sans-serif"}}>IMF</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{background:"#0F6E56"}}/><span className="text-[10px]" style={{color:"#94A3B8",fontFamily:"Inter,sans-serif"}}>World Bank</span></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {([
            { key: "GDP_GROWTH", name: "GDP Growth", accentColor: "#1B4FD8", explain: "How fast the total US economy is growing. Above 2% is healthy. Two consecutive negative quarters = recession.", deltaLabel: (v: string) => parseFloat(v) >= 2 ? "Healthy growth" : "Below target", deltaGood: (v: string) => parseFloat(v) >= 2 },
            { key: "GOVT_DEBT", name: "Gov. Debt / GDP", accentColor: "#1B4FD8", explain: "The US owes more than it produces in a year. High debt can crowd out spending on healthcare and infrastructure.", deltaLabel: (v: string) => parseFloat(v) > 100 ? "Above 100% — elevated" : "Below 100%", deltaGood: (v: string) => parseFloat(v) <= 100 },
            { key: "CURRENT_ACCOUNT", name: "Current Account", accentColor: "#1B4FD8", explain: "The US buys more from the world than it sells. This deficit is funded by foreign investment flowing into US assets.", deltaLabel: (v: string) => parseFloat(v) < 0 ? "Trade deficit" : "Trade surplus", deltaGood: (v: string) => parseFloat(v) >= 0 },
            { key: "GDP_PER_CAPITA", name: "GDP Per Capita", accentColor: "#0F6E56", explain: "Total economic output divided by population — a rough measure of average living standards. Inequality means most earn far below this.", deltaLabel: () => "Among world's highest", deltaGood: () => true },
            { key: "GINI", name: "Income Inequality", accentColor: "#0F6E56", explain: "Scored 0–1. Zero means everyone earns the same. The US at ~0.49 is among the most unequal wealthy nations — Denmark is 0.29.", deltaLabel: (v: string) => parseFloat(v) > 0.4 ? "High inequality" : "Moderate", deltaGood: (v: string) => parseFloat(v) <= 0.4 },
            { key: "POVERTY_RATE", name: "Poverty Rate", accentColor: "#0F6E56", explain: "Share of Americans below the poverty line (~$30K/year for a family of 4). Doesn't capture cost-of-living differences between cities.", deltaLabel: (v: string) => parseFloat(v) > 15 ? "Above avg" : "Near average", deltaGood: (v: string) => parseFloat(v) <= 15 },
          ] as Array<{key: string; name: string; accentColor: string; explain: string; deltaLabel: (v: string) => string; deltaGood: (v: string) => boolean}>).map((meta) => {
            const indicator = (globalIndicators as GlobalIndicators)[meta.key];
            const rawValue = indicator?.value ?? null;
            const formatted = rawValue ? formatGlobalValue(meta.key, rawValue) : null;
            const year = indicator?.year;
            return (
              <div key={meta.key} className="flex flex-col gap-3 rounded-xl px-5 py-5" style={{background:"#fff",border:"1px solid #E2E8F0",borderTop:`3px solid ${meta.accentColor}`}}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider leading-snug" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>{meta.name}</p>
                  {formatted ? <span className="font-mono text-2xl leading-none shrink-0 font-bold" style={{color:"#0F172A"}}>{formatted}</span> : <span className="text-xs leading-none shrink-0" style={{color:"#CBD5E1",fontFamily:"Inter,sans-serif"}}>loading…</span>}
                </div>
                {formatted && <span className="self-start text-[10px] font-semibold px-2 py-1 rounded" style={{background: meta.deltaGood(rawValue!) ? "#F0FDF4" : "#FEF2F2", color: meta.deltaGood(rawValue!) ? "#166534" : "#991B1B", fontFamily:"Inter,sans-serif"}}>{meta.deltaLabel(rawValue!)}</span>}
                <p className="text-xs leading-relaxed" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>{meta.explain}</p>
                <p className="text-[10px]" style={{color:"#94A3B8",fontFamily:"Inter,sans-serif"}}>{indicator?.source ?? "IMF / World Bank"}{year ? ` · ${year}` : ""}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-5 flex items-center gap-2" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{background:"#3B82F6"}} />
          What&apos;s affecting you right now
        </h2>
        {topEvents.length === 0 ? <p className="text-sm" style={{color:"#94A3B8",fontFamily:"Inter,sans-serif"}}>No high-impact events published yet.</p> : (
          <div className="flex flex-col gap-3">
            {topEvents.map((ev: typeof topEvents[0]) => (
              <Link key={ev.id} href={`/feed/${ev.slug}`} className="flex flex-col gap-2 rounded-xl px-5 py-4 transition-shadow hover:shadow-md" style={{background:"#fff",border:"1px solid #E2E8F0"}}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded" style={{background:"#F1F5F9",color:"#475569",fontFamily:"Inter,sans-serif"}}>{PILLAR_LABEL[ev.pillar]}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded" style={{background:"#FEE2E2",color:"#DC2626",fontFamily:"Inter,sans-serif"}}>HIGH IMPACT</span>
                </div>
                <p className="font-semibold text-base leading-snug" style={{color:"#0F172A",fontFamily:"Inter,sans-serif"}}>{ev.title}</p>
                <p className="text-xs line-clamp-2" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>{ev.summary}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{background:"#F43F5E"}} />
            Your recent questions
          </h2>
          <Link href="/ask" className="text-xs font-semibold transition-colors" style={{color:"#F43F5E",fontFamily:"Inter,sans-serif"}}>Ask new →</Link>
        </div>
        {recentQuestions.length === 0 ? (
          <div className="rounded-xl px-5 py-8 text-center" style={{background:"#fff",border:"1px solid #E2E8F0"}}>
            <p className="text-sm" style={{color:"#94A3B8",fontFamily:"Inter,sans-serif"}}>You haven&apos;t asked anything yet.</p>
            <Link href="/ask" className="mt-3 inline-block text-xs font-semibold transition-colors" style={{color:"#F43F5E",fontFamily:"Inter,sans-serif"}}>Ask the Economist →</Link>
          </div>
        ) : (
          <div className="flex flex-col rounded-xl overflow-hidden" style={{border:"1px solid #E2E8F0"}}>
            {recentQuestions.map((q: typeof recentQuestions[0]) => (
              <div key={q.id} className="px-5 py-4 transition-colors" style={{borderBottom:"1px solid #F1F5F9"}}>
                <p className="text-sm font-semibold leading-snug" style={{color:"#0F172A",fontFamily:"Inter,sans-serif"}}>{q.question}</p>
                <p className="mt-1.5 text-xs line-clamp-2 leading-relaxed" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>
                  {(() => { const c = q.answer.replace(/\*\*/g, "").replace(/\*/g, "").trim(); return c.slice(0, 160) + (c.length > 160 ? "…" : ""); })()}
                </p>
                <p className="mt-2 font-mono text-[10px]" style={{color:"#94A3B8"}}>{new Date(q.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{background:"#1E293B"}} />
            Saved events
          </h2>
          <Link href="/saved" className="text-xs font-semibold transition-colors" style={{color:"#F43F5E",fontFamily:"Inter,sans-serif"}}>See all →</Link>
        </div>
        {savedEvents.length === 0 ? (
          <div className="rounded-xl px-5 py-8 text-center" style={{background:"#fff",border:"1px solid #E2E8F0"}}>
            <p className="text-sm" style={{color:"#94A3B8",fontFamily:"Inter,sans-serif"}}>No saved events yet.</p>
            <Link href="/feed" className="mt-3 inline-block text-xs font-semibold transition-colors" style={{color:"#F43F5E",fontFamily:"Inter,sans-serif"}}>Browse the feed →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedEvents.map((se: typeof savedEvents[0]) => (
              <Link key={se.id} href={`/feed/${se.event.slug}`} className="flex flex-col gap-2 rounded-xl px-4 py-4 transition-shadow hover:shadow-md" style={{background:"#fff",border:"1px solid #E2E8F0"}}>
                <span className="self-start text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded" style={{background:"#F1F5F9",color:"#475569",fontFamily:"Inter,sans-serif"}}>{PILLAR_LABEL[se.event.pillar]}</span>
                <p className="font-semibold text-sm leading-snug line-clamp-2" style={{color:"#0F172A",fontFamily:"Inter,sans-serif"}}>{se.event.title}</p>
                <p className="text-[10px]" style={{color:"#94A3B8",fontFamily:"Inter,sans-serif"}}>Saved · {new Date(se.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
