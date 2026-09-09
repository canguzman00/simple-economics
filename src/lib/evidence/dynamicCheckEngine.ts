// Dynamic, any-topic comprehension check — see the "Dynamic, any-topic
// comprehension check" comment in types.ts for the full design rationale.
//
// Short version: ACT-001 and any future ActivityTemplate in
// activityTemplates.ts are hand-authored, Carlos-reviewed, and grounded in
// one specific Published card — great content, but only available for the
// handful of cards someone has sat down and written a template for. Carlos's
// 2026-09-09 request was explicit: gamification needs to work for ANY
// question the app can already answer, reviewed or Research mode, not just
// the reviewed library's existing coverage. Hand-authoring a template for
// every possible question isn't possible, so this module generates one
// on the fly — but "generated" does not mean "ungrounded": the generator is
// given nothing but the exact answer text already shown to the user (already
// drafted and already verified by answerEngine.ts or researchEngine.ts) and
// is told, explicitly, to introduce no fact beyond it. A second, independent
// verification pass then checks the drafted check against that same source
// text, mirroring the two-pass discipline both answer engines already use.
//
// This is a genuinely NEW source of model output reaching the user (unlike
// activityEngine.ts's pure lookup), so unlike that file, this one is
// server-only and does need its own verification pass — see the comment on
// GeneratedCheck in types.ts for why that's an acceptable, bounded risk: the
// check can only ever restate/quiz on content already shown and already
// verified, never introduce new claims of its own.

import { anthropic } from "@/lib/anthropic";
import { withRetry } from "./answerEngine";
import type { GeneratedCheck } from "./types";

const DRAFT_TOOL = {
  name: "submit_check",
  description: "Submit a short comprehension check grounded strictly in the provided source text.",
  input_schema: {
    type: "object" as const,
    properties: {
      prompt: {
        type: "string" as const,
        description: "One short question testing whether the reader understood the key point of the source text — not a trivia fact, the actual takeaway.",
      },
      choices: {
        type: "array" as const,
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object" as const,
          properties: {
            id: { type: "string" as const, description: "Short id, e.g. 'a', 'b', 'c'." },
            label: { type: "string" as const, description: "The choice text, one plain sentence." },
          },
          required: ["id", "label"],
        },
        description: "Exactly 3 choices: one correct, two plausible-but-wrong (a common misconception the source text itself corrects, or an overstatement/understatement of it) — never a joke or obviously-wrong throwaway option.",
      },
      correctChoiceId: { type: "string" as const, description: "The id of the correct choice." },
      revealHeadline: { type: "string" as const, description: "One-sentence truth statement, restating the source text's key point plainly." },
      revealExplanation: { type: "string" as const, description: "2-3 sentences explaining why, using only the source text." },
      revealLimitation: { type: "string" as const, description: "One sentence on what this still doesn't tell the reader — drawn from the source text's own limitations/caveats, never invented." },
      insightCardText: { type: "string" as const, description: "One short 'what you learned' sentence, suitable for a running session recap." },
    },
    required: ["prompt", "choices", "correctChoiceId", "revealHeadline", "revealExplanation", "revealLimitation", "insightCardText"],
  },
};

function buildDraftSystemPrompt(): string {
  return `You write a short, engaging comprehension check for "My Economist" on Simple Economics. You will be given ONE piece of source text: an answer that has already been drafted and already independently fact-checked against Simple Economics' evidence. Your job is to test whether the reader understood it — not to teach anything new.

HARD RULES:
- Use ONLY the source text below. Never introduce a fact, number, date, or claim that isn't already stated in it.
- Never write a correct answer, wrong-choice explanation, limitation, or headline that goes beyond the source text's own content and its own stated limitations.
- Never include a personal recommendation (buy/wait/sell/refinance/invest, "you should") anywhere, even inside a wrong-choice option.
- The two incorrect choices should be genuinely plausible — a common misreading the source text itself would correct — never a strawman or joke.
- Keep it short: one question, three choices, a brief reveal. Plain language, no jargon left unexplained.

Call submit_check exactly once.`;
}

const VERIFY_TOOL = {
  name: "submit_check_verification",
  description: "Report whether the drafted check is strictly grounded in the provided source text.",
  input_schema: {
    type: "object" as const,
    properties: {
      grounded: {
        type: "boolean" as const,
        description: "true only if every fact in the prompt, choices, and reveal fields is directly present in the source text — false if anything goes beyond it.",
      },
      violation: {
        type: "string" as const,
        description: "If grounded is false, the specific claim that goes beyond the source text. Empty if grounded.",
      },
    },
    required: ["grounded", "violation"],
  },
};

interface RawChoice {
  id?: unknown;
  label?: unknown;
}

interface DraftInput {
  prompt?: string;
  choices?: RawChoice[];
  correctChoiceId?: string;
  revealHeadline?: string;
  revealExplanation?: string;
  revealLimitation?: string;
  insightCardText?: string;
}

function sanitizeDraft(input: DraftInput): GeneratedCheck | null {
  if (!input.prompt?.trim()) return null;
  if (!Array.isArray(input.choices)) return null;
  const choices = input.choices
    .filter((c): c is { id: string; label: string } => typeof c?.id === "string" && typeof c?.label === "string" && !!c.id.trim() && !!c.label.trim())
    .map((c) => ({ id: c.id.trim(), label: c.label.trim() }));
  if (choices.length < 2) return null;
  if (!input.correctChoiceId || !choices.some((c) => c.id === input.correctChoiceId)) return null;
  if (!input.revealHeadline?.trim() || !input.revealExplanation?.trim() || !input.revealLimitation?.trim() || !input.insightCardText?.trim()) {
    return null;
  }
  return {
    prompt: input.prompt.trim(),
    choices,
    correctChoiceId: input.correctChoiceId,
    revealHeadline: input.revealHeadline.trim(),
    revealExplanation: input.revealExplanation.trim(),
    revealLimitation: input.revealLimitation.trim(),
    insightCardText: input.insightCardText.trim(),
  };
}

async function verifyCheck(sourceText: string, check: GeneratedCheck): Promise<{ grounded: boolean; violation: string }> {
  const checkText = [
    `Prompt: ${check.prompt}`,
    `Choices: ${check.choices.map((c) => c.label).join(" | ")}`,
    `Reveal headline: ${check.revealHeadline}`,
    `Reveal explanation: ${check.revealExplanation}`,
    `Reveal limitation: ${check.revealLimitation}`,
  ].join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system: `You are a strict, adversarial reviewer. You will be shown a SOURCE TEXT (an already fact-checked answer) and a comprehension CHECK drafted from it. Your only job is to confirm the check introduces nothing the source text doesn't already say — not to judge whether the check is well-written.

Flag grounded=false if the prompt, any choice, or the reveal states a fact, number, date, or claim not present in the source text, or contains a personal recommendation. Otherwise grounded=true.`,
    tools: [VERIFY_TOOL],
    tool_choice: { type: "tool", name: "submit_check_verification" },
    messages: [{ role: "user", content: `SOURCE TEXT:\n${sourceText}\n\nCHECK TO VERIFY:\n${checkText}` }],
  });

  const toolUse = message.content.find(
    (block): block is Extract<typeof message.content[number], { type: "tool_use" }> => block.type === "tool_use"
  );
  if (!toolUse) throw new Error("check verification call returned no tool_use block");
  return toolUse.input as { grounded: boolean; violation: string };
}

// Generates and verifies a comprehension check for the given already-shown,
// already-verified answer text. Returns null on ANY failure — malformed
// draft, failed verification, or a technical error — since this is a purely
// optional enrichment: never worth surfacing an error state over, and never
// worth blocking or altering the real answer above it.
export async function generateCheck(sourceText: string): Promise<GeneratedCheck | null> {
  const trimmedSource = sourceText.trim();
  if (!trimmedSource) return null;

  let message;
  try {
    message = await withRetry(() =>
      anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 700,
        system: buildDraftSystemPrompt(),
        tools: [DRAFT_TOOL],
        tool_choice: { type: "tool", name: "submit_check" },
        messages: [{ role: "user", content: `SOURCE TEXT:\n${trimmedSource}` }],
      })
    );
  } catch (err) {
    console.error("[dynamic-check] draft call failed after retry:", err);
    return null;
  }

  const toolUse = message.content.find(
    (block): block is Extract<typeof message.content[number], { type: "tool_use" }> => block.type === "tool_use"
  );
  if (!toolUse) {
    console.error("[dynamic-check] draft call returned no tool_use block");
    return null;
  }

  const draft = sanitizeDraft(toolUse.input as DraftInput);
  if (!draft) {
    console.warn("[dynamic-check] draft failed sanitization");
    return null;
  }

  try {
    const verification = await withRetry(() => verifyCheck(trimmedSource, draft));
    if (!verification.grounded) {
      console.warn("[dynamic-check] verification rejected a draft:", verification.violation);
      return null;
    }
  } catch (err) {
    console.error("[dynamic-check] verification pass failed after retry:", err);
    return null;
  }

  return draft;
}
