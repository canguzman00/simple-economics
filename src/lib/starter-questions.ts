import { prisma } from "@/lib/prisma";
import { STARTER_QUESTIONS } from "@/lib/evidence/cards";
import { getCachedTrendingTopics } from "@/lib/trends-fetcher";

// Server-side only (imports prisma) — powers the split starter-question UI
// on the My Economist page (2026-09-08, Carlos's request): "current issues
// happening now" sourced from the existing daily Today's Issue pipeline,
// and "most-asked" sourced from the Trending Topics cache. Both are prompts
// a user can click to send as their question — clicking one does NOT mean
// the reviewed library covers it. A current-events or trending question is
// just as likely to land on "not covered, explore the research?" as a
// reviewed-card hit, which is the correct, honest behavior: this list is
// about relevance ("what's happening / what people are asking"), not a
// promise of reviewed coverage the way the original STARTER_QUESTIONS list
// was. See claude/answer-contract.md §8 for the Research mode disclosure
// that handles anything these prompts surface outside the reviewed cards.

export interface StarterQuestionGroup {
  label: string;
  questions: string[];
}

const RECENT_ISSUES_WINDOW_DAYS = 7;
const MAX_CURRENT_ISSUES = 3;
const MAX_TRENDING = 6;

async function getCurrentIssueQuestions(): Promise<string[]> {
  const since = new Date(Date.now() - RECENT_ISSUES_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const issues = await prisma.todaysIssue.findMany({
    where: { approved: true, generatedAt: { gte: since } },
    orderBy: { generatedAt: "desc" },
    take: MAX_CURRENT_ISSUES,
  });
  // Today's Issue titles are real news headlines, not phrased as
  // questions — wrap each one the same lightweight way the composer
  // treats any freeform input, so the button reads naturally without
  // risking a templated claim the underlying story doesn't support.
  return issues.map((i) => `What does this mean for me: ${i.title}`);
}

async function getTrendingQuestions(): Promise<string[]> {
  const trending = await getCachedTrendingTopics(MAX_TRENDING);
  return trending.map((t) => t.term);
}

export async function getStarterQuestionGroups(): Promise<StarterQuestionGroup[]> {
  const [currentIssues, trending] = await Promise.all([
    getCurrentIssueQuestions().catch((err) => {
      console.error("[starter-questions] current issues fetch failed:", err);
      return [];
    }),
    getTrendingQuestions().catch((err) => {
      console.error("[starter-questions] trending fetch failed:", err);
      return [];
    }),
  ]);

  const groups: StarterQuestionGroup[] = [];
  if (currentIssues.length > 0) {
    groups.push({ label: "Happening right now", questions: currentIssues });
  }
  if (trending.length > 0) {
    groups.push({ label: "Popular questions right now", questions: trending });
  }

  // Fallback: before the first cron run ever populates either cache (or if
  // both happen to come back empty), fall back to the original
  // reviewed-library list so the page is never blank for a first-time
  // visitor.
  if (groups.length === 0) {
    groups.push({ label: "Questions our evidence library can answer", questions: STARTER_QUESTIONS.slice(0, 6) });
  }

  return groups;
}
