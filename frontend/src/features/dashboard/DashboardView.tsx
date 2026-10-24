'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (screen: string) => void;
  onSelectRoleToScout?: (role: string) => void;
  theme?: 'dark' | 'light';
}

export function formatPlayerName(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function DashboardView({
  onNavigate,
  onSelectRoleToScout,
}: DashboardViewProps) {
  const candidates = [
    {
      id: 'p-gem-vortex',
      handle: 'Riven',
      realName: 'Dmitry Morozov',
      team: 'Vortex Rising',
      region: 'CIS',
      role: 'Entry',
      game: 'CS2',
      matchScore: 92,
      buyout: 45000,
    },
    {
      id: 'p-broky',
      handle: 'Kairo',
      realName: 'Helvijs Saukants',
      team: 'Apex Esports',
      region: 'EU',
      role: 'AWPer',
      game: 'CS2',
      matchScore: 88,
      buyout: 500000,
    },
    {
      id: 'p-rookie',
      handle: 'Nexon',
      realName: 'Kevin Zhang',
      team: 'Nexus Gaming',
      region: 'Americas',
      role: 'IGL',
      game: 'CS2',
      matchScore: 85,
      buyout: 30000,
    },
  ];

  const activityData = [
    { date: 'Oct 1', profiles: 58 },
    { date: 'Oct 7', profiles: 72 },
    { date: 'Oct 14', profiles: 68 },
    { date: 'Oct 21', profiles: 96 },
    { date: 'Oct 28', profiles: 118 },
  ];

  const rosters = [
    { id: 'cs2', name: 'CS2 Main Lineup', game: 'CS2', filled: 4, total: 5, status: 'Open slot' },
    { id: 'val', name: 'VCT Champions Roster', game: 'Valorant', filled: 5, total: 5, status: 'Complete' },
    { id: 'bgmi', name: 'Battlegrounds Squad', game: 'BGMI', filled: 5, total: 5, status: 'Complete' },
  ];

  return (
    <div className="bg-[#0b0b0c] text-[#ededed] p-6 -m-6 min-h-[calc(100vh-3.5rem)] space-y-6 font-sans text-[14px]">
      {/* 1. Greeting Header */}
      <div className="border-b border-[#26262a] pb-4">
        <h1 className="text-[20px] font-bold text-[#ededed] tracking-normal">
          Good afternoon, Alex.
        </h1>
        <p className="text-[12px] text-[#9a9aa2] mt-0.5">
          Active rosters, candidates, and scouting pipeline.
        </p>
      </div>

      {/* 2. ONE horizontal row for 4 stat metrics: big number, small muted label, tiny +/- delta in plain text. No borders, no icons. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-2 border-b border-[#26262a]">
        <div>
          <div className="text-[28px] font-bold font-mono tabular-nums text-[#ededed] leading-none">
            128
          </div>
          <div className="text-[12px] text-[#9a9aa2] mt-1.5">Active candidates</div>
          <div className="text-[11px] text-[#4ade80] font-mono mt-0.5">+12% this week</div>
        </div>

        <div>
          <div className="text-[28px] font-bold font-mono tabular-nums text-[#ededed] leading-none">
            4
          </div>
          <div className="text-[12px] text-[#9a9aa2] mt-1.5">Scouting briefs</div>
          <div className="text-[11px] text-[#9a9aa2] font-mono mt-0.5">+1 pending</div>
        </div>

        <div>
          <div className="text-[28px] font-bold font-mono tabular-nums text-[#ededed] leading-none">
            3
          </div>
          <div className="text-[12px] text-[#9a9aa2] mt-1.5">Active rosters</div>
          <div className="text-[11px] text-[#9a9aa2] mt-0.5">CS2, Valorant, BGMI</div>
        </div>

        <div>
          <div className="text-[28px] font-bold font-mono tabular-nums text-[#ededed] leading-none">
            16
          </div>
          <div className="text-[12px] text-[#9a9aa2] mt-1.5">Evaluations logged</div>
          <div className="text-[11px] text-[#4ade80] font-mono mt-0.5">+28% this month</div>
        </div>
      </div>

      {/* 3. Main Sections separated by 1px borders and whitespace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Top Recommended Candidates (compact 3-row table) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#26262a]">
            <div>
              <h2 className="text-[14px] font-bold text-[#ededed]">
                Top recommended candidates
              </h2>
              <p className="text-[12px] text-[#9a9aa2] mt-0.5">
                Match score (based on roster needs)
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('recruitment')}
              className="text-[12px] text-[#9a9aa2] hover:text-[#ededed] cursor-pointer"
            >
              View all
            </button>
          </div>

          {/* Compact 3-Row Table: Player, Role, Game, Match score, Est. buyout, "View" text link */}
          <div className="border border-[#26262a] rounded-[6px] bg-[#131315] overflow-x-auto">
            <table className="w-full text-left text-[14px] border-collapse">
              <thead>
                <tr className="border-b border-[#26262a] text-[12px] font-normal text-[#9a9aa2]">
                  <th className="py-2.5 px-3 font-normal">Player</th>
                  <th className="py-2.5 px-3 font-normal">Role</th>
                  <th className="py-2.5 px-3 font-normal">Game</th>
                  <th className="py-2.5 px-3 text-right font-normal">Match score</th>
                  <th className="py-2.5 px-3 text-right font-normal">Est. buyout</th>
                  <th className="py-2.5 px-3 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(candidate => (
                  <tr
                    key={candidate.id}
                    className="border-b border-[#26262a] last:border-b-0 transition-colors duration-[120ms] hover:bg-[#1a1a1d]"
                  >
                    {/* Player: handle bold, real name + team + region in muted below */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#ededed]">
                        {candidate.handle}
                      </div>
                      <div className="text-[12px] text-[#9a9aa2] mt-0.5">
                        {candidate.realName} · {candidate.team} · {candidate.region}
                      </div>
                    </td>

                    {/* Role: plain muted text, NO colored pills */}
                    <td className="py-3 px-3 text-[#9a9aa2]">
                      {candidate.role}
                    </td>

                    {/* Game: plain muted text */}
                    <td className="py-3 px-3 text-[#9a9aa2]">
                      {candidate.game}
                    </td>

                    {/* Match score: lime text only, monospace, no background */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-[#e8ff59]">
                      {candidate.matchScore}
                    </td>

                    {/* Est. buyout: normal text color */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#ededed]">
                      ${candidate.buyout.toLocaleString()}
                    </td>

                    {/* View text link */}
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onNavigate('discover')}
                        className="text-[13px] text-[#9a9aa2] hover:text-[#ededed] hover:underline cursor-pointer bg-transparent border-0 p-0"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Rosters and Activity separated by 1px borders */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Rosters Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#26262a]">
              <h2 className="text-[14px] font-bold text-[#ededed]">
                Team rosters
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('rosters')}
                className="text-[12px] text-[#9a9aa2] hover:text-[#ededed] cursor-pointer"
              >
                Manage
              </button>
            </div>

            <div className="border border-[#26262a] rounded-[6px] bg-[#131315] divide-y divide-[#26262a]">
              {rosters.map(r => (
                <div
                  key={r.id}
                  onClick={() => onNavigate('rosters')}
                  className="p-3 flex items-center justify-between transition-colors duration-[120ms] hover:bg-[#1a1a1d] cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-[#ededed] text-[13px]">
                      {r.name}
                    </div>
                    <div className="text-[12px] text-[#9a9aa2] mt-0.5">
                      {r.filled} / {r.total} players · {r.game}
                    </div>
                  </div>
                  <span className="text-[12px] text-[#9a9aa2] font-mono">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Trajectory */}
          <div className="space-y-3">
            <div className="pb-2 border-b border-[#26262a]">
              <h2 className="text-[14px] font-bold text-[#ededed]">
                Profiles reviewed (30d)
              </h2>
            </div>

            <div className="border border-[#26262a] rounded-[6px] bg-[#131315] p-3">
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData}>
                    <XAxis
                      dataKey="date"
                      stroke="#9a9aa2"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#26262a' }}
                    />
                    <YAxis
                      stroke="#9a9aa2"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={24}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#131315',
                        borderColor: '#26262a',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#ededed',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profiles"
                      stroke="#ededed"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
