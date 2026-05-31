import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const TOPICS = [
  { query: "inflation wages consumer prices 2024 2025", pillar: "PERSONAL_FINANCE" },
  { query: "housing rent affordability 2024 2025", pillar: "PERSONAL_FINANCE" },
  { query: "unemployment labor market 2024 2025", pillar: "GLOBAL_ECONOMICS" },
  { query: "income inequality poverty 2024 2025", pillar: "DEVELOPMENT_POLICY" },
  { query: "trade tariffs economic impact 2024 2025", pillar: "GEOPOLITICS_MONEY" },
  { query: "artificial intelligence jobs automation 2024 2025", pillar: "GLOBAL_ECONOMICS" },
];

export async function GET() {
  const session = await getAuthSession();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let saved = 0;

  for (const topic of TOPICS) {
    try {
      const url = new URL("https://api.openalex.org/works");
      url.searchParams.set("search", topic.query);
      url.searchParams.set("filter", "primary_topic.field.id:F27,publication_year:>2022,cited_by_count:>5");
      url.searchParams.set("sort", "publication_date:desc");
      url.searchParams.set("per_page", "3");
      url.searchParams.set("select", "id,title,publication_year,abstract_inverted_index,primary_location,doi,cited_by_count");
      url.searchParams.set("mailto", "canguzman@gmail.com");

      const res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "SimpleEconomics/1.0 (mailto:canguzman@gmail.com)" },
      });
      if (!res.ok) continue;

      const json = await res.json() as { results?: Array<{
        title: string;
        publication_year: number;
        abstract_inverted_index?: Record<string, number[]>;
        primary_location?: { source?: { display_name?: string }; landing_page_url?: string };
        doi?: string;
      }> };

      for (const work of (json.results ?? [])) {
        if (!work.title) continue;
        const paperUrl = work.primary_location?.landing_page_url ?? (work.doi ? `https://doi.org/${work.doi}` : null);
        if (!paperUrl) continue;
        const existing = await prisma.newsCache.findUnique({ where: { url: paperUrl } });
        if (existing) continue;

        const abstract = work.abstract_inverted_index
          ? Object.entries(work.abstract_inverted_index).reduce((words: string[], [word, positions]) => {
              for (const pos of positions) words[pos] = word;
              return words;
            }, []).filter(Boolean).join(" ").slice(0, 400)
          : "";
        if (!abstract) continue;

        let summary = "";
        try {
          const ai = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 150,
            messages: [{ role: "user", content: `Summarize in 2 plain English sentences for a non-economist:\n\nTitle: ${work.title}\nAbstract: ${abstract}\n\nOnly the summary, no preamble.` }],
          });
          summary = ai.content[0]?.type === "text" ? ai.content[0].text.trim() : "";
        } catch { continue; }

        if (!summary) continue;

        await prisma.newsCache.create({
          data: {
            title: work.title,
            summary,
            fullExplanation: "",
            url: paperUrl,
            source: work.primary_location?.source?.display_name ?? "Economics Research",
            contentType: "Research Paper",
            publishedAt: new Date(`${work.publication_year}-06-01`),
            pillar: topic.pillar as "PERSONAL_FINANCE" | "GLOBAL_ECONOMICS" | "DEVELOPMENT_POLICY" | "GEOPOLITICS_MONEY",
            impact: "MEDIUM",
            tier: "GLOBAL",
            region: null,
          },
        });
        saved++;
      }
    } catch { continue; }
  }

  return NextResponse.json({ ok: true, saved });
}
