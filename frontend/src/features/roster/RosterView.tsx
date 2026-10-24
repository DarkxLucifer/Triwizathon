'use client';

import React, { useState } from 'react';
import { Roster, Role } from '@/types';

interface RosterViewProps {
  rosters: Roster[];
  onSelectRoleToScout: (role: Role) => void;
  onNavigate: (screen: any) => void;
}

export function formatPlayerName(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function RosterView({
  rosters,
  onSelectRoleToScout,
  onNavigate,
}: RosterViewProps) {
  const [selectedRosterIndex, setSelectedRosterIndex] = useState(0);
  const roster = rosters[selectedRosterIndex] || rosters[0];

  const occupiedSlots = roster?.slots.filter(s => s.player !== null).length || 0;
  const totalSlots = roster?.slots.length || 5;

  return (
    <div className="bg-[#0b0b0c] text-[#ededed] p-6 -m-6 min-h-[calc(100vh-3.5rem)] space-y-6 font-sans text-[14px]">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#26262a]">
        <div>
          <h1 className="text-[18px] font-bold text-[#ededed]">
            {roster?.name || 'Roster formation'}
          </h1>
          <p className="text-[12px] text-[#9a9aa2] mt-0.5">
            {roster?.teamName || 'Apex Esports'} · {roster?.gameTitle || 'CS2'} · {occupiedSlots} / {totalSlots} slots filled
          </p>
        </div>

        {/* Roster Switcher and Action */}
        <div className="flex items-center gap-2">
          {rosters.length > 1 && (
            <div className="flex items-center rounded-[6px] border border-[#26262a] bg-[#131315] p-0.5">
              {rosters.map((r, idx) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRosterIndex(idx)}
                  className={`px-2.5 py-1 text-[12px] rounded-[4px] transition-colors cursor-pointer ${
                    selectedRosterIndex === idx
                      ? 'bg-[#1a1a1d] text-[#ededed] font-medium'
                      : 'text-[#9a9aa2] hover:text-[#ededed]'
                  }`}
                >
                  {r.gameTitle}
                </button>
              ))}
            </div>
          )}

          {roster?.weakestRole && (
            <button
              type="button"
              onClick={() => {
                onSelectRoleToScout(roster.weakestRole!.role);
                onNavigate('recommendations');
              }}
              className="px-3 py-1.5 rounded-[6px] border border-[#26262a] bg-[#131315] hover:bg-[#1a1a1d] text-[#ededed] text-[13px] font-medium transition-colors cursor-pointer"
            >
              Scout {roster.weakestRole.role}
            </button>
          )}
        </div>
      </div>

      {/* Roster Lineup Table: Separated by 1px borders and whitespace, NO nested card-in-card boxes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-[12px] font-normal text-[#9a9aa2]">
            Active lineup configuration
          </h2>
          <span className="text-[12px] text-[#9a9aa2] font-mono">
            {occupiedSlots} filled · {totalSlots - occupiedSlots} vacant
          </span>
        </div>

        <div className="border border-[#26262a] rounded-[6px] bg-[#131315] overflow-x-auto">
          <table className="w-full text-left text-[14px] border-collapse">
            <thead className="border-b border-[#26262a] text-[12px] font-normal text-[#9a9aa2]">
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
                    className="border-b border-[#26262a] last:border-b-0 transition-colors duration-[120ms] hover:bg-[#1a1a1d]"
                  >
                    {/* Slot number */}
                    <td className="py-3 px-3 text-[13px] font-mono text-[#9a9aa2]">
                      Slot {slot.slotNumber}
                    </td>

                    {/* Player: 28px initials avatar in --surface, handle bold, real name below */}
                    <td className="py-3 px-3">
                      {isVacant ? (
                        <div className="text-[13px] text-[#9a9aa2] italic">
                          Vacant position
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-[4px] bg-[#131315] border border-[#26262a] flex items-center justify-center text-[11px] font-mono font-bold text-[#ededed] shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-[#ededed]">
                              {formatPlayerName(player.handle)}
                            </div>
                            <div className="text-[12px] text-[#9a9aa2] mt-0.5">
                              {player.realName} · {player.region} · {player.tier}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Assigned role: plain muted text, NO colored pills */}
                    <td className="py-3 px-3 text-[#9a9aa2]">
                      {slot.assignedRole}
                    </td>

                    {/* Rating: lime text only, monospace, no background */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-[#e8ff59]">
                      {player ? player.stats.rating.toFixed(2) : '—'}
                    </td>

                    {/* ADR: right-aligned font-mono */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#ededed]">
                      {player ? player.stats.adr.toFixed(1) : '—'}
                    </td>

                    {/* K/D: right-aligned font-mono */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#ededed]">
                      {player ? player.stats.kdRatio.toFixed(2) : '—'}
                    </td>

                    {/* Matches */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#ededed]">
                      {player ? player.matchesPlayed : '—'}
                    </td>

                    {/* Trajectory */}
                    <td
                      className={`py-3 px-3 text-right font-mono tabular-nums ${
                        player
                          ? player.improvementTrend >= 0
                            ? 'text-[#4ade80]'
                            : 'text-[#f87171]'
                          : 'text-[#9a9aa2]'
                      }`}
                    >
                      {player
                        ? `${player.improvementTrend >= 0 ? '+' : ''}${(player.improvementTrend * 100).toFixed(0)}%`
                        : '—'}
                    </td>

                    {/* Actions: text link */}
                    <td className="py-3 px-3 text-right">
                      {isVacant ? (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectRoleToScout(slot.assignedRole);
                            onNavigate('recommendations');
                          }}
                          className="text-[13px] text-[#ededed] hover:underline cursor-pointer bg-transparent border-0 p-0 font-medium"
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
                          className="text-[13px] text-[#9a9aa2] hover:text-[#ededed] hover:underline cursor-pointer bg-transparent border-0 p-0"
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
