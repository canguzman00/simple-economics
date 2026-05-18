import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { policy, profile, financials } = body;

  const systemPrompt = `You are a personal economics advisor. Analyze how a specific economic policy or event affects this person based on their real financial situation. Be specific, use their actual numbers, give dollar estimates where possible, use plain language. Never fabricate statistics. Return ONLY valid JSON with no markdown fences:
{
  "verdict": "positive",
  "headline": "One sentence capturing the core personal impact",
  "overall_summary": "2-3 sentences explaining the overall picture",
  "short_term": {
    "label": "Next 3-6 Months",
    "impact": "paragraph describing short-term effects",
    "dollar_estimate": "specific dollar range or null",
    "key_points": ["point 1", "point 2", "point 3"]
  },
  "long_term": {
    "label": "1-3 Years Out",
    "impact": "paragraph describing longer-term effects",
    "dollar_estimate": "specific dollar range or null",
    "key_points": ["point 1", "point 2", "point 3"]
  },
  "watch_for": ["thing 1", "thing 2", "thing 3"],
  "action_steps": [
    {"step": "action description", "urgency": "now"},
    {"step": "action description", "urgency": "soon"},
    {"step": "action description", "urgency": "consider"}
  ],
  "sources": ["Institution 1", "Institution 2"],
  "impact_score": 0,
  "areas_affected": [
    {"area": "Housing", "impact": 0},
    {"area": "Savings", "impact": 0},
    {"area": "Investments", "impact": 0},
    {"area": "Income", "impact": 0},
    {"area": "Debt", "impact": 0}
  ]
}

Where impact_score is a number from -100 (very negative) to +100 (very positive).
For areas_affected, each impact is -100 to +100 showing how much that area is affected. Only include areas actually affected.`;

  const income = financials.income ? "$" + Number(financials.income).toLocaleString() : "Not provided";
  const housingCost = financials.housingCost ? "$" + Number(financials.housingCost).toLocaleString() : "Not provided";
  const savings = financials.savings ? "$" + Number(financials.savings).toLocaleString() : "Not provided";
  const investments = financials.investments ? "$" + Number(financials.investments).toLocaleString() : "Not provided";
  const debtPayments = financials.debtPayments ? "$" + Number(financials.debtPayments).toLocaleString() : "Not provided";

  const userMessage = `Analyze how this policy/event affects this specific person:

POLICY/EVENT: ${policy}

PERSONAL PROFILE:
- Housing: ${profile.situation || "Unknown"}
- Employment: ${profile.employmentStatus || "Unknown"}
- City: ${profile.city || "Unknown"}
- Life Stage: ${profile.lifeStage || "Unknown"}
- Industry: ${profile.industry || "Unknown"}
- Debt types: ${(profile.debtTypes || []).join(", ") || "None listed"}
- Primary financial concern: ${profile.concern || "Unknown"}

FINANCIAL DETAILS:
- Monthly income: ${income}
- Monthly housing cost: ${housingCost}
- Savings: ${savings}
- Investments: ${investments}
- Monthly debt payments: ${debtPayments}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = message.content
      .filter((b: {type: string}) => b.type === "text")
      .map((b: {type: string; text?: string}) => b.text || "")
      .join("");

    return NextResponse.json({ result: text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 });
  }
}
