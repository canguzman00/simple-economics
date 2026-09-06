"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { UserProfile } from "@/lib/ai/systemPrompt";
import { STARTER_QUESTIONS } from "@/lib/evidence/cards";

// --- Design tokens (My Economist page only — see the design-refresh brief) ---
const COLOR = {
  bg: "#FBF7F5",            // warm porcelain page background
  surface: "#FFFFFF",       // card/input surfaces
  text: "#202B3B",          // navy — primary text
  textSecondary: "#62616B", // secondary text
  accent: "#B9404F",        // dark coral — buttons, links
  border: "#E7DDDD",
  limitsBg: "#FAF0EE",      // pale coral inset for "what this can't tell you"
};

const FONT_VAR = "var(--font-source-sans), 'Source Sans 3', sans-serif";

// Interactive states (hover/focus-visible/disabled) live in real CSS, not
// inline styles, because inline `style` can't express pseudo-classes and
// would otherwise out-specificity any stylesheet rule. Colors are still the
// exact tokens above — this block is the only place they're duplicated as
// literal CSS.
const INTERACTIVE_STYLES = `
  .se-root { font-family: ${FONT_VAR}; }
  .se-root button, .se-root textarea, .se-root input { font-family: inherit; }

  .se-textarea {
    width: 100%; box-sizing: border-box; outline: none; resize: vertical;
    border-radius: 8px; background: ${COLOR.surface}; border: 1.5px solid ${COLOR.border};
    color: ${COLOR.text}; font-size: 15px; padding: 12px 14px; transition: border-color 120ms;
  }
  .se-textarea:focus-visible { border-color: ${COLOR.accent}; }
  .se-textarea:disabled { opacity: 0.6; }

  .se-btn-primary {
    display: inline-block; background: ${COLOR.accent}; color: #FFFFFF; border: none;
    border-radius: 8px; font-size: 14px; font-weight: 600; padding: 10px 24px;
    cursor: pointer; text-decoration: none; transition: background-color 120ms;
  }
  .se-btn-primary:hover:not(:disabled) { background: #9E3542; }
  .se-btn-primary:focus-visible { outline: 2px solid ${COLOR.accent}; outline-offset: 2px; }
  .se-btn-primary:disabled { background: #D9B6BB; color: #FFFFFF; cursor: not-allowed; }

  .se-btn-starter {
    text-align: left; font-size: 14px; line-height: 1.4; border-radius: 8px; padding: 12px 14px;
    background: ${COLOR.surface}; border: 1px solid ${COLOR.border}; color: ${COLOR.text};
    cursor: pointer; transition: border-color 120ms, background-color 120ms;
  }
  .se-btn-starter:hover { border-color: ${COLOR.accent}; background: ${COLOR.limitsBg}; }
  .se-btn-starter:focus-visible { outline: 2px solid ${COLOR.accent}; outline-offset: 2px; }

  .se-btn-link {
    font-size: 13px; font-weight: 600; color: ${COLOR.accent}; background: none; border: none;
    padding: 0; cursor: pointer;
  }
  .se-btn-link:hover { text-decoration: underline; }
  .se-btn-link:focus-visible { outline: 2px solid ${COLOR.accent}; outline-offset: 2px; border-radius: 3px; }

  .se-btn-disclosure {
    display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600;
    color: ${COLOR.text}; background: none; border: none; padding: 0; cursor: pointer;
  }
  .se-btn-disclosure:hover { color: ${COLOR.accent}; }
  .se-btn-disclosure:focus-visible { outline: 2px solid ${COLOR.accent}; outline-offset: 2px; border-radius: 3px; }

  .se-link { color: ${COLOR.accent}; text-decoration: underline; }
  .se-link:focus-visible { outline: 2px solid ${COLOR.accent}; outline-offset: 2px; }
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

interface AnswerResult {
  classification: Classification;
  answer: string;
  why: string;
  decisionRelevance: string;
  limits: string;
  suggestions: string[];
  citations: Citation[];
}

interface Props {
  profile: UserProfile;
  isAuthenticated: boolean;
}

export function MyEconomistClient({ profile, isAuthenticated }: Props) {
  const [question, setQuestion] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  async function handleSubmit(q = question) {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    setResult(null);
    setFetchError(null);
    setLimitReached(false);
    setSourcesOpen(false);
    setLoading(true);
    setLastQuestion(trimmed);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, userProfile: profile }),
      });
      if (res.status === 429) {
        setLimitReached(true);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFetchError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as AnswerResult;
      setResult(data);
      setQuestion("");
    } catch {
      setFetchError("Connection lost. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSuggested(s: string) {
    setQuestion(s);
    handleSubmit(s);
  }

  function reset() {
    setResult(null);
    setQuestion("");
    setFetchError(null);
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

  const visibleStarterQuestions = showAllQuestions ? STARTER_QUESTIONS : STARTER_QUESTIONS.slice(0, 3);

  return (
    <div className="se-root" style={{ maxWidth: "720px", color: COLOR.text }}>
      <style>{INTERACTIVE_STYLES}</style>
      <PageHeader />

      {/* Composer — kept above the starter questions per design spec */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        style={{ marginTop: "8px" }}
      >
        <label htmlFor="question" style={{ fontSize: "15px", fontWeight: 600, color: COLOR.text, display: "block" }}>
          What&apos;s on your mind?
        </label>
        <p style={{ fontSize: "13px", color: COLOR.textSecondary, marginTop: "4px", marginBottom: "12px" }}>
          Reviewed evidence. Clear limits.
        </p>
        <textarea
          id="question"
          className="se-textarea"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
          placeholder="What do you want to understand?"
          rows={3}
          disabled={loading}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
          <p style={{ fontSize: "12px", color: COLOR.textSecondary }}>⌘ + Enter to submit</p>
          <button type="submit" disabled={!question.trim() || loading} className="se-btn-primary">
            {loading ? "Asking…" : "Ask"}
          </button>
        </div>
      </form>

      {/* Starter questions */}
      {!result && !loading && (
        <div style={{ marginTop: "36px" }}>
          <p style={smallLabelStyle()}>Questions our evidence library can answer</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
            {visibleStarterQuestions.map((s) => (
              <button key={s} onClick={() => handleSuggested(s)} className="se-btn-starter">
                {s}
              </button>
            ))}
          </div>
          {STARTER_QUESTIONS.length > 3 && (
            <button onClick={() => setShowAllQuestions((v) => !v)} className="se-btn-link" style={{ marginTop: "14px", display: "block" }}>
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

      {/* Connection/technical fetch error (distinct from an "error" classification) */}
      {fetchError && (
        <div style={noticeBoxStyle("#FDECEC", "#F3C6C6")}>
          <p style={{ fontSize: "14px", color: "#A33A3A" }}>{fetchError}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ marginTop: "36px" }}>
          <p style={{ fontSize: "14px", color: COLOR.textSecondary }}>Checking the evidence library…</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{ marginTop: "40px" }}>
          {(result.classification === "covered" || result.classification === "partial") && (
            <CoveredAnswer result={result} sourcesOpen={sourcesOpen} setSourcesOpen={setSourcesOpen} />
          )}

          {(result.classification === "not_covered" || result.classification === "unsupported") && (
            <RefusalAnswer result={result} onSuggested={handleSuggested} />
          )}

          {result.classification === "error" && <ErrorAnswer result={result} onRetry={() => handleSubmit(lastQuestion)} />}

          <button onClick={reset} className="se-btn-link" style={{ marginTop: "24px", display: "block" }}>
            Ask another question →
          </button>
        </div>
      )}
    </div>
  );
}

function CoveredAnswer({
  result,
  sourcesOpen,
  setSourcesOpen,
}: {
  result: AnswerResult;
  sourcesOpen: boolean;
  setSourcesOpen: (v: (prev: boolean) => boolean) => void;
}) {
  const isPartial = result.classification === "partial";
  return (
    <div>
      <p style={smallLabelStyle()}>{isPartial ? "Partially answered by our evidence library" : "Answer"}</p>

      {/* 1. Short answer */}
      <div style={{ fontSize: "19px", lineHeight: 1.5, fontWeight: 600, marginTop: "10px", color: COLOR.text }}>
        {renderWithLinks(result.answer)}
      </div>

      {/* 2. Why */}
      {result.why && (
        <div style={{ marginTop: "24px" }}>
          <p style={sectionHeadingStyle()}>Why</p>
          <div style={bodyTextStyle()}>{renderWithLinks(result.why)}</div>
        </div>
      )}

      {/* 3. Decision relevance — only when the engine actually produced one */}
      {result.decisionRelevance && (
        <div style={{ marginTop: "24px" }}>
          <p style={sectionHeadingStyle()}>What this means for a decision</p>
          <div style={bodyTextStyle()}>{renderWithLinks(result.decisionRelevance)}</div>
        </div>
      )}

      {/* 4. What this can't tell you */}
      {result.limits && (
        <div
          style={{
            marginTop: "24px",
            background: COLOR.limitsBg,
            border: `1px solid ${COLOR.border}`,
            borderRadius: "8px",
            padding: "16px 18px",
          }}
        >
          <p style={sectionHeadingStyle()}>What this can&apos;t tell you</p>
          <div style={bodyTextStyle()}>{renderWithLinks(result.limits)}</div>
        </div>
      )}

      {/* 5. Sources & limits — expandable, per-citation metadata from the actual cited cards */}
      {result.citations.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <button onClick={() => setSourcesOpen((v) => !v)} aria-expanded={sourcesOpen} className="se-btn-disclosure">
            <span>Sources &amp; limits</span>
            <ChevronDown size={16} style={{ transform: sourcesOpen ? "rotate(180deg)" : "none", transition: "transform 150ms" }} />
          </button>
          {sourcesOpen && (
            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {result.citations.map((c) => (
                <div
                  key={c.id}
                  style={{
                    border: `1px solid ${COLOR.border}`,
                    borderRadius: "8px",
                    padding: "14px 16px",
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
    </div>
  );
}

function RefusalAnswer({ result, onSuggested }: { result: AnswerResult; onSuggested: (q: string) => void }) {
  const isUnsupported = result.classification === "unsupported";
  return (
    <div>
      <p style={sectionHeadingStyle()}>{isUnsupported ? "We couldn't confirm that answer" : "Not in our evidence library yet"}</p>
      <div style={{ ...bodyTextStyle(), marginTop: "8px" }}>{renderWithLinks(result.answer)}</div>

      {result.suggestions.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <p style={smallLabelStyle()}>Questions our library can answer</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            {result.suggestions.map((s) => (
              <button key={s} onClick={() => onSuggested(s)} className="se-btn-starter">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ErrorAnswer({ result, onRetry }: { result: AnswerResult; onRetry: () => void }) {
  return (
    <div>
      <p style={sectionHeadingStyle()}>Something went wrong</p>
      <div style={{ ...bodyTextStyle(), marginTop: "8px" }}>{renderWithLinks(result.answer)}</div>
      <button onClick={onRetry} className="se-btn-primary" style={{ marginTop: "16px" }}>
        Try again
      </button>
    </div>
  );
}

function PageHeader() {
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

// --- Shared inline style helpers (non-interactive properties only —
// hover/focus/disabled states live in INTERACTIVE_STYLES above) ------------

function smallLabelStyle(): React.CSSProperties {
  return {
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: COLOR.textSecondary,
  };
}

function sectionHeadingStyle(): React.CSSProperties {
  return { fontSize: "14px", fontWeight: 600, color: COLOR.text };
}

function bodyTextStyle(): React.CSSProperties {
  return { fontSize: "15px", lineHeight: 1.6, color: COLOR.text, marginTop: "6px" };
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
