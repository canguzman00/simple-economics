import { NextResponse } from "next/server";
import { fetchAndCacheNews } from "@/lib/news-fetcher";
import { fetchAndCacheRSSFeeds } from "@/lib/rss-fetcher";
import { fetchAndCacheRecentResearch } from "@/lib/openalex";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET() {
  const session = await getAuthSession();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.newsCache.deleteMany({
    where: { contentType: { not: "Research Paper" } },
  });

  await fetchAndCacheNews();

  await Promise.allSettled([
    fetchAndCacheRSSFeeds(),
    fetchAndCacheRecentResearch(),
  ]);

  const count = await prisma.newsCache.count();
  return NextResponse.json({ ok: true, message: "News cache refreshed", count });
}

export async function POST() {
  const session = await getAuthSession();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.newsCache.deleteMany({});
  await fetchAndCacheNews();
  await Promise.allSettled([
    fetchAndCacheRSSFeeds(),
    fetchAndCacheRecentResearch(),
  ]);

  const count = await prisma.newsCache.count();
  return NextResponse.json({ ok: true, message: "News cache refreshed", count });
}
