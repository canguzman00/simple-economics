"use client";

import { useState } from "react";

interface Issue {
  id: string;
  date: string;
  title: string;
  sourceLabel: string;
  happeningBody: string;
  liveStats: Array<{ label: string; value: string; delta: string; deltaType: string }>;
  researchItems: Array<{ source: string; journal: string; year: number; finding: string; url: string }>;
  impactGeneric: Array<{ bold: string; text: string }>;
  approved: boolean;
  generatedAt: string;
}

export function TodaysIssueAdminClient({ issues }: { issues: Issue[] }) {
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [localIssues, setLocalIssues] = useState(issues);

  async function generate() {
    setGenerating(true);
    setMessage("");
    try {
      const res = await fetch("/api/todays-issue/generate");
      const data = await res.json() as { message?: string; error?: string };
      setMessage(data.message ?? data.error ?? "Done");
      window.location.reload();
    } catch {
      setMessage("Error generating");
    }
    setGenerating(false);
  }

  async function approve(id: string) {
    setApproving(id);
    try {
      await fetch("/api/todays-issue/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setLocalIssues(function(prev) {
        return prev.map(function(i) { return i.id === id ? { ...i, approved: true } : i; });
      });
      setMessage("Approved and live!");
    } catch {
      setMessage("Error approving");
    }
    setApproving(null);
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0F172A" }}>{"Today's Issue"} — Admin</h1>
          <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>Generate, review, and approve daily issue cards</p>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          style={{ background: generating ? "#94A3B8" : "#E63329", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: generating ? "not-allowed" : "pointer" }}
        >
          {generating ? "Generating..." : "Generate Today's Issue"}
        </button>
      </div>

      {message && (
        <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "12px", color: "#166534" }}>
          {message}
        </div>
      )}

      <div style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "16px" }}>
        Step 1: Click Generate — Claude ranks top story and fetches research.
        Step 2: Review below and click Approve to publish to users.
      </div>

      {localIssues.length === 0 && (
        <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "32px", textAlign: "center" as const }}>
          <p style={{ color: "#94A3B8", fontSize: "14px" }}>No issues generated yet. Click Generate to create today's card.</p>
          <p style={{ color: "#CBD5E1", fontSize: "12px", marginTop: "6px" }}>Run /api/news/refresh first so there is fresh news to rank.</p>
        </div>
      )}

      {localIssues.map(function(issue) {
        return (
          <div key={issue.id} style={{ background: "#fff", border: issue.approved ? "1px solid #BBF7D0" : "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "14px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, background: issue.approved ? "#F0FDF4" : "#FEF2F2", color: issue.approved ? "#166534" : "#991B1B", padding: "2px 8px", borderRadius: "4px" }}>
                    {issue.approved ? "LIVE" : "PENDING REVIEW"}
                  </span>
                  <span style={{ fontSize: "10px", color: "#94A3B8" }}>{issue.date} {" · "} {issue.sourceLabel}</span>
                </div>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#0F172A", lineHeight: 1.4 }}>{issue.title}</h3>
              </div>
              {!issue.approved && (
                <button
                  onClick={function() { void approve(issue.id);
