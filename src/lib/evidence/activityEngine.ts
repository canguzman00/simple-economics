// Pure, deterministic logic for the MVP learning-activity format (Quick
// Reveal). No model call anywhere in this file — see the header comment in
// types.ts's "Optional learning activities" section for why that's a
// deliberate architecture choice, not a missing feature. Safe to import from
// either a client component or a server route: no server-only APIs.

import type { UserProfile } from "@/lib/ai/systemPrompt";
import { housingContext } from "@/lib/ai/systemPrompt";
import { getCardById } from "./cards";
import { getActivityById } from "./activityTemplates";
import type { ActivityTemplate, ActivityOfferView, ActivityRevealView } from "./types";

export const NOT_SURE_CHOICE_ID = "__not_sure__";

// The public-facing shape shown before a choice is made.
export function offerView(template: ActivityTemplate): ActivityOfferView {
  return {
    id: template.id,
    version: template.version,
    format: template.format,
    title: template.title,
    prompt: template.prompt,
    choices: template.choices,
  };
}

// One deterministic, profile-derived sentence — placeholder substitution
// only, never a new claim. Mirrors personalizationHint() in
// answerEngine.ts/researchEngine.ts: phrasing only, no assessment the
// template (and, through it, the supporting card) doesn't already make.
// Returns null whenever the profile doesn't give us anything genuine to say
// — never invents a fact to personalize around.
function personalizeReveal(template: ActivityTemplate, profile: UserProfile): string | null {
  if (template.id === "ACT-001") {
    const housing = housingContext(profile.housingStatus, profile.situation);
    if (housing === "a renter") {
      return "Since you're currently renting, this is exactly the kind of assumption worth checking with a real lender quote rather than a Fed headline, whenever you do start comparing.";
    }
    if (housing === "a homeowner with a mortgage") {
      return "Since you already have a mortgage, this affects a new purchase or refinance quote — it has no effect on the rate on your existing loan.";
    }
  }
  return null;
}

// Computes the reveal for a submitted choice, including the special
// "I'm not sure" sentinel. Returns null only when the template or choice
// doesn't exist (a client-state bug or tampered request), never as a
// judgment on the user's answer — recognizing uncertainty is always handled
// as a legitimate, non-wrong outcome, not an error.
export function reveal(templateId: string, selectedChoiceId: string, profile: UserProfile): ActivityRevealView | null {
  const template = getActivityById(templateId);
  if (!template) return null;

  const wasUnsure = selectedChoiceId === NOT_SURE_CHOICE_ID;
  if (!wasUnsure && !template.choices.some((c) => c.id === selectedChoiceId)) return null;

  const sourceCardId = template.supportingCardIds[0];
  const sourceCard = getCardById(sourceCardId);

  return {
    id: template.id,
    version: template.version,
    selectedChoiceId,
    isCorrect: !wasUnsure && selectedChoiceId === template.correctChoiceId,
    wasUnsure,
    headline: template.revealHeadline,
    explanation: template.revealExplanation,
    limitation: template.revealLimitation,
    personalization: personalizeReveal(template, profile),
    insightCardText: template.insightCardText,
    nextStepText: template.nextStepText,
    sourceCardId,
    // Sourced from the live card, not duplicated onto the template, so a
    // card version bump is reflected here automatically rather than going
    // stale — see claude/answer-contract.md §13's note on why superseding a
    // supporting card should be visible to whoever reviews activities next.
    sourceCardVersion: sourceCard?.version ?? template.version,
  };
}
