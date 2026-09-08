import { NextResponse } from "next/server";
import { fetchAndCacheTrendingTopics } from "@/lib/trends-fetcher";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// Manual trigger, same admin-gated pattern as /api/news/refresh — lets
// Carlos populate the Trending Topics cache on demand instead of waiting
// for the next 8am UTC cron run (see vercel.json).
export async function GET() {
  const session = await getAuthSession();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await fetchAndCacheTrendingTopics();
  return NextResponse.json({ ok: true, message: "Trending topics refreshed", count });
}
