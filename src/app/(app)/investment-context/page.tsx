export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InvestmentSignalCard } from "@/components/feed/InvestmentSignalCard";

export default async function InvestmentContextPage() {
  const session = await getAuthSession();

  const userProfile = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          situation: true,
          city: true,
          industry: true,
          lifeStage: true,
          concern: true,
          debtTypes: true,
        },
      })
    : null;

  return (
    <div>
      <InvestmentSignalCard userProfile={userProfile} />
    </div>
  );
}
