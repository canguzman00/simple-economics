export interface ResearchItem {
  source: string;
  journal: string;
  year: number;
  finding: string;
  url: string;
}

interface OpenAlexWork {
  id: string;
  title: string;
  publication_year: number;
  abstract_inverted_index?: Record<string, number[]>;
  primary_location?: {
    source?: { display_name?: string };
    landing_page_url?: string;
  };
  doi?: string;
  cited_by_count: number;
}

function reconstructAbstract(invertedIndex: Record<string, number[]>): string {
  if (!invertedIndex) return "";
  const words: string[] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      words[pos] = word;
    }
  }
  return words.filter(Boolean).join(" ");
}

export async function searchOpenAlex(
  query: string,
  maxResults = 3
): Promise<OpenAlexWork[]> {
  try {
    const url = new URL("https://api.openalex.org/works");
    url.searchParams.set("search", query);
    url.searchParams.set("filter", "primary_topic.field.id:F27,cited_by_count:>10");
    url.searchParams.set("sort", "cited_by_count:desc");
    url.searchParams.set("per_page", String(maxResults));
    url.searchParams.set("select", "id,title,publication_year,abstract_inverted_index,primary_location,doi,cited_by_count");
    url.searchParams.set("mailto", "canguzman@gmail.com");

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: { "User-Agent": "SimpleEconomics/1.0 (mailto:canguzman@gmail.com)" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`OpenAlex ${res.status}`);
    const json = await res.json() as { results?: OpenAlexWork[] };
    return json.results ?? [];
  } catch (err) {
    console.error("[openalex] search error:", err);
    return [];
  }
}

export async function translateResearchToFindings(
  works: OpenAlexWork[],
  topic: string,
  anthropicClient: { messages: { create: (params: unknown) => Promise<{ content: Array<{ type: string; text: string }> }> } }
): Promise<ResearchItem[]> {
  const items: ResearchItem[] = [];

  for (const work of works) {
    const abstract = work.abstract_inverted_index
      ? reconstructAbstract(work.abstract_inverted_index)
      : "";

    if (!abstract && !work.title) continue;

    try {
      const res = await anthropicClient.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `You are an economics educator. In 1-2 plain English sentences, state the single most important finding from this research as it relates to "${topic}". No jargon. No markdown. Be specific — include numbers if the abstract has them.

Title: ${work.title}
Abstract: ${abstract.slice(0, 600)}

Respond with ONLY the finding sentence(s). Nothing else.`,
        }],
      });

      const finding = res.content[0]?.type === "text"
        ? res.content[0].text.trim()
        : "";

      if (!finding) continue;

      const journal = work.primary_location?.source?.display_name ?? "Economics Journal";
      const url = work.doi
        ? `https://doi.org/${work.doi.replace("https://doi.org/", "")}`
        : work.primary_location?.landing_page_url ?? work.id;

      items.push({
        source: work.title.slice(0, 80) + (work.title.length > 80 ? "…" : ""),
        journal,
        year: work.publication_year,
        finding,
        url,
      });
    } catch (err) {
      console.error("[openalex] translation error:", err);
    }
  }

  return items;
}
