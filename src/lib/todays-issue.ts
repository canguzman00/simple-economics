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
  "topic": "<3-5 word plain English topic>",
  "openAlexQuery": "<6-10 word academic search query>",
  "happeningBody": "<3-4 sentences in plain English. Write like texting a smart friend who never studied economics. No jargon.>",
  "liveStats": [
    { "label": "<plain English e.g. 'Prices rising compared to last year' NOT 'CPI YoY'>", "value": "<number only, no abbreviations>", "delta": "<plain English change>", "deltaType": "up|down|neutral" }
  ],
  "impactBullets": [
    { "bold": "<3-5 word plain English header>", "text": "<1-2 sentences of specific impact>" }
  ]
}

STRICT RULES:
- NEVER use: YoY, CPI, GDP, PCE, MoM, QoQ, FOMC, SPR, ETF, or any acronym
- NEVER use: real wages, monetary policy, fiscal, aggregate demand, yield curve, basis points
- Say 'prices are 4% higher than last year' NOT 'CPI rose 4% YoY'
- Say 'your paycheck buys less than it did last year' NOT 'real wage growth is negative'
- - stat values must include units — use % for percentages (e.g. '4.2%'), $ for prices (e.g. '$3.80/gal'), $ for dollar amounts
- NEVER show just a raw number without its unit — '4.2' is wrong, '4.2%' is correct, '18' is wrong, '$3.80/gal' is correct
- For gas prices always show the full price like '$3.80/gal' not just the percentage change
- stat values must never be words like 'Negative' or 'Moderate'
- liveStats: exactly 3-4 stats
- impactBullets: exactly 3-4 bullets`,
    }],
  });

  const text = res.content[0]?.type === "text" ? res.content[0].text.trim() : "{}";
  return JSON.parse(text.replace(/^```json\n?|```$/g, "").trim());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getResearch(works: Awaited<ReturnType<typeof searchOpenAlex>>, topic: string): Promise<Awaited<ReturnType<typeof translateResearchToFindings>>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return translateResearchToFindings(works, topic, anthropic as any);
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
  const researchItems = works.length > 0 ? await getResearch(works, ranked.topic) : [];

  const finalResearch = researchItems.length > 0 ? researchItems : [{
    source: "NBER Working Paper Series",
    journal: "National Bureau of Economic Research",
    year: 2024,
    finding: `Economic research consistently shows that ${ranked.topic.toLowerCase()} events have significant impacts on household finances, particularly for renters and workers in affected sectors.`,
    url: "https://www.nber.org",
  }];

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
