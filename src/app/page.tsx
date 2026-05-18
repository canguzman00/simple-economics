export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";
import { getAuthSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getAuthSession();
  const isAuthed = !!session?.user;

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC", fontFamily: "Inter, sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: "#1E293B", borderBottom: "1px solid #334155" }} className="sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md flex-shrink-0" style={{ background: "#F43F5E" }} />
            <span className="text-sm font-bold tracking-wide leading-none" style={{ color: "#F8FAFC", fontFamily: "Inter, sans-serif" }}>
              Simple Economics
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/feed" className="hidden sm:block text-xs font-medium transition-colors" style={{ color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
              Feed
            </Link>
            {isAuthed ? (
              <Link href="/feed" className="text-xs font-semibold px-4 py-2 rounded-lg transition-colors" style={{ background: "#F43F5E", color: "#fff", fontFamily: "Inter, sans-serif" }}>
                Go to Feed
              </Link>
            ) : (
              <Link href="/signin" className="text-xs font-semibold px-4 py-2 rounded-lg transition-colors" style={{ background: "#F43F5E", color: "#fff", fontFamily: "Inter, sans-serif" }}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: "#F8FAFC" }} className="overflow-hidden">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[calc(100vh-3.5rem)]">

            {/* Left */}
            <div className="py-20 lg:py-0 lg:pr-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ background: "#FFF1F2", border: "1px solid #FECDD3" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#F43F5E" }} />
                <span className="text-xs font-medium" style={{ color: "#F43F5E", fontFamily: "Inter, sans-serif" }}>Economic education for real life</span>
              </div>
              <h1 className="font-bold leading-tight tracking-tight" style={{ fontSize: "clamp(40px, 6vw, 64px)", color: "#0F172A", fontFamily: "Inter, sans-serif" }}>
                Big ideas.<br />
                Simple terms.<br />
                <span style={{ color: "#F43F5E" }}>Smarter you.</span>
              </h1>
              <p className="mt-6 text-base leading-relaxed max-w-sm" style={{ color: "#64748B", fontFamily: "Inter, sans-serif" }}>
                Simple Economics explains what&apos;s happening in the economy and what it means specifically for you — based on how you actually live.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link href="/onboarding"
                  className="text-sm font-semibold px-7 py-3.5 rounded-lg text-center transition-colors"
                  style={{ background: "#F43F5E", color: "#fff", fontFamily: "Inter, sans-serif" }}>
                  Get Started Free →
                </Link>
                <a href="#how-it-works"
                  className="text-sm font-semibold px-7 py-3.5 rounded-lg text-center transition-colors"
                  style={{ background: "#fff", color: "#1E293B", border: "1px solid #E2E8F0", fontFamily: "Inter, sans-serif" }}>
                  See How It Works
                </a>
              </div>
              <p className="mt-4 text-xs" style={{ color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>No credit card. No paywall to start.</p>
            </div>

            {/* Right: image + indicators */}
            <div className="hidden lg:flex h-full min-h-[calc(100vh-3.5rem)] relative overflow-hidden flex-col rounded-2xl" style={{ border: "1px solid #E2E8F0" }}>
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=80&auto=format&fit=crop"
                alt="Global economic network"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,10,0.65)" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "32px", gap: "12px" }}>
                <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "8px", fontFamily: "Inter, sans-serif" }}>Live Global Indicators</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  {[
                    { label: "World GDP", value: "$123T", source: "IMF 2026" },
                    { label: "Global Growth", value: "3.1%", source: "IMF WEO Apr 2026" },
                    { label: "Global Inflation", value: "4.5%", source: "IMF 2026" },
                    { label: "Oil Price", value: "$82/bbl", source: "IMF Apr 2026" },
                    { label: "World Trade", value: "3.0%", source: "WTO 2026" },
                    { label: "Unemployment", value: "5.1%", source: "ILO 2026" },
                    { label: "World Population", value: "8.12B", source: "UN 2026" },
                    { label: "Global Debt", value: "$251T", source: "IMF GDD 2024" },
                    { label: "Poverty Rate", value: "8.5%", source: "World Bank 2026" },
                  ].map(({ label, value, source }) => (
                    <div key={label} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", padding: "12px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "8px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>{label}</div>
                      <div style={{ fontSize: "20px", fontWeight: 700, color: "#FAFAFA", marginTop: "4px", lineHeight: 1, fontFamily: "Inter, sans-serif" }}>{value}</div>
                      <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.25)", marginTop: "4px", fontFamily: "Inter, sans-serif" }}>{source}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ background: "#1E293B" }}>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-16" style={{ color: "#64748B", fontFamily: "Inter, sans-serif" }}>How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "01", color: "#F43F5E", title: "Tell us your situation", body: "Renter, homeowner, employed, student. One quick question set. 60 seconds." },
              { step: "02", color: "#3B82F6", title: "Get your personalized feed", body: "Economic events translated into what they mean for your life — not for a hedge fund manager." },
              { step: "03", color: "#8B5CF6", title: "Ask anything", body: "Ask the Simple Economist answers your questions with real data, named sources, and a clear bottom line." },
            ].map(({ step, color, title, body }) => (
              <div key={step} className="rounded-xl p-7 flex flex-col gap-4" style={{ background: "#0F172A", border: "1px solid #334155" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: color, color: "#fff", fontFamily: "Inter, sans-serif" }}>
                  {step}
                </div>
                <h3 className="font-semibold text-base leading-snug" style={{ color: "#F8FAFC", fontFamily: "Inter, sans-serif" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748B", fontFamily: "Inter, sans-serif" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Problems */}
      <section style={{ background: "#F8FAFC" }}>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-16" style={{ color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>Two problems, one solution</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                label: "Problem 1",
                title: "The Translation Gap",
                body: "Economic news is written for economists, traders, and policymakers — not people. The jargon is dense, the implications are never spelled out, and the question "what does this mean for me?" is never answered.",
                cta: "We translate it.",
              },
              {
                label: "Problem 2",
                title: "One Size Fits Nobody",
                body: "Generic economic advice assumes you own a home, have a retirement account, and earn a six-figure salary. Most people don't. The same interest rate hike means something completely different to a renter than to a homeowner.",
                cta: "Every answer is filtered through your real situation.",
              },
            ].map(({ label, title, body, cta }) => (
              <div key={label} className="rounded-xl p-8 flex flex-col gap-4" style={{ background: "#fff", border: "1px solid #E2E8F0", borderTop: "3px solid #F43F5E" }}>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#F43F5E", fontFamily: "Inter, sans-serif" }}>{label}</span>
                <h3 className="font-bold text-xl leading-tight" style={{ color: "#0F172A", fontFamily: "Inter, sans-serif" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748B", fontFamily: "Inter, sans-serif" }}>{body}</p>
                <p className="text-sm font-semibold mt-auto pt-2" style={{ color: "#0F172A", fontFamily: "Inter, sans-serif" }}>{cta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built on Evidence */}
      <section style={{ background: "#1E293B" }}>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-12" style={{ color: "#64748B", fontFamily: "Inter, sans-serif" }}>Built on evidence</p>
          <div className="flex flex-wrap gap-2 mb-12">
            {[
              "Federal Reserve", "Bureau of Labor Statistics", "International Monetary Fund",
              "World Bank", "NBER Working Papers", "Brookings Institution",
              "Congressional Budget Office", "Peer-reviewed journals",
            ].map((source) => (
              <span key={source} className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: "#0F172A", color: "#94A3B8", border: "1px solid #334155", fontFamily: "Inter, sans-serif" }}>
                {source}
              </span>
            ))}
          </div>
          <div className="rounded-xl p-6 max-w-lg mb-14" style={{ background: "#0F172A", border: "1px solid #334155" }}>
            <p className="text-sm leading-relaxed" style={{ color: "#64748B", fontFamily: "Inter, sans-serif" }}>
              Simple Economics provides economic education only.{" "}
              <strong style={{ color: "#F8FAFC" }}>Not financial or investment advice.</strong>{" "}
              Every answer includes its sources so you can verify what we say.
            </p>
          </div>
          <Link href="/onboarding"
            className="inline-block text-sm font-semibold px-8 py-4 rounded-lg transition-colors"
            style={{ background: "#F43F5E", color: "#fff", fontFamily: "Inter, sans-serif" }}>
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#0F172A", borderTop: "1px solid #1E293B" }}>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md flex-shrink-0" style={{ background: "#F43F5E" }} />
                <span className="text-sm font-bold tracking-wide" style={{ color: "#F8FAFC", fontFamily: "Inter, sans-serif" }}>Simple Economics</span>
              </div>
              <nav className="flex flex-wrap gap-x-6 gap-y-2">
                {[
                  { label: "Feed", href: "/feed" },
                  { label: "Ask the Simple Economist", href: "/ask" },
                  { label: "My Economy", href: "/my-economy" },
                  { label: "Sign in", href: "/signin" },
                ].map(({ label, href }) => (
                  <Link key={href} href={href} className="text-xs transition-colors" style={{ color: "#475569", fontFamily: "Inter, sans-serif" }}>
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-5">
              <FooterSocialLink href="https://youtube.com"   label="YouTube"   icon={<YouTubeIcon />} />
              <FooterSocialLink href="https://tiktok.com"    label="TikTok"    icon={<TikTokIcon />} />
              <FooterSocialLink href="https://instagram.com" label="Instagram" icon={<InstagramIcon />} />
              <FooterSocialLink href="https://facebook.com"  label="Facebook"  icon={<FacebookIcon />} />
            </div>
          </div>
          <div className="mt-10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ borderTop: "1px solid #1E293B" }}>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "#334155", fontFamily: "Inter, sans-serif" }}>© {new Date().getFullYear()} Simple Economics</p>
            <p className="text-[10px] sm:text-right" style={{ color: "#334155", fontFamily: "Inter, sans-serif" }}>Economic education only. Not financial advice.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

function FooterSocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} style={{ color: "#475569" }}>
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
