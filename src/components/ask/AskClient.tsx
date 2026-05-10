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
      const url = match[0].replace(/[.,;:!?)]+$/, ""); // strip trailing punctuation
      parts.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold-500 underline underline-offset-2 hover:text-gold-300 transition-colors"
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

      if (res.status === 429) {
        setLimit(true);
        setStreaming(false);
        return;
      }
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
        <div className="mt-10 border border-[#2C2417] rounded-xl p-8 text-center">
          <p className="font-sans text-sm text-[#7A6A52] mb-4">
            Sign in to ask the Economist a question.
          </p>
          <Link
            href="/signin"
            className="inline-block bg-[#C49A52] hover:bg-[#E2C27A] transition-colors text-[#1A1208] font-sans font-medium text-sm px-6 py-2.5 rounded-lg"
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
          <p className="font-sans text-xs text-[#4A3D2A] uppercase tracking-widest mb-1">
            Try asking
          </p>
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggested(s)}
              className="text-left font-sans text-sm text-[#7A6A52] hover:text-[#C8B8A2] border border-[#2C2417] hover:border-[#4A3D2A] rounded-lg px-4 py-3 transition-colors leading-snug"
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
          placeholder="What do you want to understand?"
          rows={4}
          disabled={streaming}
          className="w-full bg-[#2C2417] border border-[#4A3D2A] focus:border-[#C49A52] text-[#C8B8A2] placeholder-[#4A3D2A] font-sans text-base py-3.5 px-4 rounded-xl outline-none transition-colors resize-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between">
          <p className="font-sans text-xs text-[#4A3D2A]">
            ⌘ + Enter to submit
          </p>
          <button
            type="submit"
            disabled={!question.trim() || streaming}
            className="bg-[#C49A52] hover:bg-[#E2C27A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[#1A1208] font-sans font-medium text-sm px-6 py-2.5 rounded-lg"
          >
            {streaming ? "Thinking…" : "Get the answer"}
          </button>
        </div>
      </form>

      {/* Rate limit */}
      {limitReached && (
        <div className="mt-6 border border-[#4A3D2A] rounded-xl px-5 py-4">
          <p className="font-sans text-sm text-[#7A6A52]">
            You&apos;ve reached your daily limit of {5} questions.
            Check back tomorrow.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-4 font-sans text-sm text-[#D4613C] border border-[#D4613C]/30 bg-[#D4613C]/5 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {/* Streaming answer */}
      {(answer || streaming) && (
        <div className="mt-8">
          {/* Re-stated question */}
          <p className="font-sans text-xs text-[#4A3D2A] uppercase tracking-widest mb-4">
            The Economist responds
          </p>

          {/* Pull quote block */}
          <div className="border-l-2 border-[#C49A52] bg-[#C49A52]/5 rounded-r-xl px-6 py-5">
            <div className="font-sans text-base text-[#C8B8A2] leading-relaxed">
              {renderWithLinks(answer)}
              {streaming && (
                <span className="inline-block w-0.5 h-4 bg-[#C49A52] ml-0.5 animate-pulse align-middle" />
              )}
            </div>
          </div>

          {/* Ask another */}
          {!streaming && answer && (
            <button
              onClick={() => { setAnswer(""); setQuestion(""); }}
              className="mt-5 font-sans text-sm text-[#7A6A52] hover:text-[#C49A52] transition-colors"
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
    <div>
      <h1 className="font-serif text-4xl sm:text-5xl text-[#FAF9F6] leading-tight">
        Ask the Economist
      </h1>
      <p className="mt-3 font-sans text-base text-[#7A6A52] leading-relaxed">
        A straight answer on anything economics — based on your situation.
      </p>
    </div>
  );
}
