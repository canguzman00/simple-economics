"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { UserProfile } from "@/lib/ai/systemPrompt";

const URL_REGEX = /https?:\/\/[^\s]+/g;

function renderWithLinks(text: string): React.ReactNode {
  return text.split("\n").map((line, lineIdx) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    URL_REGEX.lastIndex = 0;

    while ((match = URL_REGEX.exec(line)) !== null) {
      if (match.index > lastIndex) parts.push(line.slice(lastIndex, match.index));
      const url = match[0].replace(/[.,;:!?)]+$/, "");
      parts.push(
        <a key={match.index} href={url} target="_blank" rel="noopener noreferrer"
          style={{ color: "#F43F5E", textDecoration: "underline" }}>
          {url}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < line.length) parts.push(line.slice(lastIndex));
    return (
      <p key={lineIdx} style={{ marginTop: lineIdx > 0 ? "12px" : "0" }}>
        {parts.length > 0 ? parts : line}
      </p>
    );
  });
}

const SUGGESTED = [
  "Why did the Fed raise (or cut) rates, and what does it mean for my finances?",
  "Is now a good time to buy a house, or should I keep renting?",
  "What\'s driving inflation right now and when will prices actually come down?",
];

interface Props {
  profile: UserProfile;
  isAuthenticated: boolean;
}

export function AskClient({ profile, isAuthenticated }: Props) {
  const [question, setQuestion]   = useState("");
  const [answer, setAnswer]       = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [limitReached, setLimit]  = useState(false);
  const abortRef                  = useRef<AbortController | null>(null);

  async function handleSubmit(q = question) {
    const trimmed = q.trim();
    if (!trimmed || streaming) return;
    setAnswer(""); setError(null); setLimit(false); setStreaming(true);
    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, userProfile: profile }),
        signal: abortRef.current.signal,
      });
      if (res.status === 429) { setLimit(true); setStreaming(false); return; }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Please try again.");
        setStreaming(false); return;
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAnswer((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") setError("Connection lost. Please try again.");
    } finally {
      setStreaming(false);
    }
  }

  function handleSuggested(s: string) { setQuestion(s); handleSubmit(s); }

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: "680px" }}>
        <PageHeader />
        <div className="mt-10 rounded-xl p-8 text-center" style={{ background: "#fff", border: "1px solid #E2E8F0" }}>
          <p className="text-sm mb-5" style={{ color: "#64748B", fontFamily: "Inter, sans-serif" }}>
            Sign in to ask the Economist a question.
          </p>
          <Link href="/signin"
            className="inline-block text-xs font-semibold px-6 py-3 rounded-lg transition-colors"
            style={{ background: "#1E293B", color: "#F8FAFC", fontFamily: "Inter, sans-serif" }}>
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "680px", fontFamily: "Inter, sans-serif" }}>
      <PageHeader />

      {/* Suggested questions */}
      {!answer && !streaming && (
        <div className="flex flex-col gap-3 mt-8 mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#94A3B8" }}>
            Try asking
          </p>
          {SUGGESTED.map((s) => (
            <button key={s} onClick={() => handleSuggested(s)}
              className="text-left text-sm leading-snug rounded-xl px-4 py-3.5 transition-all"
              style={{
                background: "#fff",
                border: "1px solid #E2E8F0",
                color: "#0F172A",
                fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#F43F5E"; e.currentTarget.style.background = "#FFF1F2"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#fff"; }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col gap-3 mt-8">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
          placeholder="What do you want to understand?"
          rows={4}
          disabled={streaming}
          className="w-full outline-none resize-none transition-colors rounded-xl"
          style={{
            background: "#fff",
            border: "1.5px solid #E2E8F0",
            color: "#0F172A",
            fontFamily: "Inter, sans-serif",
            fontSize: "15px",
            padding: "14px 16px",
            opacity: streaming ? 0.5 : 1,
          }}
          onFocus={e => e.currentTarget.style.borderColor = "#F43F5E"}
          onBlur={e => e.currentTarget.style.borderColor = "#E2E8F0"}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>⌘ + Enter to submit</p>
          <button type="submit" disabled={!question.trim() || streaming}
            className="text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
            style={{
              background: !question.trim() || streaming ? "#E2E8F0" : "#F43F5E",
              color: !question.trim() || streaming ? "#94A3B8" : "#fff",
              fontFamily: "Inter, sans-serif",
              cursor: !question.trim() || streaming ? "not-allowed" : "pointer",
            }}>
            {streaming ? "Thinking…" : "Get the answer"}
          </button>
        </div>
      </form>

      {/* Rate limit */}
      {limitReached && (
        <div className="mt-6 rounded-xl px-5 py-4" style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
          <p className="text-sm" style={{ color: "#EA580C", fontFamily: "Inter, sans-serif" }}>
            You&apos;ve reached your daily limit of 5 questions. Check back tomorrow.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl px-4 py-3" style={{ background: "#FEE2E2", border: "1px solid #FECACA" }}>
          <p className="text-sm" style={{ color: "#DC2626", fontFamily: "Inter, sans-serif" }}>{error}</p>
        </div>
      )}

      {/* Answer */}
      {(answer || streaming) && (
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#1E293B" }}>
              <span style={{ color: "#F43F5E", fontSize: "14px", fontWeight: "700" }}>E</span>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
              The Economist Responds
            </p>
          </div>
          <div className="rounded-xl px-6 py-5" style={{ background: "#fff", border: "1px solid #E2E8F0", borderLeft: "3px solid #F43F5E" }}>
            <div className="text-base leading-relaxed" style={{ color: "#0F172A", fontFamily: "Inter, sans-serif" }}>
              {renderWithLinks(answer)}
              {streaming && (
                <span className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse" style={{ background: "#F43F5E" }} />
              )}
            </div>
          </div>
          {!streaming && answer && (
            <button onClick={() => { setAnswer(""); setQuestion(""); }}
              className="mt-5 text-sm font-medium transition-colors"
              style={{ color: "#64748B", fontFamily: "Inter, sans-serif" }}>
              Ask another question →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PageHeader() {
  return (
    <div className="pb-8 mb-2">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#1E293B" }}>
          <span style={{ color: "#F43F5E", fontSize: "18px", fontWeight: "800" }}>E</span>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
          AI-powered · Evidence-based
        </span>
      </div>
      <h1 className="font-bold leading-tight" style={{ fontSize: "36px", color: "#0F172A", fontFamily: "Inter, sans-serif" }}>
        Ask the Economist
      </h1>
      <p className="mt-3 text-base leading-relaxed" style={{ color: "#64748B", fontFamily: "Inter, sans-serif" }}>
        A straight answer on anything economics — based on your situation.
      </p>
    </div>
  );
}
