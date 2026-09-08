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

// A single prior turn, as actually shown to the user — never internal
// reasoning or hidden state. Passed back to the engine so it can resolve
// references ("my existing loan", a clicked quick-reply label) against
// what was just discussed. See answerEngine.ts's system prompt for the hard
// rule this supports: history may only be used to understand what's being
// asked, never to justify a looser or more permissive answer than a fresh,
// standalone question would get.
export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

// One optional, focused clarifying question offered after a covered/partial
// answer — never forced, never present for a refusal/error outcome. Options
// are short reply labels (e.g. "A mortgage decision"), not full sentences;
// clicking one sends its label back as the next user turn. The drafting
// model proposes this only among angles the Published library can actually
// support as a next step (see the system prompt) — it goes through the same
// independent verification pass as the rest of the answer.
export interface ClarifyPrompt {
  question: string;
  options: string[];
}

export interface AnswerEnvelope {
  classification: Classification;
  cardIds: string[]; // Published card IDs actually cited — empty for not_covered/unsupported/error
  answer: string; // the short, direct answer — one to two plain-language sentences — for not_covered/unsupported, the plain refusal message (suggestions are separate, see `suggestions`); for error, the technical-failure message
  why: string; // plain-language mechanism, shown only inside the "Explain how it works" disclosure — empty outside covered/partial
  decisionRelevance: string; // how this bears on a decision the user might face, only when genuinely supported — empty when not applicable
  essentialLimitation: string; // ONE short, always-visible sentence — the single most important thing this answer does NOT establish. Fuller caveats live in the per-card evidence disclosure, not here. Empty outside covered/partial.
  clarify: ClarifyPrompt | null; // an optional single follow-up question + 2-3 quick replies — null when not useful or not applicable to this classification
  suggestions: string[]; // alternative questions the library CAN answer, for not_covered/unsupported only — always excludes the question just asked; empty for covered/partial/error
}

// --- Optional Research mode (2026-09-06) ------------------------------------
// A user-selected escape hatch offered ONLY after a "not_covered" reviewed-
// path result: instead of staying within the Published Evidence Card
// library, the user can explicitly ask to explore general web/scientific
// research instead. This is a deliberately separate, clearly-labeled path —
// see claude/answer-contract.md §8 for the full design rationale and the
// safety rules this is not allowed to relax (it never touches the reviewed
// path's evidence gate, never becomes a Published card, and is never shown
// without the user explicitly choosing it).

export interface ResearchSource {
  title: string;
  url: string;
}

// "research": a normal, policy-compliant research answer, safe to show.
// "declined": the model drafted something but the independent policy check
// (see researchEngine.ts) rejected it — distinct from "research" so the UI
// never shows a policy-violating draft, and distinct from "error" because
// this IS a real judgment (not a technical failure).
// "error": a genuine technical failure — never a judgment on the topic.
export type ResearchClassification = "research" | "declined" | "error";

export interface ResearchEnvelope {
  classification: ResearchClassification;
  answer: string; // for "declined"/"error", the distinct notice copy instead of a real answer
  limitations: string; // genuine epistemic limitations of the research itself (mixed findings, dated data, correlational not causal, etc.) — never "this source is unreviewed"; empty for declined/error
  sources: ResearchSource[]; // real web_search_tool_result entries actually returned during this call — never model-typed, so never fabricated; empty for declined/error
  clarify: ClarifyPrompt | null; // same shape/rules as the reviewed path's clarify — null unless genuinely useful
}

// --- Optional learning activities (2026-09-08) ------------------------------
// A short, optional activity offered after a covered/partial reviewed
// answer, matched to a Published Evidence Card. See
// claude/answer-contract.md §13 and claude/learning-activities-brief.md for
// the full design rationale. MVP format is Quick Reveal only.
//
// Deliberate architecture choice: activity CONTENT is entirely
// template-authored and Carlos-reviewed, exactly like an Evidence Card, so
// producing one is a pure, deterministic lookup — no model call drafts it,
// so no new verification pass is needed to keep it inside the supporting
// card's boundaries. An activity can only exist for a topic a Published card
// already covers, and it never becomes a new source of claims the card
// doesn't itself make. This is why activityEngine.ts has no dependency on
// answerEngine.ts/researchEngine.ts's model-calling machinery at all.

export type ActivityFormat = "quick_reveal";

export interface QuickRevealChoice {
  id: string; // a real choice's own id, or the sentinel "__not_sure__"
  label: string;
}

export interface ActivityTemplate {
  id: string; // e.g. "ACT-001"
  version: string;
  format: ActivityFormat;
  status: "Published"; // only Published templates live in activityTemplates.ts, mirroring EvidenceCard
  title: string; // shown in the offer ("Explore it with me" / "Just explain")
  learningObjective: string; // documentation only — never shown to the user
  supportingCardIds: string[]; // Published card(s) this activity's content is grounded in
  prompt: string; // the question posed to the user
  choices: QuickRevealChoice[]; // real choices only — the "not sure" option is added by the UI, not stored here
  correctChoiceId: string; // the objectively defensible answer, per the supporting card
  revealHeadline: string; // one-sentence truth statement, grounded in the card's claim
  revealExplanation: string; // grounded in the card's finding/mechanism — never goes beyond it
  revealLimitation: string; // grounded in the card's caveats/answerBoundary — never invented
  insightCardText: string; // the short "what you learned" line, shown after the reveal and collected in the session's progress trail
  nextStepText: string; // the recap's "a useful next step" line — authored, reviewed, never a generated recommendation
  reviewedBy: string;
  reviewDate: string; // ISO date
}

// What the UI shows before a choice is made — a plain projection of the
// template's public-facing fields. (There's no real secrecy benefit to
// withholding correctChoiceId given this app already ships full Evidence
// Card content, including answerBoundary and caveats, straight to the
// client bundle — this type exists for clarity of intent, not security.)
export interface ActivityOfferView {
  id: string;
  version: string;
  format: ActivityFormat;
  title: string;
  prompt: string;
  choices: QuickRevealChoice[];
}

// What the UI shows once a choice (including "__not_sure__") is submitted.
export interface ActivityRevealView {
  id: string;
  version: string;
  selectedChoiceId: string;
  isCorrect: boolean; // always false for "__not_sure__" — recognizing uncertainty is a valid outcome, not a wrong answer, and the UI must never present it as one
  wasUnsure: boolean;
  headline: string;
  explanation: string;
  limitation: string;
  personalization: string | null; // one deterministic, profile-derived sentence — phrasing only, never a new claim; see personalizeReveal()
  insightCardText: string;
  nextStepText: string;
  sourceCardId: string;
  sourceCardVersion: string;
}
