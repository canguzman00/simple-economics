import { NextResponse } from "next/server";
import { generateTodaysIssue } from "@/lib/todays-issue";
import { fetchAndCacheNews } from "@/lib/news-fetcher";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await fetchAndCacheNews();
  const id = await generateTodaysIssue();

  return NextResponse.json({ ok: true, issueId: id });
}
