import googleTrends from "google-trends-api";
import { prisma } from "@/lib/prisma";

// Surfaces "what people are actually searching for" alongside the reviewed
// Evidence Card library, for the My Economist starter-question list. Uses
// Google Trends because it's the only zero-cost, no-signup source of real
// search-interest data — Carlos confirmed this tradeoff explicitly
// (2026-09-08): there is no official Google Trends API, so this hits
// Trends' public (undocumented) endpoints via an unofficial client. That
// means it can break or get rate-limited without notice and isn't
// sanctioned by Google's terms of service — acceptable for a first version,
// meant to be swapped for a paid SEO/keyword API (SerpApi, DataForSEO, etc.)
// later if reliability becomes a problem. Every call is wrapped so a Trends
// outage degrades to "show nothing new," never a crash — getStarterTopics()
// in starter-questions.ts falls back to the existing reviewed-library
// questions whenever this table comes back empty.

// Seed terms anchor Trends' "related queries" to economics topics; without
// a seed, Trends has no way to know what category to look in. Kept aligned
// with the Evidence Card library's actual coverage areas (rates, inflation,
// jobs, housing) plus a couple of perennially high-interest terms (student
// loans, stock market) so the list stays relevant to what My Economist can
// actually speak to.
const SEED_TOPICS = [
  "interest rates",
  "inflation",
  "federal reserve",
  "mortgage rates",
  "unemployment rate",
  "stock market",
  "student loans",
  "recession",
];

const MAX_TOPICS_STORED = 10;

interface RisingQuery {
  query: string;
  value: number | string;
}

async function fetchRisingQueriesFor(seedTopic: string): Promise<RisingQuery[]> {
  try {
    const raw = await googleTrends.relatedQueries({
      keyword: seedTopic,
      geo: "US",
    });
    const parsed = JSON.parse(raw);
    const rankedList =
      parsed?.default?.rankedList?.find(
        (l: { rankedKeyword?: unknown[] }) => Array.isArray(l.rankedKeyword) && l.rankedKeyword.length > 0
      ) ?? parsed?.default?.rankedList?.[0];
    const items = rankedList?.rankedKeyword ?? [];
    return items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => ({ query: item?.query as string, value: item?.value ?? item?.formattedValue }))
      .filter((item: RisingQuery) => typeof item.query === "string" && item.query.length > 0);
  } catch (err) {
    console.error(`[trends] relatedQueries failed for "${seedTopic}":`, err instanceof Error ? err.message : err);
    return [];
  }
}

// Some economics jargon (tickers, raw index names) makes for a confusing
// starter-question button; skip anything under 3 characters or that's just
// a bare number/symbol, which Trends occasionally returns.
function isUsablePhrase(term: string): boolean {
  const trimmed = term.trim();
  if (trimmed.length < 3) return false;
  if (/^[\d.$%\s]+$/.test(trimmed)) return false;
  return true;
}

export async function fetchAndCacheTrendingTopics(): Promise<number> {
  const collected: { term: string; seedTopic: string; rank: number }[] = [];
  const seen = new Set<string>();

  for (const seedTopic of SEED_TOPICS) {
    const rising = await fetchRisingQueriesFor(seedTopic);
    rising.forEach((item, idx) => {
      const term = item.query.trim();
      const key = term.toLowerCase();
      if (!isUsablePhrase(term) || seen.has(key)) return;
      seen.add(key);
      collected.push({ term, seedTopic, rank: idx });
    });
  }

  const top = collected.slice(0, MAX_TOPICS_STORED);

  if (top.length === 0) {
    console.warn("[trends] No usable trending topics fetched this run — leaving existing cache in place");
    return 0;
  }

  // Replace-all, same pattern as other daily caches in this app (e.g.
  // EconomicIndicator): simplest way to guarantee stale terms don't linger.
  await prisma.$transaction([
    prisma.trendingTopic.deleteMany({}),
    prisma.trendingTopic.createMany({
      data: top.map((t) => ({ term: t.term, seedTopic: t.seedTopic, rank: t.rank })),
    }),
  ]);

  console.log(`[trends] Cached ${top.length} trending topics`);
  return top.length;
}

export async function getCachedTrendingTopics(limit = 6) {
  return prisma.trendingTopic.findMany({
    orderBy: { rank: "asc" },
    take: limit,
  });
}
