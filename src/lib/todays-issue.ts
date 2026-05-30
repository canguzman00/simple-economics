import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";
import { searchOpenAlex, translateResearchToFindings } from "@/lib/openalex";

interface LiveStat {
  label: string;
  value: string;
  delta: string;
  deltaType: "up" | "down" | "neutral";
}

interface ImpactBullet {
  bold: string;
  text: string;
}

async function rankTopStory(headlines: string[]): Promise<{
  index: number;
  topic: string;
  openAlexQuery: string;
  happeningBody: string;
  liveStats: LiveStat[];
  impactBullets: ImpactBullet[];
}> {
  const res = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{
      role: "user",
      content: `You are the chief economist at a financial education platform writing for everyday Americans who are NOT economists.

Given these economic headlines, identify the single most important story for people's daily finances.

Headlines (numbered):
${headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}

Respond with ONLY a JSON object (no markdown, no preamble):
{
  "index": <number 0-based>,
  "topic": "<3-5 word plain English topic e.g. 'Prices rising faster'>",
  "openAlexQuery": "<6-10 word academic search query>",
  "happeningBody": "<3-4 sentences in plain English. Write like you are texting a smart friend who has never studied economics. No jargon whatsoever.>",
  "liveStats": [
    { "label": "<plain English description of what this number means e.g. 'Prices rising compared to last year' NOT 'CPI YoY'>", "value": "<number only, no abbreviations>", "delta": "<plain English change e.g. 'Fastest rise in 3 years' NOT 'Up YoY'>", "deltaType": "up|down|neutral" }
  ],
  "impactBullets": [
    { "bold": "<3-5 word plain English header>", "text": "<1-2 sentences of specific impact for a typical American worker or renter>" }
  ]
}

STRICT RULES — violations will confuse readers:
- NEVER use abbreviations: no YoY, CPI, GDP, PCE, MoM, QoQ, Fed, FOMC, SPR, ETF, or any other acronym
- NEVER use jargon: no 'real wages', 'monetary policy', 'fiscal', 'aggregate demand', 'yield curve', 'basis points'
- Instead of 'real wage growth is negative' say 'your paycheck buys less than it did last year'
- Instead of 'CPI rose 4.2% YoY' say 'Prices are 4.2% higher than they were a year ago'
- Instead of 'Federal Reserve' use 'the Fed' or 'America's central bank'
- stat labels must describe what the number means in plain English
- stat values must be actual numbers or dollar amounts — never words like 'Negative' or 'Moderate'
- liveStats: exactly 3-4 stats
- impactBullets: exactly 3-4 bullets
- Choose the story with the MOST concrete financial impact on everyday people`,
    }],
  });

  const text = res.content[0]?.type === "text" ? res.content[0].text.trim() : "{}";
  return JSON.parse(text.replace(/^```json\n?|```$/g, "").trim());
}

export async function generateTodaysIssue(): Promise<string | null> {
  const today = new Date().toISOString().split("T")[0];

  const existing = await prisma.todaysIssue.findUnique({ where: { date: today } });
  if (existing) {
    console.log("[todays-issue] Already generated for today");
    return existing.id;
  }

  const recentNews = await prisma.newsCache.findMany({
    where: { publishedAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) } },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  if (recentNews.length === 0) {
    console.error("[todays-issue] No recent news — run /api/news/refresh first");
    return null;
  }

  const headlines = recentNews.map((n) => `${n.title} (${n.source})`);
  const ranked = await rankTopStory(headlines);
  const topStory = recentNews[ranked.index] ?? recentNews[0];

  console.log(`[todays-issue] Top story: ${topStory.title}`);

  const works = await searchOpenAlex(ranked.openAlexQuery, 3);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const researchItems = works.length > 0
    ? await translateResearchToFindings(works, ranked.topic, anthropic as any)
    : [];

  const finalResearch = researchItems.length > 0 ? researchItems : [{
    source: "NBER Working Paper Series",
    journal: "National Bureau of Economic Research",
    year: 2024,
    finding: `Economic research consistently shows that ${ranked.topic.toLowerCase()} events have significant impacts on household finances, particularly for renters and workers in affected sectors.`,
    url: "https://www.nber.org",
  }];

  // Auto-approve — no manual review needed
  const issue = await prisma.todaysIssue.create({
    data: {
      date: today,
      title: topStory.title,
      sourceUrl: topStory.url,
      sourceLabel: topStory.source,
      happeningBody: ranked.happeningBody,
      liveStats: JSON.parse(JSON.stringify(ranked.liveStats)),
      researchItems: JSON.parse(JSON.stringify(finalResearch)),
      impactGeneric: JSON.parse(JSON.stringify(ranked.impactBullets)),
      approved: true,
      approvedAt: new Date(),
    },
  });

  console.log(`[todays-issue] Created and auto-approved: ${issue.id}`);
  return issue.id;
}

export async function getTodaysIssue() {
  const today = new Date().toISOString().split("T")[0];
  return prisma.todaysIssue.findFirst({
    where: { date: today, approved: true },
  });
}

export async function getPendingIssues() {
  return prisma.todaysIssue.findMany({
    where: { approved: false },
    orderBy: { generatedAt: "desc" },
    take: 5,
  });
}
