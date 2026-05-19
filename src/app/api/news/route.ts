import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Tier } from "@prisma/client";
import { fetchAndCacheNews, getCachedNews, isCacheStale, CACHE_TTL_MS } from "@/lib/news-fetcher";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tierParam  = searchParams.get("tier") as Tier | null;
  const region     = searchParams.get("region") ?? undefined;

  try {
    // Check when we last fetched for this tier
    const newest = await prisma.newsCache.findFirst({
      where: tierParam ? { tier: tierParam } : {},
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (isCacheStale(newest?.createdAt ?? null)) {
      // Fire and forget — don't block the response
      fetchAndCacheNews().catch((e) => console.error("[news] background fetch failed:", e));
    }

    const articles = await getCachedNews(tierParam ?? undefined, region);

    return NextResponse.json(
articles.map((a) => ({
  id:              a.id,
  title:           a.title,
  summary:         a.summary,
  fullExplanation: a.fullExplanation,
  url:             a.url,
  source:          a.source,
  contentType:     a.contentType ?? "News",
  publishedAt:     a.publishedAt.toISOString(),
  pillar:          a.pillar,
  impact:          a.impact,
  tier:            a.tier,
  region:          a.region,
}))
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_TTL_MS / 1000}, stale-while-revalidate=60`,
        },
      }
    );
  } catch (err) {
    console.error("[news] route error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
