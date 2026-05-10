export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AskClient } from "@/components/ask/AskClient";
import type { UserProfile } from "@/lib/ai/systemPrompt";

export default async function AskPage() {
  const session = await getAuthSession();

  let profile: UserProfile = {};
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { situation: true, concern: true, city: true },
    });
    if (user) {
      profile = {
        situation: user.situation,
        concern: user.concern,
        city: user.city,
      };
    }
  }

  return <AskClient profile={profile} isAuthenticated={!!session?.user} />;
}
