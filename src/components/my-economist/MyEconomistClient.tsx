"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, MessagesSquare, RotateCcw, ArrowUp, Search } from "lucide-react";
import type { UserProfile } from "@/lib/ai/systemPrompt";
import { STARTER_QUESTIONS } from "@/lib/evidence/cards";

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

interface Exchange {
  id: string;
  question: string;
  result: AnswerResult | null; // null while in flight
  fetchError: string | null; // set only on a technical fetch/network failure, distinct from classification "error"
  research?: ResearchState; // present once the user has clicked "Explore the research" for this exchange
  showReviewedSuggestions?: boolean; // true once the user has clicked "Stay with reviewed topics"
}

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

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `ex-${Date.now()}-${idCounter}`;
}

export function MyEconomistClient({ profile, isAuthenticated }: Props) {
  const [draft, setDraft] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, { evidence?: boolean; explain?: boolean }>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

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

  function startOver() {
    setExchanges([]);
    setDraft("");
    setExpanded({});
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
                <EconomistReply
                  result={ex.result}
                  expanded={expanded[ex.id] ?? {}}
                  onToggle={(key) => toggle(ex.id, key)}
                  onQuickReply={(label) => send(label)}
                  onRetry={() => send(ex.question, { retryExchangeId: ex.id })}
                  disabled={loading}
                  research={ex.research}
                  showReviewedSuggestions={ex.showReviewedSuggestions}
                  onExploreResearch={() => exploreResearch(ex.id, exIndex)}
                  onStayReviewed={() => stayWithReviewed(ex.id)}
                />
              ) : (
                <TypingIndicator />
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
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
  onRetry,
  disabled,
  research,
  showReviewedSuggestions,
  onExploreResearch,
  onStayReviewed,
}: {
  result: AnswerResult;
  expanded: { evidence?: boolean; explain?: boolean };
  onToggle: (key: "evidence" | "explain") => void;
  onQuickReply: (label: string) => void;
  onRetry: () => void;
  disabled: boolean;
  research?: ResearchState;
  showReviewedSuggestions?: boolean;
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
        <div style={{ fontSize: "16px", lineHeight: 1.55, color: COLOR.text }}>
          Simple Economics hasn&apos;t yet reviewed the evidence on this topic.
        </div>
        <div style={{ fontSize: "15px", lineHeight: 1.55, color: COLOR.textSecondary, marginTop: "8px" }}>
          In the meantime, we can explore scientific research and official sources, with findings and limitations
          clearly explained. This answer has not been reviewed or approved by Simple Economics.
        </div>

        {!hasChosen && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "16px" }}>
            <button onClick={onExploreResearch} className="se-btn-primary" disabled={disabled}>
              Explore the research
            </button>
            <button onClick={onStayReviewed} className="se-btn-secondary" disabled={disabled}>
              Stay with reviewed topics
            </button>
          </div>
        )}

        {showReviewedSuggestions && result.suggestions.length > 0 && (
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
          <div style={{ marginTop: "14px" }}>
            <TypingIndicator hideIdentity />
          </div>
        )}
        {research?.fetchError && (
          <div style={{ marginTop: "14px" }}>
            <div style={{ fontSize: "14px", color: COLOR.text }}>{research.fetchError}</div>
            <button onClick={onExploreResearch} className="se-btn-primary" style={{ marginTop: "10px" }}>
              Try again
            </button>
          </div>
        )}
        {research?.status === "done" && research.data && (
          <ResearchAnswerBlock data={research.data} onQuickReply={onQuickReply} disabled={disabled} />
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
