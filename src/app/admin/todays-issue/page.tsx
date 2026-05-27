export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TodaysIssueAdminClient } from "./client";

export default async function TodaysIssueAdminPage() {
  const session = await getAuthSession();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) redirect("/");

  const issues = await prisma.todaysIssue.findMany({
    orderBy: { generatedAt: "desc" },
    take: 10,
  });

  return <TodaysIssueAdminClient issues={JSON.parse(JSON.stringify(issues))} />;
}
