"use client";

import React, { useState } from "react";
import { BenchmarkComparisonMetric } from "@/types/dashboard";
import { Info } from "lucide-react";

interface RoleBenchmarkTabProps {
  initialRole?: string;
  theme?: "dark" | "light";
}

export const RoleBenchmarkTab: React.FC<RoleBenchmarkTabProps> = ({
  initialRole = "AWPer",
  theme = "dark",
}) => {
  const isLight = theme === "light";
  const [selectedRole, setSelectedRole] = useState<"AWPer" | "Lurker">(
    initialRole === "Lurker" ? "Lurker" : "AWPer"
  );

  const awperMetrics: BenchmarkComparisonMetric[] = [
    {
      id: "kd",
      name: "K/D Ratio",
      yourValue: "1.35",
      cohortAverage: "1.08",
      percentile: 82,
      description: "Direct kill-to-death ratio across regulation rounds",
    },
    {
      id: "adr",
      name: "ADR (Average Damage/Round)",
      yourValue: "87.4",
      cohortAverage: "74.2",
      percentile: 78,
      description: "Impact output per round including wallbang and utility damage",
    },
    {
      id: "kpr",
      name: "KPR (Kills/Round)",
      yourValue: "0.82",
      cohortAverage: "0.70",
      percentile: 76,
      description: "Average frags per contested round",
    },
    {
      id: "opening",
      name: "Opening Duel Win Rate",
      yourValue: "41.2%",
      cohortAverage: "51.5%",
      percentile: 41,
      description: "First kill vs first death success in default setups",
    },
    {
      id: "clutch",
      name: "Clutch / Survival Value",
      yourValue: "84.0%",
      cohortAverage: "68.0%",
      percentile: 88,
      description: "Post-plant round conversion and late round equipment preservation",
    },
  ];

  const lurkerMetrics: BenchmarkComparisonMetric[] = [
    {
      id: "kd",
      name: "K/D Ratio",
      yourValue: "1.28",
      cohortAverage: "1.04",
      percentile: 79,
      description: "Lurk flank frag conversion efficiency",
    },
    {
      id: "adr",
      name: "ADR (Average Damage/Round)",
      yourValue: "82.1",
      cohortAverage: "71.0",
      percentile: 74,
      description: "Side-lane pressure and chip damage",
    },
    {
      id: "kpr",
      name: "KPR (Kills/Round)",
      yourValue: "0.78",
      cohortAverage: "0.68",
      percentile: 72,
      description: "Timing frags on rotational cutoffs",
    },
    {
      id: "opening",
      name: "Opening Duel Win Rate",
      yourValue: "44.0%",
      cohortAverage: "48.2%",
      percentile: 46,
      description: "Space isolation duel conversion",
    },
    {
      id: "clutch",
      name: "Clutch / Survival Value",
      yourValue: "86.5%",
      cohortAverage: "65.0%",
      percentile: 91,
      description: "Late flank bait & re-take denial",
    },
  ];

  const currentMetrics = selectedRole === "AWPer" ? awperMetrics : lurkerMetrics;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Role Switcher & Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
          isLight ? "border-slate-200" : "border-[#26262a]"
        }`}
      >
        <div>
          <h2
            className={`text-base font-black tracking-wide ${
              isLight ? "text-slate-950" : "text-[#ededed]"
            }`}
          >
            Deterministic Role Benchmark
          </h2>
          <p
            className={`text-xs mt-0.5 ${
              isLight ? "text-slate-500" : "text-[#9a9aa2]"
            }`}
          >
            Comparing your match telemetry against verified Tier 2 Semi-Pro averages
          </p>
        </div>

        {/* Role Toggle Button Group */}
        <div
          className={`inline-flex p-1 rounded-[6px] border self-start sm:self-center shadow-2xs ${
            isLight
              ? "bg-slate-100 border-slate-200"
              : "bg-[#18181b] border-[#26262a]"
          }`}
        >
          <button
            type="button"
            onClick={() => setSelectedRole("AWPer")}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-black transition-all cursor-pointer ${
              selectedRole === "AWPer"
                ? isLight
                  ? "bg-slate-950 text-white shadow-xs"
                  : "bg-[#e8ff59] text-[#0b0b0c] shadow-xs"
                : isLight
                ? "text-slate-600 hover:text-slate-950"
                : "text-[#9a9aa2] hover:text-[#ededed]"
            }`}
          >
            AWPer / Duelist
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("Lurker")}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-black transition-all cursor-pointer ${
              selectedRole === "Lurker"
                ? isLight
                  ? "bg-slate-950 text-white shadow-xs"
                  : "bg-[#e8ff59] text-[#0b0b0c] shadow-xs"
                : isLight
                ? "text-slate-600 hover:text-slate-950"
                : "text-[#9a9aa2] hover:text-[#ededed]"
            }`}
          >
            Lurker / Assaulter
          </button>
        </div>
      </div>

      {/* Benchmark Table Card */}
      <div
        className={`rounded-[6px] border p-6 shadow-xs ${
          isLight
            ? "border-slate-200 bg-white"
            : "border-[#26262a] bg-[#131315]"
        }`}
      >
        {/* Table Header */}
        <div
          className={`grid grid-cols-12 gap-4 pb-3 border-b text-xs font-bold ${
            isLight
              ? "border-slate-200 text-slate-400"
              : "border-[#26262a] text-[#9a9aa2]"
          }`}
        >
          <div className="col-span-4">Metric</div>
          <div className="col-span-2 text-right">Your Value</div>
          <div className="col-span-2 text-right">Role Cohort Avg</div>
          <div className="col-span-4 pl-4">Percentile vs Benchmark</div>
        </div>

        {/* Rows */}
        <div
          className={`divide-y ${
            isLight ? "divide-slate-100" : "divide-[#26262a]"
          }`}
        >
          {currentMetrics.map((m) => {
            const isStrength = m.percentile >= 75;
            const isWarning = m.percentile < 50;

            return (
              <div
                key={m.id}
                className={`grid grid-cols-12 gap-4 py-4 items-center group transition-colors ${
                  isLight ? "hover:bg-slate-50" : "hover:bg-[#0b0b0c]"
                }`}
              >
                {/* Metric Name & Description */}
                <div className="col-span-4">
                  <div
                    className={`text-xs font-black ${
                      isLight ? "text-slate-950" : "text-[#ededed]"
                    }`}
                  >
                    {m.name}
                  </div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      isLight ? "text-slate-500" : "text-[#9a9aa2]"
                    }`}
                  >
                    {m.description}
                  </div>
                </div>

                {/* Your Value */}
                <div
                  className={`col-span-2 text-right font-mono font-black text-xs ${
                    isLight ? "text-slate-950" : "text-[#e8ff59]"
                  }`}
                >
                  {m.yourValue}
                </div>

                {/* Cohort Average */}
                <div
                  className={`col-span-2 text-right font-mono text-xs font-semibold ${
                    isLight ? "text-slate-500" : "text-[#ededed]"
                  }`}
                >
                  {m.cohortAverage}
                </div>

                {/* Percentile Bar */}
                <div className="col-span-4 pl-4">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                    <span
                      className={`text-[10px] font-semibold ${
                        isLight ? "text-slate-500" : "text-[#9a9aa2]"
                      }`}
                    >
                      P{m.percentile}
                    </span>
                    <span
                      className={
                        isStrength
                          ? isLight
                            ? "text-emerald-700 font-bold"
                            : "text-[#4ade80] font-bold"
                          : isWarning
                          ? isLight
                            ? "text-amber-700 font-bold"
                            : "text-[#f87171] font-bold"
                          : isLight
                          ? "text-slate-600"
                          : "text-[#9a9aa2]"
                      }
                    >
                      {isStrength
                        ? "+ Above Avg"
                        : isWarning
                        ? "- Needs Work"
                        : "Normal"}
                    </span>
                  </div>

                  {/* Horizontal progress bar */}
                  <div
                    className={`w-full h-2 rounded-full border overflow-hidden ${
                      isLight
                        ? "bg-slate-100 border-slate-200"
                        : "bg-[#0b0b0c] border-[#26262a]"
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWarning
                          ? isLight
                            ? "bg-amber-400"
                            : "bg-[#f87171]"
                          : isLight
                          ? "bg-[#bef226]"
                          : "bg-[#e8ff59]"
                      }`}
                      style={{ width: `${m.percentile}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Methodology Explainer */}
      <div
        className={`p-4 rounded-[6px] border flex items-start gap-3 text-xs shadow-xs ${
          isLight
            ? "border-slate-200 bg-white text-slate-600"
            : "border-[#26262a] bg-[#131315] text-[#9a9aa2]"
        }`}
      >
        <Info
          className={`w-4 h-4 shrink-0 mt-0.5 ${
            isLight ? "text-slate-800" : "text-[#ededed]"
          }`}
        />
        <div className="leading-relaxed">
          <strong
            className={isLight ? "text-slate-900" : "text-[#ededed]"}
          >
            Methodology Note:
          </strong>{" "}
          Role percentiles are calibrated using tournament and scrim brackets across competitive titles. Opening duel win rate is weighted by weapon class and round economics.
        </div>
      </div>
    </div>
  );
};
