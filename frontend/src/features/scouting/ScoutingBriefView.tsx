'use client';

import React, { useState } from 'react';
import { ScoutingBrief, GameTitle, Role, CompetitionTier, ScoringWeights } from '@/types';
import { DEFAULT_WEIGHTS, generateFormulaVersion } from '@/lib/scoring/engine';

interface ScoutingBriefViewProps {
  briefs: ScoutingBrief[];
  activeBrief: ScoutingBrief | null;
  onSelectActiveBrief: (brief: ScoutingBrief) => void;
  onCreateBrief: (brief: Omit<ScoutingBrief, 'id' | 'createdAt' | 'organizationId'>) => void;
  onNavigate: (screen: any) => void;
  theme?: 'dark' | 'light';
}

export function ScoutingBriefView({
  briefs,
  activeBrief,
  onSelectActiveBrief,
  onCreateBrief,
  onNavigate,
  theme = 'dark',
}: ScoutingBriefViewProps) {
  const isLight = theme === 'light';
  const [title, setTitle] = useState('CS2 Dedicated IGL Strategic Replacement');
  const [gameTitle, setGameTitle] = useState<GameTitle>('Counter-Strike 2');
  const [targetRole, setTargetRole] = useState<Role>('IGL');
  const [evaluationWindowDays, setEvaluationWindowDays] = useState(180);
  const [competitionTier, setCompetitionTier] = useState<CompetitionTier>('Tier 1');
  const [maxBuyoutUsd, setMaxBuyoutUsd] = useState(350000);
  const [primaryLanguage, setPrimaryLanguage] = useState('English');
  const [minMatches, setMinMatches] = useState(10);
  const [region, setRegion] = useState('EU');

  // Weights configuration
  const [rolePerfWeight, setRolePerfWeight] = useState(0.55);
  const [rosterNeedWeight, setRosterNeedWeight] = useState(0.20);
  const [synergyWeight, setSynergyWeight] = useState(0.15);
  const [constraintWeight, setConstraintWeight] = useState(0.10);

  const currentWeights: ScoringWeights = {
    rolePerformanceWeight: rolePerfWeight,
    rosterNeedMatchWeight: rosterNeedWeight,
    synergyContributionWeight: synergyWeight,
    constraintMatchWeight: constraintWeight,
  };

  const weightsSum = Math.round((rolePerfWeight + rosterNeedWeight + synergyWeight + constraintWeight) * 100) / 100;
  const isWeightsValid = Math.abs(weightsSum - 1.0) < 0.001;

  const currentVersionTag = generateFormulaVersion('v1.0.0-cs2-igl', currentWeights);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWeightsValid) return;

    onCreateBrief({
      rosterId: 'roster-cs2-apex',
      title,
      gameTitle,
      targetRole,
      evaluationWindowDays,
      competitionTier,
      mustHaveConstraints: {
        maxBuyoutUsd,
        primaryLanguage,
        minMatches,
      },
      preferredConstraints: {
        region,
      },
      weightsOverride: currentWeights,
      formulaVersion: currentVersionTag,
      decisionStatus: 'open',
    });

    onNavigate('recommendations');
  };

  return (
    <div
      className={`${
        isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#0b0b0c] text-[#ededed]'
      } p-6 -m-6 min-h-[calc(100vh-3.5rem)] space-y-6 font-sans text-[14px] transition-colors`}
    >
      {/* Header */}
      <div className={`pb-4 border-b ${isLight ? 'border-slate-200' : 'border-[#26262a]'}`}>
        <h1 className={`text-[18px] font-bold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
          Scouting briefs
        </h1>
        <p className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} mt-0.5`}>
          Role requirements, evaluation windows, financial caps, and custom scoring weights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Briefs List */}
        <div className="lg:col-span-4 space-y-3">
          <div className={`pb-1 border-b ${isLight ? 'border-slate-200' : 'border-[#26262a]'}`}>
            <h2 className={`text-[12px] font-normal ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
              Configured briefs ({briefs.length})
            </h2>
          </div>

          <div className="space-y-2">
            {briefs.map(b => {
              const isActive = activeBrief?.id === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => onSelectActiveBrief(b)}
                  className={`p-3 rounded-[6px] border ${
                    isLight
                      ? 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'
                      : 'border-[#26262a] bg-[#131315] hover:bg-[#1a1a1d]'
                  } transition-colors duration-[120ms] cursor-pointer ${
                    isActive
                      ? isLight
                        ? 'border-l-4 border-l-slate-900'
                        : 'border-l-2 border-l-[#e8ff59] bg-[#18181b]'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[13px] font-bold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
                      {b.title}
                    </span>
                    <span className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                      {b.targetRole}
                    </span>
                  </div>
                  <p className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} mt-1`}>
                    {b.gameTitle} · {b.competitionTier} · {b.evaluationWindowDays}d window
                  </p>
                  <div
                    className={`flex items-center justify-between mt-2 pt-2 border-t ${
                      isLight ? 'border-slate-100 text-slate-500' : 'border-[#26262a] text-[#9a9aa2]'
                    } text-[11px] font-mono`}
                  >
                    <span>Formula: {b.formulaVersion}</span>
                    <span className={`${isLight ? 'text-slate-900' : 'text-[#ededed]'} font-medium`}>
                      {b.decisionStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Configure Brief Form */}
        <div
          className={`lg:col-span-8 border ${
            isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-[#26262a] bg-[#131315]'
          } rounded-[6px] p-5 space-y-4`}
        >
          <div
            className={`flex items-center justify-between border-b ${
              isLight ? 'border-slate-200' : 'border-[#26262a]'
            } pb-3`}
          >
            <h2 className={`text-[14px] font-bold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
              Configure strategic scouting brief
            </h2>
            <span className={`text-[12px] font-mono ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
              Tag: {currentVersionTag}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
            {/* Title & Game */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[12px] ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'} mb-1`}>
                  Brief title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className={`w-full ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-slate-500'
                      : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
                  } border rounded-[6px] px-3 py-1.5 text-[13px] focus:outline-none`}
                  required
                />
              </div>

              <div>
                <label className={`block text-[12px] ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'} mb-1`}>
                  Target game
                </label>
                <select
                  value={gameTitle}
                  onChange={e => setGameTitle(e.target.value as GameTitle)}
                  className={`w-full ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
                  } border rounded-[6px] px-2.5 py-1.5 text-[13px] focus:outline-none cursor-pointer`}
                >
                  <option value="Counter-Strike 2">Counter-Strike 2</option>
                  <option value="Valorant">Valorant</option>
                  <option value="BGMI">BGMI</option>
                </select>
              </div>
            </div>

            {/* Target Role & Competition Tier & Window */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={`block text-[12px] ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'} mb-1`}>
                  Target role
                </label>
                <select
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value as Role)}
                  className={`w-full ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
                  } border rounded-[6px] px-2.5 py-1.5 text-[13px] focus:outline-none cursor-pointer`}
                >
                  <option value="IGL">IGL</option>
                  <option value="Entry">Entry</option>
                  <option value="AWPer">AWPer</option>
                  <option value="Lurker">Lurker</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div>
                <label className={`block text-[12px] ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'} mb-1`}>
                  Evaluation window
                </label>
                <select
                  value={evaluationWindowDays}
                  onChange={e => setEvaluationWindowDays(Number(e.target.value))}
                  className={`w-full ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
                  } border rounded-[6px] px-2.5 py-1.5 text-[13px] focus:outline-none cursor-pointer`}
                >
                  <option value={90}>Last 90 days</option>
                  <option value={180}>Last 180 days</option>
                  <option value={365}>Last 365 days</option>
                </select>
              </div>

              <div>
                <label className={`block text-[12px] ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'} mb-1`}>
                  Competition tier
                </label>
                <select
                  value={competitionTier}
                  onChange={e => setCompetitionTier(e.target.value as CompetitionTier)}
                  className={`w-full ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
                  } border rounded-[6px] px-2.5 py-1.5 text-[13px] focus:outline-none cursor-pointer`}
                >
                  <option value="Tier 1">Tier 1</option>
                  <option value="Tier 2">Tier 2</option>
                  <option value="Tier 3">Tier 3</option>
                </select>
              </div>
            </div>

            {/* Hard Constraints */}
            <div className={`pt-2 border-t ${isLight ? 'border-slate-200' : 'border-[#26262a]'} space-y-3`}>
              <h3 className={`text-[12px] font-normal ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                Hard constraints
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-[12px] ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'} mb-1`}>
                    Max buyout ($)
                  </label>
                  <input
                    type="number"
                    value={maxBuyoutUsd}
                    onChange={e => setMaxBuyoutUsd(Number(e.target.value))}
                    step={10000}
                    className={`w-full ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
                    } border rounded-[6px] px-3 py-1.5 text-[13px] font-mono tabular-nums focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-[12px] ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'} mb-1`}>
                    Primary language
                  </label>
                  <input
                    type="text"
                    value={primaryLanguage}
                    onChange={e => setPrimaryLanguage(e.target.value)}
                    className={`w-full ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
                    } border rounded-[6px] px-3 py-1.5 text-[13px] focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-[12px] ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'} mb-1`}>
                    Min matches
                  </label>
                  <input
                    type="number"
                    value={minMatches}
                    onChange={e => setMinMatches(Number(e.target.value))}
                    className={`w-full ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
                    } border rounded-[6px] px-3 py-1.5 text-[13px] font-mono tabular-nums focus:outline-none`}
                  />
                </div>
              </div>
            </div>

            {/* Scoring Weights */}
            <div className={`pt-2 border-t ${isLight ? 'border-slate-200' : 'border-[#26262a]'} space-y-3`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-[12px] font-normal ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                  Fit score weight breakdown
                </h3>
                <span
                  className={`text-[12px] font-mono tabular-nums ${
                    isWeightsValid
                      ? isLight ? 'text-emerald-600' : 'text-[#4ade80]'
                      : 'text-red-500'
                  }`}
                >
                  Total: {(weightsSum * 100).toFixed(0)}% {isWeightsValid ? '' : '(Must equal 100%)'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px] font-mono">
                <div
                  className={`p-2.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'
                  } border rounded-[4px] space-y-1`}
                >
                  <span className={`${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} text-[11px] block font-sans`}>
                    Role performance
                  </span>
                  <input
                    type="number"
                    step={0.05}
                    min={0}
                    max={1}
                    value={rolePerfWeight}
                    onChange={e => setRolePerfWeight(Number(e.target.value))}
                    className={`w-full bg-transparent ${isLight ? 'text-slate-900' : 'text-[#ededed]'} font-bold focus:outline-none`}
                  />
                </div>

                <div
                  className={`p-2.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'
                  } border rounded-[4px] space-y-1`}
                >
                  <span className={`${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} text-[11px] block font-sans`}>
                    Roster need
                  </span>
                  <input
                    type="number"
                    step={0.05}
                    min={0}
                    max={1}
                    value={rosterNeedWeight}
                    onChange={e => setRosterNeedWeight(Number(e.target.value))}
                    className={`w-full bg-transparent ${isLight ? 'text-slate-900' : 'text-[#ededed]'} font-bold focus:outline-none`}
                  />
                </div>

                <div
                  className={`p-2.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'
                  } border rounded-[4px] space-y-1`}
                >
                  <span className={`${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} text-[11px] block font-sans`}>
                    Synergy
                  </span>
                  <input
                    type="number"
                    step={0.05}
                    min={0}
                    max={1}
                    value={synergyWeight}
                    onChange={e => setSynergyWeight(Number(e.target.value))}
                    className={`w-full bg-transparent ${isLight ? 'text-slate-900' : 'text-[#ededed]'} font-bold focus:outline-none`}
                  />
                </div>

                <div
                  className={`p-2.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'
                  } border rounded-[4px] space-y-1`}
                >
                  <span className={`${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} text-[11px] block font-sans`}>
                    Constraints
                  </span>
                  <input
                    type="number"
                    step={0.05}
                    min={0}
                    max={1}
                    value={constraintWeight}
                    onChange={e => setConstraintWeight(Number(e.target.value))}
                    className={`w-full bg-transparent ${isLight ? 'text-slate-900' : 'text-[#ededed]'} font-bold focus:outline-none`}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={`pt-3 border-t ${isLight ? 'border-slate-200' : 'border-[#26262a]'} flex justify-end`}>
              <button
                type="submit"
                disabled={!isWeightsValid}
                className={`px-4 py-2 rounded-[6px] border ${
                  isLight
                    ? 'border-slate-900 bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    : 'border-[#26262a] bg-[#1a1a1d] hover:bg-[#222226] text-[#ededed]'
                } disabled:opacity-50 text-[13px] font-medium transition-colors cursor-pointer`}
              >
                Save and execute brief
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
