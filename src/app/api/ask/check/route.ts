import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateCheck } from "@/lib/evidence/dynamicCheckEngine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Powers the "Quick-Check" gamification offer for any answer — reviewed or
// Research mode — that doesn't already have a hand-authored ActivityTemplate
// (see activityTemplates.ts / dynamicCheckEngine.ts). Deliberately NOT
// counted against the daily question quota: this never asks the model a new
// question, it only quizzes on an answer the user already paid a question
// against. Also deliberately not logged to UserQuestion — there's no new
// claim here for Carlos to review, only a check on content that was already
// reviewed (by the calling answer's own verification pass) before this route
// ever saw it.
//
// `sourceText` must be the exact, already-verified text the user was shown
// (the reviewed answer's answer+why+decisionRelevance+relevance, or the
// research answer's answer+limitations+relevance) — never raw user input,
// since this route trusts it as the sole grounding for what it generates.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const body = await req.json();
  const { sourceText } = body as { sourceText?: string };

  if (!sourceText?.trim()) {
    return NextResponse.json({ error: "sourceText is required" }, { status: 400 });
  }

  // Defensive cap — this route only ever needs one already-shown answer's
  // worth of text, never an arbitrarily large payload.
  const trimmed = sourceText.trim().slice(0, 6000);

  try {
    const check = await generateCheck(trimmed);
    if (!check) {
      // Not an error — generation/verification can reasonably decline. The
      // client simply doesn't offer the Quick-Check for this answer.
      return NextResponse.json({ check: null });
    }
    return NextResponse.json({ check });
  } catch (err) {
    console.error("[ask/check] route error:", err);
    return NextResponse.json({ check: null });
  }
}
