"use client";

import { useState, useEffect } from "react";

interface LiveStat {
  label: string;
  value: string;
  delta: string;
  deltaType: "up" | "down" | "neutral";
}

interface ResearchItem {
  source: string;
  journal: string;
  year: number;
  finding: string;
  url: string;
}

interface ImpactBullet {
  bold: string;
  text: string;
}

interface TodaysIssueData {
  id: string;
  date: string;
  title: string;
  sourceUrl: string;
  sourceLabel: string;
  happeningBody: string;
  liveStats: LiveStat[];
  researchItems: ResearchItem[];
  impactGeneric: ImpactBullet[];
}

type Tab = "happening" | "research" | "impact";

type UserProfile = {
  city?: string | null;
  situation?: string | null;
  industry?: string | null;
} | null;

function ImpactTab({ issue, userProfile }: { issue: TodaysIssueData; userProfile: UserProfile }) {
  const situationLabel =
    userProfile?.situation === "RENTER" ? "Renter" :
    userProfile?.situation === "OWNER" ? "Homeowner" :
    userProfile?.situation ?? null;

  const industryWords = userProfile?.industry
    ? userProfile.industry.replace(/_/g, " ").toLowerCase().split(" ")
    : [];
  const industryLabel = industryWords.length > 0
    ? industryWords.map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(" ")
    : null;

  const showTags = userProfile?.city || userProfile?.situation;

  return (
    <div>
      {showTags ? (
        <div className="flex gap-2 mb-3 flex-wrap">
          {situationLabel ? (
            <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "#94A3B8" }}>
              {situationLabel}
            </span>
          ) : null}
          {userProfile?.city ? (
            <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "#94A3B8" }}>
              {userProfile.city}
            </span>
          ) : null}
          {industryLabel ? (
            <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "#94A3B8" }}>
              {industryLabel}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-col gap-3">
        {issue.impactGeneric.map(function(bullet, i) {
          return (
            <div key={i} className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: "#E63329" }} />
              <p className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>
                <strong style={{ color: "#CBD5E1" }}>{bullet.bold}: </strong>
                {bullet.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TodaysIssueCard({ userProfile }: { userProfile?: UserProfile }) {
  const [issue, setIssue] = useState<TodaysIssueData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("happening");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/todays-issue")
      .then(function(r) { return r.json(); })
      .then(function(data: TodaysIssueData | null) { setIssue(data); setLoading(false); })
      .catch(function() { setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl overflow-hidden animate-pulse mb-6" style={{ background: "#1E293B", height: "180px" }} />
    );
  }

  if (!issue) return null;

  function deltaColor(type: "up" | "down" | "neutral") {
    if (type === "up") return "#F87171";
    if (type === "down") return "#4ADE80";
    return "#94A3B8";
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "happening", label: "What's happening" },
    { id: "research", label: "What research says" },
    { id: "impact", label: "Your impact" },
  ];

  return (
    <div className="rounded-2xl overflow-hidden mb-6" style={{ background: "#0F172A", border: "1px solid #1E293B" }}>

      <div className="px-5 pt-5 pb-0" style={{ borderBottom: "1px solid #1E293B" }}>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "rgba(230,51,41,0.12)", border: "1px solid rgba(230,51,41,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#E63329" }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#E63329" }}>Today&apos;s Issue</span>
          </div>
          <span className="text-[10px]" style={{ color: "#475569" }}>
            {issue.sourceLabel} &middot; {new Date(issue.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>

        <h2 className="text-base font-bold leading-snug mb-3" style={{ color: "#F8FAFC" }}>{issue.title}</h2>

        <div className="flex gap-0" style={{ borderBottom: "1px solid #1E293B" }}>
          {tabs.map(function(tab) {
            return (
              <button
                key={tab.id}
                onClick={function() { setActiveTab(tab.id); }}
                style={{
                  color: activeTab === tab.id ? "#F8FAFC" : "#475569",
                  marginBottom: "-1px",
                  background: "transparent",
                  border: "none",
                  borderBottomWidth: "2px",
                  borderBottomStyle: "solid" as const,
                  borderBottomColor: activeTab === tab.id ? "#E63329" : "transparent",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "8px 12px",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-4">

        {activeTab === "happening" ? (
          <div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: "#94A3B8" }}>{issue.happeningBody}</p>
            <div className="grid grid-cols-2 gap-2">
              {issue.liveStats.map(function(stat, i) {
                return (
                  <div key={i} className="rounded-lg px-3 py-3" style={{ background: "#1E293B" }}>
                    <div className="text-base font-bold" style={{ color: "#F8FAFC", fontFamily: "monospace" }}>{stat.value}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "#475569" }}>{stat.label}</div>
                    <div className="text-[10px] mt-1 font-medium" style={{ color: deltaColor(stat.deltaType) }}>{stat.delta}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {activeTab === "research" ? (
          <div className="flex flex-col gap-3">
            {issue.researchItems.map(function(item, i) {
              return (
                <div key={i} className="rounded-lg px-4 py-3" style={{ background: "#1E293B", borderLeft: "3px solid #1B4FD8" }}>
                  <div className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: "#475569" }}>
                    {item.journal} &middot; {item.year}
                  </div>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: "#94A3B8" }}>{item.finding}</p>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: "#E63329", fontSize: "10px" }}>
                    Read paper
                  </a>
                </div>
              );
            })}
          </div>
        ) : null}

        {activeTab === "impact" ? (
          <ImpactTab issue={issue} userProfile={userProfile ?? null} />
        ) : null}

      </div>

      <div className="px-5 pb-4">
        <a href={issue.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#E63329", fontSize: "11px", fontWeight: 500 }}>
          Read full story at {issue.sourceLabel}
        </a>
      </div>

    </div>
  );
}
