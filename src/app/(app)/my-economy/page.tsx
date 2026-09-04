export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";
import { cookies } from "next/headers";
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
  { key: "CPI", name: "Inflation Rate (CPI)", source: "Bureau of Labor Statistics", fallbackValue: "2.4%", fallbackDate: "March 2025", meaning: (s) => { if (s === "RENTER") return "Your rent and grocery costs are rising slower than last year, but prices aren't falling — they're just increasing less quickly."; if (s === "OWNER") return "Slower inflation reduces pressure on the Fed to keep rates high, which could ease mortgage costs over time."; if (s === "STUDENT") return "Tuition and everyday costs are stabilizing, but your dollar still buys less than it did two years ago."; if (s === "SELF_EMPLOYED") return "Input costs for your business are rising more slowly — a modest relief for margins."; return "Prices are rising more slowly than at the 2022 peak, but everyday goods still cost more than they did two years ago."; } },
  { key: "FEDFUNDS", name: "Federal Funds Rate", source: "Federal Reserve", fallbackValue: "4.25–4.50%", fallbackDate: "March 2025", meaning: (s) => { if (s === "RENTER") return "High rates keep mortgage borrowing expensive, which reduces home buying competition and can hold rents steadier."; if (s === "OWNER") return "Refinancing is still costly at this level. Most economists expect gradual cuts — watch Fed meeting dates."; if (s === "STUDENT") return "Federal student loan rates are set separately, but private loan rates remain elevated alongside this benchmark."; if (s === "SELF_EMPLOYED") return "Business lines of credit and small business loans are expensive right now. Fixed-rate financing where possible is worth exploring."; return "This is the rate banks charge each other overnight — it ripples into mortgages, credit cards, and savings account yields."; } },
  { key: "UNRATE", name: "Unemployment Rate", source: "Bureau of Labor Statistics", fallbackValue: "4.2%", fallbackDate: "March 2025", meaning: (s) => { if (s === "RENTER") return "A healthy job market means most renters have stable income, though wage growth has cooled from its peak."; if (s === "OWNER") return "Low unemployment supports home values — fewer forced sales keep supply tight in most markets."; if (s === "STUDENT") return "The job market remains competitive for new graduates in some fields. Entry-level hiring is softer than 2021–2022."; if (s === "SELF_EMPLOYED") return "Consumer spending holds up when employment is strong — a tailwind for businesses serving everyday customers."; return "Historically low — below 5% is considered full employment by most economists. Layoffs remain concentrated in specific sectors."; } },
  { key: "CONSCONF", name: "Consumer Confidence", source: "University of Michigan via FRED", fallbackValue: "68.0", fallbackDate: "March 2025", meaning: (s) => { if (s === "RENTER") return "When consumers feel pessimistic, landlords face pressure to hold rents steady or offer concessions. Falling confidence often precedes job market softening by 6–12 months."; if (s === "OWNER") return "Low consumer confidence typically precedes lower home sales volume — fewer buyers means longer days on market and more negotiating room for buyers."; if (s === "STUDENT") return "Consumer sentiment predicts hiring. When confidence falls, businesses cut hiring budgets first. A reading below 70 historically signals tighter job markets within a year."; if (s === "SELF_EMPLOYED") return "Consumer confidence is a direct leading indicator for small business revenue. When people feel financially insecure, discretionary spending drops first — which hits small businesses hardest."; return "The University of Michigan Consumer Sentiment Index measures how optimistic Americans feel about their finances. Readings above 80 signal expansion; below 70 often precede recessions."; } },
  { key: "REALWAGES", name: "Avg. Hourly Earnings", source: "Bureau of Labor Statistics via FRED", fallbackValue: "$30.15", fallbackDate: "March 2025", meaning: (s) => { if (s === "RENTER") return "This is the average hourly wage for production workers nationally. If your wages are below this, you're earning less than the median."; if (s === "OWNER") return "Rising wages support home values by keeping more buyers in the market. If wage growth outpaces inflation, purchasing power is improving."; if (s === "STUDENT") return "This is the wage floor you're entering. Whether your starting salary is above or below this benchmark signals how your field pays relative to the broader workforce."; if (s === "SELF_EMPLOYED") return "When average wages rise, consumer spending tends to follow — which supports demand for independent businesses and services."; return "The average hourly wage for production and nonsupervisory workers. Compare this to CPI — if wages are rising faster than prices, workers are gaining real purchasing power."; } },
];

export default async function MyEconomyPage() {
  const cookieStore = cookies();
  const guestId = cookieStore.get("se_user_id")?.value ?? null;

  const [user, liveIndicators] = await Promise.all([
    guestId
      ? prisma.user.findUnique({
          where: { guestId },
          select: { id: true, situation: true, city: true, onboardingComplete: true },
        })
      : null,
    fetchAllIndicators(),
  ]);

  const situation = user?.situation ?? null;
  const city = user?.city ?? null;
  const situationStr = situation ? situationLabel(situation as Situation) : null;

  return (
    <div className="flex flex-col gap-8">

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {INDICATOR_META.map((meta) => {
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
              const markerPct = validRaw ? Math.min(100, Math.max(0, (raw / 140) * 100)) : 0;
              const avgPct = (HIST_AVG / 140) * 100;
              const sentiment_word = !validRaw ? "uncertain" : raw >= 90 ? "optimistic" : raw >= 70 ? "cautious" : "pessimistic";
              return (
                <div key={meta.key} className="flex flex-col gap-2.5 rounded-xl px-4 py-4" style={{background:"#fff",border:"1px solid #E2E8F0",borderTop:"3px solid #F43F5E"}}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider leading-snug" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>{meta.name}</p>
                    {unavailable ? <span className="text-xs leading-none shrink-0" style={{color:"#CBD5E1",fontFamily:"Inter,sans-serif"}}>unavailable</span>
                    : sentiment ? <span className="font-mono text-sm font-bold leading-none shrink-0 whitespace-nowrap" style={{color: cached ? "#94A3B8" : "#0F172A"}}>{sentiment.label} ({value})</span>
                    : <span className="font-mono text-2xl leading-none shrink-0 text-primary-black">{value}</span>}
                  </div>
                  {validRaw && !unavailable && (
                    <div className="relative h-2 flex rounded overflow-hidden" style={{border:"1px solid #E2E8F0"}}>
                      <div className="bg-primary-red" style={{ width: "42.8%" }} />
                      <div className="bg-primary-yellow border-x border-primary-black" style={{ width: "21.4%" }} />
                      <div className="bg-[#3D8A55] flex-1" />
                      <div className="absolute top-0 bottom-0 w-px bg-primary-black opacity-60" style={{ left: `${avgPct}%` }} />
                      <div className="absolute top-0 bottom-0 w-0.5 bg-primary-black" style={{ left: `${markerPct}%` }} />
                    </div>
                  )}
                  <p className="text-xs leading-relaxed" style={{color:"#64748B",fontFamily:"Inter,sans-serif"}}>
                    {unavailable ? "Data temporarily unavailable." : validRaw ? `Americans feel ${sentiment_word} about the economy right now (avg: 86).` : meta.meaning(situation)}
                  </p>
                  <p className="text-[10px]" style={{color:"#94A3B8",fontFamily:"Inter,sans-serif"}}>{meta.source} · {date}{cached && <span className="ml-1">(cached)</span>}</p>
                </div>
              );
            }
            return (
              <div key={meta.key} className="flex flex-col gap-2.5 rounded-xl px-4 py-4" style={{background:"#fff",border:"1px solid #E2E8F0",borderTop:"3px solid #F43F5E"}}>
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

    </div>
  );
}
