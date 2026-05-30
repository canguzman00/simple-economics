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

  const weekOf = new Date().toISOString().split("T")[0].slice(0, 7);
  await prisma.investmentSignal.deleteMany({ where: { weekOf } });
  return NextResponse.json({ ok: true, message: "Signal reset — run /generate to create a fresh one" });
}
