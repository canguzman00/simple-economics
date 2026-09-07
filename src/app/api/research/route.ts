import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { UserProfile } from "@/lib/ai/systemPrompt";
import type { ConversationTurn } from "@/lib/evidence/types";
import { researchAnswer } from "@/lib/evidence/researchEngine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Same daily quota as /api/ask, and both write into the same UserQuestion
// table, so a research-mode answer counts toward the same limit as a
// reviewed-path question — it costs the same web-search + model call, and
// keeping one shared quota avoids research mode becoming an unmetered
// side door around the existing rate limit.
const DAILY_LIMIT = 5;
const MAX_HISTORY_TURNS = 8;

function sanitizeHistory(raw: unknown): ConversationTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (t): t is ConversationTurn =>
        !!t &&
        typeof t === "object" &&
        (t.role === "user" || t.role === "assistant") &&
        typeof t.content === "string" &&
        t.content.trim().length > 0
    )
    .slice(-MAX_HISTORY_TURNS);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const body = await req.json();
  const { question, userProfile, history } = body as {
    question: string;
    userProfile?: UserProfile;
    history?: unknown;
  };

  if (!question?.trim()) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  const conversationHistory = sanitizeHistory(history);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, isPremium: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.isPremium) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const count = await prisma.userQuestion.count({
      where: { userId: user.id, createdAt: { gte: startOfDay } },
    });
    if (count >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: "You've reached your daily limit of 5 questions." },
        { status: 429 }
      );
    }
  }

  try {
    const trimmed = question.trim();
    const envelope = await researchAnswer(trimmed, userProfile ?? {}, conversationHistory);

    // "error" is a technical failure, never logged and never counted against
    // the quota, same convention as /api/ask. "research" and "declined" are
    // both real outcomes worth Carlos being able to review — "declined"
    // especially, since a policy-rejected draft is exactly the kind of thing
    // worth knowing happened even though the user never saw it.
    if (envelope.classification !== "error") {
      await prisma.userQuestion.create({
        data: {
          userId: user.id,
          question: trimmed,
          answer: envelope.answer,
          classification: envelope.classification, // "research" or "declined" — plain string column, no schema change needed
          cardIds: [],
          needsReview: true,
        },
      });
    }

    return NextResponse.json({
      classification: envelope.classification,
      answer: envelope.answer,
      limitations: envelope.limitations,
      sources: envelope.sources,
      clarify: envelope.clarify,
    });
  } catch (err) {
    console.error("[research] route error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
