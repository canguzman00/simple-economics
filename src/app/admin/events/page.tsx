import Link from "next/link";
import type { Pillar, Impact } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PILLAR_LABEL: Record<Pillar, string> = {
  GLOBAL_ECONOMICS:   "Global Economics",
  GEOPOLITICS_MONEY:  "Geopolitics & Money",
  DEVELOPMENT_POLICY: "Development & Policy",
  PERSONAL_FINANCE:   "Personal Finance",
};

const IMPACT_COLOR: Record<Impact, string> = {
  HIGH:   "text-[#D4613C]",
  MEDIUM: "text-[#C49A52]",
  LOW:    "text-[#3D8A55]",
};

export default async function AdminEventsPage() {
  const events = await prisma.econEvent.findMany({
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      pillar: true,
      impact: true,
      published: true,
      publishedAt: true,
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[#FAF9F6]">Events</h1>
          <p className="mt-1 font-sans text-sm text-[#7A6A52]">
            {events.length} total · {events.filter((e) => e.published).length} published
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="bg-[#C49A52] hover:bg-[#E2C27A] transition-colors text-[#1A1208] font-sans font-medium text-sm px-5 py-2.5 rounded-lg"
        >
          + New event
        </Link>
      </div>

      {/* Table */}
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-[#2C2417] rounded-xl text-center gap-2">
          <p className="font-serif text-xl text-[#7A6A52]">No events yet</p>
          <p className="font-sans text-sm text-[#4A3D2A]">
            <Link href="/admin/events/new" className="text-[#C49A52] hover:underline">
              Create your first event
            </Link>
          </p>
        </div>
      ) : (
        <div className="border border-[#2C2417] rounded-xl overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-6 px-5 py-2.5 border-b border-[#2C2417] bg-[#2C2417]/30">
            {["Title", "Pillar", "Impact", "Status", ""].map((h) => (
              <span key={h} className="font-sans text-[10px] text-[#4A3D2A] uppercase tracking-widest">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {events.map((event, i) => (
            <div
              key={event.id}
              className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-6 items-center px-5 py-4 ${
                i < events.length - 1 ? "border-b border-[#2C2417]" : ""
              } hover:bg-[#2C2417]/20 transition-colors`}
            >
              {/* Title + date */}
              <div className="min-w-0">
                <p className="font-sans text-sm text-[#C8B8A2] truncate">{event.title}</p>
                <p className="font-mono text-[10px] text-[#4A3D2A] mt-0.5">
                  {new Date(event.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Pillar */}
              <span className="font-sans text-xs text-[#7A6A52] whitespace-nowrap">
                {PILLAR_LABEL[event.pillar]}
              </span>

              {/* Impact */}
              <span className={`font-mono text-xs font-medium whitespace-nowrap ${IMPACT_COLOR[event.impact]}`}>
                {event.impact}
              </span>

              {/* Status */}
              <span className={`inline-flex items-center gap-1.5 font-sans text-xs whitespace-nowrap ${
                event.published ? "text-[#3D8A55]" : "text-[#7A6A52]"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${event.published ? "bg-[#3D8A55]" : "bg-[#4A3D2A]"}`} />
                {event.published ? "Published" : "Draft"}
              </span>

              {/* Edit link */}
              <Link
                href={`/admin/events/${event.id}/edit`}
                className="font-sans text-xs text-[#7A6A52] hover:text-[#C49A52] transition-colors whitespace-nowrap"
              >
                Edit →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
