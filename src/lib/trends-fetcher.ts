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

// Trends' "related queries" for adjacent seeds (e.g. "interest rates" and
// "federal reserve") heavily overlap — "fed interest rate", "current
// interest rate", "interest rate today" all surface together and read as
// the same question rewritten three times. Exact-string dedup (the old
// `seen` set) doesn't catch that. Instead we reduce each term to its
// meaningful words (dropping filler like "today"/"current"/"latest" that
// carries no topic information) and treat two terms as duplicates once
// they share most of their remaining words — Jaccard similarity over the
// word sets, which catches "mortgage rates" / "mortgage rates today" /
// "current mortgage rate" as one topic without also collapsing genuinely
// different ones like "mortgage rates" and "unemployment rate".
const FILLER_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "of",
  "for", "to", "and", "or", "vs", "today", "now", "current", "currently",
  "latest", "live", "news", "update", "updates", "forecast", "prediction",
  "predictions", "2025", "2026", "new",
]);

// Crude singular/plural fold so "mortgage rate" and "mortgage rates" hash
// to the same word instead of counting as different topics — a plain word
// like "rates" vs "rate" would otherwise dodge the Jaccard check below
// even though they're clearly the same query.
function stem(word: string): string {
  return word.length > 4 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word;
}

function significantWords(term: string): Set<string> {
  const words = term
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !FILLER_WORDS.has(w))
    .map(stem);
  return new Set(words);
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  a.forEach((word) => {
    if (b.has(word)) intersection++;
  });
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

const NEAR_DUPLICATE_THRESHOLD = 0.5;

function isNearDuplicate(term: string, keptWordSets: Set<string>[]): boolean {
  const words = significantWords(term);
  if (words.size === 0) return true; // nothing but filler words — not a usable topic
  return keptWordSets.some((kept) => jaccardSimilarity(words, kept) >= NEAR_DUPLICATE_THRESHOLD);
}

// Capitalize just the first letter for storage/display — Trends returns
// everything lowercase, and the term gets embedded in a sentence by the
// caller (starter-questions.ts), where a bare capital mid-phrase would
// look wrong. This only fixes the leading letter so the term also reads
// fine on its own wherever else it's shown.
function capitalizeFirst(term: string): string {
  return term.length === 0 ? term : term[0].toUpperCase() + term.slice(1);
}

export async function fetchAndCacheTrendingTopics(): Promise<number> {
  // Fetch all seeds in parallel, then merge round-robin (one candidate per
  // seed topic per pass) instead of exhausting one seed before moving to
  // the next. Adjacent seeds like "interest rates" and "federal reserve"
  // rank very similar queries at the top of their own lists — taking the
  // first 10 in seed order would let 1-2 seeds dominate the whole list.
  // Round-robin spreads the picks across topics before going deep on any
  // one of them, so the final list actually covers rates, jobs, housing,
  // etc. rather than five phrasings of the same rate question.
  const perSeed = await Promise.all(SEED_TOPICS.map((seedTopic) => fetchRisingQueriesFor(seedTopic)));

  const collected: { term: string; seedTopic: string; rank: number }[] = [];
  const keptWordSets: Set<string>[] = [];
  const cursors = perSeed.map(() => 0);

  let addedThisPass = true;
  while (collected.length < MAX_TOPICS_STORED && addedThisPass) {
    addedThisPass = false;
    for (let seedIdx = 0; seedIdx < SEED_TOPICS.length; seedIdx++) {
      if (collected.length >= MAX_TOPICS_STORED) break;
      const rising = perSeed[seedIdx];
      while (cursors[seedIdx] < rising.length) {
        const item = rising[cursors[seedIdx]];
        cursors[seedIdx]++;
        const term = item.query.trim();
        if (!isUsablePhrase(term) || isNearDuplicate(term, keptWordSets)) continue;
        keptWordSets.push(significantWords(term));
        collected.push({ term: capitalizeFirst(term), seedTopic: SEED_TOPICS[seedIdx], rank: collected.length });
        addedThisPass = true;
        break; // one pick per seed per pass — enforces the round-robin spread
      }
    }
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
