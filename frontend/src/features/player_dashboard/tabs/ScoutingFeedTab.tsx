"use client";

import React from "react";
import { Eye, UserCheck, Calculator, ShieldCheck, Clock } from "lucide-react";
import { ScoutingTimelineEvent } from "@/types/dashboard";

interface ScoutingFeedTabProps {
  theme?: "dark" | "light";
}

export const ScoutingFeedTab: React.FC<ScoutingFeedTabProps> = ({
  theme = "dark",
}) => {
  const isLight = theme === "light";
  const events: ScoutingTimelineEvent[] = [
    {
      id: "ev-1",
      author: "Analyst Riya",
      organization: "Velocity Gaming",
      action: "inspected your",
      target: "multi-title benchmark metrics",
      timeAgo: "2 hours ago",
      type: "analyst",
      detail:
        "Focused on Opening Duel Win Rate, First Bloods and Clutch conversions across tournament scrims.",
    },
    {
      id: "ev-2",
      author: "Coach Arjun",
      organization: "Reckoning Esports",
      action: "shortlisted your profile for a",
      target: "Roster Trial",
      timeAgo: "1 day ago",
      type: "coach",
      detail:
        "Trial consideration for upcoming Tier-2 South Asia Open Qualifier.",
    },
    {
      id: "ev-3",
      author: "System Audit",
      organization: "ScoutForge Core",
      action: "Score recalculated under",
      target: "Formula v1.2",
      timeAgo: "3 days ago",
      type: "audit",
      detail:
        "+2.4 pts adjustment applied due to opponent-strength rating across Tier-2 bracket.",
    },
    {
      id: "ev-4",
      author: "ScoutForge Security",
      organization: "Integrity Watch",
      action: "verified anti-cheat demo telemetry for",
      target: "12 Scrim Recordings",
      timeAgo: "5 days ago",
      type: "system",
      detail:
        "Clean check verified. No anomalous inputs or packet injection detected.",
    },
    {
      id: "ev-5",
      author: "Analyst Vikram",
      organization: "Global Esports Academy",
      action: "downloaded your",
      target: "Performance Summary Dossier",
      timeAgo: "1 week ago",
      type: "analyst",
      detail:
        "Exported standard scout PDF for internal recruitment review.",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div
        className={`flex items-center justify-between pb-4 border-b ${
          isLight ? "border-slate-200" : "border-[#26262a]"
        }`}
      >
        <div>
          <h2
            className={`text-base font-black tracking-wide ${
              isLight ? "text-slate-950" : "text-[#ededed]"
            }`}
          >
            Scouting Activity & Transparency Feed
          </h2>
          <p
            className={`text-xs mt-0.5 ${
              isLight ? "text-slate-500" : "text-[#9a9aa2]"
            }`}
          >
            Real-time audit log of coach evaluations, analyst views, and system rating recalculations
          </p>
        </div>

        <span
          className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border shadow-2xs ${
            isLight
              ? "text-slate-800 bg-slate-100 border-slate-200"
              : "text-[#ededed] bg-[#18181b] border-[#26262a]"
          }`}
        >
          5 Verified Inquiries (Last 30 Days)
        </span>
      </div>

      {/* Timeline Card */}
      <div
        className={`rounded-[6px] border p-6 shadow-xs ${
          isLight
            ? "border-slate-200 bg-white"
            : "border-[#26262a] bg-[#131315]"
        }`}
      >
        <div
          className={`relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-px ${
            isLight ? "before:bg-slate-200" : "before:bg-[#26262a]"
          }`}
        >
          {events.map((event) => {
            let icon = (
              <Eye
                className={`w-3.5 h-3.5 ${
                  isLight ? "text-slate-700" : "text-[#ededed]"
                }`}
              />
            );
            let badgeBg = isLight
              ? "bg-slate-100 text-slate-700 border-slate-200"
              : "bg-[#18181b] text-[#ededed] border-[#26262a]";

            if (event.type === "coach") {
              icon = (
                <UserCheck
                  className={`w-3.5 h-3.5 ${
                    isLight ? "text-slate-900" : "text-[#e8ff59]"
                  }`}
                />
              );
              badgeBg = isLight
                ? "bg-lime-100 text-lime-900 border-lime-300 font-bold"
                : "bg-[#e8ff59]/10 text-[#e8ff59] border-[#e8ff59]/30 font-bold";
            } else if (event.type === "audit") {
              icon = <Calculator className="w-3.5 h-3.5 text-blue-400" />;
              badgeBg = isLight
                ? "bg-blue-50 text-blue-800 border-blue-200"
                : "bg-blue-950/40 text-blue-300 border-blue-800/40";
            } else if (event.type === "system") {
              icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
              badgeBg = isLight
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-emerald-950/40 text-emerald-300 border-emerald-800/40";
            }

            return (
              <div key={event.id} className="relative group">
                {/* Timeline node */}
                <div
                  className={`absolute -left-6 top-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors shadow-2xs ${
                    isLight
                      ? "bg-white border-slate-300 group-hover:border-slate-800"
                      : "bg-[#131315] border-[#26262a] group-hover:border-[#e8ff59]"
                  }`}
                >
                  {icon}
                </div>

                {/* Content */}
                <div
                  className={`p-4 rounded-[6px] border transition-all ${
                    isLight
                      ? "border-slate-200 bg-slate-50 group-hover:bg-slate-100"
                      : "border-[#26262a] bg-[#0b0b0c] group-hover:bg-[#18181b]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-black ${
                          isLight ? "text-slate-950" : "text-[#ededed]"
                        }`}
                      >
                        {event.author}
                      </span>
                      {event.organization && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeBg}`}
                        >
                          {event.organization}
                        </span>
                      )}
                      <span
                        className={`text-xs ${
                          isLight ? "text-slate-500" : "text-[#9a9aa2]"
                        }`}
                      >
                        {event.action}
                      </span>
                      <strong
                        className={`text-xs font-bold ${
                          isLight ? "text-slate-950" : "text-[#ededed]"
                        }`}
                      >
                        {event.target}
                      </strong>
                    </div>

                    <div
                      className={`flex items-center gap-1 text-[11px] font-mono shrink-0 ${
                        isLight ? "text-slate-400" : "text-[#9a9aa2]"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{event.timeAgo}</span>
                    </div>
                  </div>

                  {event.detail && (
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        isLight ? "text-slate-600" : "text-[#9a9aa2]"
                      }`}
                    >
                      {event.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
