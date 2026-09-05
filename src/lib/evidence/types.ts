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

export type Classification = "covered" | "partial" | "not_covered";

export interface AnswerEnvelope {
  classification: Classification;
  cardIds: string[]; // Published card IDs actually cited — empty for not_covered
  answer: string; // the plain-language answer shown to the user
}
