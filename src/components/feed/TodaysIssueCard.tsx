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
            <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(
