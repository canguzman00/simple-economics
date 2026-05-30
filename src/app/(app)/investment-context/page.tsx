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
        select: { city: true, situation: true },
      })
    : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0F172A", fontFamily: "Inter, sans-serif" }}>
          Investment Context
        </h1>
        <p style={{ fontSize: "13px", color: "#64748B", marginTop: "6px", lineHeight: 1.6, fontFamily: "Inter, sans-serif" }}>
          When major economic events happen, history shows clear patterns in how asset classes respond.
          This is what the data and research say — updated weekly from live news.
        </p>
        <div style={{ marginTop: "10px", padding: "8px 12px", borderRadius: "6px", background: "#FFFBEB", border: "1px solid #FDE68A", fontSize: "11px", color: "#92400E" }}>
          Educational only — not financial advice. Past patterns do not guarantee future results.
        </div>
      </div>

      <InvestmentSignalCard userProfile={userProfile} />

    </div>
  );
}
