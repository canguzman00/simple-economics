import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CalculatorClient from "./CalculatorClient";

export const metadata = {
  title: "Personal Impact Calculator | Simple Economics",
  description: "See exactly how economic policies affect your specific financial situation.",
};

export default async function CalculatorPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      situation: true,
      employmentStatus: true,
      concern: true,
      city: true,
      lifeStage: true,
      debtTypes: true,
      industry: true,
      onboardingComplete: true,
    },
  });

  if (!user?.onboardingComplete) {
    redirect("/onboarding");
  }

  return (
    <CalculatorClient
      profile={{
        situation: user.situation,
        employmentStatus: user.employmentStatus,
        concern: user.concern,
        city: user.city,
        lifeStage: user.lifeStage,
        debtTypes: user.debtTypes ?? [],
        industry: user.industry,
      }}
    />
  );
}
