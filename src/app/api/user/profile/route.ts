import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Situation, HousingStatus, EmploymentStatus } from "@prisma/client";

// LifeStage and Industry enums are defined in schema.prisma but the Prisma
// client won't export them until `prisma migrate dev` is run. Until then
// we treat them as plain strings — behaviour is identical at runtime.
type LifeStage = string;
type Industry  = string;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = await (prisma.user as any).findUnique({
    where: { id: session.user.id },
    select: {
      situation: true,
      housingStatus: true,
      employmentStatus: true,
      concerns: true,
      city: true,
      lifeStage: true,
      debtTypes: true,
      industry: true,
      onboardingComplete: true,
    },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    situation, housingStatus, employmentStatus, concerns, city,
    lifeStage, debtTypes, industry,
    onboardingComplete,
  } = body;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {};

  if (situation !== undefined)          data.situation        = situation as Situation;
  if (housingStatus !== undefined)      data.housingStatus    = housingStatus as HousingStatus;
  if (employmentStatus !== undefined)   data.employmentStatus = employmentStatus as EmploymentStatus;
  if (concerns !== undefined)           data.concerns         = concerns as string[];
  if (city !== undefined)               data.city             = city;
  if (lifeStage !== undefined)          data.lifeStage        = lifeStage as LifeStage;
  if (debtTypes !== undefined)          data.debtTypes        = debtTypes as string[];
  if (industry !== undefined)           data.industry         = industry as Industry;
  if (onboardingComplete !== undefined) data.onboardingComplete = onboardingComplete;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = await (prisma.user as any).update({
    where: { id: session.user.id },
    data,
    select: {
      id: true,
      situation: true,
      housingStatus: true,
      employmentStatus: true,
      concerns: true,
      city: true,
      lifeStage: true,
      debtTypes: true,
      industry: true,
      onboardingComplete: true,
    },
  });

  return NextResponse.json(user);
}
