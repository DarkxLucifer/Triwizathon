'use client';

import React from 'react';
import { Player, ScoutingBrief } from '@/types';
import { computeConfidence, computeRolePerformance } from '@/lib/scoring/engine';

interface ComparisonViewProps {
  brief: ScoutingBrief | null;
  players: Player[];
  comparisonPlayerIds: string[];
  onRemovePlayer: (playerId: string) => void;
  onNavigate: (screen: any) => void;
  theme?: 'dark' | 'light';
}

export function formatPlayerName(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function ComparisonView({
  brief,
  players,
  comparisonPlayerIds,
  onRemovePlayer,
  onNavigate,
  theme = 'dark',
}: ComparisonViewProps) {
  const isLight = theme === 'light';
  const targetRole = brief?.targetRole || 'IGL';

  // Selected players
  const comparedPlayers = players.filter(p => comparisonPlayerIds.includes(p.id));

  if (comparedPlayers.length === 0) {
    return (
      <div
        className={`${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#131315] border-[#26262a]'
        } border rounded-[6px] p-8 text-center space-y-3 font-sans text-[14px]`}
      >
        <h2 className={`text-[16px] font-bold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
          No candidates selected for comparison
        </h2>
        <p className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} max-w-md mx-auto`}>
          Select 2 or more candidates using the checkboxes in the table to evaluate them side-by-side.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('recommendations')}
          className={`px-3.5 py-1.5 rounded-[6px] border ${
            isLight
              ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-900 shadow-sm'
              : 'border-[#26262a] bg-[#131315] hover:bg-[#1a1a1d] text-[#ededed]'
          } text-[13px] font-medium transition-colors cursor-pointer`}
        >
          View recommendations
        </button>
      </div>
    );
  }

  // Build unified evaluations
  const evaluations = comparedPlayers.map(p => ({
    player: p,
    eval: computeRolePerformance(p, targetRole),
    conf: computeConfidence(p, targetRole),
  }));

  const allMetricKeys = Array.from(
    new Set(evaluations.flatMap(e => Object.keys(e.eval.individualMetrics)))
  );

  return (
    <div
      className={`${
        isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#0b0b0c] text-[#ededed]'
      } p-6 -m-6 space-y-6 font-sans text-[14px] transition-colors`}
    >
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
          isLight ? 'border-slate-200' : 'border-[#26262a]'
        }`}
      >
        <div>
          <h1 className={`text-[18px] font-bold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
            Candidate comparison
          </h1>
          <p className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} mt-0.5`}>
            Role performance comparison for {targetRole} ({comparedPlayers.length} candidates).
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('recommendations')}
          className={`px-3 py-1.5 rounded-[6px] border ${
            isLight
              ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-900 shadow-sm'
              : 'border-[#26262a] bg-[#131315] hover:bg-[#1a1a1d] text-[#ededed]'
          } text-[13px] font-medium transition-colors cursor-pointer`}
        >
          Back to recommendations
        </button>
      </div>

      {/* Candidate Profile Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {evaluations.map(item => {
          const p = item.player;
          const initials = p.handle.slice(0, 2).toUpperCase();

          return (
            <div
              key={p.id}
              className={`${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#131315] border-[#26262a]'
              } border rounded-[6px] p-4 space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-[4px] ${
                      isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-[#131315] border-[#26262a] text-[#ededed]'
                    } border flex items-center justify-center text-[11px] font-mono font-bold shrink-0`}
                  >
                    {initials}
                  </div>
                  <div>
                    <h3 className={`text-[14px] font-bold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
                      {formatPlayerName(p.handle)}
                    </h3>
                    <div className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                      {p.primaryRole} · {p.tier} · {p.region}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemovePlayer(p.id)}
                  className={`text-[12px] ${
                    isLight ? 'text-slate-400 hover:text-red-600' : 'text-[#9a9aa2] hover:text-[#ededed]'
                  } cursor-pointer`}
                >
                  Remove
                </button>
              </div>

              {/* Definition list of stats */}
              <div
                className={`pt-2 border-t ${
                  isLight ? 'border-slate-100' : 'border-[#26262a]'
                } space-y-1.5 text-[12px]`}
              >
                <div className="flex justify-between items-center">
                  <span className={isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}>Role score</span>
                  <span
                    className={`font-mono tabular-nums font-semibold ${
                      isLight ? 'text-emerald-600' : 'text-[#e8ff59]'
                    }`}
                  >
                    {item.eval.score.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}>ADR</span>
                  <span
                    className={`font-mono tabular-nums ${
                      isLight ? 'text-slate-800' : 'text-[#ededed]'
                    }`}
                  >
                    {p.stats.adr.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}>K/D ratio</span>
                  <span
                    className={`font-mono tabular-nums ${
                      isLight ? 'text-slate-800' : 'text-[#ededed]'
                    }`}
                  >
                    {p.stats.kdRatio.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}>Est. buyout</span>
                  <span
                    className={`font-mono tabular-nums ${
                      isLight ? 'text-slate-800' : 'text-[#ededed]'
                    }`}
                  >
                    ${p.buyoutUsd.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Horizontal Bar Breakdown per Metric */}
      <div
        className={`border ${
          isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-[#26262a] bg-[#131315]'
        } rounded-[6px] p-5 space-y-4`}
      >
        <div
          className={`flex items-center justify-between border-b ${
            isLight ? 'border-slate-100' : 'border-[#26262a]'
          } pb-3`}
        >
          <div>
            <h2 className={`text-[14px] font-bold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
              Skill breakdown & role benchmarks
            </h2>
            <p className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} mt-0.5`}>
              Side-by-side metric comparison across evaluated candidates.
            </p>
          </div>
          <span className={`text-[12px] ${isLight ? 'text-slate-400' : 'text-[#9a9aa2]'} font-mono`}>
            0–100 scale
          </span>
        </div>

        <div className="space-y-5">
          {allMetricKeys.map(metric => (
            <div key={metric} className="space-y-2">
              <div className={`text-[12px] ${isLight ? 'text-slate-800' : 'text-[#ededed]'} font-medium`}>
                {metric}
              </div>
              <div className="space-y-1.5">
                {evaluations.map(item => {
                  const val = item.eval.individualMetrics[metric] || 50;
                  return (
                    <div key={item.player.id} className="flex items-center gap-3 text-[12px]">
                      <span className={`w-24 truncate ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'}`}>
                        {formatPlayerName(item.player.handle)}
                      </span>
                      <div
                        className={`flex-1 h-2 ${
                          isLight ? 'bg-slate-100' : 'bg-[#26262a]'
                        } rounded-full overflow-hidden`}
                      >
                        <div
                          className={`h-full ${
                            isLight ? 'bg-slate-800' : 'bg-[#ededed]'
                          } transition-all duration-300`}
                          style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                        />
                      </div>
                      <span
                        className={`w-10 text-right font-mono tabular-nums ${
                          isLight ? 'text-slate-900 font-semibold' : 'text-[#ededed] font-medium'
                        }`}
                      >
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Comparison Matrix Table */}
      <div className="space-y-2">
        <h2 className={`text-[12px] font-normal ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
          Candidate metrics matrix
        </h2>
        <div
          className={`border ${
            isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-[#26262a] bg-[#131315]'
          } rounded-[6px] overflow-x-auto`}
        >
          <table className="w-full text-left text-[14px] border-collapse">
            <thead>
              <tr
                className={`border-b ${
                  isLight
                    ? 'border-slate-200 bg-slate-50 text-slate-500'
                    : 'border-[#26262a] text-[#9a9aa2]'
                } text-[12px] font-normal`}
              >
                <th className="py-2.5 px-3 font-normal">Metric</th>
                {evaluations.map(e => (
                  <th
                    key={e.player.id}
                    className={`py-2.5 px-3 text-right font-normal ${
                      isLight ? 'text-slate-900 font-semibold' : 'text-[#ededed]'
                    }`}
                  >
                    {formatPlayerName(e.player.handle)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allMetricKeys.map(k => (
                <tr
                  key={k}
                  className={`border-b ${
                    isLight
                      ? 'border-slate-100 hover:bg-slate-50'
                      : 'border-[#26262a] hover:bg-[#1a1a1d]'
                  } transition-colors duration-[120ms]`}
                >
                  <td className={`py-2.5 px-3 ${isLight ? 'text-slate-800' : 'text-[#ededed]'}`}>
                    {k}
                  </td>
                  {evaluations.map(e => {
                    const val = e.eval.individualMetrics[k] || 50;
                    return (
                      <td
                        key={e.player.id}
                        className={`py-2.5 px-3 text-right font-mono tabular-nums ${
                          isLight ? 'text-slate-900' : 'text-[#ededed]'
                        }`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr
                className={`border-b ${
                  isLight
                    ? 'border-slate-100 hover:bg-slate-50'
                    : 'border-[#26262a] hover:bg-[#1a1a1d]'
                } transition-colors duration-[120ms]`}
              >
                <td className={`py-2.5 px-3 ${isLight ? 'text-slate-800' : 'text-[#ededed]'}`}>
                  ADR
                </td>
                {evaluations.map(e => (
                  <td
                    key={e.player.id}
                    className={`py-2.5 px-3 text-right font-mono tabular-nums ${
                      isLight ? 'text-slate-900' : 'text-[#ededed]'
                    }`}
                  >
                    {e.player.stats.adr.toFixed(1)}
                  </td>
                ))}
              </tr>
              <tr
                className={`border-b ${
                  isLight
                    ? 'border-slate-100 hover:bg-slate-50'
                    : 'border-[#26262a] hover:bg-[#1a1a1d]'
                } transition-colors duration-[120ms]`}
              >
                <td className={`py-2.5 px-3 ${isLight ? 'text-slate-800' : 'text-[#ededed]'}`}>
                  K/D ratio
                </td>
                {evaluations.map(e => (
                  <td
                    key={e.player.id}
                    className={`py-2.5 px-3 text-right font-mono tabular-nums ${
                      isLight ? 'text-slate-900' : 'text-[#ededed]'
                    }`}
                  >
                    {e.player.stats.kdRatio.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr
                className={`border-b ${
                  isLight
                    ? 'border-slate-100 hover:bg-slate-50'
                    : 'border-[#26262a] hover:bg-[#1a1a1d]'
                } transition-colors duration-[120ms]`}
              >
                <td className={`py-2.5 px-3 ${isLight ? 'text-slate-800' : 'text-[#ededed]'}`}>
                  Matches
                </td>
                {evaluations.map(e => (
                  <td
                    key={e.player.id}
                    className={`py-2.5 px-3 text-right font-mono tabular-nums ${
                      isLight ? 'text-slate-900' : 'text-[#ededed]'
                    }`}
                  >
                    {e.player.matchesPlayed}
                  </td>
                ))}
              </tr>
              <tr
                className={`${
                  isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1d]'
                } transition-colors duration-[120ms]`}
              >
                <td className={`py-2.5 px-3 ${isLight ? 'text-slate-800' : 'text-[#ededed]'}`}>
                  Est. buyout
                </td>
                {evaluations.map(e => (
                  <td
                    key={e.player.id}
                    className={`py-2.5 px-3 text-right font-mono tabular-nums ${
                      isLight ? 'text-slate-900' : 'text-[#ededed]'
                    }`}
                  >
                    ${e.player.buyoutUsd.toLocaleString()}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
