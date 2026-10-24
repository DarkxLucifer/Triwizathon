"use client";

import React, { useState } from "react";
import { PlayerProfile, TrajectoryPoint } from "@/types/dashboard";
import { Crosshair, Database } from "lucide-react";

interface OverviewTabProps {
  player: PlayerProfile;
  trajectory: TrajectoryPoint[];
  theme?: "dark" | "light";
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  player,
  trajectory,
  theme = "dark",
}) => {
  const isLight = theme === "light";
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  // SVG Chart Dimensions
  const width = 580;
  const height = 180;
  const padLeft = 32;
  const padRight = 24;
  const padTop = 20;
  const padBottom = 30;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const minY = 70;
  const maxY = 80;

  const points = trajectory.map((pt, i) => {
    const x = padLeft + (i / (trajectory.length - 1)) * chartWidth;
    const y = padTop + (1 - (pt.score - minY) / (maxY - minY)) * chartHeight;
    return { ...pt, x, y };
  });

  // Smooth bezier curve
  let linePath = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cx1 = p0.x + (p1.x - p0.x) * 0.5;
    const cy1 = p0.y;
    const cx2 = p0.x + (p1.x - p0.x) * 0.5;
    const cy2 = p1.y;
    linePath += ` C ${cx1},${cy1} ${cx2},${cy2} ${p1.x},${p1.y}`;
  }

  const areaPath = `${linePath} L ${points[points.length - 1].x},${
    padTop + chartHeight
  } L ${points[0].x},${padTop + chartHeight} Z`;

  const yTicks = [70, 73, 76, 79];

  const activePoint =
    hoveredWeek !== null ? points[hoveredWeek] : points[points.length - 1];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Row 1: 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: ScoutForge Fit Score */}
        <div
          className={`rounded-[6px] border p-5 flex flex-col justify-between shadow-xs transition-colors ${
            isLight
              ? "bg-white border-slate-200 text-slate-900"
              : "bg-[#131315] border-[#26262a] text-[#ededed]"
          }`}
        >
          <div
            className={`flex items-center justify-between text-xs font-bold ${
              isLight ? "text-slate-500" : "text-[#9a9aa2]"
            }`}
          >
            <span>ScoutForge Fit Score</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isLight
                  ? "bg-[#bef226] border border-slate-900"
                  : "bg-[#e8ff59] border border-[#0b0b0c]"
              }`}
            />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-3xl font-black tracking-tight font-mono ${
                  isLight ? "text-slate-950" : "text-[#e8ff59]"
                }`}
              >
                {player.fitScore}
              </span>
              <span
                className={`text-xs font-bold ${
                  isLight ? "text-slate-400" : "text-[#9a9aa2]"
                }`}
              >
                / 100
              </span>
            </div>
          </div>
          <div
            className={`text-[11px] font-mono font-medium ${
              isLight ? "text-slate-600" : "text-[#9a9aa2]"
            }`}
          >
            {player.fitFormula} •{" "}
            <strong
              className={isLight ? "text-emerald-600" : "text-[#4ade80]"}
            >
              {player.confidence}
            </strong>
          </div>
        </div>

        {/* Card 2: Primary Role */}
        <div
          className={`rounded-[6px] border p-5 flex flex-col justify-between shadow-xs transition-colors ${
            isLight
              ? "bg-white border-slate-200 text-slate-900"
              : "bg-[#131315] border-[#26262a] text-[#ededed]"
          }`}
        >
          <div
            className={`flex items-center justify-between text-xs font-bold ${
              isLight ? "text-slate-500" : "text-[#9a9aa2]"
            }`}
          >
            <span>Primary Role ({player.activeGame})</span>
            <Crosshair
              className={`w-3.5 h-3.5 ${
                isLight ? "text-slate-700" : "text-[#9a9aa2]"
              }`}
            />
          </div>
          <div className="my-3">
            <div
              className={`text-lg font-black tracking-tight truncate ${
                isLight ? "text-slate-950" : "text-[#ededed]"
              }`}
            >
              {player.role} / {player.secondaryRole}
            </div>
          </div>
          <div
            className={`text-[11px] font-mono ${
              isLight ? "text-slate-600" : "text-[#9a9aa2]"
            }`}
          >
            {player.dataCoverage}% Data Coverage
          </div>
        </div>

        {/* Card 3: Sample Reliability */}
        <div
          className={`rounded-[6px] border p-5 flex flex-col justify-between shadow-xs transition-colors ${
            isLight
              ? "bg-white border-slate-200 text-slate-900"
              : "bg-[#131315] border-[#26262a] text-[#ededed]"
          }`}
        >
          <div
            className={`flex items-center justify-between text-xs font-bold ${
              isLight ? "text-slate-500" : "text-[#9a9aa2]"
            }`}
          >
            <span>Sample Reliability</span>
            <Database
              className={`w-3.5 h-3.5 ${
                isLight ? "text-slate-700" : "text-[#9a9aa2]"
              }`}
            />
          </div>
          <div className="my-3">
            <div
              className={`text-2xl font-black tracking-tight font-mono ${
                isLight ? "text-slate-950" : "text-[#ededed]"
              }`}
            >
              {player.matchesSampled} Matches
            </div>
          </div>
          <div
            className={`text-[11px] font-mono ${
              isLight ? "text-slate-600" : "text-[#9a9aa2]"
            }`}
          >
            Last 30 days • {player.cohort}
          </div>
        </div>

        {/* Card 4: Profile Status */}
        <div
          className={`rounded-[6px] border p-5 flex flex-col justify-between shadow-xs transition-colors ${
            isLight
              ? "bg-white border-slate-200 text-slate-900"
              : "bg-[#131315] border-[#26262a] text-[#ededed]"
          }`}
        >
          <div
            className={`flex items-center justify-between text-xs font-bold ${
              isLight ? "text-slate-500" : "text-[#9a9aa2]"
            }`}
          >
            <span>Profile Status</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                isLight
                  ? "bg-lime-100 text-lime-900 border border-lime-300"
                  : "bg-[#e8ff59]/10 text-[#e8ff59] border border-[#e8ff59]/30"
              }`}
            >
              Active
            </span>
          </div>
          <div className="my-3">
            <div
              className={`text-lg font-black tracking-tight ${
                isLight ? "text-slate-950" : "text-[#ededed]"
              }`}
            >
              {player.profileStatus}
            </div>
          </div>
          <div
            className={`text-[11px] font-mono font-bold ${
              isLight ? "text-emerald-600" : "text-[#4ade80]"
            }`}
          >
            Above-cohort impact (+14%)
          </div>
        </div>
      </div>

      {/* Row 2: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols) - Performance Trajectory */}
        <div
          className={`lg:col-span-2 rounded-[6px] border p-6 flex flex-col justify-between shadow-xs transition-colors ${
            isLight
              ? "bg-white border-slate-200 text-slate-900"
              : "bg-[#131315] border-[#26262a] text-[#ededed]"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className={`text-sm font-black tracking-wide ${
                  isLight ? "text-slate-950" : "text-[#ededed]"
                }`}
              >
                Performance Trajectory ({player.activeGame})
              </h2>
              <p
                className={`text-xs mt-0.5 ${
                  isLight ? "text-slate-500" : "text-[#9a9aa2]"
                }`}
              >
                Fit score progression over the last 6 weeks
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-mono ${
                  isLight ? "text-slate-600" : "text-[#9a9aa2]"
                }`}
              >
                Current:{" "}
                <strong
                  className={`font-black ${
                    isLight ? "text-slate-950" : "text-[#ededed]"
                  }`}
                >
                  {activePoint.score.toFixed(1)}
                </strong>
              </span>
              <span
                className={`text-[11px] font-mono font-black px-2 py-0.5 rounded shadow-xs ${
                  isLight
                    ? "text-slate-950 bg-[#bef226] border border-[#a3e614]"
                    : "text-[#0b0b0c] bg-[#e8ff59] border border-[#e8ff59]"
                }`}
              >
                +4.5 pts
              </span>
            </div>
          </div>

          {/* Clean Line Chart */}
          <div className="relative w-full h-[190px]">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full overflow-visible select-none"
            >
              <defs>
                <linearGradient id="limeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isLight ? "#bef226" : "#e8ff59"}
                    stopOpacity={isLight ? "0.45" : "0.35"}
                  />
                  <stop
                    offset="60%"
                    stopColor={isLight ? "#bef226" : "#e8ff59"}
                    stopOpacity="0.08"
                  />
                  <stop
                    offset="100%"
                    stopColor={isLight ? "#bef226" : "#e8ff59"}
                    stopOpacity="0.0"
                  />
                </linearGradient>
              </defs>

              {/* Muted Horizontal Grid Lines */}
              {yTicks.map((val) => {
                const y =
                  padTop + (1 - (val - minY) / (maxY - minY)) * chartHeight;
                return (
                  <g key={`ytick-${val}`}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={width - padRight}
                      y2={y}
                      stroke={isLight ? "#e2e8f0" : "#26262a"}
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      fill={isLight ? "#94a3b8" : "#9a9aa2"}
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path d={areaPath} fill="url(#limeAreaGrad)" />

              {/* Crisp stroke line */}
              <path
                d={linePath}
                fill="none"
                stroke={isLight ? "#65a30d" : "#e8ff59"}
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {points.map((pt, i) => {
                const isHovered = hoveredWeek === i;
                return (
                  <g
                    key={`pt-${i}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredWeek(i)}
                    onMouseLeave={() => setHoveredWeek(null)}
                  >
                    <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
                    {isHovered && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="6"
                        fill={isLight ? "#bef226" : "#e8ff59"}
                        opacity="0.5"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? "5" : "4"}
                      fill={isLight ? "#bef226" : "#e8ff59"}
                      stroke={isLight ? "#0f172a" : "#0b0b0c"}
                      strokeWidth="2"
                    />
                    {/* Week label */}
                    <text
                      x={pt.x}
                      y={padTop + chartHeight + 18}
                      textAnchor="middle"
                      fill={
                        isHovered
                          ? isLight
                            ? "#0f172a"
                            : "#ededed"
                          : isLight
                          ? "#64748b"
                          : "#9a9aa2"
                      }
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight={isHovered ? "bold" : "500"}
                    >
                      {pt.week}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right (1 col) - Key Focus Areas */}
        <div
          className={`rounded-[6px] border p-6 flex flex-col justify-between gap-4 shadow-xs transition-colors ${
            isLight
              ? "bg-white border-slate-200 text-slate-900"
              : "bg-[#131315] border-[#26262a] text-[#ededed]"
          }`}
        >
          <div>
            <h2
              className={`text-sm font-black tracking-wide ${
                isLight ? "text-slate-950" : "text-[#ededed]"
              }`}
            >
              Key Focus Areas
            </h2>
            <p
              className={`text-xs mt-0.5 ${
                isLight ? "text-slate-500" : "text-[#9a9aa2]"
              }`}
            >
              Automated scout takeaways based on {player.matchesSampled} scrims
            </p>
          </div>

          <div className="space-y-3">
            {/* Top Strength */}
            <div
              className={`p-3.5 rounded-[6px] border transition-colors ${
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-900"
                  : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                    isLight
                      ? "text-emerald-800 bg-emerald-100"
                      : "text-emerald-400 bg-emerald-950/60 border border-emerald-800/40"
                  }`}
                >
                  Top Strength
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    isLight ? "text-slate-700" : "text-[#ededed]"
                  }`}
                >
                  88th %ile
                </span>
              </div>
              <div
                className={`text-xs font-black ${
                  isLight ? "text-slate-950" : "text-[#ededed]"
                }`}
              >
                {player.topStrength}
              </div>
              <p
                className={`text-[11px] mt-1 leading-relaxed ${
                  isLight ? "text-slate-600" : "text-[#9a9aa2]"
                }`}
              >
                88th percentile in cohort. Consistent 1v2 conversion and round preservation.
              </p>
            </div>

            {/* Priority Improvement */}
            <div
              className={`p-3.5 rounded-[6px] border transition-colors ${
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-900"
                  : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                    isLight
                      ? "text-amber-800 bg-amber-100"
                      : "text-amber-400 bg-amber-950/60 border border-amber-800/40"
                  }`}
                >
                  Priority Improvement
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    isLight ? "text-slate-700" : "text-[#ededed]"
                  }`}
                >
                  41st %ile
                </span>
              </div>
              <div
                className={`text-xs font-black ${
                  isLight ? "text-slate-950" : "text-[#ededed]"
                }`}
              >
                {player.priorityImprovement}
              </div>
              <p
                className={`text-[11px] mt-1 leading-relaxed ${
                  isLight ? "text-slate-600" : "text-[#9a9aa2]"
                }`}
              >
                41st percentile — below benchmark. Focus on pre-aiming common entry angles.
              </p>
            </div>
          </div>

          <div
            className={`pt-2 border-t text-[11px] font-mono ${
              isLight
                ? "border-slate-200 text-slate-500"
                : "border-[#26262a] text-[#9a9aa2]"
            }`}
          >
            Model: Formula v1.2 • Standardized Cohort
          </div>
        </div>
      </div>
    </div>
  );
};
