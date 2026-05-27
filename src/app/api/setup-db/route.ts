import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getAuthSession();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "TodaysIssue" (
        "id" TEXT NOT NULL,
        "date" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "sourceUrl" TEXT NOT NULL,
        "sourceLabel" TEXT NOT NULL,
        "happeningBody" TEXT NOT NULL,
        "liveStats" JSONB NOT NULL,
        "researchItems" JSONB NOT NULL,
        "impactGeneric" JSONB NOT NULL,
        "approved" BOOLEAN NOT NULL DEFAULT false,
        "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "approvedAt" TIMESTAMP(3),
        CONSTRAINT "TodaysIssue_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "TodaysIssue_date_key" ON "TodaysIssue"("date");
    `);

    return NextResponse.json({ ok: true, message: "TodaysIssue table created" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
