import { NextResponse } from "next/server";
import { generateTodaysIssue } from "@/lib/todays-issue";
import { fetchAndCacheNews } from "@/lib/news-fetcher";
import { fetchAndCacheTrendingTopics } from "@/lib/trends-fetcher";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 90;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await fetchAndCacheNews();
  const id = await generateTodaysIssue();

  // Trending topics is a separate, unofficial data source (Google Trends —
  // see src/lib/trends-fetcher.ts) that can fail independently of the news
  // pipeline; never let a Trends outage block Today's Issue from generating.
  const trendingCount = await fetchAndCacheTrendingTopics().catch((err) => {
    console.error("[cron] trending topics refresh failed:", err);
    return 0;
  });

  return NextResponse.json({ ok: true, issueId: id, trendingCount });
}
