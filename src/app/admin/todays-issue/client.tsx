"use client";

import React, { useState } from "react";

interface LiveStat { label: string; value: string; delta: string; deltaType: string; }
interface ResearchItem { source: string; journal: string; year: number; finding: string; url: string; }
interface ImpactBullet { bold: string; text: string; }

interface Issue {
  id: string;
  date: string;
  title: string;
  sourceLabel: string;
  happeningBody: string;
  liveStats: LiveStat[];
  researchItems: ResearchItem[];
  impactGeneric: ImpactBullet[];
  approved: boolean;
}

export function TodaysIssueAdminClient(props: { issues: Issue[] }) {
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState("");
  const [message, setMessage] = useState("");
  const [localIssues, setLocalIssues] = useState(props.issues);

  function handleGenerate() {
    setGenerating(true);
    setMessage("");
    fetch("/api/todays-issue/generate")
      .then(function(r) { return r.json() as Promise<{ message?: string; error?: string }>; })
      .then(function(data) {
        setMessage(data.message ?? data.error ?? "Done");
        window.location.reload();
      })
      .catch(function() { setMessage("Error generating"); })
      .finally(function() { setGenerating(false); });
  }

  function handleApprove(id: string) {
    setApproving(id);
    fetch("/api/todays-issue/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then(function() {
        setLocalIssues(function(prev) {
          return prev.map(function(i) { return i.id === id ? { ...i, approved: true } : i; });
        });
        setMessage("Approved and live!");
      })
      .catch(function() { setMessage("Error approving"); })
      .finally(function() { setApproving(""); });
  }

  const wrapStyle: React.CSSProperties = { maxWidth: "800px", margin: "0 auto", padding: "24px", fontFamily: "Inter, sans-serif" };
  const cardStyle: React.CSSProperties = { background: "#fff", borderRadius: "12px", padding: "20px", marginBottom: "16px" };
  const sectionStyle: React.CSSProperties = { background: "#F8FAFC", borderRadius: "8px", padding: "12px", marginBottom: "10px" };
  const labelStyle: React.CSSProperties = { fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8", marginBottom: "6px" };

  return (
    <div style={wrapStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0F172A" }}>{"Today's Issue - Admin"}</h1>
          <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>Generate, review, and approve daily issue cards</p>
        </div>
        <button
          onClick={handleGenerate}
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

      <p style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "16px" }}>
        Step 1: Click Generate. Step 2: Review and Approve to publish.
      </p>

      {localIssues.length === 0 && (
        <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "32px", textAlign: "center" }}>
          <p style={{ color: "#94A3B8", fontSize: "14px" }}>No issues yet. Run /api/news/refresh first, then click Generate.</p>
        </div>
      )}

      {localIssues.map(function(issue) {
        return (
          <div key={issue.id} style={{ ...cardStyle, border: issue.approved ? "1px solid #BBF7D0" : "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "14px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, background: issue.approved ? "#F0FDF4" : "#FEF2F2", color: issue.approved ? "#166534" : "#991B1B", padding: "2px 8px", borderRadius: "4px" }}>
                    {issue.approved ? "LIVE" : "PENDING"}
                  </span>
                  <span style={{ fontSize: "10px", color: "#94A3B8" }}>{issue.date}</span>
                </div>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#0F172A", lineHeight: 1.4 }}>{issue.title}</h3>
              </div>
              {!issue.approved && (
                <button
                  onClick={function() { handleApprove(issue.id); }}
                  disabled={approving === issue.id}
                  style={{ background: "#0F172A", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  {approving === issue.id ? "Approving..." : "Approve and Publish"}
                </button>
              )}
            </div>

            <div style={sectionStyle}>
              <div style={labelStyle}>{"What's happening"}</div>
              <p style={{ fontSize: "12px", color: "#64748B", lineHeight: 1.65 }}>{issue.happeningBody}</p>
              <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                {issue.liveStats.map(function(s, i) {
                  return (
                    <div key={i} style={{ background: "#1E293B", borderRadius: "6px", padding: "6px 10px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#F8FAFC" }}>{s.value}</div>
                      <div style={{ fontSize: "10px", color: "#475569" }}>{s.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={sectionStyle}>
              <div style={labelStyle}>{"Research (" + String(issue.researchItems.length) + " papers)"}</div>
              {issue.researchItems.map(function(r, i) {
                return (
                  <div key={i} style={{ fontSize: "11px", color: "#64748B", marginBottom: "6px", paddingLeft: "8px", borderLeft: "2px solid #CBD5E1" }}>
                    <strong style={{ color: "#475569" }}>{r.journal + " " + String(r.year) + ": "}</strong>{r.finding}
                  </div>
                );
              })}
            </div>

            <div style={sectionStyle}>
              <div style={labelStyle}>{"Impact (" + String(issue.impactGeneric.length) + " bullets)"}</div>
              {issue.impactGeneric.map(function(b, i) {
                return (
                  <div key={i} style={{ fontSize: "11px", color: "#64748B", marginBottom: "4px" }}>
                    <strong style={{ color: "#475569" }}>{b.bold + ": "}</strong>{b.text}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
