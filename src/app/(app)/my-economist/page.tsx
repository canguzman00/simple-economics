export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MyEconomistClient } from "@/components/my-economist/MyEconomistClient";
import type { UserProfile } from "@/lib/ai/systemPrompt";

export default async function MyEconomistPage() {
  const session = await getServerSession(authOptions);
  let profile: UserProfile = {};

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        situation: true,
        concern: true,
        city: true,
        industry: true,
        lifeStage: true,
        debtTypes: true,
        employmentStatus: true,
        housingStatus: true,
      },
    });
    if (user) {
      profile = {
        situation: user.situation,
        concern: user.concern,
        city: user.city,
        industry: user.industry,
        lifeStage: user.lifeStage,
        debtTypes: user.debtTypes,
        employmentStatus: user.employmentStatus,
        housingStatus: user.housingStatus,
      };
    }
  }

  return <MyEconomistClient profile={profile} isAuthenticated={!!session?.user} />;
}
