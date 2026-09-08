// Versioned, Carlos-reviewed learning-activity templates — each grounded in
// one or more Published Evidence Cards (see cards.ts). Adding a template
// here IS the publication step: nothing else in the app can produce
// activity content, and this file is the only place that can. See
// claude/answer-contract.md §13 and claude/learning-activities-brief.md for
// the review/architecture rationale, and cards.ts's own header comment for
// the review process a supporting card goes through before it can be cited
// here.
//
// MVP (2026-09-08): a single Quick Reveal template, grounded in SE-002
// ("Will a Fed rate cut automatically lower mortgage rates?"). Chosen over a
// Decision Detective template for the first ship because SE-002 already
// gives Quick Reveal's binary "test an assumption, then explain it"
// structure a directly supporting card — see the card-coverage check in
// claude/learning-activities-brief.md for why Decision Detective's
// buy-vs-rent clue content needs more evidence-coverage work first.
//
// Client-safe: this file has no server-only imports, exactly like cards.ts,
// so activity content can be rendered directly in the browser the same way
// STARTER_QUESTIONS already is.

import type { ActivityTemplate } from "./types";

export const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  {
    id: "ACT-001",
    version: "0.1",
    format: "quick_reveal",
    status: "Published",
    title: "Will a Fed rate cut lower your mortgage quote?",
    learningObjective:
      "Test the assumption that a Fed rate cut automatically lowers new mortgage rates, then explain the actual pricing mechanism and its limits.",
    supportingCardIds: ["SE-002"],
    prompt:
      "The Fed just cut its policy rate. What happens to the rate on a new 30-year fixed mortgage quoted tomorrow?",
    choices: [
      { id: "down", label: "It falls by roughly the same amount as the cut" },
      { id: "unclear", label: "It could go up, down, or stay about the same" },
      { id: "unchanged", label: "It stays exactly where it was" },
    ],
    correctChoiceId: "unclear",
    revealHeadline: "A Fed rate cut doesn't guarantee a lower mortgage quote.",
    revealExplanation:
      "Fixed mortgage rates track longer-term Treasury yields and their own mortgage-specific spread, not the Fed's short-term policy rate directly. Those components move on their own expectations about the future economy — so a cut the market already anticipated can leave mortgage quotes unchanged, and a mortgage rate can even rise after a cut for reasons that have nothing to do with the cut itself.",
    revealLimitation:
      "This explains the pricing mechanism — it can't tell you what a particular lender will quote you, or whether waiting for the next Fed meeting would get you a better rate.",
    insightCardText:
      "A Fed rate cut ≠ an automatic lower mortgage quote — fixed rates track Treasury yields and lender spreads instead.",
    nextStepText:
      "When you're actually comparing loans, get real quotes from a couple of lenders rather than estimating from Fed headlines — that's the only way to see the rate that applies to you.",
    reviewedBy: "Carlos",
    reviewDate: "2026-09-08",
  },
];

export function getActivityForCard(cardId: string): ActivityTemplate | undefined {
  return ACTIVITY_TEMPLATES.find((a) => a.status === "Published" && a.supportingCardIds.includes(cardId));
}

export function getActivityById(id: string): ActivityTemplate | undefined {
  return ACTIVITY_TEMPLATES.find((a) => a.id === id && a.status === "Published");
}
