import { NextResponse } from "next/server";
import { fetchAndCacheNews } from "@/lib/news-fetcher";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function runRefresh() {
  await prisma.newsCache.deleteMany({});
  await fetchAndCacheNews();
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
