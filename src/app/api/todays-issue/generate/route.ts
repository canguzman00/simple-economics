import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { generateTodaysIssue } from "@/lib/todays-issue";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const session = await getAuthSession();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = await generateTodaysIssue();
    if (!id) {
      return NextResponse.json(
        { error: "No recent news to rank — run /api/news/refresh first" },
        { status: 400 }
      );
    }
    return NextResponse.json({
      ok: true,
      id,
      message: "Today's Issue generated — check admin panel to approve",
    });
  } catch (err) {
    console.error("[todays-issue/generate] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
