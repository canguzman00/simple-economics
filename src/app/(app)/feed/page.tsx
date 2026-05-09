export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { FeedClient } from "@/components/feed/FeedClient";
import { situationLabel } from "@/components/onboarding/data";
import type { Situation } from "@/components/onboarding/data";

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
          select: { situation: true, city: true, onboardingComplete: true },
        })
      : null,
  ]);

  const serialized = events.map((e) => ({
    ...e,
    publishedAt: e.publishedAt.toISOString(),
  }));

  const isPersonalized = userProfile?.onboardingComplete && userProfile.situation;
  const personalizationLabel = isPersonalized
    ? [
        "Personalized for",
        situationLabel(userProfile!.situation as Situation),
        userProfile?.city ? `in ${userProfile.city}` : "",
      ]
        .filter(Boolean)
        .join(" ")
    : null;

  return (
    <div>
      {/* Personalization banner */}
      {personalizationLabel && (
        <p className="mb-6 font-sans text-xs text-[#7A6A52] border border-[#2C2417] rounded-lg px-4 py-2.5 inline-flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C49A52]" />
          {personalizationLabel}
        </p>
      )}

      <FeedClient initialEvents={serialized} />
    </div>
  );
}
