// Types for the Evidence Engine — the curated, human-reviewed library that
// backs the "Ask the Economist" page. See project docs (answer-contract.md,
// evidence-review-workflow.md) for the review process these cards go through
// before they ever reach this file.

export type EvidenceType =
  | "FACT"
  | "CORRELATION"
  | "CAUSAL"
  | "MODEL"
  | "FORECAST"
  | "EXPERT_JUDGMENT";

export type SourceTier = 1 | 2 | 3 | 4 | 5;

export interface EvidenceSource {
  name: string;
  url: string;
  tier: SourceTier;
  isCrossCheck?: boolean; // true if this source was added specifically to corroborate, not the primary basis
}

export interface EvidenceStrengthDimension {
  dimension: string;
  assessment: string;
}

export interface EvidenceCard {
  id: string; // e.g. "SE-001"
  version: string; // e.g. "0.3"
  question: string; // the economic question this card answers
  status: "Published"; // only Published cards live in this file — Draft/Needs Revision stay in the review workflow, never here
  evidenceType: EvidenceType;
  evidenceSubtype?: string;
  claim: string;
  finding: string;
  causalConfidence: string;
  evidenceStrength: EvidenceStrengthDimension[];
  mechanism: string;
  timeHorizon: string;
  population: string;
  caveats: string[];
  whatWouldChangeAssessment?: string; // required for EXPERT_JUDGMENT and CAUSAL cards
  relevantDecisions: string;
  sources: EvidenceSource[];
  answerBoundary: string; // what this card explicitly does NOT establish — used to keep answers bounded
  reviewedBy: string;
  reviewDate: string; // ISO date
  publishedVersion: string;
  publishedDate: string; // ISO date
}

// "covered"/"partial"/"not_covered" are the drafting model's own classification.
// "unsupported" and "error" are engine-level outcomes added after that call:
// "unsupported" means the model answered but the independent verification
// pass found content the cited cards don't establish (a real system catch,
// not "no evidence exists" on the topic). "error" means a technical failure
// (an API call itself threw, even after retrying) prevented producing or
// checking an answer at all — this should read as "try again", never as a
// coverage judgment.
export type Classification = "covered" | "partial" | "not_covered" | "unsupported" | "error";

export interface AnswerEnvelope {
  classification: Classification;
  cardIds: string[]; // Published card IDs actually cited — empty for not_covered/unsupported/error
  answer: string; // the short, direct answer / headline — for not_covered/unsupported, the plain refusal message (suggestions are separate, see `suggestions`); for error, the technical-failure message
  why: string; // plain-language explanation of the mechanism/reasoning behind the answer — empty outside covered/partial
  decisionRelevance: string; // how this bears on a decision the user might face, only when genuinely supported — empty when not applicable
  limits: string; // "What this can't tell you" — drawn from the cited cards' answer boundaries/caveats — empty outside covered/partial
  suggestions: string[]; // alternative questions the library CAN answer, for not_covered/unsupported only — always excludes the question just asked; empty for covered/partial/error
}
