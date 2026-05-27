import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json() as { id: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.todaysIssue.update({
    where: { id },
    data: { approved: true, approvedAt: new Date() },
  });

  return NextResponse.json({ ok: true, message: "Today's Issue approved and live" });
}
