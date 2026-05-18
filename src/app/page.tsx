import React from "react";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";
import Image from "next/image";
import { getAuthSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getAuthSession();
  const isAuthed = !!session?.user;

  return (
    <div style={{ background: "#F8FAFC", fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>

      <nav style={{ background: "#1E293B", borderBottom: "1px solid #334155", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem", height: "3.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <circle cx="14" cy="14" r="12" stroke="#F43F5E" strokeWidth="2"/>
              <ellipse cx="14" cy="14" rx="5" ry="12" stroke="#F43F5E" strokeWidth="1.5"/>
              <line x1="2" y1="14" x2="26" y2="14" stroke="#F43F5E" strokeWidth="1.5"/>
              <line x1="4" y1="8" x2="24" y2="8" stroke="#F43F5E" strokeWidth="1"/>
              <line x1="4" y1="20" x2="24" y2="20" stroke="#F43F5E" strokeWidth="1"/>
            </svg>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#F8FAFC", letterSpacing: "0.02em" }}>Simple Economics</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/feed" style={{ fontSize: "12px", color: "#94A3B8", textDecoration: "none" }}>Feed</Link>
            {isAuthed ? (
              <Link href="/feed" style={{ fontSize: "12px", fontWeight: 600, padding: "8px 16px", borderRadius: "8px", background: "#F43F5E", color: "#fff", textDecoration: "none" }}>Go to Feed</Link>
            ) : (
              <Link href="/signin" style={{ fontSize: "12px", fontWeight: 600, padding: "8px 16px", borderRadius: "8px", background: "#F43F5E", color: "#fff", textDecoration: "none" }}>Sign in</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", minHeight: "calc(100vh - 3.5rem)", gap: "3rem" }}>
          <div style={{ padding: "5rem 0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 12px", borderRadius: "999px", background: "#FFF1F2", border: "1px solid #FECDD3", marginBottom: "24px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#F43F5E" }} />
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#F43F5E" }}>Economic education for real life</span>
            </div>
            <h1 style={{ fontSize: "clamp(40px, 5vw, 60px)", fontWeight: 700, color: "#0F172A", lineHeight: 1.1, marginBottom: "24px" }}>
              Big ideas.<br />Simple terms.<br /><span style={{ color: "#F43F5E" }}>Smarter you.</span>
            </h1>
            <p style={{ fontSize: "16px", color: "#64748B", lineHeight: 1.7, maxWidth: "400px", marginBottom: "40px" }}>
              Simple Economics explains what is happening in the economy and what it means specifically for you - based on how you actually live.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/onboarding" style={{ fontSize: "14px", fontWeight: 600, padding: "14px 28px", borderRadius: "10px", background: "#F43F5E", color: "#fff", textDecoration: "none" }}>
                Get Started Free
              </Link>
              <a href="#how-it-works" style={{ fontSize: "14px", fontWeight: 600, padding: "14px 28px", borderRadius: "10px", background: "#fff", color: "#1E293B", border: "1px solid #E2E8F0", textDecoration: "none" }}>
                See How It Works
              </a>
            </div>
            <p style={{ marginTop: "16px", fontSize: "12px", color: "#94A3B8" }}>No credit card. No paywall to start.</p>
          </div>

          <div style={{ position: "relative", height: "calc(100vh - 3.5rem)", borderRadius: "16px", overflow: "hidden", border: "1px solid #E2E8F0" }}>
            <Image src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=80&auto=format&fit=crop" alt="Global economic network" fill style={{ objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,10,0.65)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "32px" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "12px" }}>Live Global Indicators</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                {[
                  { label: "World GDP", value: "$123T", source: "IMF 2026" },
                  { label: "Global Growth", value: "3.1%", source: "IMF WEO" },
                  { label: "Global Inflation", value: "4.5%", source: "IMF 2026" },
                  { label: "Oil Price", value: "$82/bbl", source: "IMF Apr 2026" },
                  { label: "World Trade", value: "3.0%", source: "WTO 2026" },
                  { label: "Unemployment", value: "5.1%", source: "ILO 2026" },
                  { label: "World Population", value: "8.12B", source: "UN 2026" },
                  { label: "Global Debt", value: "$251T", source: "IMF 2024" },
                  { label: "Poverty Rate", value: "8.5%", source: "World Bank" },
                ].map(({ label, value, source }) => (
                  <div key={label} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", padding: "12px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "8px", fontWeight: 600, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>{label}</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "#FAFAFA", marginTop: "4px", lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.25)", marginTop: "4px" }}>{source}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" style={{ background: "#1E293B", padding: "80px 0" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: "#64748B", marginBottom: "48px" }}>How it works</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
            {[
              { step: "01", color: "#F43F5E", title: "Tell us your situation", body: "Renter, homeowner, employed, student. One quick question set. 60 seconds." },
              { step: "02", color: "#3B82F6", title: "Get your personalized feed", body: "Economic events translated into what they mean for your life - not for a hedge fund manager." },
              { step: "03", color: "#8B5CF6", title: "Ask anything", body: "Ask the Simple Economist answers your questions with real data, named sources, and a clear bottom line." },
            ].map(({ step, color, title, body }) => (
              <div key={step} style={{ background: "#0F172A", border: "1px solid #334155", borderRadius: "12px", padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#fff" }}>{step}</div>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#F8FAFC", lineHeight: 1.4 }}>{title}</h3>
                <p style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.6 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Problems */}
      <div style={{ background: "#F8FAFC", padding: "80px 0" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: "#94A3B8", marginBottom: "48px" }}>Two problems, one solution</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {[
              { label: "Problem 1", title: "The Translation Gap", body: "Economic news is written for economists, traders, and policymakers - not people. The jargon is dense, the implications are never spelled out, and the question what does this mean for me is never answered.", cta: "We translate it." },
              { label: "Problem 2", title: "One Size Fits Nobody", body: "Generic economic advice assumes you own a home, have a retirement account, and earn a six-figure salary. Most people do not. The same interest rate hike means something completely different to a renter than to a homeowner.", cta: "Every answer is filtered through your real situation." },
            ].map(({ label, title, body, cta }) => (
              <div key={label} style={{ background: "#fff", border: "1px solid #E2E8F0", borderTop: "3px solid #F43F5E", borderRadius: "12px", padding: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#F43F5E" }}>{label}</span>
                <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#0F172A", lineHeight: 1.3 }}>{title}</h3>
                <p style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.65 }}>{body}</p>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#0F172A", marginTop: "auto" }}>{cta}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Built on Evidence */}
      <div style={{ background: "#1E293B", padding: "80px 0" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: "#64748B", marginBottom: "40px" }}>Built on evidence</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "40px" }}>
            {["Federal Reserve", "Bureau of Labor Statistics", "International Monetary Fund", "World Bank", "NBER Working Papers", "Brookings Institution", "Congressional Budget Office", "Peer-reviewed journals"].map((s) => (
              <span key={s} style={{ fontSize: "11px", fontWeight: 500, padding: "6px 12px", borderRadius: "8px", background: "#0F172A", color: "#94A3B8", border: "1px solid #334155" }}>{s}</span>
            ))}
          </div>
          <div style={{ background: "#0F172A", border: "1px solid #334155", borderRadius: "12px", padding: "24px", maxWidth: "480px", marginBottom: "48px" }}>
            <p style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.7 }}>
              Simple Economics provides economic education only. <strong style={{ color: "#F8FAFC" }}>Not financial or investment advice.</strong> Every answer includes its sources so you can verify what we say.
            </p>
          </div>
          <Link href="/onboarding" style={{ fontSize: "14px", fontWeight: 600, padding: "14px 32px", borderRadius: "10px", background: "#F43F5E", color: "#fff", textDecoration: "none", display: "inline-block" }}>
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#0F172A", borderTop: "1px solid #1E293B", padding: "48px 0" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "#F43F5E" }} />
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#F8FAFC" }}>Simple Economics</span>
            </div>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {[{ label: "Feed", href: "/feed" }, { label: "Ask the Simple Economist", href: "/ask" }, { label: "My Economy", href: "/my-economy" }, { label: "Sign in", href: "/signin" }].map(({ label, href }) => (
                <Link key={href} href={href} style={{ fontSize: "12px", color: "#475569", textDecoration: "none" }}>{label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div style={{ maxWidth: "72rem", margin: "32px auto 0", padding: "0 1.5rem", borderTop: "1px solid #1E293B", paddingTop: "24px", display: "flex", justifyContent: "space-between" }}>
          <p style={{ fontSize: "10px", color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {new Date().getFullYear()} Simple Economics
          </p>
          <p style={{ fontSize: "10px", color: "#334155" }}>Economic education only. Not financial advice.</p>
        </div>
      </div>

    </div>
  );
}
