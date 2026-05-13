import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";
import type { Pillar, Impact, Tier } from "@prisma/client";

export const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsAPIArticle {
  title: string;
  description: string | null;
  url: string;
  source: { name: string };
  publishedAt: string;
}

interface ClassifiedArticle {
  summary: string;
  bullets: string[];
  pillar: Pillar;
  impact: Impact;
}

// ─── AI classification ────────────────────────────────────────────────────────

async function classifyArticle(
  title: string,
  description: string
): Promise<ClassifiedArticle | null> {
  try {
    const res = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 350,
      messages: [
        {
          role: "user",
          content: `You are an economics educator. Respond with a JSON object — no markdown, no explanation, only raw JSON — with these exact fields:
- "summary": 2 plain-language sentences explaining what happened
- "fullExplanation": 1 sentence explaining what this means for ordinary people
- "pillar": exactly one of GLOBAL_ECONOMICS, GEOPOLITICS_MONEY, DEVELOPMENT_POLICY, PERSONAL_FINANCE
- "impact": exactly one of HIGH, MEDIUM, LOW

Article title: ${title}
Article description: ${description.slice(0, 300)}`,
        },
      ],
    });

    const text = res.content[0].type === "text" ? res.content[0].text.trim() : "";
    const json = JSON.parse(text.replace(/^```json\n?|```$/g, "").trim());
    return {
      summary: json.summary ?? "",
      bullets: Array.isArray(json.bullets) ? json.bullets : [json.fullExplanation ?? json.summary ?? ""],
      pillar: json.pillar,
      impact: json.impact,
    } as ClassifiedArticle;
  } catch {
    return null;
  }
}

// ─── NewsAPI fetch ────────────────────────────────────────────────────────────

async function fetchNewsAPIArticles(
  keywords: string,
  pageSize: number
): Promise<NewsAPIArticle[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) return [];

  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", keywords);
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("language", "en");
  url.searchParams.set("apiKey", apiKey);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];

  const json = await res.json() as { articles?: NewsAPIArticle[] };
  return json.articles?.filter((a) => a.title && a.description && a.url) ?? [];
}

// ─── Process and cache articles ───────────────────────────────────────────────

async function processArticles(
  articles: NewsAPIArticle[],
  tier: Tier,
  region?: string
): Promise<void> {
  // Process max 3 articles per tier to stay within Vercel timeout
  const toProcess = articles.slice(0, 3);
  for (const article of toProcess) {
    try {
      const existing = await prisma.newsCache.findUnique({ where: { url: article.url } });
      if (existing) continue;

      const classified = await classifyArticle(
        article.title,
        article.description ?? article.title
      );
      if (!classified) continue;

      await prisma.newsCache.create({
        data: {
          title: article.title,
          summary: classified.summary,
          fullExplanation: JSON.stringify(classified.bullets),
          url: article.url,
          source: article.source.name,
          publishedAt: new Date(article.publishedAt),
          pillar: classified.pillar,
          impact: classified.impact,
          tier,
          region: region ?? null,
        },
      });
    } catch (err) {
      console.error("[news] failed to process article:", err);
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchAndCacheNews(region?: string): Promise<void> {
  const [globalArticles, nationalArticles] = await Promise.all([
    fetchNewsAPIArticles(
      "global economy OR trade war OR oil prices OR central bank OR IMF OR World Bank OR currency crisis",
      3
    ),
    fetchNewsAPIArticles(
      "US economy OR Federal Reserve OR inflation OR unemployment OR GDP OR jobs report OR recession",
      3
    ),
  ]);

  const tasks: Promise<void>[] = [
    processArticles(globalArticles, "GLOBAL"),
    processArticles(nationalArticles, "NATIONAL"),
  ];

  if (region) {
    const regionalArticles = await fetchNewsAPIArticles(
      `${region} economy OR ${region} jobs OR ${region} housing OR ${region} unemployment`,
      3
    );
    tasks.push(processArticles(regionalArticles, "REGIONAL", region));
  }

  await Promise.all(tasks);
}

export async function getCachedNews(
  tier?: Tier,
  region?: string
): Promise<ReturnType<typeof prisma.newsCache.findMany> extends Promise<infer T> ? T : never> {
  const since = new Date(Date.now() - CACHE_TTL_MS);

  return prisma.newsCache.findMany({
    where: {
      createdAt: { gte: since },
      ...(tier ? { tier } : {}),
      ...(tier === "REGIONAL" && region ? { region } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });
}

export function isCacheStale(oldestCreatedAt: Date | null): boolean {
  if (!oldestCreatedAt) return true;
  // Refresh if last fetch was more than 24 hours ago
  const ageMs = Date.now() - oldestCreatedAt.getTime();
  return ageMs > CACHE_TTL_MS;
}
