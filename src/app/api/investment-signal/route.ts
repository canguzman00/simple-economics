import { NextResponse } from "next/server";
import { getCurrentSignal } from "@/lib/investment-signal";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const signal = await getCurrentSignal();
    return NextResponse.json(signal ?? null);
  } catch (err) {
    console.error("[investment-signal] GET error:", err);
    return NextResponse.json(null);
  }
}
