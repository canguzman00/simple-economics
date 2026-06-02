export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AskClient } from "@/components/ask/AskClient";
import type { UserProfile } from "@/lib/ai/systemPrompt";

export default async function AskPage() {
  const cookieStore = cookies();
  const guestId = cookieStore.get("se_user_id")?.value ?? null;

  let profile: UserProfile = {};

  if (guestId) {
    const user = await prisma.user.findUnique({
      where: { guestId },
      select: {
        situation: true,
        concern: true,
        city: true,
      },
    });
    if (user) {
      profile = {
        situation: user.situation,
        concern: user.concern,
        city: user.city,
      };
    }
  }

  return <AskClient profile={profile} isAuthenticated={true} />;
}
