"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Globe,
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown, 
  Check,
  Flame,
  Crosshair,
  Shield,
  Zap,
  Swords,
  Sun,
  Moon,
  LogOut
} from "lucide-react";
import { TabType, PlayerProfile, GameType } from "@/types/dashboard";

interface HeaderProps {
  activeTab: TabType;
  player: PlayerProfile;
  onExportPdf: () => void;
  onUpdateAvailability: () => void;
  onSelectGame: (game: GameType) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onLogout: () => void;
}

const tabLabels: Record<TabType, string> = {
  overview: "Overview",
  openings: "Roster Openings & Trials",
  applied: "Applied Applications",
  players: "Player Directory",
  benchmark: "Role Benchmark",
  evidence: "Evidence & Audio",
  scouting: "Scouting Feed",
  profile: "My Profile",
};

const gameIcons: Record<GameType, React.ReactNode> = {
  "CS2": <Zap className="w-3.5 h-3.5 text-emerald-600" />,
  "Valorant": <Crosshair className="w-3.5 h-3.5 text-rose-500" />,
  "League of Legends": <Swords className="w-3.5 h-3.5 text-cyan-600" />,
  "Rocket League": <Flame className="w-3.5 h-3.5 text-amber-500" />,
  "BGMI": <Shield className="w-3.5 h-3.5 text-amber-600" />,
  "General": <Globe className="w-3.5 h-3.5 text-indigo-400" />,
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  player,
  onExportPdf,
  onUpdateAvailability,
  onSelectGame,
  theme,
  onToggleTheme,
  onLogout,
}) => {
  const [gameMenuOpen, setGameMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setGameMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const games: GameType[] = ["CS2", "Valorant", "League of Legends", "Rocket League", "BGMI"];

  return (
    <header className="h-16 border-b border-slate-200/90 bg-white/95 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Breadcrumb on left */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Player Portal</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#bef226] border border-slate-900" />
          {tabLabels[activeTab]}
        </span>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-3">
        {/* Interactive Game Switcher Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setGameMenuOpen(!gameMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-300 text-xs text-slate-800 font-semibold transition-all cursor-pointer shadow-xs"
            title="Click to switch competitive game"
          >
            {gameIcons[player.activeGame]}
            <span>Game: <strong className="text-slate-950 font-bold">{player.activeGame}</strong></span>
            <span className="text-slate-400 font-normal">({player.role})</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${gameMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Game Selection Menu */}
          {gameMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Select Active Game
              </div>
              <div className="space-y-0.5">
                {games.map((g) => {
                  const isCurrent = player.activeGame === g;
                  return (
                    <button
                      key={g}
                      onClick={() => {
                        onSelectGame(g);
                        setGameMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isCurrent
                          ? "bg-[#bef226]/30 text-slate-950 border border-lime-300"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        {gameIcons[g]}
                        <span>{g}</span>
                      </span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Theme Mode Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 transition-all cursor-pointer shadow-xs"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500 fill-indigo-500" />
          )}
        </button>

        {/* Secondary button: Export Profile PDF */}
        <button
          onClick={onExportPdf}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>Export PDF</span>
        </button>

        {/* Primary button: Update Availability in Electric Lime */}
        <button
          onClick={onUpdateAvailability}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#bef226] hover:bg-[#d0ff36] text-slate-950 border border-[#a3e614] text-xs font-black shadow-xs transition-all cursor-pointer transform active:scale-95"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
          <span>Update Availability</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
          title="Log out of ScoutForge session"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
