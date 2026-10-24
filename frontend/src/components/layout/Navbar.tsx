'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Logo } from '@/components/ui/Logo';
import {
  Search,
  Gamepad2,
  ChevronDown,
  Sun,
  Moon,
  Users,
  Building2,
  LogOut,
  ArrowLeftRight,
} from 'lucide-react';

export type UserRole = 'player' | 'organiser';

interface NavbarProps {
  selectedGame: string;
  onSelectGame: (game: string) => void;
  onSelectGamer?: (gamerHandle: string) => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  authRole?: UserRole;
  onSwitchRole?: (role: UserRole) => void;
  onLogout?: () => void;
}

interface GamerItem {
  handle: string;
  realName: string;
  team: string;
  role: string;
  game: string;
  score: number;
}

const ALL_GAMERS: GamerItem[] = [
  { handle: 'Jonathan', realName: 'Jonathan Amaral', team: 'Team GodLike', role: 'Entry Fragger', game: 'BGMI', score: 98 },
  { handle: 'SPOWER', realName: 'Rudra B', team: 'Team Soul', role: 'IGL', game: 'BGMI', score: 95 },
  { handle: 'NinjaJOD', realName: 'Shubham Ranjan', team: 'Team XSpark', role: 'Assaulter', game: 'BGMI', score: 93 },
  { handle: 'Mortal', realName: 'Naman Mathur', team: 'Team Soul', role: 'IGL', game: 'BGMI', score: 91 },
  { handle: 'Goblin', realName: 'Harsh Paudwal', team: 'Team GodLike', role: 'Support', game: 'BGMI', score: 89 },
  { handle: 'ShadowOG', realName: 'Arjun Mandhalkar', team: 'Team XSpark', role: 'Sniper', game: 'BGMI', score: 88 },
  { handle: 'Riven', realName: 'Elena Rostova', team: 'Radiant', role: 'IGL', game: 'Valorant', score: 92 },
  { handle: 'Kairo', realName: 'Kai Vance', team: 'Apex Core', role: 'AWPer', game: 'CS2', score: 88 },
  { handle: 'Nexon', realName: 'Marcus Chen', team: 'Sentinels', role: 'Initiator', game: 'Valorant', score: 85 },
  { handle: 'siuhy', realName: 'Kamil Szkaradek', team: 'MOUZ', role: 'IGL', game: 'CS2', score: 93 },
  { handle: 'Aleksib', realName: 'Aleksi Virolainen', team: 'NAVI', role: 'IGL', game: 'CS2', score: 89 },
  { handle: 'TenZ', realName: 'Tyson Ngo', team: 'Sentinels', role: 'Flex', game: 'Valorant', score: 96 },
  { handle: 'ZywOo', realName: 'Mathieu Herbaut', team: 'Team Vitality', role: 'Sniper', game: 'CS2', score: 98 },
];

const GAMES_LIST = [
  { id: 'All Games', label: 'All games (unified)' },
  { id: 'BGMI', label: 'BGMI' },
  { id: 'Valorant', label: 'Valorant' },
  { id: 'CS2', label: 'Counter-Strike 2' },
  { id: 'Apex Legends', label: 'Apex Legends' },
  { id: 'Fortnite', label: 'Fortnite' },
];

export function Navbar({
  selectedGame,
  onSelectGame,
  onSelectGamer,
  searchTerm = '',
  onSearchChange,
  theme = 'dark',
  onToggleTheme,
  authRole = 'organiser',
  onSwitchRole,
  onLogout,
}: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'gamers' | 'games'>('gamers');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredGamers = ALL_GAMERS.filter(g => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      g.handle.toLowerCase().includes(q) ||
      g.realName.toLowerCase().includes(q) ||
      g.team.toLowerCase().includes(q) ||
      g.role.toLowerCase().includes(q) ||
      g.game.toLowerCase().includes(q);
    const matchesGame = selectedGame === 'All Games' || g.game === selectedGame;
    return matchesSearch && matchesGame;
  });

  return (
    <header
      className={`h-14 px-4 sticky top-0 z-40 flex items-center justify-between border-b select-none transition-colors duration-200 ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
      }`}
    >
      <div className="flex items-center justify-between gap-6 w-full max-w-[1440px] mx-auto">
        {/* Left: Brand Logo */}
        <div className="flex items-center shrink-0">
          <Logo size="md" theme={theme} />
        </div>

        {/* Center: Search Bar & Gamers / Games Dropdown */}
        <div className="flex-1 max-w-2xl flex items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              className={`w-4 h-4 absolute left-3 top-2.5 ${
                isLight ? 'text-slate-400' : 'text-[#9a9aa2]'
              }`}
              style={{ strokeWidth: 1.5 }}
            />
            <input
              type="text"
              placeholder="Search players, games, roles, or regions..."
              value={searchTerm}
              onChange={e => onSearchChange && onSearchChange(e.target.value)}
              className={`w-full rounded-[6px] pl-9 pr-3 py-1.5 text-[13px] transition-colors focus:outline-none ${
                isLight
                  ? 'bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 placeholder-slate-400 focus:border-slate-400'
                  : 'bg-[#131315] border border-[#26262a] hover:border-[#36363c] text-[#ededed] placeholder-[#9a9aa2] focus:border-[#36363c]'
              }`}
            />
          </div>

          {/* Beside Search Box: List of all gamers / games dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-[13px] transition-colors cursor-pointer border ${
                isDropdownOpen
                  ? isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-900'
                    : 'bg-[#1a1a1d] border-[#36363c] text-[#ededed]'
                  : isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  : 'bg-[#131315] border border-[#26262a] hover:border-[#36363c] text-[#ededed]'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-[#9a9aa2]" style={{ strokeWidth: 1.5 }} />
              <span className="font-normal">{selectedGame === 'All Games' ? 'All gamers' : selectedGame}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-150 text-[#9a9aa2] ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
                style={{ strokeWidth: 1.5 }}
              />
            </button>

            {/* Dropdown Menu (List of All Gamers & Games) */}
            {isDropdownOpen && (
              <div
                className={`absolute right-0 mt-1.5 w-72 sm:w-80 rounded-[6px] border z-50 overflow-hidden ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900 shadow-md'
                    : 'bg-[#131315] border-[#26262a] text-[#ededed]'
                }`}
              >
                {/* Header Switcher: Gamers / Games */}
                <div
                  className={`flex items-center border-b p-1 text-[12px] ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab('gamers')}
                    className={`flex-1 py-1 px-2.5 rounded-[4px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'gamers'
                        ? isLight
                          ? 'bg-white text-slate-900 font-medium border border-slate-200'
                          : 'bg-[#1a1a1d] text-[#ededed] font-medium border border-[#26262a]'
                        : 'text-[#9a9aa2] hover:text-[#ededed]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" style={{ strokeWidth: 1.5 }} />
                    <span>Gamers ({ALL_GAMERS.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('games')}
                    className={`flex-1 py-1 px-2.5 rounded-[4px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'games'
                        ? isLight
                          ? 'bg-white text-slate-900 font-medium border border-slate-200'
                          : 'bg-[#1a1a1d] text-[#ededed] font-medium border border-[#26262a]'
                        : 'text-[#9a9aa2] hover:text-[#ededed]'
                    }`}
                  >
                    <Gamepad2 className="w-3.5 h-3.5" style={{ strokeWidth: 1.5 }} />
                    <span>Games ({GAMES_LIST.length})</span>
                  </button>
                </div>

                {/* Content: Gamers List */}
                {activeTab === 'gamers' && (
                  <div className="max-h-64 overflow-y-auto divide-y divide-[#26262a]">
                    {filteredGamers.map(gamer => {
                      const initials = gamer.handle.slice(0, 2).toUpperCase();

                      return (
                        <div
                          key={gamer.handle}
                          onClick={() => {
                            if (onSelectGamer) onSelectGamer(gamer.handle);
                            setIsDropdownOpen(false);
                          }}
                          className={`p-2.5 flex items-center justify-between transition-colors duration-[120ms] cursor-pointer ${
                            isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1d]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {/* 28px initials avatar in --surface, NO photos */}
                            <div className="w-7 h-7 rounded-[4px] bg-[#131315] border border-[#26262a] flex items-center justify-center text-[11px] font-mono font-bold text-[#ededed] shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="text-[13px] font-bold text-[#ededed]">
                                {gamer.handle}
                              </div>
                              <div className="text-[11px] text-[#9a9aa2]">
                                {gamer.role} · {gamer.team}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            {/* Score is lime TEXT only, monospace, no background */}
                            <span className="font-mono tabular-nums text-[13px] font-semibold text-[#e8ff59]">
                              {gamer.score}
                            </span>
                            <span className="text-[10px] text-[#9a9aa2] block">
                              {gamer.game}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Content: Games List */}
                {activeTab === 'games' && (
                  <div className="max-h-64 overflow-y-auto divide-y divide-[#26262a]">
                    {GAMES_LIST.map(game => (
                      <div
                        key={game.id}
                        onClick={() => {
                          onSelectGame(game.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`p-2.5 flex items-center justify-between transition-colors duration-[120ms] cursor-pointer ${
                          selectedGame === game.id
                            ? isLight
                              ? 'bg-slate-100 font-medium'
                              : 'bg-[#18181b] border-l-2 border-l-[#e8ff59]'
                            : isLight
                            ? 'hover:bg-slate-50'
                            : 'hover:bg-[#1a1a1d]'
                        }`}
                      >
                        <span className="text-[13px]">{game.label}</span>
                        {selectedGame === game.id && (
                          <span className="text-[11px] text-[#e8ff59] font-mono">
                            Active
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Actions: Role Badge, Role Switcher, Logout & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Active Role Badge */}
          <span
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border text-xs font-mono font-bold ${
              authRole === 'player'
                ? isLight
                  ? 'border-lime-400 bg-lime-50 text-lime-900'
                  : 'border-[#e8ff59]/30 bg-[#e8ff59]/10 text-[#e8ff59]'
                : isLight
                ? 'border-blue-300 bg-blue-50 text-blue-900'
                : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
            }`}
          >
            {authRole === 'player' ? (
              <>
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Player: Vortex</span>
              </>
            ) : (
              <>
                <Building2 className="w-3.5 h-3.5" />
                <span>Organiser: The Shadow</span>
              </>
            )}
          </span>

          {/* Quick Switch Role Button */}
          {onSwitchRole && (
            <button
              type="button"
              onClick={() => onSwitchRole(authRole === 'player' ? 'organiser' : 'player')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border text-xs font-medium transition-colors cursor-pointer ${
                isLight
                  ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
                  : 'border-[#26262a] bg-[#131315] hover:bg-[#18181b] text-[#ededed] hover:border-[#e8ff59]/50'
              }`}
              title={`Switch perspective to ${authRole === 'player' ? 'Organiser' : 'Player'}`}
            >
              <ArrowLeftRight className="w-3 h-3 text-[#e8ff59]" />
              <span className="hidden md:inline">
                Switch to {authRole === 'player' ? 'Organiser' : 'Player'}
              </span>
            </button>
          )}

          {/* Theme Toggle */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className={`p-1.5 rounded-[6px] border transition-colors cursor-pointer ${
                isLight
                  ? 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  : 'border-[#26262a] text-[#9a9aa2] hover:text-[#ededed] hover:bg-[#131315]'
              }`}
              title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
              aria-label="Toggle theme"
            >
              {isLight ? (
                <Moon className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
              ) : (
                <Sun className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
              )}
            </button>
          )}

          {/* Logout Button */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className={`p-1.5 rounded-[6px] border text-xs transition-colors cursor-pointer ${
                isLight
                  ? 'border-slate-200 text-slate-600 hover:text-red-600 hover:bg-slate-50'
                  : 'border-[#26262a] text-[#9a9aa2] hover:text-red-400 hover:bg-[#131315]'
              }`}
              title="Log out of session"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
