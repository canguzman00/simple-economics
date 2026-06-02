import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";
import { buildSystemPrompt, type UserProfile } from "@/lib/ai/systemPrompt";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DAILY_LIMIT = 5;

export async function POST(req: NextRequest) {
  const guestId = req.cookies.get("se_user_id")?.value;
  if (!guestId) {
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

  // Look up user by guestId
  const user = await prisma.user.findUnique({
    where: { guestId },
    select: { id: true, isPremium: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Rate limit: free users get 5 questions per calendar day
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

  const systemPrompt = buildSystemPrompt(userProfile ?? {});
  let fullAnswer = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 600,
          system: systemPrompt,
          messages: [{ role: "user", content: question.trim() }],
        });

        stream.on("text", (text: string) => {
          fullAnswer += text;
          controller.enqueue(new TextEncoder().encode(text));
        });

        await stream.finalMessage();

        await prisma.userQuestion.create({
          data: { userId: user.id, question: question.trim(), answer: fullAnswer },
        });

        controller.close();
      } catch (err) {
        console.error("[ask] stream error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
