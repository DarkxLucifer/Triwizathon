'use client';

import React from 'react';
import {
  Home,
  Trophy,
  Search,
  Users,
  FileText,
  BarChart2,
  Settings,
  Shield,
  Gamepad2,
  LogOut,
  ArrowLeftRight,
} from 'lucide-react';

export type UserRole = 'player' | 'organiser';

export type SidebarNavId =
  | 'dashboard'
  | 'leaderboards'
  | 'discover'
  | 'rosters'
  | 'recruitment'
  | 'analytics'
  | 'player_portal'
  | 'settings'
  | 'ingestion'
  | 'tests';

interface SidebarProps {
  activeNav: SidebarNavId;
  onSelectNav: (id: SidebarNavId) => void;
  orgName?: string;
  theme?: 'dark' | 'light';
  authRole?: UserRole;
  onSwitchRole?: (role: UserRole) => void;
  onLogout?: () => void;
}

export function Sidebar({
  activeNav,
  onSelectNav,
  orgName = 'The Shadow',
  theme = 'dark',
  authRole = 'organiser',
  onSwitchRole,
  onLogout,
}: SidebarProps) {
  const isLight = theme === 'light';

  // Role-specific navigation items
  const mainNavItems =
    authRole === 'player'
      ? [
          { id: 'player_portal' as SidebarNavId, label: 'My Player Portal', icon: Gamepad2 },
          { id: 'leaderboards' as SidebarNavId, label: 'Leaderboards', icon: Trophy },
          { id: 'discover' as SidebarNavId, label: 'Discover players', icon: Search },
        ]
      : [
          { id: 'dashboard' as SidebarNavId, label: 'Dashboard', icon: Home },
          { id: 'leaderboards' as SidebarNavId, label: 'Leaderboards', icon: Trophy },
          { id: 'discover' as SidebarNavId, label: 'Discover players', icon: Search },
          { id: 'rosters' as SidebarNavId, label: 'Rosters', icon: Users },
          { id: 'recruitment' as SidebarNavId, label: 'Recruitment', icon: FileText },
          { id: 'analytics' as SidebarNavId, label: 'Analytics', icon: BarChart2 },
        ];

  return (
    <aside
      className={`w-56 p-3 flex flex-col justify-between shrink-0 select-none transition-colors duration-200 border-r ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
      }`}
    >
      <div className="space-y-4">
        {/* User / Organization Identity Card */}
        <div
          className={`flex items-center gap-2.5 p-2 rounded-[6px] border ${
            isLight
              ? 'bg-slate-50 border-slate-200'
              : 'bg-[#131315] border-[#26262a]'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-[4px] border flex items-center justify-center shrink-0 ${
              authRole === 'player'
                ? isLight
                  ? 'bg-lime-100 border-lime-300 text-lime-900'
                  : 'bg-[#0b0b0c] border-[#e8ff59]/40 text-[#e8ff59]'
                : isLight
                ? 'bg-white border-slate-200 text-slate-700'
                : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
            }`}
          >
            {authRole === 'player' ? (
              <Gamepad2 className="w-3.5 h-3.5" style={{ strokeWidth: 1.5 }} />
            ) : (
              <Shield className="w-3.5 h-3.5" style={{ strokeWidth: 1.5 }} />
            )}
          </div>
          <div className="min-w-0">
            <p
              className={`text-[13px] font-semibold truncate ${
                isLight ? 'text-slate-900' : 'text-[#ededed]'
              }`}
            >
              {authRole === 'player' ? 'Sam "Vortex"' : orgName}
            </p>
            <p
              className={`text-[11px] truncate ${
                isLight ? 'text-slate-500' : 'text-[#9a9aa2]'
              }`}
            >
              {authRole === 'player'
                ? 'Competitive Player'
                : 'Pro roster organization'}
            </p>
          </div>
        </div>

        {/* Primary Navigation Menu */}
        <nav className="space-y-1">
          <div className="px-2 pb-1.5 text-[11px] text-[#9a9aa2] font-normal">
            {authRole === 'player' ? 'Player Portal' : 'Platform'}
          </div>
          {mainNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectNav(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-[13px] font-normal transition-colors duration-[120ms] cursor-pointer text-left ${
                  isActive
                    ? isLight
                      ? 'bg-slate-100 text-slate-900 font-medium'
                      : 'bg-[#131315] text-[#ededed] border-l-2 border-l-[#e8ff59] font-medium'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    : 'text-[#9a9aa2] hover:text-[#ededed] hover:bg-[#131315]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" style={{ strokeWidth: 1.5 }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions: Role Switch, Settings, Logout */}
      <div
        className={`pt-3 border-t space-y-1 ${
          isLight ? 'border-slate-200' : 'border-[#26262a]'
        }`}
      >
        {/* Switch Role Link */}
        {onSwitchRole && (
          <button
            type="button"
            onClick={() => onSwitchRole(authRole === 'player' ? 'organiser' : 'player')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-[12px] font-normal transition-colors cursor-pointer text-left ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                : 'text-[#9a9aa2] hover:text-[#ededed] hover:bg-[#131315]'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 shrink-0 text-[#e8ff59]" />
            <span>Switch to {authRole === 'player' ? 'Organiser' : 'Player'}</span>
          </button>
        )}

        {/* Settings (Organiser only) */}
        {authRole === 'organiser' && (
          <button
            type="button"
            onClick={() => onSelectNav('settings')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-[13px] font-normal transition-colors duration-[120ms] cursor-pointer text-left ${
              activeNav === 'settings'
                ? isLight
                  ? 'bg-slate-100 text-slate-900 font-medium'
                  : 'bg-[#131315] text-[#ededed] border-l-2 border-l-[#e8ff59] font-medium'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                : 'text-[#9a9aa2] hover:text-[#ededed] hover:bg-[#131315]'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" style={{ strokeWidth: 1.5 }} />
            <span>Settings</span>
          </button>
        )}

        {/* Logout */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-[12px] font-normal transition-colors cursor-pointer text-left ${
              isLight
                ? 'text-slate-600 hover:text-red-600 hover:bg-slate-50'
                : 'text-[#9a9aa2] hover:text-red-400 hover:bg-[#131315]'
            }`}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Log Out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
