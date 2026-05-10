export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";
import { getAuthSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getAuthSession();
  const isAuthed = !!session?.user;

  return (
    <div className="min-h-screen bg-[#1A1208] text-[#FAF9F6]">

      {/* ── Top nav ── */}
      <nav className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
        <span className="font-serif text-xl text-[#C49A52] tracking-tight">
          Simple Economics
        </span>
        <div className="flex items-center gap-5">
          <Link href="/feed" className="font-sans text-sm text-[#7A6A52] hover:text-[#C8B8A2] transition-colors hidden sm:block">
            Feed
          </Link>
          {isAuthed ? (
            <Link
              href="/feed"
              className="font-sans text-sm text-[#C49A52] hover:text-[#E2C27A] border border-[#4A3D2A] hover:border-[#C49A52] transition-colors px-4 py-1.5 rounded-lg"
            >
              Go to Feed
            </Link>
          ) : (
            <Link
              href="/signin"
              className="font-sans text-sm text-[#C49A52] hover:text-[#E2C27A] border border-[#4A3D2A] hover:border-[#C49A52] transition-colors px-4 py-1.5 rounded-lg"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-28 text-center">
        <p className="font-sans text-xs text-[#C49A52] uppercase tracking-[0.2em] mb-6">
          Economic education for real life
        </p>
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-[#FAF9F6] leading-[1.08] tracking-tight">
          The economy,<br />translated for<br />your life.
        </h1>
        <p className="mt-8 font-sans text-lg sm:text-xl text-[#7A6A52] leading-relaxed max-w-2xl mx-auto">
          Simple Economics explains what&apos;s happening in the economy and what it means specifically for you — based on how you actually live.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/onboarding"
            className="w-full sm:w-auto bg-[#C49A52] hover:bg-[#E2C27A] transition-colors text-[#1A1208] font-sans font-semibold text-sm px-8 py-3.5 rounded-lg"
          >
            Get Started Free
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto border border-[#2C2417] hover:border-[#4A3D2A] text-[#7A6A52] hover:text-[#C8B8A2] font-sans text-sm px-8 py-3.5 rounded-lg transition-colors text-center"
          >
            See How It Works
          </a>
        </div>

        {/* Thin divider */}
        <div className="mt-20 mx-auto w-px h-16 bg-gradient-to-b from-[#2C2417] to-transparent" />
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="mx-auto max-w-4xl px-6 py-20">
        <p className="font-sans text-xs text-[#4A3D2A] uppercase tracking-widest text-center mb-14">
          How it works
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6">
          {[
            {
              step: "01",
              title: "Tell us your situation",
              body: "Renter, homeowner, employed, student. One quick question set. 60 seconds.",
            },
            {
              step: "02",
              title: "Get your personalized feed",
              body: "Economic events translated into what they mean for your life — not for a hedge fund manager.",
            },
            {
              step: "03",
              title: "Ask anything",
              body: "Ask the Economist answers your questions with real data, named sources, and a clear bottom line.",
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="flex flex-col gap-4">
              <span className="font-mono text-3xl text-[#2C2417] leading-none">{step}</span>
              <div className="w-10 h-px bg-[#C49A52]" />
              <h3 className="font-serif text-xl text-[#FAF9F6] leading-snug">{title}</h3>
              <p className="font-sans text-sm text-[#7A6A52] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── The two problems ── */}
      <section className="bg-[#2C2417]/30 border-y border-[#2C2417]">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <p className="font-sans text-xs text-[#4A3D2A] uppercase tracking-widest text-center mb-14">
            Two problems, one solution
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border border-[#2C2417] bg-[#1A1208] rounded-xl px-7 py-8 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[#D4613C]">PROBLEM 1</span>
              </div>
              <h3 className="font-serif text-2xl text-[#FAF9F6] leading-snug">
                The Translation Gap
              </h3>
              <p className="font-sans text-sm text-[#7A6A52] leading-relaxed">
                Economic news is written for economists, traders, and policymakers — not people. The jargon is dense, the implications are never spelled out, and the question &ldquo;what does this mean for me?&rdquo; is never answered.
              </p>
              <p className="font-sans text-sm text-[#C49A52] leading-relaxed">
                We translate it.
              </p>
            </div>
            <div className="border border-[#2C2417] bg-[#1A1208] rounded-xl px-7 py-8 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[#D4613C]">PROBLEM 2</span>
              </div>
              <h3 className="font-serif text-2xl text-[#FAF9F6] leading-snug">
                One Size Fits Nobody
              </h3>
              <p className="font-sans text-sm text-[#7A6A52] leading-relaxed">
                Generic economic advice assumes you own a home, have a retirement account, and earn a six-figure salary. Most people don&apos;t. The same interest rate hike means something completely different to a renter than it does to a homeowner.
              </p>
              <p className="font-sans text-sm text-[#C49A52] leading-relaxed">
                Every answer is filtered through your real situation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof / evidence ── */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="font-sans text-xs text-[#4A3D2A] uppercase tracking-widest mb-10">
          Built on evidence
        </p>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-12">
          {[
            "Federal Reserve",
            "Bureau of Labor Statistics",
            "International Monetary Fund",
            "World Bank",
            "NBER Working Papers",
            "Brookings Institution",
            "Congressional Budget Office",
            "Peer-reviewed journals",
          ].map((source) => (
            <span key={source} className="font-sans text-xs text-[#4A3D2A]">
              {source}
            </span>
          ))}
        </div>
        <div className="mx-auto max-w-md border border-[#2C2417] rounded-xl px-6 py-5 bg-[#2C2417]/20">
          <p className="font-sans text-xs text-[#7A6A52] leading-relaxed">
            Simple Economics provides economic education only.{" "}
            <span className="text-[#4A3D2A]">Not financial or investment advice.</span>{" "}
            Every answer includes its sources so you can verify what we say.
          </p>
        </div>

        {/* Final CTA */}
        <div className="mt-16">
          <Link
            href="/onboarding"
            className="inline-block bg-[#C49A52] hover:bg-[#E2C27A] transition-colors text-[#1A1208] font-sans font-semibold text-sm px-10 py-4 rounded-lg"
          >
            Get Started Free
          </Link>
          <p className="mt-4 font-sans text-xs text-[#4A3D2A]">No credit card. No paywall to start.</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#2C2417]">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            {/* Brand + nav */}
            <div className="flex flex-col gap-4">
              <span className="font-serif text-base text-[#C49A52]">Simple Economics</span>
              <nav className="flex flex-wrap gap-x-5 gap-y-2">
                {[
                  { label: "Feed", href: "/feed" },
                  { label: "Ask the Economist", href: "/ask" },
                  { label: "My Economy", href: "/my-economy" },
                  { label: "Sign in", href: "/signin" },
                ].map(({ label, href }) => (
                  <Link key={href} href={href} className="font-sans text-xs text-[#4A3D2A] hover:text-[#7A6A52] transition-colors">
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-5">
              <SocialLink href="https://youtube.com" label="YouTube" icon={<YouTubeIcon />} />
              <SocialLink href="https://tiktok.com" label="TikTok" icon={<TikTokIcon />} />
              <SocialLink href="https://instagram.com" label="Instagram" icon={<InstagramIcon />} />
              <SocialLink href="https://facebook.com" label="Facebook" icon={<FacebookIcon />} />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#2C2417] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="font-sans text-[10px] text-[#2C2417]">
              © {new Date().getFullYear()} Simple Economics
            </p>
            <p className="font-sans text-[10px] text-[#2C2417] max-w-xs sm:text-right">
              Economic education only. Not financial advice.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

// ─── Social icons ─────────────────────────────────────────────────────────────

function SocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className="text-[#2C2417] hover:text-[#C49A52] transition-colors">
      {icon}
    </a>
  );
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
