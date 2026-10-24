'use client';

import React, { useState } from 'react';
import { Player, Role } from '@/types';
import { computeHiddenGemScore, computeConfidence } from '@/lib/scoring/engine';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

interface HiddenGemsViewProps {
  players: Player[];
  onToggleCompare: (playerId: string) => void;
  comparisonPlayerIds: string[];
  onNavigate: (screen: any) => void;
  theme?: 'dark' | 'light';
}

export function formatPlayerName(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

type SortKey =
  | 'player'
  | 'role'
  | 'tier'
  | 'gemScore'
  | 'adr'
  | 'visibilityGap'
  | 'matches'
  | 'trajectory'
  | 'buyout';

export function HiddenGemsView({
  players,
  onToggleCompare,
  comparisonPlayerIds,
  onNavigate,
  theme = 'dark',
}: HiddenGemsViewProps) {
  const isLight = theme === 'light';
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('gemScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Filter & evaluate players using HiddenGem formula
  const evaluatedPlayers = players
    .filter(p => p.gameTitle === 'Counter-Strike 2')
    .filter(p => selectedRole === 'all' || p.primaryRole === selectedRole)
    .filter(p => selectedTier === 'all' || p.tier === selectedTier)
    .map(player => {
      const gemEval = computeHiddenGemScore(player, player.primaryRole);
      const conf = computeConfidence(player, player.primaryRole);
      return {
        player,
        gemScore: Math.round(gemEval.score),
        isEligible: gemEval.isEligible,
        suppressionReason: gemEval.suppressionReason,
        confidence: conf,
      };
    });

  // Sort evaluated players
  const sorted = [...evaluatedPlayers].sort((a, b) => {
    let valA: any;
    let valB: any;

    switch (sortKey) {
      case 'player':
        valA = a.player.handle.toLowerCase();
        valB = b.player.handle.toLowerCase();
        break;
      case 'role':
        valA = a.player.primaryRole;
        valB = b.player.primaryRole;
        break;
      case 'tier':
        valA = a.player.tier;
        valB = b.player.tier;
        break;
      case 'gemScore':
        valA = a.gemScore;
        valB = b.gemScore;
        break;
      case 'adr':
        valA = a.player.stats.adr;
        valB = b.player.stats.adr;
        break;
      case 'visibilityGap':
        valA = a.player.visibilityGap;
        valB = b.player.visibilityGap;
        break;
      case 'matches':
        valA = a.player.matchesPlayed;
        valB = b.player.matchesPlayed;
        break;
      case 'trajectory':
        valA = a.player.improvementTrend;
        valB = b.player.improvementTrend;
        break;
      case 'buyout':
        valA = a.player.buyoutUsd;
        valB = b.player.buyoutUsd;
        break;
      default:
        valA = a.gemScore;
        valB = b.gemScore;
    }

    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir(key === 'player' || key === 'role' || key === 'tier' ? 'asc' : 'desc');
    }
  };

  const renderSortIndicator = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" style={{ strokeWidth: 1.5 }} />;
    }
    return sortDir === 'desc' ? (
      <ArrowDown className={`w-4 h-4 ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`} style={{ strokeWidth: 1.5 }} />
    ) : (
      <ArrowUp className={`w-4 h-4 ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`} style={{ strokeWidth: 1.5 }} />
    );
  };

  return (
    <div className={`p-6 -m-6 min-h-[calc(100vh-3.5rem)] space-y-4 font-sans text-[14px] ${isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#0b0b0c] text-[#ededed]'}`}>
      {/* Top Toolbar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${isLight ? 'border-slate-200' : 'border-[#26262a]'}`}>
        <div>
          <h1 className={`text-[18px] font-bold tracking-normal ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>Hidden gems</h1>
          <p className={`text-[12px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
            Under-observed players with positive trajectory and above-cohort execution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {comparisonPlayerIds.length >= 2 && (
            <button
              type="button"
              onClick={() => onNavigate('comparison')}
              className={`px-3 py-1.5 rounded-[6px] text-[13px] font-medium border cursor-pointer transition-colors ${
                isLight
                  ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-900 shadow-sm'
                  : 'border-[#26262a] bg-[#131315] hover:bg-[#1a1a1d] text-[#ededed]'
              }`}
            >
              Compare ({comparisonPlayerIds.length})
            </button>
          )}

          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className={`border rounded-[6px] px-2.5 py-1 text-[13px] focus:outline-none cursor-pointer ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-[#131315] border-[#26262a] text-[#ededed]'
            }`}
          >
            <option value="all">All roles</option>
            <option value="IGL">IGL</option>
            <option value="Entry">Entry</option>
            <option value="AWPer">AWPer</option>
            <option value="Lurker">Lurker</option>
            <option value="Support">Support</option>
          </select>

          <select
            value={selectedTier}
            onChange={e => setSelectedTier(e.target.value)}
            className={`border rounded-[6px] px-2.5 py-1 text-[13px] focus:outline-none cursor-pointer ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-[#131315] border-[#26262a] text-[#ededed]'
            }`}
          >
            <option value="all">All tiers</option>
            <option value="Tier 2">Tier 2</option>
            <option value="Tier 3">Tier 3</option>
            <option value="Tier 1">Tier 1</option>
          </select>
        </div>
      </div>

      {/* Sortable Table Container */}
      <div className={`border rounded-[6px] overflow-x-auto ${isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-[#26262a] bg-[#131315]'}`}>
        <table className="w-full border-collapse text-left text-[14px]">
          <thead className={`sticky top-0 z-10 border-b ${isLight ? 'bg-slate-50/90 border-slate-200 text-slate-600' : 'bg-[#131315] border-[#26262a] text-[#9a9aa2]'}`}>
            <tr>
              <th className="py-2.5 px-3 w-10 text-center text-[12px] font-normal">
                <span className="sr-only">Compare</span>
              </th>

              <th
                onClick={() => handleSort('player')}
                className="py-2.5 px-3 text-[12px] font-normal cursor-pointer select-none group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Player</span>
                  {renderSortIndicator('player')}
                </div>
              </th>

              <th
                onClick={() => handleSort('role')}
                className="py-2.5 px-3 text-[12px] font-normal cursor-pointer select-none group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Role</span>
                  {renderSortIndicator('role')}
                </div>
              </th>

              <th
                onClick={() => handleSort('tier')}
                className="py-2.5 px-3 text-[12px] font-normal cursor-pointer select-none group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Tier</span>
                  {renderSortIndicator('tier')}
                </div>
              </th>

              <th
                onClick={() => handleSort('gemScore')}
                className="py-2.5 px-3 text-right text-[12px] font-normal cursor-pointer select-none group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Gem score</span>
                  {renderSortIndicator('gemScore')}
                </div>
              </th>

              <th
                onClick={() => handleSort('adr')}
                className="py-2.5 px-3 text-right text-[12px] font-normal cursor-pointer select-none group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>ADR</span>
                  {renderSortIndicator('adr')}
                </div>
              </th>

              <th
                onClick={() => handleSort('visibilityGap')}
                className="py-2.5 px-3 text-right text-[12px] font-normal cursor-pointer select-none group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Visibility gap</span>
                  {renderSortIndicator('visibilityGap')}
                </div>
              </th>

              <th
                onClick={() => handleSort('matches')}
                className="py-2.5 px-3 text-right text-[12px] font-normal cursor-pointer select-none group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Matches</span>
                  {renderSortIndicator('matches')}
                </div>
              </th>

              <th
                onClick={() => handleSort('trajectory')}
                className="py-2.5 px-3 text-right text-[12px] font-normal cursor-pointer select-none group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Trajectory</span>
                  {renderSortIndicator('trajectory')}
                </div>
              </th>

              <th
                onClick={() => handleSort('buyout')}
                className="py-2.5 px-3 text-right text-[12px] font-normal cursor-pointer select-none group"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Est. buyout</span>
                  {renderSortIndicator('buyout')}
                </div>
              </th>

              <th className="py-2.5 px-3 text-right text-[12px] font-normal">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={11} className={`py-8 text-center text-[13px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                  No candidates match the selected filters.
                </td>
              </tr>
            ) : (
              sorted.map(({ player, gemScore, isEligible, confidence }) => {
                const isSelected = comparisonPlayerIds.includes(player.id);

                return (
                  <tr
                    key={player.id}
                    className={`border-b transition-colors duration-[120ms] ${
                      isLight
                        ? 'border-slate-100 hover:bg-slate-50/80'
                        : 'border-[#26262a] hover:bg-[#1a1a1d]'
                    } ${
                      isSelected
                        ? isLight
                          ? 'border-l-2 border-l-lime-600 bg-lime-50/30'
                          : 'border-l-2 border-l-[#e8ff59] bg-[#18181b]'
                        : 'border-l-2 border-l-transparent'
                    }`}
                  >
                    {/* Checkbox for Compare */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleCompare(player.id)}
                        className={`w-4 h-4 rounded-[3px] border accent-[#e8ff59] cursor-pointer ${
                          isLight
                            ? 'border-slate-300 bg-white'
                            : 'border-[#26262a] bg-[#131315]'
                        }`}
                        aria-label={`Compare ${player.handle}`}
                      />
                    </td>

                    {/* Player: handle bold, real name + team + region in muted text below */}
                    <td className="py-3 px-3">
                      <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
                        {formatPlayerName(player.handle)}
                      </div>
                      <div className={`text-[12px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                        {player.realName} · {player.currentTeamName} · {player.region}
                      </div>
                    </td>

                    {/* Role: plain muted text */}
                    <td className={`py-3 px-3 ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'}`}>
                      {player.primaryRole}
                    </td>

                    {/* Tier: plain muted text */}
                    <td className={`py-3 px-3 ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'}`}>
                      {player.tier}
                    </td>

                    {/* Gem Score: right-aligned, font-mono tabular-nums, --accent color */}
                    <td className={`py-3 px-3 text-right font-mono tabular-nums font-semibold ${isLight ? 'text-lime-700' : 'text-[#e8ff59]'}`}>
                      {isEligible ? gemScore : '—'}
                    </td>

                    {/* ADR: right-aligned, font-mono tabular-nums */}
                    <td className={`py-3 px-3 text-right font-mono tabular-nums ${isLight ? 'text-slate-800' : 'text-[#ededed]'}`}>
                      {player.stats.adr.toFixed(1)}
                    </td>

                    {/* Visibility Gap: right-aligned, font-mono tabular-nums */}
                    <td className={`py-3 px-3 text-right font-mono tabular-nums ${isLight ? 'text-slate-800' : 'text-[#ededed]'}`}>
                      {(player.visibilityGap * 100).toFixed(0)}%
                    </td>

                    {/* Matches: right-aligned, font-mono tabular-nums */}
                    <td className={`py-3 px-3 text-right font-mono tabular-nums ${isLight ? 'text-slate-800' : 'text-[#ededed]'}`}>
                      {player.matchesPlayed}
                    </td>

                    {/* Trajectory: right-aligned, font-mono tabular-nums, --up / --down */}
                    <td
                      className={`py-3 px-3 text-right font-mono tabular-nums ${
                        player.improvementTrend >= 0 ? (isLight ? 'text-emerald-600' : 'text-[#4ade80]') : (isLight ? 'text-rose-600' : 'text-[#f87171]')
                      }`}
                    >
                      {player.improvementTrend >= 0 ? '+' : ''}
                      {(player.improvementTrend * 100).toFixed(0)}%
                    </td>

                    {/* Est. Buyout: right-aligned, font-mono tabular-nums, normal text color, thin 3px bar */}
                    <td className={`py-3 px-3 text-right font-mono tabular-nums ${isLight ? 'text-slate-800' : 'text-[#ededed]'}`}>
                      <div>${player.buyoutUsd.toLocaleString()}</div>
                      <div
                        title="Reliability metric"
                        className={`w-12 h-[3px] rounded-full overflow-hidden ml-auto mt-1 ${isLight ? 'bg-slate-200' : 'bg-[#26262a]'}`}
                      >
                        <div
                          className={`h-full ${isLight ? 'bg-slate-400' : 'bg-[#9a9aa2]'}`}
                          style={{
                            width: `${Math.min(95, Math.max(30, confidence.score))}%`,
                          }}
                        />
                      </div>
                    </td>

                    {/* Actions: plain text link "Details" */}
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onNavigate('recommendations')}
                        className={`text-[13px] hover:underline cursor-pointer bg-transparent border-0 p-0 ${
                          isLight ? 'text-slate-600 hover:text-slate-900' : 'text-[#9a9aa2] hover:text-[#ededed]'
                        }`}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
