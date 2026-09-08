"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, MessagesSquare, RotateCcw, ArrowUp, Search, Sparkles, Lightbulb, HelpCircle } from "lucide-react";
import type { UserProfile } from "@/lib/ai/systemPrompt";
import { housingContext } from "@/lib/ai/systemPrompt";
import { STARTER_QUESTIONS } from "@/lib/evidence/cards";
import { getActivityForCard } from "@/lib/evidence/activityTemplates";
import { reveal as revealActivity, NOT_SURE_CHOICE_ID } from "@/lib/evidence/activityEngine";
import type { ActivityTemplate, ActivityRevealView } from "@/lib/evidence/types";

// --- Design tokens (My Economist page only) --------------------------------
// Conversational redesign, 2026-09-06: same navy/coral/porcelain identity as
// the previous single-answer layout, applied to a running thread instead of
// a page that resets on every question. See claude/answer-contract.md for
// the underlying answer-engine contract this renders.
const COLOR = {
  bg: "#FBF7F5",             // warm porcelain page background
  surface: "#FFFFFF",        // card/input/panel surfaces
  text: "#202B3B",           // navy — primary text
  textSecondary: "#62616B",  // secondary text
  accent: "#B9404F",         // coral — actions, identity mark, limitation rule
  accentSoft: "#FAF0EE",     // pale coral — identity badge background
  border: "#E7DDDD",
  userBubble: "#F1E9E4",     // soft warm tint — user message bubble
};

// Research mode (2026-09-06) gets its own, deliberately different accent —
// never coral — so a research answer is visually unmistakable from a
// reviewed one at a glance, not just via its text label. See
// claude/answer-contract.md §8.
const RESEARCH_COLOR = {
  bg: "#FBF6EC",       // pale amber — research answer background
  border: "#E7DBB8",
  label: "#8A6D2E",    // amber-brown — badge text/icon
};

// Learning activities (2026-09-08) get their own soft, distinct panel color
// too — violet, never coral (reviewed) or amber (research), never red/green.
// Deliberately no correctness color-coding: a Quick Reveal's copy carries
// the "right instinct" / "good guess" / "fair to be unsure" distinction
// instead of a color, so the activity never reads as a graded pass/fail —
// see claude/learning-activities-brief.md's "reward understanding, not
// speed" note and the brief's explicit ban on financial-choice scoring.
const ACTIVITY_COLOR = {
  bg: "#F4F2FB",       // pale violet — activity panel background
  border: "#DDD5F2",
  label: "#5B4B9E",    // deep violet — badge text/icon, insight-card accent
};

const FONT_VAR = "var(--font-source-sans), 'Source Sans 3', sans-serif";

// Interactive states (hover/focus-visible/disabled) live in real CSS, not
// inline styles, because inline `style` can't express pseudo-classes.
const INTERACTIVE_STYLES = `
  .se-root { font-family: ${FONT_VAR}; }
  .se-root button, .se-root textarea, .se-root input { font-family: inherit; }

  .se-textarea {
    width: 100%; box-sizing: border-box; outline: none; resize: none;
    border-radius: 10px; background: ${COLOR.surface}; border: 1.5px solid ${COLOR.border};
    color: ${COLOR.text}; font-size: 16px; line-height: 1.5; padding: 12px 50px 12px 16px; transition: border-color 120ms;
  }
  .se-textarea:focus-visible { border-color: ${COLOR.accent}; }
  .se-textarea:disabled { opacity: 0.6; }

  .se-send {
    position: absolute; right: 8px; bottom: 8px; width: 34px; height: 34px; border-radius: 50%;
    background: ${COLOR.accent}; color: #FFFFFF; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: background-color 120ms;
  }
  .se-send:hover:not(:disabled) { background: #9E3542; }
  .se-send:focus-visible { outline: 2px solid ${COLOR.accent}; outline-offset: 2px; }
  .se-send:disabled { background: #D9B6BB; cursor: not-allowed; }

  .se-btn-primary {
    display: inline-block; background: ${COLOR.accent}; color: #FFFFFF; border: none;
    border-radius: 8px; font-size: 14px; font-weight: 600; padding: 10px 24px;
    cursor: pointer; text-decoration: none; transition: background-color 120ms;
  }
  .se-btn-primary:hover:not(:disabled) { background: #9E3542; }
  .se-btn-primary:focus-visible { outline: 2px solid ${COLOR.accent}; outline-offset: 2px; }
  .se-btn-primary:disabled { background: #D9B6BB; color: #FFFFFF; cursor: not-allowed; }

  .se-btn-secondary {
    display: inline-block; background: none; color: ${COLOR.text}; border: 1.5px solid ${COLOR.border};
    border-radius: 8px; font-size: 14px; font-weight: 600; padding: 9px 22px;
    cursor: pointer; transition: border-color 120ms, background-color 120ms;
  }
  .se-btn-secondary:hover:not(:disabled) { border-color: ${COLOR.text}; background: ${COLOR.accentSoft}; }
  .se-btn-secondary:focus-visible { outline: 2px solid ${COLOR.accent}; outline-offset: 2px; }
  .se-btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }

  .se-chip-neutral {
    font-size: 13.5px; font-weight: 600; color: ${RESEARCH_COLOR.label}; background: ${COLOR.surface};
    border: 1.5px solid ${RESEARCH_COLOR.border}; border-radius: 99px; padding: 8px 15px; cursor: pointer;
    transition: background-color 120ms, color 120ms;
  }
  .se-chip-neutral:hover:not(:disabled) { background: ${RESEARCH_COLOR.label}; color: #fff; border-color: ${RESEARCH_COLOR.label}; }
  .se-chip-neutral:focus-visible { outline: 2px solid ${RESEARCH_COLOR.label}; outline-offset: 2px; }
  .se-chip-neutral:disabled { opacity: 0.55; cursor: not-allowed; }

  .se-btn-starter {
    text-align: left; font-size: 14px; line-height: 1.4; border-radius: 8px; padding: 12px 14px;
    background: ${COLOR.surface}; border: 1px solid ${COLOR.border}; color: ${COLOR.text};
    cursor: pointer; transition: border-color 120ms, background-color 120ms;
  }
  .se-btn-starter:hover { border-color: ${COLOR.accent}; background: ${COLOR.accentSoft}; }
  .se-btn-starter:focus-visible { outline: 2px solid ${COLOR.accent}; outline-offset: 2px; }

  .se-chip {
    font-size: 13.5px; font-weight: 600; color: ${COLOR.accent}; background: ${COLOR.surface};
    border: 1.5px solid ${COLOR.accent}; border-radius: 99px; padding: 8px 15px; cursor: pointer;
    transition: background-color 120ms, color 120ms;
  }
  .se-chip:hover:not(:disabled) { background: ${COLOR.accent}; color: #fff; }
  .se-chip:focus-visible { outline: 2px solid ${COLOR.accent}; outline-offset: 2px; }
  .se-chip:disabled { opacity: 0.55; cursor: not-allowed; }

  .se-btn-link {
    font-size: 13px; font-weight: 600; color: ${COLOR.accent}; background: none; border: none;
    padding: 0; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;
  }
  .se-btn-link:hover { text-decoration: underline; }
  .se-btn-link:focus-visible { outline: 2px solid ${COLOR.accent}; outline-offset: 2px; border-radius: 3px; }

  .se-disclosure {
    display: flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 600;
    color: ${COLOR.textSecondary}; background: none; border: none; padding: 0; cursor: pointer;
  }
  .se-disclosure:hover { color: ${COLOR.accent}; }
  .se-disclosure:focus-visible { outline: 2px solid ${COLOR.accent}; outline-offset: 2px; border-radius: 3px; }

  .se-link { color: ${COLOR.accent}; text-decoration: underline; }
  .se-link:focus-visible { outline: 2px solid ${COLOR.accent}; outline-offset: 2px; }

  @keyframes se-fade-up { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .se-enter { animation: se-fade-up 220ms ease-out; }
  @media (prefers-reduced-motion: reduce) { .se-enter { animation: none; } }

  @keyframes se-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: .45; } 30% { transform: translateY(-3px); opacity: 1; } }
  .se-dot { width: 6px; height: 6px; border-radius: 50%; background: ${COLOR.textSecondary}; animation: se-bounce 1.1s infinite ease-in-out; }
  .se-dot:nth-child(2) { animation-delay: .15s; }
  .se-dot:nth-child(3) { animation-delay: .3s; }
  @media (prefers-reduced-motion: reduce) { .se-dot { animation: none; opacity: .8; } }

  .se-btn-activity {
    display: inline-flex; align-items: center; gap: 7px; background: ${ACTIVITY_COLOR.label}; color: #FFFFFF;
    border: none; border-radius: 8px; font-size: 14px; font-weight: 600; padding: 10px 20px;
    cursor: pointer; transition: background-color 120ms;
  }
  .se-btn-activity:hover:not(:disabled) { background: #47397D; }
  .se-btn-activity:focus-visible { outline: 2px solid ${ACTIVITY_COLOR.label}; outline-offset: 2px; }
  .se-btn-activity:disabled { opacity: 0.55; cursor: not-allowed; }

  .se-activity-choice {
    text-align: left; font-size: 14.5px; line-height: 1.4; border-radius: 8px; padding: 12px 14px;
    background: ${COLOR.surface}; border: 1.5px solid ${ACTIVITY_COLOR.border}; color: ${COLOR.text};
    cursor: pointer; transition: border-color 120ms, background-color 120ms, transform 80ms;
  }
  .se-activity-choice:hover:not(:disabled) { border-color: ${ACTIVITY_COLOR.label}; background: #FBFAFE; }
  .se-activity-choice:focus-visible { outline: 2px solid ${ACTIVITY_COLOR.label}; outline-offset: 2px; }
  .se-activity-choice:active:not(:disabled) { transform: scale(0.98); }
  .se-activity-choice:disabled { opacity: 0.55; cursor: not-allowed; }

  @keyframes se-reveal-in { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .se-reveal { animation: se-reveal-in 280ms ease-out; }
  @media (prefers-reduced-motion: reduce) { .se-reveal { animation: none; } }

  @keyframes se-trail-pop { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
  .se-trail-dot { animation: se-trail-pop 260ms ease-out; }
  @media (prefers-reduced-motion: reduce) { .se-trail-dot { animation: none; } }
`;

const URL_REGEX = /https?:\/\/[^\s]+/g;

function renderWithLinks(text: string): React.ReactNode {
  return text
    .split("\n")
    .filter(Boolean)
    .map((line, lineIdx) => {
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      URL_REGEX.lastIndex = 0;

      while ((match = URL_REGEX.exec(line)) !== null) {
        if (match.index > lastIndex) parts.push(line.slice(lastIndex, match.index));
        const url = match[0].replace(/[.,;:!?)]+$/, "");
        parts.push(
          <a key={match.index} href={url} target="_blank" rel="noopener noreferrer" className="se-link">
            {url}
          </a>
        );
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < line.length) parts.push(line.slice(lastIndex));
      return (
        <p key={lineIdx} style={{ marginTop: lineIdx > 0 ? "10px" : 0 }}>
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
}

interface EvidenceStrengthDimension {
  dimension: string;
  assessment: string;
}

interface Citation {
  id: string;
  version: string;
  question: string;
  evidenceType: string;
  evidenceStrength: EvidenceStrengthDimension[];
  sources: { name: string; url: string; tier: number }[];
  reviewedBy: string;
  reviewDate: string;
  caveats: string[];
  answerBoundary: string;
}

type Classification = "covered" | "partial" | "not_covered" | "unsupported" | "error";

interface ClarifyPrompt {
  question: string;
  options: string[];
}

interface AnswerResult {
  classification: Classification;
  answer: string;
  why: string;
  decisionRelevance: string;
  essentialLimitation: string;
  clarify: ClarifyPrompt | null;
  suggestions: string[];
  citations: Citation[];
}

interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

// --- Optional Research mode (2026-09-06) ------------------------------------
// Offered only after a "not_covered" reviewed-path result, only once the
// user explicitly clicks "Explore the research". See
// claude/answer-contract.md §8 for the full design and safety rationale.
type ResearchClassification = "research" | "declined" | "error";

interface ResearchSource {
  title: string;
  url: string;
}

interface ResearchResult {
  classification: ResearchClassification;
  answer: string;
  limitations: string;
  sources: ResearchSource[];
  clarify: ClarifyPrompt | null;
}

interface ResearchState {
  status: "loading" | "done";
  data: ResearchResult | null;
  fetchError: string | null; // technical fetch/network failure, distinct from classification "error"
}

// One optional learning activity's state for an exchange (see
// claude/answer-contract.md §13). "dismissed" covers both "Just explain" at
// the offer stage and "Back to my question" after in_progress/revealed —
// either way the activity block goes away for this exchange for good; the
// answer above it is untouched and always was the real answer, activity or
// not (never gated).
type ActivityStatus = "in_progress" | "revealed" | "dismissed";

interface ActivityState {
  templateId: string;
  status: ActivityStatus;
  selectedChoiceId?: string; // a real choice id, or NOT_SURE_CHOICE_ID
  revealData?: ActivityRevealView;
}

interface Exchange {
  id: string;
  question: string;
  result: AnswerResult | null; // null while in flight
  fetchError: string | null; // set only on a technical fetch/network failure, distinct from classification "error"
  research?: ResearchState; // present once the user has clicked "Explore the research" for this exchange
  showReviewedSuggestions?: boolean; // true once the user has clicked "Stay with reviewed topics"
  // True for an exchange created by clicking a research answer's own
  // clarify chip (see sendResearchFollowup / §11 of the answer contract).
  // `result` is a stub not_covered shape purely so the existing rendering
  // branch applies; the real content is entirely in `research`. Used to
  // suppress the "hasn't yet reviewed" framing text and Explore/Stay
  // buttons for these, since the user already opted into research mode.
  isResearchFollowup?: boolean;
  activity?: ActivityState; // present once the user has clicked "Explore it with me" (or dismissed the offer) for this exchange's linked learning activity
}

// Placeholder result for a research-mode follow-up exchange (see
// isResearchFollowup above). Never sent anywhere, never shown — it exists
// only so EconomistReply's existing not_covered branch renders, driven
// entirely by the exchange's `research` state instead.
const RESEARCH_FOLLOWUP_STUB: AnswerResult = {
  classification: "not_covered",
  answer: "",
  why: "",
  decisionRelevance: "",
  essentialLimitation: "",
  clarify: null,
  suggestions: [],
  citations: [],
};

interface Props {
  profile: UserProfile;
  isAuthenticated: boolean;
}

// A compact, faithful plain-text summary of what the user actually saw for
// one exchange — this is what goes back as "assistant" conversation history,
// never internal reasoning or hidden fields. Keeping it short bounds prompt
// growth across a long conversation.
function summarizeForHistory(result: AnswerResult): string {
  const parts = [result.answer];
  if (result.essentialLimitation) parts.push(`(Does not establish: ${result.essentialLimitation})`);
  if (result.clarify) {
    parts.push(`(I then asked: "${result.clarify.question}" — options offered: ${result.clarify.options.join(", ")})`);
  }
  return parts.join(" ");
}

// A compact summary of a completed research-mode exchange, for the SAME
// reason summarizeForHistory exists above: give later reviewed-path
// questions enough context to resolve a reference ("that study," "the one
// you found") without ever implying the research itself was reviewed or
// approved — the label is baked into the summary text itself, not left
// implicit, since this text becomes assistant history the reviewed-path
// model sees with no other framing around it.
function summarizeResearchForHistory(data: ResearchResult): string {
  if (data.classification !== "research") return "";
  return `(I also explored general research on this, not reviewed or approved by Simple Economics: ${data.answer})`;
}

// Checks a covered/partial answer's cited cards, in order, for the first one
// with a Published learning-activity template linked to it (see
// activityTemplates.ts). Returns undefined when none of the cited cards has
// one — most answers won't, since only ACT-001/SE-002 exists so far.
function findActivityTemplate(citedCardIds: string[]): ActivityTemplate | undefined {
  for (const id of citedCardIds) {
    const template = getActivityForCard(id);
    if (template) return template;
  }
  return undefined;
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `ex-${Date.now()}-${idCounter}`;
}

// Both engines' prompts explicitly tell the model a clarify option may be "a
// neutral, commitment-free option such as 'Something else' or 'Not sure
// yet'" (see answerEngine.ts's clarify rules, mirrored in researchEngine.ts)
// — the whole point being the user isn't forced into one of the specific
// supported angles. Clicking a SPECIFIC option (e.g. "How Fed rate cuts
// affect mortgage rates") is meant to resend that label as a real follow-up
// question, which works fine. But resending one of these neutral labels
// literally is nonsensical — the model then has to answer the question
// "Something else" as if it were a genuine question, which is exactly the
// confusing non-answer Carlos hit live. So a click matching this pattern
// focuses the composer for free text instead of sending anything.
const NEUTRAL_QUICKREPLY_RE = /^(something else|something different|not sure( yet)?|none of these|none of the above|other)\.?$/i;

export function MyEconomistClient({ profile, isAuthenticated }: Props) {
  const [draft, setDraft] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, { evidence?: boolean; explain?: boolean }>>({});
  // Session-level "progress trail" — one entry per distinct learning
  // activity completed (reveal seen, "I'm not sure" included) anywhere in
  // this conversation. Deliberately NOT a score or streak: it only ever
  // grows, carries no right/wrong count, and resets on "Start over" along
  // with the rest of the thread. See claude/learning-activities-brief.md.
  const [explored, setExplored] = useState<{ templateId: string; title: string; insight: string }[]>([]);
  const [trailOpen, setTrailOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [exchanges.length, loading]);

  function toggle(exId: string, key: "evidence" | "explain") {
    setExpanded((prev) => ({ ...prev, [exId]: { ...prev[exId], [key]: !prev[exId]?.[key] } }));
  }

  function buildHistory(upToIndex: number): ConversationTurn[] {
    const turns: ConversationTurn[] = [];
    for (let i = 0; i < upToIndex; i++) {
      const ex = exchanges[i];
      if (!ex.result) continue;
      turns.push({ role: "user", content: ex.question });
      turns.push({ role: "assistant", content: summarizeForHistory(ex.result) });
      if (ex.research?.data) {
        const researchSummary = summarizeResearchForHistory(ex.research.data);
        if (researchSummary) turns.push({ role: "assistant", content: researchSummary });
      }
    }
    return turns;
  }

  async function send(text: string, opts?: { retryExchangeId?: string }) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setLimitReached(false);

    let exId: string;
    let historyEndIndex: number;

    if (opts?.retryExchangeId) {
      exId = opts.retryExchangeId;
      const idx = exchanges.findIndex((e) => e.id === exId);
      historyEndIndex = idx === -1 ? exchanges.length : idx;
      setExchanges((prev) => prev.map((e) => (e.id === exId ? { ...e, result: null, fetchError: null } : e)));
    } else {
      exId = nextId();
      historyEndIndex = exchanges.length;
      setExchanges((prev) => [...prev, { id: exId, question: trimmed, result: null, fetchError: null }]);
      setDraft("");
    }

    const history = buildHistory(historyEndIndex);
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, userProfile: profile, history }),
      });

      if (res.status === 429) {
        setLimitReached(true);
        setExchanges((prev) =>
          prev.map((e) => (e.id === exId ? { ...e, fetchError: "You've reached your daily limit of 5 questions. Check back tomorrow." } : e))
        );
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setExchanges((prev) =>
          prev.map((e) => (e.id === exId ? { ...e, fetchError: data.error ?? "Something went wrong. Please try again." } : e))
        );
        setLoading(false);
        return;
      }
      const data = (await res.json()) as AnswerResult;
      setExchanges((prev) => prev.map((e) => (e.id === exId ? { ...e, result: data, fetchError: null } : e)));
    } catch {
      setExchanges((prev) => prev.map((e) => (e.id === exId ? { ...e, fetchError: "Connection lost. Please try again." } : e)));
    } finally {
      setLoading(false);
    }
  }

  // Research mode is only ever entered by explicit click, per exchange, on a
  // "not_covered" reviewed-path result — never automatically. `exIndex` is
  // needed so the same conversation history the exchange itself was asked
  // with (not including the not_covered exchange) is what research mode
  // sees too.
  async function exploreResearch(exId: string, exIndex: number) {
    const ex = exchanges[exIndex];
    if (!ex || loading) return;

    setExchanges((prev) =>
      prev.map((e) => (e.id === exId ? { ...e, research: { status: "loading", data: null, fetchError: null } } : e))
    );

    const history = buildHistory(exIndex);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: ex.question, userProfile: profile, history }),
      });

      if (res.status === 429) {
        setLimitReached(true);
        setExchanges((prev) =>
          prev.map((e) =>
            e.id === exId
              ? { ...e, research: { status: "done", data: null, fetchError: "You've reached your daily limit of 5 questions. Check back tomorrow." } }
              : e
          )
        );
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setExchanges((prev) =>
          prev.map((e) =>
            e.id === exId
              ? { ...e, research: { status: "done", data: null, fetchError: data.error ?? "Something went wrong. Please try again." } }
              : e
          )
        );
        return;
      }
      const data = (await res.json()) as ResearchResult;
      setExchanges((prev) => prev.map((e) => (e.id === exId ? { ...e, research: { status: "done", data, fetchError: null } } : e)));
    } catch {
      setExchanges((prev) =>
        prev.map((e) => (e.id === exId ? { ...e, research: { status: "done", data: null, fetchError: "Connection lost. Please try again." } } : e))
      );
    }
  }

  function stayWithReviewed(exId: string) {
    setExchanges((prev) => prev.map((e) => (e.id === exId ? { ...e, showReviewedSuggestions: true } : e)));
  }

  function focusComposer() {
    textareaRef.current?.focus();
    textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // --- Optional learning activities (2026-09-08) ----------------------------
  // See claude/answer-contract.md §13. Entirely client-side and
  // deterministic — activityEngine.reveal() just looks up the
  // Carlos-reviewed template, it never calls a model, so there's no loading
  // state, no fetch, and no new failure mode to handle here.

  function startActivity(exId: string, templateId: string) {
    setExchanges((prev) =>
      prev.map((e) => (e.id === exId ? { ...e, activity: { templateId, status: "in_progress" } } : e))
    );
  }

  // Covers both "Just explain" at the offer stage and "Back to my question"
  // after in_progress/revealed — either way the activity block goes away
  // for this exchange for good. The answer above it was never gated behind
  // this, so there's nothing to "unlock" by dismissing.
  function dismissActivity(exId: string, templateId: string) {
    setExchanges((prev) =>
      prev.map((e) => (e.id === exId ? { ...e, activity: { templateId, status: "dismissed" } } : e))
    );
  }

  function answerActivity(exId: string, template: ActivityTemplate, choiceId: string) {
    const result = revealActivity(template.id, choiceId, profile);
    if (!result) return;
    setExchanges((prev) =>
      prev.map((e) =>
        e.id === exId
          ? { ...e, activity: { templateId: template.id, status: "revealed", selectedChoiceId: choiceId, revealData: result } }
          : e
      )
    );
    setExplored((prev) =>
      prev.some((x) => x.templateId === template.id)
        ? prev
        : [...prev, { templateId: template.id, title: template.title, insight: result.insightCardText }]
    );
  }

  // Wraps a clarify/suggestion chip click: a neutral option (see
  // NEUTRAL_QUICKREPLY_RE above) focuses the composer instead of being sent
  // as a literal question. Everything else is resent as a real follow-up,
  // same as before.
  function handleQuickReply(label: string) {
    if (NEUTRAL_QUICKREPLY_RE.test(label.trim())) {
      focusComposer();
      return;
    }
    send(label);
  }

  function handleResearchQuickReply(label: string, sourceExIndex: number) {
    if (NEUTRAL_QUICKREPLY_RE.test(label.trim())) {
      focusComposer();
      return;
    }
    sendResearchFollowup(label, sourceExIndex);
  }

  // Continuing a research-mode conversation, directly — skips the reviewed
  // path entirely instead of routing a research answer's clarify chip
  // through /api/ask like an ordinary question. Before this, that follow-up
  // almost always landed on "not_covered" again (the follow-up topic isn't
  // in the reviewed library either, or the conversation wouldn't have
  // reached Research mode in the first place) and dead-ended back at the
  // same Explore/Stay prompt instead of answering — reported live by Carlos
  // as the conversation "not engaging." See claude/answer-contract.md §11.
  // `sourceExIndex` is whichever exchange's completed research the user
  // just read (the original not_covered exchange, or an earlier
  // continuation of it) — passing sourceExIndex + 1 to buildHistory
  // includes that exchange's own research summary, so the model has
  // context for what it already explained; chaining works the same way for
  // a second or third follow-up since each continuation is just another
  // exchange with its own index.
  async function sendResearchFollowup(text: string, sourceExIndex: number) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setLimitReached(false);

    const exId = nextId();
    const history = buildHistory(sourceExIndex + 1);

    setExchanges((prev) => [
      ...prev,
      {
        id: exId,
        question: trimmed,
        result: RESEARCH_FOLLOWUP_STUB,
        fetchError: null,
        research: { status: "loading", data: null, fetchError: null },
        isResearchFollowup: true,
      },
    ]);
    setLoading(true);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, userProfile: profile, history }),
      });

      if (res.status === 429) {
        setLimitReached(true);
        setExchanges((prev) =>
          prev.map((e) =>
            e.id === exId
              ? { ...e, research: { status: "done", data: null, fetchError: "You've reached your daily limit of 5 questions. Check back tomorrow." } }
              : e
          )
        );
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setExchanges((prev) =>
          prev.map((e) =>
            e.id === exId
              ? { ...e, research: { status: "done", data: null, fetchError: data.error ?? "Something went wrong. Please try again." } }
              : e
          )
        );
        return;
      }
      const data = (await res.json()) as ResearchResult;
      setExchanges((prev) => prev.map((e) => (e.id === exId ? { ...e, research: { status: "done", data, fetchError: null } } : e)));
    } catch {
      setExchanges((prev) =>
        prev.map((e) => (e.id === exId ? { ...e, research: { status: "done", data: null, fetchError: "Connection lost. Please try again." } } : e))
      );
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    setExchanges([]);
    setDraft("");
    setExpanded({});
    setExplored([]);
    setTrailOpen(false);
  }

  if (!isAuthenticated) {
    return (
      <div className="se-root" style={{ maxWidth: "720px" }}>
        <style>{INTERACTIVE_STYLES}</style>
        <PageHeader />
        <div
          style={{
            marginTop: "28px",
            borderRadius: "10px",
            padding: "32px",
            textAlign: "center",
            background: COLOR.surface,
            border: `1px solid ${COLOR.border}`,
          }}
        >
          <p style={{ fontSize: "15px", color: COLOR.textSecondary, marginBottom: "18px" }}>
            Sign in to ask the Economist a question.
          </p>
          <Link href="/signin" className="se-btn-primary">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const hasThread = exchanges.length > 0;
  const visibleStarterQuestions = showAllQuestions ? STARTER_QUESTIONS : STARTER_QUESTIONS.slice(0, 3);
  const composerDisabled = loading || limitReached;

  return (
    <div className="se-root" style={{ maxWidth: "720px", color: COLOR.text }}>
      <style>{INTERACTIVE_STYLES}</style>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px" }}>
        <PageHeader compact={hasThread} />
        {hasThread && (
          <button onClick={startOver} className="se-btn-link" style={{ marginBottom: "28px", flexShrink: 0 }}>
            <RotateCcw size={13} />
            Start over
          </button>
        )}
      </div>

      {/* Conversation thread */}
      {hasThread && (
        <div style={{ display: "flex", flexDirection: "column", gap: "22px", marginBottom: "26px" }}>
          {exchanges.map((ex, exIndex) => (
            <div key={ex.id} className="se-enter" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <UserBubble text={ex.question} />
              {ex.fetchError ? (
                <TechnicalErrorReply message={ex.fetchError} onRetry={() => send(ex.question, { retryExchangeId: ex.id })} />
              ) : ex.result ? (
                <>
                  <EconomistReply
                    result={ex.result}
                    expanded={expanded[ex.id] ?? {}}
                    onToggle={(key) => toggle(ex.id, key)}
                    onQuickReply={(label) => handleQuickReply(label)}
                    onResearchQuickReply={(label) => handleResearchQuickReply(label, exIndex)}
                    onRetry={() => send(ex.question, { retryExchangeId: ex.id })}
                    onRetryResearchFollowup={() => exploreResearch(ex.id, exIndex)}
                    disabled={loading}
                    research={ex.research}
                    showReviewedSuggestions={ex.showReviewedSuggestions}
                    isResearchFollowup={ex.isResearchFollowup}
                    onExploreResearch={() => exploreResearch(ex.id, exIndex)}
                    onStayReviewed={() => stayWithReviewed(ex.id)}
                  />
                  {(ex.result.classification === "covered" || ex.result.classification === "partial") &&
                    (() => {
                      const template = findActivityTemplate(ex.result!.citations.map((c) => c.id));
                      if (!template) return null;
                      const boundary = ex.result!.citations.find((c) => c.id === template.supportingCardIds[0])?.answerBoundary;
                      return (
                        <ActivityPanel
                          template={template}
                          activity={ex.activity}
                          disabled={loading}
                          profile={profile}
                          answerBoundary={boundary}
                          onStart={() => startActivity(ex.id, template.id)}
                          onDismiss={() => dismissActivity(ex.id, template.id)}
                          onAnswer={(choiceId) => answerActivity(ex.id, template, choiceId)}
                          onFocusComposer={focusComposer}
                        />
                      );
                    })()}
                </>
              ) : (
                <TypingIndicator />
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Progress trail — only appears once at least one activity has been
          completed this session; see claude/answer-contract.md §13. */}
      {explored.length > 0 && (
        <ProgressTrail explored={explored} open={trailOpen} onToggle={() => setTrailOpen((v) => !v)} />
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        {!hasThread && (
          <>
            <label htmlFor="question" style={{ fontSize: "15px", fontWeight: 600, color: COLOR.text, display: "block" }}>
              What&apos;s on your mind?
            </label>
            <p style={{ fontSize: "13px", color: COLOR.textSecondary, marginTop: "4px", marginBottom: "12px" }}>
              Reviewed evidence. Clear limits.
            </p>
          </>
        )}
        <div style={{ position: "relative" }}>
          <textarea
            id="question"
            ref={textareaRef}
            className="se-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            placeholder={hasThread ? "Ask a follow-up…" : "What does this mean for you?"}
            rows={hasThread ? 1 : 3}
            disabled={composerDisabled}
          />
          <button type="submit" disabled={!draft.trim() || composerDisabled} className="se-send" aria-label="Send">
            <ArrowUp size={16} />
          </button>
        </div>
        <p style={{ fontSize: "12px", color: COLOR.textSecondary, marginTop: "8px" }}>
          Enter to send · Shift + Enter for a new line
        </p>
      </form>

      {/* Starter questions — first visit only */}
      {!hasThread && (
        <div style={{ marginTop: "32px" }}>
          <p style={smallLabelStyle()}>Questions our evidence library can answer</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
            {visibleStarterQuestions.map((s) => (
              <button key={s} onClick={() => send(s)} className="se-btn-starter">
                {s}
              </button>
            ))}
          </div>
          {STARTER_QUESTIONS.length > 3 && (
            <button onClick={() => setShowAllQuestions((v) => !v)} className="se-btn-link" style={{ marginTop: "14px" }}>
              {showAllQuestions ? "Show fewer questions" : `See more questions (${STARTER_QUESTIONS.length - 3} more)`}
            </button>
          )}
        </div>
      )}

      {/* Rate limit */}
      {limitReached && (
        <div style={noticeBoxStyle("#FFF7ED", "#FED7AA")}>
          <p style={{ fontSize: "14px", color: "#B45309" }}>
            You&apos;ve reached your daily limit of 5 questions. Check back tomorrow.
          </p>
        </div>
      )}
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div
        style={{
          maxWidth: "80%",
          background: COLOR.userBubble,
          color: COLOR.text,
          borderRadius: "14px 14px 3px 14px",
          padding: "11px 16px",
          fontSize: "15px",
          lineHeight: 1.5,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function IdentityMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "7px",
          background: COLOR.accentSoft,
          color: COLOR.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <MessagesSquare size={14} />
      </div>
      <span style={{ fontSize: "13px", fontWeight: 700, color: COLOR.textSecondary }}>My Economist</span>
    </div>
  );
}

function TypingIndicator({ hideIdentity }: { hideIdentity?: boolean } = {}) {
  return (
    <div>
      {!hideIdentity && <IdentityMark />}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          background: COLOR.surface,
          border: `1px solid ${COLOR.border}`,
          borderRadius: "4px 14px 14px 14px",
          padding: "13px 16px",
        }}
      >
        <span className="se-dot" />
        <span className="se-dot" />
        <span className="se-dot" />
      </div>
    </div>
  );
}

function TechnicalErrorReply({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div>
      <IdentityMark />
      <div style={{ fontSize: "15px", lineHeight: 1.6, color: COLOR.text }}>{message}</div>
      <button onClick={onRetry} className="se-btn-primary" style={{ marginTop: "12px" }}>
        Try again
      </button>
    </div>
  );
}

function EconomistReply({
  result,
  expanded,
  onToggle,
  onQuickReply,
  onResearchQuickReply,
  onRetry,
  onRetryResearchFollowup,
  disabled,
  research,
  showReviewedSuggestions,
  isResearchFollowup,
  onExploreResearch,
  onStayReviewed,
}: {
  result: AnswerResult;
  expanded: { evidence?: boolean; explain?: boolean };
  onToggle: (key: "evidence" | "explain") => void;
  onQuickReply: (label: string) => void;
  onResearchQuickReply: (label: string) => void;
  onRetry: () => void;
  onRetryResearchFollowup: () => void;
  disabled: boolean;
  research?: ResearchState;
  showReviewedSuggestions?: boolean;
  isResearchFollowup?: boolean;
  onExploreResearch: () => void;
  onStayReviewed: () => void;
}) {
  const isError = result.classification === "error";

  if (isError) {
    return <TechnicalErrorReply message={result.answer} onRetry={onRetry} />;
  }

  // "unsupported": the library likely DOES cover this topic, but this
  // specific drafted answer failed the accuracy check — Research mode isn't
  // offered here (the "hasn't yet reviewed the evidence" copy would be
  // factually wrong), just the existing reviewed-alternatives treatment.
  if (result.classification === "unsupported") {
    return (
      <div>
        <IdentityMark />
        <div style={{ fontSize: "16px", lineHeight: 1.6, color: COLOR.text }}>{renderWithLinks(result.answer)}</div>
        {result.suggestions.length > 0 && (
          <div style={{ marginTop: "16px" }}>
            <p style={smallLabelStyle()}>Questions our library can answer</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
              {result.suggestions.map((s) => (
                <button key={s} onClick={() => onQuickReply(s)} className="se-btn-starter" disabled={disabled}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // "not_covered": no Published card matches this topic at all. This is
  // where the optional Research mode offer appears — see
  // claude/answer-contract.md §8. Research only ever starts on explicit
  // click; nothing here calls /api/research on its own.
  if (result.classification === "not_covered") {
    const hasChosen = !!research || showReviewedSuggestions;
    return (
      <div>
        <IdentityMark />
        {/* A research-follow-up exchange skips the "hasn't yet reviewed"
            framing and the Explore/Stay choice — the user already opted
            into research mode on the exchange this one continues, so
            re-showing that wall on every follow-up read as the
            conversation stalling instead of answering (see §11). */}
        {!isResearchFollowup && (
          <>
            <div style={{ fontSize: "16px", lineHeight: 1.55, color: COLOR.text }}>
              Simple Economics hasn&apos;t yet reviewed the evidence on this topic.
            </div>
            <div style={{ fontSize: "15px", lineHeight: 1.55, color: COLOR.textSecondary, marginTop: "8px" }}>
              In the meantime, we can explore scientific research and official sources, with findings and limitations
              clearly explained. This answer has not been reviewed or approved by Simple Economics.
            </div>
          </>
        )}

        {!isResearchFollowup && !hasChosen && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "16px" }}>
            <button onClick={onExploreResearch} className="se-btn-primary" disabled={disabled}>
              Explore the research
            </button>
            <button onClick={onStayReviewed} className="se-btn-secondary" disabled={disabled}>
              Stay with reviewed topics
            </button>
          </div>
        )}

        {!isResearchFollowup && showReviewedSuggestions && result.suggestions.length > 0 && (
          <div style={{ marginTop: "16px" }}>
            <p style={smallLabelStyle()}>Questions our library can answer</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
              {result.suggestions.map((s) => (
                <button key={s} onClick={() => onQuickReply(s)} className="se-btn-starter" disabled={disabled}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {research?.status === "loading" && (
          <div style={{ marginTop: isResearchFollowup ? "0" : "14px" }}>
            <TypingIndicator hideIdentity />
          </div>
        )}
        {research?.fetchError && (
          <div style={{ marginTop: isResearchFollowup ? "0" : "14px" }}>
            <div style={{ fontSize: "14px", color: COLOR.text }}>{research.fetchError}</div>
            <button
              onClick={isResearchFollowup ? onRetryResearchFollowup : onExploreResearch}
              className="se-btn-primary"
              style={{ marginTop: "10px" }}
            >
              Try again
            </button>
          </div>
        )}
        {research?.status === "done" && research.data && (
          <div style={{ marginTop: isResearchFollowup ? "0" : undefined }}>
            <ResearchAnswerBlock data={research.data} onQuickReply={onResearchQuickReply} disabled={disabled} />
          </div>
        )}
      </div>
    );
  }

  const sourceCount = result.citations.reduce((n, c) => n + c.sources.length, 0);
  const reviewer = result.citations[0]?.reviewedBy;

  return (
    <div>
      <IdentityMark />

      {/* Short answer — one to two plain sentences, no oversized bold treatment */}
      <div style={{ fontSize: "17px", lineHeight: 1.55, color: COLOR.text }}>{renderWithLinks(result.answer)}</div>

      {/* Decision relevance, when present — plain prose, no separate heading */}
      {result.decisionRelevance && (
        <div style={{ fontSize: "16px", lineHeight: 1.55, color: COLOR.text, marginTop: "8px" }}>
          {renderWithLinks(result.decisionRelevance)}
        </div>
      )}

      {/* Essential limitation — one short, always-visible line */}
      {result.essentialLimitation && (
        <p
          style={{
            marginTop: "14px",
            borderLeft: `2px solid ${COLOR.accent}`,
            paddingLeft: "12px",
            fontSize: "14.5px",
            lineHeight: 1.5,
            color: COLOR.textSecondary,
          }}
        >
          {result.essentialLimitation}
        </p>
      )}

      {/* Evidence disclosure — real per-card metadata, collapsed by default */}
      {result.citations.length > 0 && (
        <div style={{ marginTop: "14px" }}>
          <button onClick={() => onToggle("evidence")} aria-expanded={!!expanded.evidence} className="se-disclosure">
            <ChevronRight size={13} style={{ transform: expanded.evidence ? "rotate(90deg)" : "none", transition: "transform 150ms" }} />
            Evidence reviewed by {reviewer ?? "our economist"} · {sourceCount} source{sourceCount === 1 ? "" : "s"}
          </button>
          {expanded.evidence && (
            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {result.citations.map((c) => (
                <div
                  key={c.id}
                  style={{
                    border: `1px solid ${COLOR.border}`,
                    borderRadius: "8px",
                    padding: "13px 15px",
                    background: COLOR.surface,
                  }}
                >
                  <p style={{ fontSize: "13px", fontWeight: 600, color: COLOR.text }}>
                    {c.id} v{c.version}
                  </p>
                  <p style={{ fontSize: "12px", color: COLOR.textSecondary, marginTop: "2px" }}>
                    Evidence type: {c.evidenceType.replace(/_/g, " ")}
                  </p>
                  {c.evidenceStrength.length > 0 && (
                    <div style={{ marginTop: "6px" }}>
                      {c.evidenceStrength.map((d) => (
                        <p key={d.dimension} style={{ fontSize: "12px", color: COLOR.textSecondary }}>
                          <span style={{ color: COLOR.text }}>{d.dimension}:</span> {d.assessment}
                        </p>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize: "12px", color: COLOR.textSecondary, marginTop: "6px" }}>
                    Reviewed by {c.reviewedBy} on {c.reviewDate}
                  </p>
                  <p style={{ fontSize: "12px", color: COLOR.textSecondary, marginTop: "4px" }}>
                    Sources:{" "}
                    {c.sources.map((s, i) => (
                      <span key={s.url}>
                        {i > 0 && "; "}
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="se-link">
                          {s.name}
                        </a>{" "}
                        (Tier {s.tier})
                      </span>
                    ))}
                  </p>
                  {c.caveats.length > 0 && (
                    <div style={{ marginTop: "8px" }}>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: COLOR.text }}>This card&apos;s limits:</p>
                      <ul style={{ margin: "4px 0 0", paddingLeft: "16px" }}>
                        {c.caveats.map((cv) => (
                          <li key={cv} style={{ fontSize: "12px", color: COLOR.textSecondary, marginTop: "2px" }}>
                            {cv}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clarifying follow-up — one question, 2-3 quick replies, never forced */}
      {result.clarify && (
        <div
          style={{
            marginTop: "16px",
            background: COLOR.surface,
            border: `1px solid ${COLOR.border}`,
            borderRadius: "10px",
            padding: "16px 18px",
          }}
        >
          <p style={{ fontSize: "15px", fontWeight: 600, color: COLOR.text, marginBottom: "12px" }}>{result.clarify.question}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {result.clarify.options.map((opt) => (
              <button key={opt} onClick={() => onQuickReply(opt)} className="se-chip" disabled={disabled}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Explain how it works — the fuller mechanism, collapsed by default */}
      {result.why && (
        <div style={{ marginTop: "14px" }}>
          <button onClick={() => onToggle("explain")} aria-expanded={!!expanded.explain} className="se-disclosure">
            <ChevronRight size={13} style={{ transform: expanded.explain ? "rotate(90deg)" : "none", transition: "transform 150ms" }} />
            Explain how it works
          </button>
          {expanded.explain && (
            <div style={{ fontSize: "15px", lineHeight: 1.6, color: COLOR.text, marginTop: "8px" }}>
              {renderWithLinks(result.why)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// The one required, always-visible label for any research-mode answer — see
// claude/answer-contract.md §8. Deliberately its own pale-amber pill, never
// the coral identity mark used for reviewed answers, so the two are
// unmistakable at a glance, not just by reading the text.
function ResearchLabel() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        marginBottom: "10px",
        padding: "4px 10px",
        borderRadius: "99px",
        background: COLOR.surface,
        border: `1px solid ${RESEARCH_COLOR.border}`,
      }}
    >
      <Search size={12} color={RESEARCH_COLOR.label} />
      <span style={{ fontSize: "12px", fontWeight: 700, color: RESEARCH_COLOR.label }}>
        Research answer · not reviewed or approved by Simple Economics
      </span>
    </div>
  );
}

function ResearchAnswerBlock({
  data,
  onQuickReply,
  disabled,
}: {
  data: ResearchResult;
  onQuickReply: (label: string) => void;
  disabled: boolean;
}) {
  // "declined"/"error" already have their own distinct copy in data.answer
  // (see researchEngine.ts) — show it plainly, no amber panel, no sources,
  // since there's nothing real to attach that treatment to.
  if (data.classification !== "research") {
    return (
      <div style={{ marginTop: "14px", fontSize: "15px", lineHeight: 1.6, color: COLOR.text }}>{data.answer}</div>
    );
  }

  return (
    <div
      style={{
        marginTop: "14px",
        background: RESEARCH_COLOR.bg,
        border: `1px solid ${RESEARCH_COLOR.border}`,
        borderRadius: "10px",
        padding: "16px 18px",
      }}
    >
      <ResearchLabel />
      <div style={{ fontSize: "16px", lineHeight: 1.55, color: COLOR.text }}>{renderWithLinks(data.answer)}</div>

      {data.limitations && (
        <div style={{ marginTop: "12px" }}>
          <p style={smallLabelStyle()}>Limitations</p>
          <p style={{ fontSize: "14px", lineHeight: 1.5, color: COLOR.textSecondary, marginTop: "4px" }}>
            {data.limitations}
          </p>
        </div>
      )}

      {data.sources.length > 0 && (
        <div style={{ marginTop: "12px" }}>
          <p style={smallLabelStyle()}>Sources</p>
          <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
            {data.sources.map((s) => (
              <li key={s.url} style={{ fontSize: "13px", marginTop: "3px" }}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="se-link">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.clarify && (
        <div style={{ marginTop: "14px" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: COLOR.text, marginBottom: "10px" }}>
            {data.clarify.question}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {data.clarify.options.map((opt) => (
              <button key={opt} onClick={() => onQuickReply(opt)} className="se-chip-neutral" disabled={disabled}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Optional learning activities (2026-09-08) ------------------------------
// See claude/answer-contract.md §13. Three stages, one panel: offer (no
// `activity` state yet) → in_progress (the Quick Reveal question) →
// revealed (explanation + insight card + recap). "dismissed" ends it at any
// stage and shows nothing further — the answer above was never gated on any
// of this.

function ActivityPanel({
  template,
  activity,
  disabled,
  profile,
  answerBoundary,
  onStart,
  onDismiss,
  onAnswer,
  onFocusComposer,
}: {
  template: ActivityTemplate;
  activity?: ActivityState;
  disabled: boolean;
  profile: UserProfile;
  answerBoundary?: string;
  onStart: () => void;
  onDismiss: () => void;
  onAnswer: (choiceId: string) => void;
  onFocusComposer: () => void;
}) {
  if (activity?.status === "dismissed") return null;

  const panelStyle: React.CSSProperties = {
    marginTop: "4px",
    background: ACTIVITY_COLOR.bg,
    border: `1px solid ${ACTIVITY_COLOR.border}`,
    borderRadius: "10px",
    padding: "16px 18px",
  };

  // Offer stage — nothing chosen yet.
  if (!activity) {
    return (
      <div style={panelStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={15} color={ACTIVITY_COLOR.label} />
          <p style={{ fontSize: "14px", fontWeight: 700, color: ACTIVITY_COLOR.label, margin: 0 }}>
            Want to test that before we move on?
          </p>
        </div>
        <p style={{ fontSize: "14px", lineHeight: 1.5, color: COLOR.text, marginTop: "8px" }}>{template.title}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "14px" }}>
          <button onClick={onStart} className="se-btn-activity" disabled={disabled}>
            <Sparkles size={14} /> Explore it with me
          </button>
          <button onClick={onDismiss} className="se-btn-secondary" disabled={disabled}>
            Just explain
          </button>
        </div>
      </div>
    );
  }

  // In progress — the Quick Reveal question, plus a genuine "not sure" option.
  if (activity.status === "in_progress") {
    return (
      <div style={panelStyle}>
        <p style={{ fontSize: "15px", fontWeight: 600, color: COLOR.text, margin: 0 }}>{template.prompt}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
          {template.choices.map((c) => (
            <button key={c.id} onClick={() => onAnswer(c.id)} className="se-activity-choice" disabled={disabled}>
              {c.label}
            </button>
          ))}
          <button
            onClick={() => onAnswer(NOT_SURE_CHOICE_ID)}
            className="se-activity-choice"
            disabled={disabled}
            style={{ display: "flex", alignItems: "center", gap: "7px", color: COLOR.textSecondary, fontStyle: "italic" }}
          >
            <HelpCircle size={14} /> I&apos;m not sure
          </button>
        </div>
        <button onClick={onDismiss} className="se-btn-link" style={{ marginTop: "14px" }} disabled={disabled}>
          Back to my question
        </button>
      </div>
    );
  }

  // Revealed — explanation, insight card, and a compact recap. No
  // right/wrong color-coding anywhere here on purpose — the encouragement
  // line carries that distinction in words, never in red/green.
  const data = activity.revealData;
  if (!data) return null;

  const encouragement = data.wasUnsure
    ? "Totally fair to be unsure — here's what the evidence actually shows."
    : data.isCorrect
      ? "Good instinct — that matches the evidence."
      : "Good guess — here's what actually happens.";

  return (
    <div className="se-reveal" style={panelStyle}>
      <p style={{ fontSize: "13px", fontWeight: 700, color: ACTIVITY_COLOR.label, margin: 0 }}>{encouragement}</p>
      <p style={{ fontSize: "16px", fontWeight: 600, lineHeight: 1.45, color: COLOR.text, marginTop: "8px" }}>{data.headline}</p>
      <p style={{ fontSize: "14.5px", lineHeight: 1.55, color: COLOR.text, marginTop: "8px" }}>{data.explanation}</p>
      {data.personalization && (
        <p style={{ fontSize: "14px", lineHeight: 1.5, color: COLOR.text, marginTop: "8px" }}>{data.personalization}</p>
      )}
      <p style={{ fontSize: "13px", lineHeight: 1.5, color: COLOR.textSecondary, marginTop: "10px", fontStyle: "italic" }}>
        {data.limitation}
      </p>
      <p style={{ fontSize: "12px", color: COLOR.textSecondary, marginTop: "10px" }}>
        Grounded in {data.sourceCardId} v{data.sourceCardVersion}
      </p>

      <InsightCardStrip text={data.insightCardText} />

      <ActivityRecap
        template={template}
        profile={profile}
        answerBoundary={answerBoundary}
        nextStepText={data.nextStepText}
        onFocusComposer={onFocusComposer}
      />

      <button onClick={onDismiss} className="se-btn-link" style={{ marginTop: "14px" }}>
        Back to my question
      </button>
    </div>
  );
}

function InsightCardStrip({ text }: { text: string }) {
  return (
    <div
      style={{
        marginTop: "14px",
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        background: COLOR.surface,
        border: `1px solid ${ACTIVITY_COLOR.border}`,
        borderRadius: "8px",
        padding: "12px 14px",
      }}
    >
      <Lightbulb size={15} color={ACTIVITY_COLOR.label} style={{ flexShrink: 0, marginTop: "1px" }} />
      <div>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: ACTIVITY_COLOR.label,
            margin: 0,
          }}
        >
          Insight collected
        </p>
        <p style={{ fontSize: "13.5px", lineHeight: 1.45, color: COLOR.text, marginTop: "3px" }}>{text}</p>
      </div>
    </div>
  );
}

// One deterministic, always-truthful "what you told me" line — returns null
// (and the recap simply omits that row) whenever the profile doesn't give us
// a real stated fact to show. Never invents one. Reuses housingContext so
// this stays in sync with the same per-value mapping answerEngine.ts and
// researchEngine.ts already use for personalization.
function profileFactLine(profile: UserProfile): string | null {
  const housing = housingContext(profile.housingStatus, profile.situation);
  if (housing === "someone") return null;
  return `You're ${housing}.`;
}

function ActivityRecap({
  template,
  profile,
  answerBoundary,
  nextStepText,
  onFocusComposer,
}: {
  template: ActivityTemplate;
  profile: UserProfile;
  answerBoundary?: string;
  nextStepText: string;
  onFocusComposer: () => void;
}) {
  const toldMe = profileFactLine(profile);

  return (
    <div style={{ marginTop: "16px", borderTop: `1px solid ${ACTIVITY_COLOR.border}`, paddingTop: "14px" }}>
      <p style={{ ...smallLabelStyle(), color: ACTIVITY_COLOR.label }}>Quick recap</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
        {toldMe && <RecapRow label="What you told me" text={toldMe} />}
        <RecapRow label="What we explored" text={template.title} />
        {answerBoundary && <RecapRow label="What's still missing" text={answerBoundary} />}
        <RecapRow label="A useful next step" text={nextStepText} />
      </div>
      <button onClick={onFocusComposer} className="se-btn-link" style={{ marginTop: "10px" }}>
        Ask a follow-up question
      </button>
    </div>
  );
}

function RecapRow({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: COLOR.textSecondary,
          margin: 0,
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: "13.5px", lineHeight: 1.45, color: COLOR.text, marginTop: "3px" }}>{text}</p>
    </div>
  );
}

// Session-wide "progress trail" — see the `explored` state comment in
// MyEconomistClient for what this deliberately is not (a score or streak).
function ProgressTrail({
  explored,
  open,
  onToggle,
}: {
  explored: { templateId: string; title: string; insight: string }[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        marginBottom: "16px",
        background: COLOR.surface,
        border: `1px solid ${ACTIVITY_COLOR.border}`,
        borderRadius: "10px",
        padding: "12px 16px",
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ display: "flex", gap: "4px" }}>
            {explored.map((e) => (
              <span
                key={e.templateId}
                className="se-trail-dot"
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: ACTIVITY_COLOR.label,
                  display: "inline-block",
                }}
              />
            ))}
          </span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: COLOR.text }}>
            {explored.length} idea{explored.length === 1 ? "" : "s"} explored this session
          </span>
        </span>
        <ChevronRight
          size={14}
          color={COLOR.textSecondary}
          style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 150ms" }}
        />
      </button>
      {open && (
        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {explored.map((e) => (
            <div key={e.templateId} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <Lightbulb size={13} color={ACTIVITY_COLOR.label} style={{ flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "13px", lineHeight: 1.45, color: COLOR.text, margin: 0 }}>{e.insight}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PageHeader({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: COLOR.text, margin: 0 }}>My Economist</h1>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: "28px" }}>
      <p
        style={{
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: COLOR.textSecondary,
        }}
      >
        Economics, made useful
      </p>
      <h1
        style={{
          fontSize: "clamp(30px, 5vw, 40px)",
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          color: COLOR.text,
          marginTop: "8px",
        }}
      >
        My Economist
      </h1>
      <p style={{ fontSize: "17px", lineHeight: 1.5, color: COLOR.textSecondary, marginTop: "10px", maxWidth: "540px" }}>
        Understand the economics behind your everyday choices.
      </p>
    </div>
  );
}

// --- Shared inline style helpers --------------------------------------------

function smallLabelStyle(): React.CSSProperties {
  return {
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: COLOR.textSecondary,
  };
}

function noticeBoxStyle(bg: string, border: string): React.CSSProperties {
  return {
    marginTop: "20px",
    borderRadius: "8px",
    padding: "14px 16px",
    background: bg,
    border: `1px solid ${border}`,
  };
}
