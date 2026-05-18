import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";
import type { Pillar, Impact, Tier } from "@prisma/client";

export const CACHE_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

interface GuardianArticle {
  id: string;
  webTitle: string;
  webUrl: string;
  webPublicationDate: string;
  fields?: {
    trailText?: string;
    bodyText?: string;
  };
}

interface ClassifiedArticle {
  summary: string;
  contentType: string;
  pillar: Pillar;
  impact: Impact;
}

const ECONOMIC_KEYWORDS = [
  "economy", "inflation", "recession", "GDP", "unemployment", "interest rate",
  "Federal Reserve", "central bank", "trade", "tariff", "fiscal", "monetary",
  "debt", "deficit", "budget", "market", "housing", "wages", "jobs", "growth",
];

async function classifyArticle(
  title: string,
  description: string,
  source: string
): Promise<ClassifiedArticle | null> {
  try {
    const res = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: `You are an economics educator writing for busy people. Respond with ONLY raw JSON — no markdown, no explanation.

Fields:
- "summary": 2-3 plain English sentences explaining what happened. No jargon. Write like you are explaining to a smart friend who is not an economist.
- "contentType": one of exactly: "News", "Statement", "Report", "Data release", "Analysis"
- "pillar": one of exactly: GLOBAL_ECONOMICS, GEOPOLITICS_MONEY, DEVELOPMENT_POLICY, PERSONAL_FINANCE
- "impact": one of exactly: HIGH, MEDIUM, LOW

Source: ${source}
Title: ${title}
Description: ${description.slice(0, 400)}`,
      }],
    });

    const text = res.content[0].type === "text" ? res.content[0].text.trim() : "";
    const json = JSON.parse(text.replace(/^```json\n?|```$/g, "").trim());
    return {
      summary: json.summary ?? "",
      contentType: json.contentType ?? "News",
      pillar: json.pillar,
      impact: json.impact,
    } as ClassifiedArticle;
  } catch {
    return null;
  }
}

async function fetchGuardianArticles(): Promise<GuardianArticle[]> {
  const apiKey = process.env.GUARDIAN_API_KEY;
  if (!apiKey) {
    console.error("[news] GUARDIAN_API_KEY not set");
    return [];
  }

  const since = new Date(Date.now() - CACHE_TTL_MS).toISOString().split("T")[0];

  const url = new URL("https://content.guardianapis.com/search");
  url.searchParams.set("q", "economy OR inflation OR 'interest rate' OR unemployment OR 'Federal Reserve' OR trade OR GDP OR recession OR wages OR housing");
  url.searchParams.set("section", "business|money|us-news|world");
  url.searchParams.set("from-date", since);
  url.searchParams.set("order-by", "newest");
  url.searchParams.set("page-size", "20");
  url.searchParams.set("show-fields", "trailText,bodyText");
  url.searchParams.set("api-key", apiKey);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      console.error("[news] Guardian API error:", res.status);
      return [];
    }
    const json = await res.json() as { response?: { results?: GuardianArticle[] } };
    const articles = json.response?.results ?? [];

    // Score by keyword relevance and pick top 5
    const scored = articles
      .map((a) => {
        const text = (a.webTitle + " " + (a.fields?.trailText ?? "")).toLowerCase();
        const score = ECONOMIC_KEYWORDS.filter((kw) => text.includes(kw.toLowerCase())).length;
        return { article: a, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s) => s.article);

    return scored;
  } catch (err) {
    console.error("[news] Guardian fetch error:", err);
    return [];
  }
}

async function processGuardianArticles(articles: GuardianArticle[]): Promise<void> {
  for (const article of articles) {
    try {
      const existing = await prisma.newsCache.findUnique({ where: { url: article.webUrl } });
      if (existing) continue;

      const description = article.fields?.trailText ?? article.fields?.bodyText?.slice(0, 400) ?? article.webTitle;
      const classified = await classifyArticle(article.webTitle, description, "The Guardian");
      if (!classified) continue;

      // Determine tier based on content
      const text = (article.webTitle + " " + description).toLowerCase();
      const isNational = text.includes("us ") || text.includes("america") || text.includes("federal reserve") || text.includes("congress");
      const tier: Tier = isNational ? "NATIONAL" : "GLOBAL";

      await prisma.newsCache.create({
        data: {
          title: article.webTitle,
          summary: classified.summary,
          fullExplanation: "",
          url: article.webUrl,
          source: "The Guardian",
          contentType: "News",
          publishedAt: new Date(article.webPublicationDate),
          pillar: classified.pillar,
          impact: classified.impact,
          tier,
          region: null,
        },
      });
    } catch (err) {
      console.error("[news] failed to process Guardian article:", err);
    }
  }
}

export async function fetchAndCacheNews(): Promise<void> {
  const articles = await fetchGuardianArticles();
  await processGuardianArticles(articles);
}

export async function getCachedNews(
  tier?: Tier,
  region?: string
): Promise<ReturnType<typeof prisma.newsCache.findMany> extends Promise<infer T> ? T : never> {
  const since = new Date(Date.now() - CACHE_TTL_MS);

  return prisma.newsCache.findMany({
    where: {
      publishedAt: { gte: since },
      ...(tier ? { tier } : {}),
      ...(tier === "REGIONAL" && region ? { region } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 10,
  });
}

export function isCacheStale(oldestCreatedAt: Date | null): boolean {
  if (!oldestCreatedAt) return true;
  const ageMs = Date.now() - oldestCreatedAt.getTime();
  return ageMs > 6 * 60 * 60 * 1000; // refresh every 6 hours
}
