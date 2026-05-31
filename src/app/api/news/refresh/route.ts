import { NextResponse } from "next/server";
import { fetchAndCacheNews } from "@/lib/news-fetcher";
import { fetchAndCacheRSSFeeds } from "@/lib/rss-fetcher";
import { fetchAndCacheRecentResearch } from "@/lib/openalex";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function runRefresh() {
  await prisma.newsCache.deleteMany({});
  // Guardian news — await this so we have something immediately
  await fetchAndCacheNews();
  // RSS feeds (IMF, World Bank, Fed, NBER etc) — fire in background
  fetchAndCacheRSSFeeds().catch((e) => console.error("[refresh] RSS error:", e));
  fetchAndCacheRecentResearch().catch((e) => console.error("[refresh] Research error:", e));
}

export async function GET() {
  const session = await getAuthSession();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await runRefresh();
  return NextResponse.json({ ok: true, message: "News cache refreshed" });
}

export async function POST() {
  const session = await getAuthSession();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await runRefresh();
  return NextResponse.json({ ok: true, message: "News cache refreshed" });
}
