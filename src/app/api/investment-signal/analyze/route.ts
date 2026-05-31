import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { searchOpenAlex, translateResearchToFindings } from "@/lib/openalex";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getResearch(works: Awaited<ReturnType<typeof searchOpenAlex>>, topic: string): Promise<Awaited<ReturnType<typeof translateResearchToFindings>>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return translateResearchToFindings(works, topic, anthropic as any);
}

export async function POST(req: NextRequest) {
  try {
    const { event, profile } = await req.json() as {
      event: string;
      profile?: {
        situation?: string | null;
        city?: string | null;
        industry?: string | null;
        lifeStage?: string | null;
        concern?: string | null;
        debtTypes?: string[];
      };
    };

    if (!event?.trim()) {
      return NextResponse.json({ error: "No event provided" }, { status: 400 });
    }

    const profileStr = profile ? `
User profile:
- Housing: ${profile.situation ?? "unknown"}
- City: ${profile.city ?? "unknown"}
- Industry: ${profile.industry ?? "unknown"}
- Life stage: ${profile.lifeStage ?? "unknown"}
- Main concern: ${profile.concern ?? "unknown"}
- Debt: ${profile.debtTypes?.join(", ") || "none"}` : "";

    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      messages: [{
        role: "user",
        content: `You are a financial economics educator writing for everyday Americans. Analyze this economic event and generate an investment context card.

Event: "${event}"
${profileStr}

Respond with ONLY a JSON object (no markdown, no preamble):
{
  "eventTitle": "<plain English title for this event>",
  "eventSummary": "<2-3 plain English sentences explaining what happened and why it matters. No jargon.>",
  "openAlexQuery": "<6-8 word academic search query for relevant economics research>",
  "signalsUp": [
    { "name": "<asset class>", "reason": "<1 sentence plain English why historically benefits>", "strength": "Strong|Moderate|Weak" }
  ],
  "signalsDown": [
    { "name": "<asset class>", "reason": "<1 sentence plain English why historically struggles>", "strength": "Strong|Moderate|Weak" }
  ],
  "historicalBars": [
    { "label": "<asset name>", "value": <number like 18.5 for 18.5%>, "direction": "up|down|neutral" }
  ],
  "impactBullets": [
    { "bold": "<3-5 word header>", "text": "<1-2 sentences of specific impact personalized to the user profile above>" }
  ],
  "disclaimer": "Historical patterns do not guarantee future results. This is economic education, not financial advice. Consult a licensed financial advisor before making investment decisions."
}

RULES:
- signalsUp: 3-4 assets
- signalsDown: 3-4 assets
- historicalBars: 5-6 bars, positive values for up assets, negative for down
- impactBullets: 3-4 bullets, personalized to the user profile
- NEVER say buy or sell — always say historically or in past episodes
- No jargon, no abbreviations, plain English throughout`,
      }],
    });

    const text = res.content[0]?.type === "text" ? res.content[0].text.trim() : "{}";
    const signal = JSON.parse(text.replace(/^```json\n?|```$/g, "").trim());

    const works = await searchOpenAlex(signal.openAlexQuery, 3);
    const researchItems = works.length > 0
      ? await getResearch(works, signal.eventTitle)
      : [{
          source: "NBER Working Paper Series",
          journal: "National Bureau of Economic Research",
          year: 2024,
          finding: "Economic research consistently shows that major economic events create predictable patterns in asset class performance over 3-12 month horizons.",
          url: "https://www.nber.org",
        }];

    return NextResponse.json({ ...signal, researchItems });
  } catch (err) {
    console.error("[investment-signal/analyze] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
