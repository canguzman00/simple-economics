import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { UserProfile } from "@/lib/ai/systemPrompt";
import { answerQuestion, citationsFor } from "@/lib/evidence/answerEngine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DAILY_LIMIT = 5;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const body = await req.json();
  const { question, userProfile } = body as {
    question: string;
    userProfile?: UserProfile;
  };

  if (!question?.trim()) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

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
    const envelope = await answerQuestion(trimmed, userProfile ?? {});
    const citations = citationsFor(envelope.cardIds);

    await prisma.userQuestion.create({
      data: {
        userId: user.id,
        question: trimmed,
        answer: envelope.answer,
        classification: envelope.classification,
        cardIds: envelope.cardIds,
        needsReview: envelope.classification !== "covered",
      },
    });

    return NextResponse.json({
      classification: envelope.classification,
      answer: envelope.answer,
      citations,
    });
  } catch (err) {
    console.error("[ask] answer engine error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
