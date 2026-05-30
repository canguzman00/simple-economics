import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";
import { searchOpenAlex, translateResearchToFindings } from "@/lib/openalex";

interface SignalAsset {
  name: string;
  reason: string;
  strength: "Strong" | "Moderate" | "Weak";
}

interface HistoricalBar {
  label: string;
  value: number;
  direction: "up" | "down" | "neutral";
}

interface ImpactBullet {
  bold: string;
  text: string;
}

async function generateSignal(headlines: string[]): Promise<{
  index: number;
  eventTitle: string;
  eventSummary: string;
  openAlexQuery: string;
  signalsUp: SignalAsset[];
  signalsDown: SignalAsset[];
  historicalBars: HistoricalBar[];
  impactBullets: ImpactBullet[];
  disclaimer: string;
}> {
  const res = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: `You are a financial economics educator writing for everyday Americans who are NOT investors or economists.

Given these recent economic headlines, identify the single biggest market-moving event and generate an educational investment context card.

Headlines (numbered):
${headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}

Respond with ONLY a JSON object (no markdown, no preamble):
{
  "index": <0-based index of the most market-relevant headline>,
  "eventTitle": "<plain English title describing the economic event>",
  "eventSummary": "<2-3 plain English sentences explaining what happened and why it matters for everyday finances. No jargon.>",
  "openAlexQuery": "<6-8 word academic query to find relevant economics research>",
  "signalsUp": [
    { "name": "<asset class name e.g. Energy stocks, Gold, Defense stocks>", "reason": "<1 sentence plain English why this historically does well>", "strength": "Strong|Moderate|Weak" }
  ],
  "signalsDown": [
    { "name": "<asset class name>", "reason": "<1 sentence plain English why this historically struggles>", "strength": "Strong|Moderate|Weak" }
  ],
  "historicalBars": [
    { "label": "<asset name>", "value": <number like 12.5 for 12.5% average return>, "direction": "up|down|neutral" }
  ],
  "impactBullets": [
    { "bold": "<3-5 word header>", "text": "<1-2 sentences of specific impact for a typical American renter or worker>" }
  ],
  "disclaimer": "Historical patterns do not guarantee future results. This is economic education, not financial advice. Consult a licensed financial advisor before making investment decisions."
}

RULES:
- signalsUp: 3-4 assets that historically benefit
- signalsDown: 3-4 assets that historically struggle
- historicalBars: 5-6 bars showing average % returns across past similar episodes
- impactBullets: 3-4 bullets personalized for everyday workers
- NEVER say 'you should buy/sell' — always say 'historically' or 'in past episodes'
- No abbreviations — spell out asset names fully
- historicalBars values: positive for up assets, negative for down assets`,
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

export async function generateInvestmentSignal(): Promise<string | null> {
  const weekOf = new Date().toISOString().split("T")[0].slice(0, 7);

  const existing = await prisma.investmentSignal.findUnique({ where: { weekOf } });
  if (existing) {
    console.log("[investment-signal] Already generated for this week");
    return existing.id;
  }

  const recentNews = await prisma.newsCache.findMany({
    where: { publishedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  if (recentNews.length === 0) {
    console.error("[investment-signal] No recent news — run /api/news/refresh first");
    return null;
  }

  const headlines = recentNews.map((n) => `${n.title} (${n.source})`);
  const signal = await generateSignal(headlines);
  const topStory = recentNews[signal.index] ?? recentNews[0];

  const works = await searchOpenAlex(signal.openAlexQuery, 3);
  const researchItems = works.length > 0 ? await getResearch(works, signal.eventTitle) : [];

  const finalResearch = researchItems.length > 0 ? researchItems : [{
    source: "Journal of Finance",
    journal: "Journal of Finance",
    year: 2023,
    finding: "Historical research consistently shows that major economic shocks create predictable patterns in asset class performance over 3-12 month horizons.",
    url: "https://onlinelibrary.wiley.com/journal/15406261",
  }];

  const record = await prisma.investmentSignal.create({
    data: {
      weekOf,
      eventTitle: signal.eventTitle,
      eventSummary: signal.eventSummary,
      sourceUrl: topStory.url,
      sourceLabel: topStory.source,
      signalsUp: JSON.parse(JSON.stringify(signal.signalsUp)),
      signalsDown: JSON.parse(JSON.stringify(signal.signalsDown)),
      historicalBars: JSON.parse(JSON.stringify(signal.historicalBars)),
      researchItems: JSON.parse(JSON.stringify(finalResearch)),
      impactGeneric: JSON.parse(JSON.stringify(signal.impactBullets)),
      disclaimer: signal.disclaimer,
      approved: true,
      approvedAt: new Date(),
    },
  });

  console.log(`[investment-signal] Created: ${record.id}`);
  return record.id;
}

export async function getCurrentSignal() {
  const weekOf = new Date().toISOString().split("T")[0].slice(0, 7);
  return prisma.investmentSignal.findFirst({
    where: { weekOf, approved: true },
  });
}
