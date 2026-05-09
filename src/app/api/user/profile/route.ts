import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Situation, Concern } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { situation: true, concern: true, city: true, onboardingComplete: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { situation, concern, city, onboardingComplete } = body;

  const data: {
    situation?: Situation;
    concern?: Concern;
    city?: string;
    onboardingComplete?: boolean;
  } = {};

  if (situation !== undefined) data.situation = situation as Situation;
  if (concern !== undefined) data.concern = concern as Concern;
  if (city !== undefined) data.city = city;
  if (onboardingComplete !== undefined) data.onboardingComplete = onboardingComplete;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, situation: true, concern: true, city: true, onboardingComplete: true },
  });

  return NextResponse.json(user);
}
