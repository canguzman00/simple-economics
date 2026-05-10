export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { FeedClient } from "@/components/feed/FeedClient";
import type { SerializedEvent } from "@/components/feed/FeedClient";
import { cityToStateName } from "@/lib/city-state";

export default async function FeedPage() {
  const session = await getAuthSession();

  const [events, userProfile] = await Promise.all([
    prisma.econEvent.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    }),
    session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { city: true, onboardingComplete: true },
        })
      : null,
  ]);

  const initialEvents: SerializedEvent[] = events.map((e) => ({
    id:              e.id,
    slug:            e.slug,
    title:           e.title,
    summary:         e.summary,
    fullExplanation: e.fullExplanation,
    pillar:          e.pillar,
    impact:          e.impact,
    tier:            e.tier,
    region:          e.region,
    isNews:          e.isNews,
    newsUrl:         e.newsUrl,
    newsSource:      e.newsSource,
    publishedAt:     e.publishedAt.toISOString(),
    youtubeUrl:      e.youtubeUrl,
    sources:         e.sources,
  }));

  const userCity  = userProfile?.city ?? null;
  const userState = userCity ? cityToStateName(userCity) : null;

  return (
    <FeedClient
      initialEvents={initialEvents}
      userCity={userCity}
      userState={userState}
    />
  );
}
