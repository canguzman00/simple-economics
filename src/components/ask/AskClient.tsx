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
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }
      const url = match[0].replace(/[.,;:!?)]+$/, "");
      parts.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-blue underline underline-offset-2 hover:text-primary-red transition-colors"
        >
          {url}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    return (
      <p key={lineIdx} className={lineIdx > 0 ? "mt-3" : ""}>
        {parts.length > 0 ? parts : line}
      </p>
    );
  });
}

const SUGGESTED = [
  "Why did the Fed raise (or cut) rates, and what does it mean for my finances?",
  "Is now a good time to buy a house, or should I keep renting?",
  "What's driving inflation right now and when will prices actually come down?",
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

    setAnswer("");
    setError(null);
    setLimit(false);
    setStreaming(true);
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
        setStreaming(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAnswer((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError("Connection lost. Please try again.");
      }
    } finally {
      setStreaming(false);
    }
  }

  function handleSuggested(s: string) {
    setQuestion(s);
    handleSubmit(s);
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl">
        <PageHeader />
        <div className="mt-10 border-2 border-primary-black p-8 text-center">
          <p className="font-sans text-sm text-gray-700 mb-5">
            Sign in to ask the Economist a question.
          </p>
          <Link
            href="/signin"
            className="inline-block font-sans text-xs font-bold uppercase tracking-widest bg-primary-black text-primary-white hover:bg-primary-red transition-colors px-6 py-3"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader />

      {/* Suggested questions */}
      {!answer && !streaming && (
        <div className="flex flex-col gap-2 mt-8 mb-6">
          <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
            Try asking
          </p>
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggested(s)}
              className="text-left font-sans text-sm text-primary-black bg-primary-white border-2 border-primary-black hover:bg-primary-yellow transition-colors px-4 py-3 leading-snug"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input form */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        className="flex flex-col gap-3 mt-8"
      >
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
          placeholder="What do you want to understand?"
          rows={4}
          disabled={streaming}
          className="w-full bg-primary-white border-2 border-primary-black focus:border-primary-blue text-primary-black placeholder-gray-300 font-sans text-base py-3.5 px-4 outline-none transition-colors resize-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between">
          <p className="font-sans text-xs text-gray-500">⌘ + Enter to submit</p>
          <button
            type="submit"
            disabled={!question.trim() || streaming}
            className="font-sans text-xs font-bold uppercase tracking-widest bg-primary-black text-primary-white hover:bg-primary-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-6 py-3"
          >
            {streaming ? "Thinking…" : "Get the answer"}
          </button>
        </div>
      </form>

      {/* Rate limit */}
      {limitReached && (
        <div className="mt-6 border-2 border-primary-black px-5 py-4 bg-gray-100">
          <p className="font-sans text-sm text-primary-black">
            You&apos;ve reached your daily limit of 5 questions. Check back tomorrow.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 border-2 border-primary-red bg-primary-red px-4 py-3">
          <p className="font-sans text-sm text-primary-white">{error}</p>
        </div>
      )}

      {/* Streaming answer */}
      {(answer || streaming) && (
        <div className="mt-8">
          <p className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-primary-black mb-4">
            The Economist Responds
          </p>
          <div className="border-l-4 border-primary-blue bg-primary-white border-2 border-primary-black px-6 py-5">
            <div className="font-sans text-base text-primary-black leading-relaxed">
              {renderWithLinks(answer)}
              {streaming && (
                <span className="inline-block w-0.5 h-4 bg-primary-black ml-0.5 animate-pulse align-middle" />
              )}
            </div>
          </div>
          {!streaming && answer && (
            <button
              onClick={() => { setAnswer(""); setQuestion(""); }}
              className="mt-5 font-sans text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-primary-black transition-colors"
            >
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
    <div className="border-b-2 border-primary-black pb-8 mb-2">
      <h1 className="font-sans font-black text-4xl sm:text-5xl text-primary-black leading-tight uppercase">
        Ask the Economist
      </h1>
      <p className="mt-3 font-sans text-base text-gray-700 leading-relaxed">
        A straight answer on anything economics — based on your situation.
      </p>
    </div>
  );
}
