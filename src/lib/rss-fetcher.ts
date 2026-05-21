import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";
import type { Pillar, Impact, Tier } from "@prisma/client";

interface RSSSource {
  name: string;
  url: string;
  contentType: string;
  defaultTier: Tier;
  defaultPillar: Pillar;
}

const RSS_SOURCES: RSSSource[] = [
  // US Government
  { name: "Federal Reserve", url: "https://www.federalreserve.gov/feeds/press_all.xml", contentType: "Statement", defaultTier: "NATIONAL", defaultPillar: "PERSONAL_FINANCE" },
  { name: "Bureau of Labor Statistics", url: "https://www.bls.gov/feed/news.rss", contentType: "Data release", defaultTier: "NATIONAL", defaultPillar: "PERSONAL_FINANCE" },
  { name: "US Treasury", url: "https://home.treasury.gov/news/press-releases/feed", contentType: "Statement", defaultTier: "NATIONAL", defaultPillar: "GLOBAL_ECONOMICS" },
  { name: "Congressional Budget Office", url: "https://www.cbo.gov/rss/all", contentType: "Report", defaultTier: "NATIONAL", defaultPillar: "DEVELOPMENT_POLICY" },
  { name: "Census Bureau", url: "https://www.census.gov/newsroom/press-releases.xml", contentType: "Data release", defaultTier: "NATIONAL", defaultPillar: "DEVELOPMENT_POLICY" },
  // Global Institutions
  { name: "IMF", url: "https://www.imf.org/en/news/rss?language=eng", contentType: "Report", defaultTier: "GLOBAL", defaultPillar: "GLOBAL_ECONOMICS" },
  { name: "World Bank", url: "https://www.worldbank.org/en/news/rss.xml", contentType: "Report", defaultTier: "GLOBAL", defaultPillar: "DEVELOPMENT_POLICY" },
  { name: "WTO", url: "https://www.wto.org/english/news_e/rss_e/rss_e.xml", contentType: "Report", defaultTier: "GLOBAL", defaultPillar: "GLOBAL_ECONOMICS" },
  { name: "ILO", url: "https://www.ilo.org/rss/en", contentType: "Report", defaultTier: "GLOBAL", defaultPillar: "PERSONAL_FINANCE" },
  { name: "OECD", url: "https://www.oecd.org/newsroom/rss.xml", contentType: "Report", defaultTier: "GLOBAL", defaultPillar: "GLOBAL_ECONOMICS" },
  { name: "United Nations", url: "https://news.un.org/feed/subscribe/en/news/topic/economic-development/feed/rss.xml", contentType: "Report", defaultTier: "GLOBAL", defaultPillar: "DEVELOPMENT_POLICY" },
  { name: "BIS", url: "https://www.bis.org/rss.htm", contentType: "Report", defaultTier: "GLOBAL", defaultPillar: "GLOBAL_ECONOMICS" },
  { name: "Asian Development Bank", url: "https://www.adb.org/news/rss", contentType: "Report", defaultTier: "GLOBAL", defaultPillar: "DEVELOPMENT_POLICY" },
  // Think Tanks & Research
  { name: "NBER", url: "https://www.nber.org/rss/new.xml", contentType: "Report", defaultTier: "GLOBAL", defaultPillar: "GLOBAL_ECONOMICS" },
  { name: "Brookings Institution", url: "https://www.brookings.edu/feed/", contentType: "Analysis", defaultTier: "NATIONAL", defaultPillar: "DEVELOPMENT_POLICY" },
  { name: "Peterson Institute", url: "https://www.piie.com/rss.xml", contentType: "Analysis", defaultTier: "GLOBAL", defaultPillar: "GLOBAL_ECONOMICS" },
  { name: "Economic Policy Institute", url: "https://www.epi.org/feed/", contentType: "Analysis", defaultTier: "NATIONAL", defaultPillar: "PERSONAL_FINANCE" },
  { name: "CFR", url: "https://www.cfr.org/rss/economics.xml", contentType: "Analysis", defaultTier: "GLOBAL", defaultPillar: "GEOPOLITICS_MONEY" },
  { name: "CEPR", url: "https://cepr.org/rss.xml", contentType: "Analysis", defaultTier: "GLOBAL", defaultPillar: "GLOBAL_ECONOMICS" },
  { name: "Bruegel", url: "https://www.bruegel.org/feed", contentType: "Analysis", defaultTier: "GLOBAL", defaultPillar: "GLOBAL_ECONOMICS" },
];

const ECONOMIC_KEYWORDS = [
  "economy", "economic", "inflation", "recession", "GDP", "unemployment",
  "interest rate", "federal reserve", "central bank", "trade", "tariff",
  "fiscal", "monetary", "debt", "deficit", "budget", "market", "housing",
  "wages", "jobs", "growth", "poverty", "development", "financial",
];

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g;
  let matchResult: RegExpExecArray | null;
  while ((matchResult = itemRegex.exec(xml)) !== null) {
    const item = matchResult[1];

    const title = item.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() ?? "";
    const link = item.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/)?.[1]?.trim()
      ?? item.match(/<guid[^>]*>(?:<!\[CDATA\[)?(https?:\/\/[^\s<]+)(?:\]\]>)?<\/guid>/)?.[1]?.trim()
      ?? "";
    const description = item.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1]
      ?.replace(/<[^>]+>/g, "")
      ?.trim()
      ?.slice(0, 500) ?? "";
    const pubDate = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)?.[1]?.trim()
      ?? item.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/)?.[1]?.trim()
      ?? new Date().toISOString();

    if (title && link) {
      items.push({ title, link, description, pubDate });
    }
  }

  return items;
}

function isEconomicContent(title: string, description: string): boolean {
  const text = (title + " " + description).toLowerCase();
  return ECONOMIC_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

const NEWS_SOURCES = ["The Guardian", "Reuters", "AP", "BBC"];
const INSTITUTIONAL_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const NEWS_MAX_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours

function isRecent(pubDate: string, sourceName: string): boolean {
  try {
    const date = new Date(pubDate);
    const ageMs = Date.now() - date.getTime();
    const isNewsSource = NEWS_SOURCES.some((s) => sourceName.includes(s));
    return ageMs < (isNewsSource ? NEWS_MAX_AGE_MS : INSTITUTIONAL_MAX_AGE_MS);
  } catch {
    return false;
  }
}

async function classifyRSSItem(
  title: string,
  description: string,
  source: string,
  contentType: string,
  defaultPillar: Pillar
): Promise<{ summary: string; pillar: Pillar; impact: Impact } | null> {
  try {
    const res = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: `You are an economics educator writing for busy people. Respond with ONLY raw JSON.

Fields:
- "summary": 2-3 plain English sentences explaining what this publication says. No jargon. Write for someone who is smart but not an economist.
- "pillar": one of exactly: GLOBAL_ECONOMICS, GEOPOLITICS_MONEY, DEVELOPMENT_POLICY, PERSONAL_FINANCE
- "impact": one of exactly: HIGH, MEDIUM, LOW

Source: ${source}
Type: ${contentType}
Title: ${title}
Description: ${description.slice(0, 400)}`,
      }],
    });

    const text = res.content[0].type === "text" ? res.content[0].text.trim() : "";
    const json = JSON.parse(text.replace(/^```json\n?|```$/g, "").trim());
    return {
      summary: json.summary ?? "",
      pillar: json.pillar ?? defaultPillar,
      impact: json.impact ?? "MEDIUM",
    };
  } catch {
    return null;
  }
}

async function fetchRSSSource(source: RSSSource): Promise<void> {
  try {
    const res = await fetch(source.url, {
      cache: "no-store",
      headers: { "User-Agent": "SimpleEconomics/1.0 (https://simple-economics.vercel.app)" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error(`[rss] ${source.name} returned ${res.status}`);
      return;
    }

    const xml = await res.text();
    const items = parseRSS(xml);

    const filtered = items
      .filter((item) => isRecent(item.pubDate, source.name) && isEconomicContent(item.title, item.description))
      .slice(0, 2);

    for (const item of filtered) {
      try {
        const existing = await prisma.newsCache.findUnique({ where: { url: item.link } });
        if (existing) continue;

        const classified = await classifyRSSItem(
          item.title,
          item.description,
          source.name,
          source.contentType,
          source.defaultPillar
        );
        if (!classified) continue;

        await prisma.newsCache.create({
          data: {
            title: item.title,
            summary: classified.summary,
            fullExplanation: "",
            url: item.link,
            source: source.name,
            contentType: source.contentType,
            publishedAt: new Date(item.pubDate),
            pillar: classified.pillar,
            impact: classified.impact,
            tier: source.defaultTier,
            region: null,
          },
        });

        console.log(`[rss] cached: ${source.name} — ${item.title.slice(0, 60)}`);
      } catch (err) {
        console.error(`[rss] failed to process item from ${source.name}:`, err);
      }
    }
  } catch (err) {
    console.error(`[rss] failed to fetch ${source.name}:`, err);
  }
}

export async function fetchAndCacheRSSFeeds(): Promise<void> {
  // Process in batches of 4 to avoid overwhelming the AI API
  const batchSize = 4;
  for (let i = 0; i < RSS_SOURCES.length; i += batchSize) {
    const batch = RSS_SOURCES.slice(i, i + batchSize);
    await Promise.all(batch.map(fetchRSSSource));
  }
}
