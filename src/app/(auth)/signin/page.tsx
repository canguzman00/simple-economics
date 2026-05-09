"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("email", { email, callbackUrl, redirect: false });
    setEmailSent(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#1A1208] px-6">
      {/* Wordmark */}
      <div className="mb-12 text-center">
        <h1 className="font-serif text-4xl sm:text-5xl text-[#C49A52] tracking-tight leading-none">
          Simple Economics
        </h1>
        <p className="mt-3 text-[#7A6A52] text-sm tracking-widest uppercase font-sans">
          The economy, translated for your life.
        </p>
      </div>

      <div className="w-full max-w-sm">
        {emailSent ? (
          <div className="text-center space-y-3">
            <p className="text-[#C8B8A2] font-sans text-base">
              Check your inbox.
            </p>
            <p className="text-[#7A6A52] font-sans text-sm">
              We sent a sign-in link to{" "}
              <span className="text-[#C49A52]">{email}</span>.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Google */}
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 bg-[#2C2417] hover:bg-[#4A3D2A] transition-colors text-[#C8B8A2] font-sans text-sm py-3 px-4 rounded border border-[#4A3D2A] hover:border-[#7A6A52]"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#2C2417]" />
              <span className="text-[#4A3D2A] font-sans text-xs uppercase tracking-widest">
                or
              </span>
              <div className="flex-1 h-px bg-[#2C2417]" />
            </div>

            {/* Email magic link */}
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#2C2417] border border-[#4A3D2A] focus:border-[#C49A52] text-[#C8B8A2] placeholder-[#4A3D2A] font-sans text-sm py-3 px-4 rounded outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C49A52] hover:bg-[#E2C27A] disabled:opacity-50 transition-colors text-[#1A1208] font-sans text-sm font-medium py-3 px-4 rounded"
              >
                {loading ? "Sending…" : "Send magic link"}
              </button>
            </form>
          </div>
        )}
      </div>

      <p className="mt-16 text-[#4A3D2A] font-sans text-xs">
        © {new Date().getFullYear()} Simple Economics
      </p>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1A1208]" />}>
      <SignInContent />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
