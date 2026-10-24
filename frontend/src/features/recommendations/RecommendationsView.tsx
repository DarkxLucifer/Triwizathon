'use client';

import React, { useState } from 'react';
import {
  CandidateRecommendation,
  ScoutingBrief,
  DecisionAction,
} from '@/types';

interface RecommendationsViewProps {
  brief: ScoutingBrief | null;
  recommendations: CandidateRecommendation[];
  onToggleCompare: (playerId: string) => void;
  comparisonPlayerIds: string[];
  onSaveDecision: (params: {
    briefId: string;
    briefTitle: string;
    playerId: string;
    playerHandle: string;
    action: DecisionAction;
    rationale: string;
    fitScore: number;
    formulaVersion: string;
    userEmail: string;
  }) => void;
  onNavigate: (screen: any) => void;
  theme?: 'dark' | 'light';
}

export function formatPlayerName(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function RecommendationsView({
  brief,
  recommendations,
  onToggleCompare,
  comparisonPlayerIds,
  onSaveDecision,
  onNavigate,
  theme = 'dark',
}: RecommendationsViewProps) {
  const isLight = theme === 'light';
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecommendation | null>(null);
  const [decisionAction, setDecisionAction] = useState<DecisionAction>('trial');
  const [rationale, setRationale] = useState('');
  const [userEmail, setUserEmail] = useState('riya.analyst@apex.gg');
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const openDecisionModal = (candidate: CandidateRecommendation, action: DecisionAction) => {
    setSelectedCandidate(candidate);
    setDecisionAction(action);
    setRationale(
      action === 'trial'
        ? `Recommend 3-map scrim trial against Tier-1 opposition. Match score ${candidate.fitScore}.`
        : action === 'watch'
        ? `Added to 90-day tracking. Monitor mid-round calling during regional playoffs.`
        : `Does not meet immediate buyout or communication requirements.`
    );
    setIsDecisionModalOpen(true);
  };

  const handleConfirmDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !brief) return;

    onSaveDecision({
      briefId: brief.id,
      briefTitle: brief.title,
      playerId: selectedCandidate.player.id,
      playerHandle: selectedCandidate.player.handle,
      action: decisionAction,
      rationale,
      fitScore: selectedCandidate.fitScore,
      formulaVersion: selectedCandidate.formulaVersion,
      userEmail,
    });

    setIsDecisionModalOpen(false);
    setSuccessBanner(
      `Decision logged for ${formatPlayerName(selectedCandidate.player.handle)}: ${decisionAction}.`
    );
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  return (
    <div
      className={`${
        isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#0b0b0c] text-[#ededed]'
      } p-6 -m-6 min-h-[calc(100vh-3.5rem)] space-y-4 font-sans text-[14px] transition-colors`}
    >
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
          isLight ? 'border-slate-200' : 'border-[#26262a]'
        }`}
      >
        <div>
          <h1 className={`text-[18px] font-bold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
            Candidate recommendations
          </h1>
          <p className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} mt-0.5`}>
            Ranked candidates for {brief?.title || 'Active brief'} · Role: {brief?.targetRole || 'IGL'} · Window: {brief?.evaluationWindowDays || 180}d
          </p>
        </div>

        {comparisonPlayerIds.length > 0 && (
          <button
            type="button"
            onClick={() => onNavigate('comparison')}
            className={`px-3 py-1.5 rounded-[6px] border ${
              isLight
                ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-900 shadow-sm'
                : 'border-[#26262a] bg-[#131315] hover:bg-[#1a1a1d] text-[#ededed]'
            } text-[13px] font-medium transition-colors cursor-pointer`}
          >
            Compare ({comparisonPlayerIds.length})
          </button>
        )}
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div
          className={`p-3 ${
            isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : 'bg-[#131315] border-[#26262a] text-[#ededed]'
          } border rounded-[6px] text-[13px] flex items-center justify-between`}
        >
          <span>{successBanner}</span>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className={`text-[12px] ${
              isLight ? 'text-slate-500 hover:text-slate-900' : 'text-[#9a9aa2] hover:text-[#ededed]'
            } cursor-pointer`}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Candidates List */}
      <div className="space-y-3">
        {recommendations.map(candidate => {
          const p = candidate.player;
          const isComparing = comparisonPlayerIds.includes(p.id);
          const initials = p.handle.slice(0, 2).toUpperCase();

          return (
            <div
              key={p.id}
              className={`${
                isLight
                  ? 'bg-white border-slate-200 hover:bg-slate-50/50 shadow-sm'
                  : 'bg-[#131315] border-[#26262a] hover:bg-[#17171a]'
              } border rounded-[6px] p-4 space-y-3 transition-colors duration-[120ms] ${
                isComparing
                  ? isLight
                    ? 'border-l-4 border-l-slate-900'
                    : 'border-l-2 border-l-[#e8ff59]'
                  : ''
              }`}
            >
              {/* Header Row */}
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
                  isLight ? 'border-slate-100' : 'border-[#26262a]'
                } pb-3`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <span
                    className={`font-mono ${
                      isLight ? 'text-slate-500' : 'text-[#9a9aa2]'
                    } text-[13px] w-6 text-center tabular-nums`}
                  >
                    {candidate.rank}
                  </span>

                  {/* 28px initials avatar */}
                  <div
                    className={`w-7 h-7 rounded-[4px] ${
                      isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-[#131315] border-[#26262a] text-[#ededed]'
                    } border flex items-center justify-center font-mono text-[11px] font-bold shrink-0`}
                  >
                    {initials}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-[14px] font-bold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
                        {formatPlayerName(p.handle)}
                      </h3>
                      <span className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                        {p.primaryRole}
                      </span>
                      <span className={`text-[12px] ${isLight ? 'text-slate-400' : 'text-[#9a9aa2]'}`}>·</span>
                      <span className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                        {p.availability}
                      </span>
                    </div>
                    <div className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} mt-0.5`}>
                      {p.realName} · {p.currentTeamName} · {p.tier} · {p.region} · Est. buyout: ${p.buyoutUsd.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Score & Reliability */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} block`}>
                      Match score (based on roster needs)
                    </span>
                    <span
                      className={`text-[18px] font-bold font-mono tabular-nums ${
                        isLight ? 'text-emerald-600' : 'text-[#e8ff59]'
                      }`}
                    >
                      {candidate.fitScore}
                    </span>
                  </div>

                  <div
                    className={`text-right pl-4 border-l ${
                      isLight ? 'border-slate-200' : 'border-[#26262a]'
                    }`}
                  >
                    <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} block`}>
                      Reliability
                    </span>
                    <div
                      className={`w-12 h-[3px] ${
                        isLight ? 'bg-slate-200' : 'bg-[#26262a]'
                      } rounded-full overflow-hidden mt-2 ml-auto`}
                    >
                      <div
                        className={`h-full ${isLight ? 'bg-slate-500' : 'bg-[#9a9aa2]'}`}
                        style={{ width: `${Math.min(92, Math.max(35, candidate.confidence.score))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Component Contributions Row */}
              <div
                className={`grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px] font-mono tabular-nums ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'
                } p-2.5 rounded-[4px] border`}
              >
                <div>
                  <span className={`${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} text-[11px] block font-sans`}>
                    Role performance (55%)
                  </span>
                  <span className={`${isLight ? 'text-slate-900' : 'text-[#ededed]'} font-medium`}>
                    {candidate.metricContributions.rolePerformance.toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className={`${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} text-[11px] block font-sans`}>
                    Roster need (20%)
                  </span>
                  <span className={`${isLight ? 'text-slate-900' : 'text-[#ededed]'} font-medium`}>
                    {candidate.metricContributions.rosterNeedMatch.toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className={`${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} text-[11px] block font-sans`}>
                    Synergy (15%)
                  </span>
                  <span className={`${isLight ? 'text-slate-900' : 'text-[#ededed]'} font-medium`}>
                    {candidate.metricContributions.synergyContribution.toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className={`${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} text-[11px] block font-sans`}>
                    Constraints (10%)
                  </span>
                  <span className={`${isLight ? 'text-slate-900' : 'text-[#ededed]'} font-medium`}>
                    {candidate.metricContributions.constraintMatch.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Drivers & Risks Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px] pt-1">
                <div className="space-y-1">
                  <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} block`}>
                    Positive drivers
                  </span>
                  <ul className="space-y-1">
                    {candidate.positiveDrivers.map((d, i) => (
                      <li
                        key={i}
                        className={`${isLight ? 'text-slate-800' : 'text-[#ededed]'} flex items-start gap-1.5 text-[12px]`}
                      >
                        <span className={isLight ? 'text-emerald-600' : 'text-[#4ade80]'}>•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} block`}>
                    Watchpoints
                  </span>
                  <ul className="space-y-1">
                    {candidate.risks.map((r, i) => (
                      <li
                        key={i}
                        className={`${isLight ? 'text-slate-800' : 'text-[#ededed]'} flex items-start gap-1.5 text-[12px]`}
                      >
                        <span className={isLight ? 'text-slate-400' : 'text-[#9a9aa2]'}>•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions Row */}
              <div
                className={`flex flex-wrap items-center justify-between gap-3 pt-3 border-t ${
                  isLight ? 'border-slate-100' : 'border-[#26262a]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onToggleCompare(p.id)}
                  className={`px-3 py-1.5 rounded-[6px] border text-[13px] font-medium transition-colors cursor-pointer ${
                    isComparing
                      ? isLight
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-[#e8ff59] bg-[#1a1a1d] text-[#ededed]'
                      : isLight
                      ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                      : 'border-[#26262a] bg-[#131315] hover:bg-[#1a1a1d] text-[#ededed]'
                  }`}
                >
                  {isComparing ? 'In compare' : 'Compare'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openDecisionModal(candidate, 'trial')}
                    className={`px-3 py-1.5 rounded-[6px] border ${
                      isLight
                        ? 'border-slate-900 bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                        : 'border-[#26262a] bg-[#1a1a1d] hover:bg-[#222226] text-[#ededed]'
                    } text-[13px] font-medium transition-colors cursor-pointer`}
                  >
                    Advance to trial
                  </button>
                  <button
                    type="button"
                    onClick={() => openDecisionModal(candidate, 'watch')}
                    className={`px-3 py-1.5 rounded-[6px] border ${
                      isLight
                        ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                        : 'border-[#26262a] bg-[#131315] hover:bg-[#1a1a1d] text-[#9a9aa2] hover:text-[#ededed]'
                    } text-[13px] font-medium transition-colors cursor-pointer`}
                  >
                    Watchlist
                  </button>
                  <button
                    type="button"
                    onClick={() => openDecisionModal(candidate, 'reject')}
                    className={`px-3 py-1.5 rounded-[6px] border border-transparent ${
                      isLight
                        ? 'hover:border-slate-200 bg-transparent text-slate-500 hover:text-red-600'
                        : 'hover:border-[#26262a] bg-transparent text-[#9a9aa2] hover:text-[#f87171]'
                    } text-[13px] font-medium transition-colors cursor-pointer`}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decision Modal */}
      {isDecisionModalOpen && selectedCandidate && (
        <div
          className={`fixed inset-0 z-50 ${
            isLight ? 'bg-slate-900/40 backdrop-blur-sm' : 'bg-[#0b0b0c]/80'
          } flex items-center justify-center p-4`}
        >
          <div
            className={`${
              isLight ? 'bg-white border-slate-200 shadow-xl text-slate-900' : 'bg-[#131315] border-[#26262a] text-[#ededed]'
            } border rounded-[6px] max-w-lg w-full p-6 space-y-4`}
          >
            <div
              className={`flex items-center justify-between border-b ${
                isLight ? 'border-slate-200' : 'border-[#26262a]'
              } pb-3`}
            >
              <h3 className={`text-[15px] font-bold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
                Log decision: {formatPlayerName(selectedCandidate.player.handle)}
              </h3>
              <span className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                Action: {decisionAction}
              </span>
            </div>

            <form onSubmit={handleConfirmDecision} className="space-y-4 text-[13px]">
              <div>
                <label className={`block text-[12px] ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'} mb-1`}>
                  Sign-off email
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                  className={`w-full ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
                  } border rounded-[6px] px-3 py-1.5 text-[13px] focus:outline-none`}
                  required
                />
              </div>

              <div>
                <label className={`block text-[12px] ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'} mb-1`}>
                  Rationale
                </label>
                <textarea
                  rows={3}
                  value={rationale}
                  onChange={e => setRationale(e.target.value)}
                  className={`w-full ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
                  } border rounded-[6px] p-3 text-[13px] focus:outline-none`}
                  required
                />
              </div>

              <div
                className={`p-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'
                } border rounded-[6px] text-[12px] font-mono tabular-nums ${
                  isLight ? 'text-slate-600' : 'text-[#9a9aa2]'
                } space-y-1`}
              >
                <div className="flex justify-between">
                  <span>Match score:</span>
                  <span className={`${isLight ? 'text-emerald-600' : 'text-[#e8ff59]'} font-bold`}>
                    {selectedCandidate.fitScore}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Formula:</span>
                  <span className={isLight ? 'text-slate-900' : 'text-[#ededed]'}>
                    {selectedCandidate.formulaVersion}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDecisionModalOpen(false)}
                  className={`px-3 py-1.5 rounded-[6px] border ${
                    isLight
                      ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      : 'border-[#26262a] bg-[#131315] text-[#9a9aa2] hover:text-[#ededed]'
                  } text-[13px] cursor-pointer`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-3.5 py-1.5 rounded-[6px] border ${
                    isLight
                      ? 'border-slate-900 bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                      : 'border-[#26262a] bg-[#1a1a1d] hover:bg-[#222226] text-[#ededed]'
                  } text-[13px] font-medium cursor-pointer`}
                >
                  Save decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
