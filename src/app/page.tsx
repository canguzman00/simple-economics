export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";
import { getAuthSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getAuthSession();
  const isAuthed = !!session?.user;

  return (
    <div className="min-h-screen bg-primary-white text-primary-black">

      {/* ── Top nav ── */}
      <nav className="bg-primary-white border-b-2 border-primary-black sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 bg-primary-red shrink-0" aria-hidden="true" />
            <span className="font-sans text-sm font-bold uppercase tracking-widest text-primary-black leading-none">
              Simple Economics
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/feed"
              className="hidden sm:block font-sans text-xs uppercase tracking-widest text-gray-500 hover:text-primary-black transition-colors"
            >
              Feed
            </Link>
            {isAuthed ? (
              <Link
                href="/feed"
                className="font-sans text-xs uppercase tracking-widest bg-primary-black text-primary-white hover:bg-primary-red transition-colors px-4 py-2"
              >
                Go to Feed
              </Link>
            ) : (
              <Link
                href="/signin"
                className="font-sans text-xs uppercase tracking-widest bg-primary-black text-primary-white hover:bg-primary-red transition-colors px-4 py-2"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-primary-white border-b-2 border-primary-black overflow-hidden">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[calc(100vh-3.5rem)]">

            {/* Left: headline + CTA */}
            <div className="py-20 lg:py-0 lg:pr-16">
              <p className="font-sans text-xs uppercase tracking-[0.25em] text-gray-500 mb-6">
                Economic education for real life
              </p>
              <h1 className="font-sans font-black text-5xl sm:text-6xl lg:text-7xl text-primary-black leading-[0.95] tracking-tight uppercase">
                Big ideas.<br />
                Simple terms.<br />
                <span className="text-primary-red">Smarter you.</span>
              </h1>
              <p className="mt-8 font-sans text-base text-gray-700 leading-relaxed max-w-sm">
                Simple Economics explains what&apos;s happening in the economy and what it means specifically for you — based on how you actually live.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/onboarding"
                  className="font-sans text-xs font-bold uppercase tracking-widest bg-primary-black text-primary-white hover:bg-primary-red transition-colors px-7 py-4 text-center"
                >
                  Get Started Free →
                </Link>
                <a
                  href="#how-it-works"
                  className="font-sans text-xs font-bold uppercase tracking-widest border-2 border-primary-black text-primary-black hover:bg-primary-black hover:text-primary-white transition-colors px-7 py-4 text-center"
                >
                  See How It Works
                </a>
              </div>
            </div>

            {/* Right: global economics image */}
            <div className="hidden lg:flex h-full min-h-[calc(100vh-3.5rem)] relative border-l-2 border-primary-black overflow-hidden flex-col">
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=80&auto=format&fit=crop"
                alt="Global economic network — Earth at night"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,10,0.55)" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "32px", gap: "12px" }}>
                <p style={{ fontSize: "9px", fontFamily: "var(--font-unbounded)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>Live Economic Indicators</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  {[
                    { label: "World GDP", value: "$123T", source: "IMF 2026" },
                    { label: "Global Growth", value: "3.1%", source: "IMF WEO Apr 2026" },
                    { label: "Global Inflation", value: "4.5%", source: "IMF 2026" },
                    { label: "Oil Price", value: "$82/bbl", source: "IMF Apr 2026" },
                    { label: "World Trade Growth", value: "3.0%", source: "WTO 2026" },
                    { label: "Global Unemployment", value: "5.1%", source: "ILO 2026" },
                  ].map(({ label, value, source }) => (
                    <div key={label} style={{ background: "rgba(250,250,250,0.08)", border: "1px solid rgba(255,255,255,0.15)", padding: "12px" }}>
                      <div style={{ fontSize: "7px", fontFamily: "var(--font-inter)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>{label}</div>
                      <div style={{ fontSize: "20px", fontFamily: "var(--font-inter)", fontWeight: 900, color: "#FAFAFA", marginTop: "4px", lineHeight: 1 }}>{value}</div>
                      <div style={{ fontSize: "7px", fontFamily: "var(--font-jetbrains-mono)", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>{source}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="bg-primary-white border-b-2 border-primary-black">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-16">
            How it works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-t-2 border-primary-black">
            {[
              {
                step: "01",
                accent: "bg-primary-red",
                title: "Tell us your situation",
                body: "Renter, homeowner, employed, student. One quick question set. 60 seconds.",
              },
              {
                step: "02",
                accent: "bg-primary-blue",
                title: "Get your personalized feed",
                body: "Economic events translated into what they mean for your life — not for a hedge fund manager.",
              },
              {
                step: "03",
                accent: "bg-primary-yellow",
                title: "Ask anything",
                body: "Ask the Economist answers your questions with real data, named sources, and a clear bottom line.",
              },
            ].map(({ step, accent, title, body }, i) => (
              <div
                key={step}
                className={`p-8 flex flex-col gap-5 border-b-2 border-primary-black sm:border-b-0 ${
                  i < 2 ? "sm:border-r-2 sm:border-primary-black" : ""
                }`}
              >
                <span className={`w-10 h-10 ${accent} flex items-center justify-center`}>
                  <span className="font-sans text-sm font-black text-primary-black">{step}</span>
                </span>
                <h3 className="font-sans text-base font-bold uppercase tracking-wide text-primary-black leading-snug">
                  {title}
                </h3>
                <p className="font-sans text-sm text-gray-500 leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two problems ── */}
      <section className="bg-gray-100 border-b-2 border-primary-black">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-16">
            Two problems, one solution
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                label: "Problem 1",
                title: "The Translation Gap",
                body: "Economic news is written for economists, traders, and policymakers — not people. The jargon is dense, the implications are never spelled out, and the question “what does this mean for me?” is never answered.",
                cta: "We translate it.",
              },
              {
                label: "Problem 2",
                title: "One Size Fits Nobody",
                body: "Generic economic advice assumes you own a home, have a retirement account, and earn a six-figure salary. Most people don’t. The same interest rate hike means something completely different to a renter than it does to a homeowner.",
                cta: "Every answer is filtered through your real situation.",
              },
            ].map(({ label, title, body, cta }) => (
              <div key={label} className="bg-primary-white border-2 border-primary-black p-8 flex flex-col gap-4">
                <span className="font-sans text-xs font-bold uppercase tracking-widest text-primary-red">
                  {label}
                </span>
                <h3 className="font-sans text-xl font-black uppercase text-primary-black leading-tight">
                  {title}
                </h3>
                <p className="font-sans text-sm text-gray-500 leading-relaxed">{body}</p>
                <p className="font-sans text-sm font-semibold text-primary-black mt-auto pt-2">
                  {cta}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Built on evidence ── */}
      <section className="bg-primary-yellow border-b-2 border-primary-black">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-sans text-xs font-black uppercase tracking-[0.25em] text-primary-black mb-12">
            Built on evidence
          </p>
          <div className="flex flex-wrap gap-3 mb-14">
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
              <span
                key={source}
                className="font-sans text-xs font-bold uppercase tracking-wide text-primary-black border-2 border-primary-black px-3 py-2"
              >
                {source}
              </span>
            ))}
          </div>

          <div className="border-2 border-primary-black bg-primary-white p-6 max-w-lg">
            <p className="font-sans text-sm text-gray-700 leading-relaxed">
              Simple Economics provides economic education only.{" "}
              <strong className="text-primary-black">Not financial or investment advice.</strong>{" "}
              Every answer includes its sources so you can verify what we say.
            </p>
          </div>

          {/* Final CTA */}
          <div className="mt-14">
            <Link
              href="/onboarding"
              className="inline-block font-sans text-xs font-black uppercase tracking-widest bg-primary-black text-primary-white hover:bg-primary-red transition-colors px-8 py-4"
            >
              Get Started Free →
            </Link>
            <p className="mt-4 font-sans text-xs text-primary-black">No credit card. No paywall to start.</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-primary-black text-primary-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">

            {/* Brand + nav */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 bg-primary-red shrink-0" aria-hidden="true" />
                <span className="font-sans text-sm font-bold uppercase tracking-widest text-primary-white">
                  Simple Economics
                </span>
              </div>
              <nav className="flex flex-wrap gap-x-6 gap-y-2">
                {[
                  { label: "Feed",              href: "/feed" },
                  { label: "Ask the Economist", href: "/ask" },
                  { label: "My Economy",        href: "/my-economy" },
                  { label: "Sign in",           href: "/signin" },
                ].map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="font-sans text-xs uppercase tracking-wider text-gray-500 hover:text-primary-yellow transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-5">
              <FooterSocialLink href="https://youtube.com"   label="YouTube"   icon={<YouTubeIcon />} />
              <FooterSocialLink href="https://tiktok.com"    label="TikTok"    icon={<TikTokIcon />} />
              <FooterSocialLink href="https://instagram.com" label="Instagram" icon={<InstagramIcon />} />
              <FooterSocialLink href="https://facebook.com"  label="Facebook"  icon={<FacebookIcon />} />
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="font-sans text-[10px] uppercase tracking-wider text-gray-700">
              © {new Date().getFullYear()} Simple Economics
            </p>
            <p className="font-sans text-[10px] text-gray-700 sm:text-right">
              Economic education only. Not financial advice.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

// ─── Social icons ─────────────────────────────────────────────────────────────

function FooterSocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className="text-primary-white hover:text-primary-yellow transition-colors">
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
