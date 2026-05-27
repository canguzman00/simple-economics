import { NextRequest, NextResponse } from "next/server";
import { getTodaysIssue } from "@/lib/todays-issue";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const preview = searchParams.get("preview") === "true";

    if (preview) {
      const session = await getAuthSession();
      if (session?.user?.email === process.env.ADMIN_EMAIL) {
        const today = new Date().toISOString().split("T")[0];
        const issue = await prisma.todaysIssue.findUnique({ where: { date: today } });
        return NextResponse.json(issue ?? null);
      }
    }

    const issue = await getTodaysIssue();
    return NextResponse.json(issue ?? null);
  } catch (err) {
    console.error("[todays-issue] GET error:", err);
    return NextResponse.json(null);
  }
}
