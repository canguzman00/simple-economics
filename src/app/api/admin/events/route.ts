import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Pillar, Impact, Tier } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function assertAdmin(session: Awaited<ReturnType<typeof getAuthSession>>) {
  if (!session?.user) return false;
  return session.user.email === process.env.ADMIN_EMAIL;
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!await assertAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title, slug, summary, fullExplanation,
    pillar, impact, tier, region,
    youtubeUrl, sources, published, publishedAt,
  } = body;

  if (!title || !slug || !summary || !fullExplanation || !pillar || !impact) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!Object.values(Pillar).includes(pillar)) {
    return NextResponse.json({ error: "Invalid pillar" }, { status: 400 });
  }
  if (!Object.values(Impact).includes(impact)) {
    return NextResponse.json({ error: "Invalid impact" }, { status: 400 });
  }
  if (tier && !Object.values(Tier).includes(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  try {
    const event = await prisma.econEvent.create({
      data: {
        title:           title.trim(),
        slug:            slug.trim(),
        summary:         summary.trim(),
        fullExplanation: fullExplanation.trim(),
        pillar:          pillar as Pillar,
        impact:          impact as Impact,
        tier:            (tier as Tier) ?? "NATIONAL",
        region:          region?.trim() || null,
        youtubeUrl:      youtubeUrl?.trim() || null,
        sources:         (sources as string[]).filter(Boolean).map((s: string) => s.trim()),
        published:       Boolean(published),
        publishedAt:     publishedAt ? new Date(publishedAt) : new Date(),
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
