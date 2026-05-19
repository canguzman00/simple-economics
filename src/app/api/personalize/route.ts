import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { title, summary, source, contentType } = await req.json() as {
      title: string;
      summary: string;
      source: string;
      contentType: string;
    };

    const session = await getAuthSession();
    let userContext = "a general reader interested in economics";

    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          city: true,
          situation: true,
          employmentStatus: true,
          concern: true,
          lifeStage: true,
          debtTypes: true,
          industry: true,
        },
      });

      if (user) {
        const parts: string[] = [];
        if (user.situation) parts.push(user.situation === "rent" ? "a renter" : "a homeowner");
        if (user.employmentStatus) parts.push(`employment: ${user.employmentStatus}`);
        if (user.industry) parts.push(`works in ${user.industry}`);
        if (user.city) parts.push(`lives in ${user.city}`);
        if (user.lifeStage) parts.push(`life stage: ${user.lifeStage}`);
        if (user.debtTypes?.length) parts.push(`carries ${user.debtTypes.join(", ")} debt`);
        if (user.concern) parts.push(`main financial concern: ${user.concern}`);
        if (parts.length > 0) userContext = parts.join(", ");
      }
    }

    const res = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: `You are an economics educator. Given this news story and a user's profile, write exactly 3 short bullet points explaining what this means for them personally.

User profile: ${userContext}

News title: ${title}
Summary: ${summary}
Source: ${source}
Type: ${contentType}

Rules:
- Each point must be 1-2 plain English sentences
- No jargon, no abbreviations
- Make it specific to their situation
- Be honest about uncertainty when relevant
- Do NOT use bullet characters or numbers
- Respond with ONLY a JSON array of 3 strings, no markdown, no preamble

Example format: ["Point one here.", "Point two here.", "Point three here."]`,
      }],
    });

    const text = res.content[0].type === "text" ? res.content[0].text.trim() : "[]";
    const clean = text.replace(/^```json\n?|```$/g, "").trim();
    const points = JSON.parse(clean) as string[];

    return NextResponse.json({ points });
  } catch (err) {
    console.error("[personalize] error:", err);
    return NextResponse.json({ points: [] });
  }
}
