'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';
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
  theme = 'dark',
}: DashboardViewProps) {
  const isLight = theme === 'light';

  const [candidates, setCandidates] = useState([
    {
      id: '146',
      handle: 'Vortex',
      realName: 'Sam Sharma',
      team: 'Free Agent',
      region: 'India & APAC',
      role: 'Entry / IGL',
      game: 'CS2',
      matchScore: 92,
      buyout: 45000,
    },
    {
      id: '116',
      handle: 's1mple',
      realName: 'Oleksandr Kostyliev',
      team: 'Natus Vincere',
      region: 'EU',
      role: 'AWPer',
      game: 'CS2',
      matchScore: 96,
      buyout: 750000,
    },
    {
      id: '126',
      handle: 'NiKo',
      realName: 'Nikola Kovac',
      team: 'G2 Esports',
      region: 'EU',
      role: 'Entry',
      game: 'CS2',
      matchScore: 94,
      buyout: 650000,
    },
  ]);

  const [activityData, setActivityData] = useState([
    { date: 'Oct 1', profiles: 18 },
    { date: 'Oct 7', profiles: 24 },
    { date: 'Oct 14', profiles: 35 },
    { date: 'Oct 21', profiles: 48 },
    { date: 'Oct 24', profiles: 62 },
  ]);

  const [kpis, setKpis] = useState({
    active_candidates: 147,
    scouting_briefs: 2,
    active_rosters: 2,
    evaluations_logged: 3,
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const token = localStorage.getItem('scoutforge_access_token') || undefined;
        
        // 1. Live KPIs
        const kpiRes = await apiFetch<{
          active_candidates: number;
          scouting_briefs: number;
          active_rosters: number;
          evaluations_logged: number;
        }>('/org/dashboard/kpis', { token });
        if (kpiRes) setKpis(kpiRes);

        // 2. Live Chart up to today
        const chartRes = await apiFetch<{ date: string; profiles: number }[]>('/org/dashboard/chart', { token });
        if (chartRes && chartRes.length > 0) setActivityData(chartRes);

        // 3. Live real top candidates
        const playerRes = await apiFetch<{ items: any[] }>('/players?limit=3', { token });
        if (playerRes?.items && playerRes.items.length > 0) {
          setCandidates(playerRes.items.map(p => ({
            id: String(p.id),
            handle: p.handle,
            realName: p.name,
            team: p.team_name || 'Free Agent',
            region: p.region,
            role: p.role,
            game: 'CS2',
            matchScore: Math.round((p.confidence || 0.85) * 100),
            buyout: p.tier === 'Tier 1' ? 350000 : 45000,
          })));
        }
      } catch (err) {
        console.warn('Dashboard live API notice:', err);
      }
    }
    loadDashboardData();
  }, []);

  const rosters = [
    { id: 'cs2', name: 'CS2 Main Lineup', game: 'CS2', filled: 4, total: 5, status: 'Open slot' },
    { id: 'val', name: 'VCT Champions Roster', game: 'Valorant', filled: 5, total: 5, status: 'Complete' },
    { id: 'bgmi', name: 'Battlegrounds Squad', game: 'BGMI', filled: 5, total: 5, status: 'Complete' },
  ];

  return (
    <div
      className={`${
        isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#0b0b0c] text-[#ededed]'
      } p-6 -m-6 min-h-[calc(100vh-3.5rem)] space-y-6 font-sans text-[14px] transition-colors`}
    >
      {/* 1. Greeting Header */}
      <div className={`border-b ${isLight ? 'border-slate-200' : 'border-[#26262a]'} pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h1
            className={`text-[20px] font-bold ${
              isLight ? 'text-slate-900' : 'text-[#ededed]'
            } tracking-normal`}
          >
            Good afternoon, Alex.
          </h1>
          <p className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} mt-0.5`}>
            Active rosters, candidates, and scouting pipeline.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('openings')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] font-bold text-xs bg-[#e8ff59] hover:bg-[#d8ef49] text-black transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <span>+ Post Trial Vacancy</span>
        </button>
      </div>

      {/* 2. ONE horizontal row for 4 stat metrics */}
      <div
        className={`grid grid-cols-2 md:grid-cols-4 gap-6 py-2 border-b ${
          isLight ? 'border-slate-200' : 'border-[#26262a]'
        }`}
      >
        <div>
          <div
            className={`text-[28px] font-bold font-mono tabular-nums ${
              isLight ? 'text-slate-900' : 'text-[#ededed]'
            } leading-none`}
          >
            {kpis.active_candidates}
          </div>
          <div className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} mt-1.5`}>
            Active candidates
          </div>
          <div
            className={`text-[11px] ${
              isLight ? 'text-emerald-600' : 'text-[#4ade80]'
            } font-mono mt-0.5`}
          >
            +12% this week
          </div>
        </div>

        <div>
          <div
            className={`text-[28px] font-bold font-mono tabular-nums ${
              isLight ? 'text-slate-900' : 'text-[#ededed]'
            } leading-none`}
          >
            {kpis.scouting_briefs}
          </div>
          <div className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} mt-1.5`}>
            Scouting briefs
          </div>
          <div
            className={`text-[11px] ${
              isLight ? 'text-slate-500' : 'text-[#9a9aa2]'
            } font-mono mt-0.5`}
          >
            +1 pending
          </div>
        </div>

        <div>
          <div
            className={`text-[28px] font-bold font-mono tabular-nums ${
              isLight ? 'text-slate-900' : 'text-[#ededed]'
            } leading-none`}
          >
            {kpis.active_rosters}
          </div>
          <div className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} mt-1.5`}>
            Active rosters
          </div>
          <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} mt-0.5`}>
            CS2, Valorant, BGMI
          </div>
        </div>

        <div>
          <div
            className={`text-[28px] font-bold font-mono tabular-nums ${
              isLight ? 'text-slate-900' : 'text-[#ededed]'
            } leading-none`}
          >
            {kpis.evaluations_logged}
          </div>
          <div className={`text-[12px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'} mt-1.5`}>
            Evaluations logged
          </div>
          <div
            className={`text-[11px] ${
              isLight ? 'text-emerald-600' : 'text-[#4ade80]'
            } font-mono mt-0.5`}
          >
            +28% this month
          </div>
        </div>
      </div>

      {/* 3. Main Sections separated by 1px borders and whitespace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Top Recommended Candidates */}
        <div className="lg:col-span-8 space-y-4">
          <div
            className={`flex items-center justify-between pb-2 border-b ${
              isLight ? 'border-slate-200' : 'border-[#26262a]'
            }`}
          >
            <div>
              <h2
                className={`text-[14px] font-bold ${
                  isLight ? 'text-slate-900' : 'text-[#ededed]'
                }`}
              >
                Top recommended candidates
              </h2>
              <p
                className={`text-[12px] ${
                  isLight ? 'text-slate-500' : 'text-[#9a9aa2]'
                } mt-0.5`}
              >
                Match score (based on roster needs)
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('recruitment')}
              className={`text-[12px] ${
                isLight ? 'text-slate-500 hover:text-slate-900' : 'text-[#9a9aa2] hover:text-[#ededed]'
              } cursor-pointer`}
            >
              View all
            </button>
          </div>

          {/* Compact 3-Row Table */}
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
                    className={`border-b ${
                      isLight
                        ? 'border-slate-100 hover:bg-slate-50'
                        : 'border-[#26262a] hover:bg-[#1a1a1d]'
                    } last:border-b-0 transition-colors duration-[120ms]`}
                  >
                    <td className="py-3 px-3">
                      <div
                        className={`font-bold ${
                          isLight ? 'text-slate-900' : 'text-[#ededed]'
                        }`}
                      >
                        {candidate.handle}
                      </div>
                      <div
                        className={`text-[12px] ${
                          isLight ? 'text-slate-500' : 'text-[#9a9aa2]'
                        } mt-0.5`}
                      >
                        {candidate.realName} · {candidate.team} · {candidate.region}
                      </div>
                    </td>

                    <td
                      className={`py-3 px-3 ${
                        isLight ? 'text-slate-600' : 'text-[#9a9aa2]'
                      }`}
                    >
                      {candidate.role}
                    </td>

                    <td
                      className={`py-3 px-3 ${
                        isLight ? 'text-slate-600' : 'text-[#9a9aa2]'
                      }`}
                    >
                      {candidate.game}
                    </td>

                    <td
                      className={`py-3 px-3 text-right font-mono tabular-nums font-semibold ${
                        isLight ? 'text-emerald-600' : 'text-[#e8ff59]'
                      }`}
                    >
                      {candidate.matchScore}
                    </td>

                    <td
                      className={`py-3 px-3 text-right font-mono tabular-nums ${
                        isLight ? 'text-slate-900' : 'text-[#ededed]'
                      }`}
                    >
                      ${candidate.buyout.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onNavigate('discover')}
                        className={`text-[13px] ${
                          isLight
                            ? 'text-slate-500 hover:text-slate-900'
                            : 'text-[#9a9aa2] hover:text-[#ededed]'
                        } hover:underline cursor-pointer bg-transparent border-0 p-0`}
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

        {/* Right Column (4 cols): Rosters and Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Rosters Summary */}
          <div className="space-y-3">
            <div
              className={`flex items-center justify-between pb-2 border-b ${
                isLight ? 'border-slate-200' : 'border-[#26262a]'
              }`}
            >
              <h2
                className={`text-[14px] font-bold ${
                  isLight ? 'text-slate-900' : 'text-[#ededed]'
                }`}
              >
                Team rosters
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('rosters')}
                className={`text-[12px] ${
                  isLight ? 'text-slate-500 hover:text-slate-900' : 'text-[#9a9aa2] hover:text-[#ededed]'
                } cursor-pointer`}
              >
                Manage
              </button>
            </div>

            <div
              className={`border ${
                isLight
                  ? 'border-slate-200 bg-white divide-slate-100 shadow-sm'
                  : 'border-[#26262a] bg-[#131315] divide-[#26262a]'
              } rounded-[6px] divide-y`}
            >
              {rosters.map(r => (
                <div
                  key={r.id}
                  onClick={() => onNavigate('rosters')}
                  className={`p-3 flex items-center justify-between transition-colors duration-[120ms] ${
                    isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1d]'
                  } cursor-pointer`}
                >
                  <div>
                    <div
                      className={`font-semibold ${
                        isLight ? 'text-slate-900' : 'text-[#ededed]'
                      } text-[13px]`}
                    >
                      {r.name}
                    </div>
                    <div
                      className={`text-[12px] ${
                        isLight ? 'text-slate-500' : 'text-[#9a9aa2]'
                      } mt-0.5`}
                    >
                      {r.filled} / {r.total} players · {r.game}
                    </div>
                  </div>
                  <span
                    className={`text-[12px] ${
                      isLight ? 'text-slate-500' : 'text-[#9a9aa2]'
                    } font-mono`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Trajectory */}
          <div className="space-y-3">
            <div
              className={`pb-2 border-b ${
                isLight ? 'border-slate-200' : 'border-[#26262a]'
              }`}
            >
              <h2
                className={`text-[14px] font-bold ${
                  isLight ? 'text-slate-900' : 'text-[#ededed]'
                }`}
              >
                Profiles reviewed (30d)
              </h2>
            </div>

            <div
              className={`border ${
                isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-[#26262a] bg-[#131315]'
              } rounded-[6px] p-3`}
            >
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData}>
                    <XAxis
                      dataKey="date"
                      stroke={isLight ? '#64748b' : '#9a9aa2'}
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: isLight ? '#cbd5e1' : '#26262a' }}
                    />
                    <YAxis
                      stroke={isLight ? '#64748b' : '#9a9aa2'}
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={24}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isLight ? '#ffffff' : '#131315',
                        borderColor: isLight ? '#cbd5e1' : '#26262a',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: isLight ? '#0f172a' : '#ededed',
                        boxShadow: isLight
                          ? '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          : undefined,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profiles"
                      stroke={isLight ? '#0f172a' : '#ededed'}
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
