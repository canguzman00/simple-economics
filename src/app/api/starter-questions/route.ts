import { NextResponse } from "next/server";
import { getStarterQuestionGroups } from "@/lib/starter-questions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public, read-only — same trust level as the STARTER_QUESTIONS list this
// replaces (it's just suggested prompts, not evidence). Called client-side
// from MyEconomistClient.tsx on first load.
export async function GET() {
  const groups = await getStarterQuestionGroups();
  return NextResponse.json({ groups });
}
