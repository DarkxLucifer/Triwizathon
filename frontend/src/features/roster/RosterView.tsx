'use client';

import React, { useState } from 'react';
import { Roster, Role } from '@/types';

interface RosterViewProps {
  rosters: Roster[];
  onSelectRoleToScout: (role: Role) => void;
  onNavigate: (screen: any) => void;
  theme?: 'dark' | 'light';
}

export function formatPlayerName(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function RosterView({
  rosters,
  onSelectRoleToScout,
  onNavigate,
  theme = 'dark',
}: RosterViewProps) {
  const isLight = theme === 'light';
  const [selectedRosterIndex, setSelectedRosterIndex] = useState(0);
  const roster = rosters[selectedRosterIndex] || rosters[0];

  const occupiedSlots = roster?.slots.filter(s => s.player !== null).length || 0;
  const totalSlots = roster?.slots.length || 5;

  return (
    <div
      className={`${
        isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#0b0b0c] text-[#ededed]'
      } p-6 -m-6 min-h-[calc(100vh-3.5rem)] space-y-6 font-sans text-[14px] transition-colors`}
    >
      {/* Header and Controls */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${
          isLight ? 'border-slate-200' : 'border-[#26262a]'
        }`}
      >
        <div>
          <h1 className={`text-[18px] font-bold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
            {roster?.name || 'Roster formation'}
          </h1>
          <p className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} mt-0.5`}>
            {roster?.teamName || 'Apex Esports'} · {roster?.gameTitle || 'CS2'} · {occupiedSlots} / {totalSlots} slots filled
          </p>
        </div>

        {/* Roster Switcher and Action */}
        <div className="flex items-center gap-2">
          {rosters.length > 1 && (
            <div
              className={`flex items-center rounded-[6px] border ${
                isLight ? 'border-slate-300 bg-white shadow-sm' : 'border-[#26262a] bg-[#131315]'
              } p-0.5`}
            >
              {rosters.map((r, idx) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRosterIndex(idx)}
                  className={`px-2.5 py-1 text-[12px] rounded-[4px] transition-colors cursor-pointer ${
                    selectedRosterIndex === idx
                      ? isLight
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'bg-[#1a1a1d] text-[#ededed] font-medium'
                      : isLight
                      ? 'text-slate-500 hover:text-slate-900'
                      : 'text-[#9a9aa2] hover:text-[#ededed]'
                  }`}
                >
                  {r.gameTitle}
                </button>
              ))}
            </div>
          )}

          <button type="button" onClick={() => onNavigate('openings')} className="px-3 py-1.5 rounded-[6px] font-bold text-xs bg-[#e8ff59] hover:bg-[#d8ef49] text-black transition-colors cursor-pointer shadow-xs">+ Post Vacancy</button>

          {roster?.weakestRole && (
            <button
              type="button"
              onClick={() => {
                onSelectRoleToScout(roster.weakestRole!.role);
                onNavigate('recommendations');
              }}
              className={`px-3 py-1.5 rounded-[6px] border ${
                isLight
                  ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-900 shadow-sm'
                  : 'border-[#26262a] bg-[#131315] hover:bg-[#1a1a1d] text-[#ededed]'
              } text-[13px] font-medium transition-colors cursor-pointer`}
            >
              Scout {roster.weakestRole.role}
            </button>
          )}
        </div>
      </div>

      {/* Roster Lineup Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <h2 className={`text-[12px] font-normal ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
            Active lineup configuration
          </h2>
          <span className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} font-mono`}>
            {occupiedSlots} filled · {totalSlots - occupiedSlots} vacant
          </span>
        </div>

        <div
          className={`border ${
            isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-[#26262a] bg-[#131315]'
          } rounded-[6px] overflow-x-auto`}
        >
          <table className="w-full text-left text-[14px] border-collapse">
            <thead
              className={`border-b ${
                isLight
                  ? 'border-slate-200 bg-slate-50 text-slate-500'
                  : 'border-[#26262a] text-[#9a9aa2]'
              } text-[12px] font-normal`}
            >
              <tr>
                <th className="py-2.5 px-3 w-16 font-normal">Slot</th>
                <th className="py-2.5 px-3 font-normal">Player</th>
                <th className="py-2.5 px-3 font-normal">Assigned role</th>
                <th className="py-2.5 px-3 text-right font-normal">Rating</th>
                <th className="py-2.5 px-3 text-right font-normal">ADR</th>
                <th className="py-2.5 px-3 text-right font-normal">K/D</th>
                <th className="py-2.5 px-3 text-right font-normal">Matches</th>
                <th className="py-2.5 px-3 text-right font-normal">Trajectory</th>
                <th className="py-2.5 px-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roster?.slots.map(slot => {
                const player = slot.player;
                const isVacant = !player;
                const initials = player ? player.handle.slice(0, 2).toUpperCase() : '--';

                return (
                  <tr
                    key={slot.slotNumber}
                    className={`border-b ${
                      isLight
                        ? 'border-slate-100 hover:bg-slate-50'
                        : 'border-[#26262a] hover:bg-[#1a1a1d]'
                    } last:border-b-0 transition-colors duration-[120ms]`}
                  >
                    {/* Slot number */}
                    <td
                      className={`py-3 px-3 text-[13px] font-mono ${
                        isLight ? 'text-slate-500' : 'text-[#9a9aa2]'
                      }`}
                    >
                      Slot {slot.slotNumber}
                    </td>

                    {/* Player */}
                    <td className="py-3 px-3">
                      {isVacant ? (
                        <div
                          className={`text-[13px] ${
                            isLight ? 'text-slate-400' : 'text-[#9a9aa2]'
                          } italic`}
                        >
                          Vacant position
                        </div>
                      ) : (
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
                            <div
                              className={`font-bold ${
                                isLight ? 'text-slate-900' : 'text-[#ededed]'
                              }`}
                            >
                              {formatPlayerName(player.handle)}
                            </div>
                            <div
                              className={`text-[12px] ${
                                isLight ? 'text-slate-500' : 'text-[#9a9aa2]'
                              } mt-0.5`}
                            >
                              {player.realName} · {player.region} · {player.tier}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Assigned role */}
                    <td
                      className={`py-3 px-3 ${
                        isLight ? 'text-slate-600' : 'text-[#9a9aa2]'
                      }`}
                    >
                      {slot.assignedRole}
                    </td>

                    {/* Rating */}
                    <td
                      className={`py-3 px-3 text-right font-mono tabular-nums font-semibold ${
                        isLight ? 'text-emerald-600' : 'text-[#e8ff59]'
                      }`}
                    >
                      {player ? player.stats.rating.toFixed(2) : '—'}
                    </td>

                    {/* ADR */}
                    <td
                      className={`py-3 px-3 text-right font-mono tabular-nums ${
                        isLight ? 'text-slate-800' : 'text-[#ededed]'
                      }`}
                    >
                      {player ? player.stats.adr.toFixed(1) : '—'}
                    </td>

                    {/* K/D */}
                    <td
                      className={`py-3 px-3 text-right font-mono tabular-nums ${
                        isLight ? 'text-slate-800' : 'text-[#ededed]'
                      }`}
                    >
                      {player ? player.stats.kdRatio.toFixed(2) : '—'}
                    </td>

                    {/* Matches */}
                    <td
                      className={`py-3 px-3 text-right font-mono tabular-nums ${
                        isLight ? 'text-slate-800' : 'text-[#ededed]'
                      }`}
                    >
                      {player ? player.matchesPlayed : '—'}
                    </td>

                    {/* Trajectory */}
                    <td
                      className={`py-3 px-3 text-right font-mono tabular-nums ${
                        player
                          ? player.improvementTrend >= 0
                            ? isLight
                              ? 'text-emerald-600'
                              : 'text-[#4ade80]'
                            : 'text-red-500'
                          : isLight
                          ? 'text-slate-400'
                          : 'text-[#9a9aa2]'
                      }`}
                    >
                      {player
                        ? `${player.improvementTrend >= 0 ? '+' : ''}${(player.improvementTrend * 100).toFixed(0)}%`
                        : '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      {isVacant ? (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectRoleToScout(slot.assignedRole);
                            onNavigate('recommendations');
                          }}
                          className={`text-[13px] ${
                            isLight
                              ? 'text-slate-900 hover:text-slate-700'
                              : 'text-[#ededed]'
                          } hover:underline cursor-pointer bg-transparent border-0 p-0 font-medium`}
                        >
                          Scout candidate
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectRoleToScout(slot.assignedRole);
                            onNavigate('recommendations');
                          }}
                          className={`text-[13px] ${
                            isLight
                              ? 'text-slate-500 hover:text-slate-900'
                              : 'text-[#9a9aa2] hover:text-[#ededed]'
                          } hover:underline cursor-pointer bg-transparent border-0 p-0`}
                        >
                          Find replacement
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
