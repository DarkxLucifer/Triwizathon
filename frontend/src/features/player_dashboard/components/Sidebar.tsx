"use client";

import React from "react";
import { 
  Layout, 
  BarChart2, 
  FileAudio, 
  Eye, 
  User,
  ChevronRight,
  Briefcase,
  Sun,
  Moon,
  LogOut
} from "lucide-react";
import { TabType, PlayerProfile } from "@/types/dashboard";
import { ScoutForgeLogo } from "./ScoutForgeLogo";

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  player: PlayerProfile;
  onProfileClick: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  player,
  onProfileClick,
  theme,
  onToggleTheme,
  onLogout,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Layout className="w-4 h-4" /> },
    { id: "openings", label: "Roster Openings", icon: <Briefcase className="w-4 h-4" /> },
    { id: "benchmark", label: "Role Benchmark", icon: <BarChart2 className="w-4 h-4" /> },
    { id: "evidence", label: "Evidence & Audio", icon: <FileAudio className="w-4 h-4" /> },
    { id: "scouting", label: "Scouting Feed", icon: <Eye className="w-4 h-4" /> },
    { id: "profile", label: "My Profile", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col justify-between border-r border-slate-200/90 bg-white p-4 select-none shadow-[1px_0_3px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col gap-6">
        {/* Top Brand Logo & v1.0 Pill */}
        <div className="flex items-center justify-between px-1 pt-1 pb-1">
          <ScoutForgeLogo size="md" />
          <span className="text-[10px] font-mono font-bold text-slate-800 bg-lime-100 border border-lime-300 px-1.5 py-0.5 rounded">
            v1.0
          </span>
        </div>

        {/* Active Game Ticker Pill */}
        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#bef226] border border-slate-900" />
            <span className="text-slate-500 font-medium">Active Title:</span>
            <span className="text-slate-950 font-extrabold">{player.activeGame}</span>
          </div>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-700">
            {player.role}
          </span>
        </div>

        {/* Navigation Section */}
        <div className="flex flex-col gap-1">
          <div className="px-2 pb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Platform Navigation
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-slate-950 text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <span className={isActive ? "text-[#bef226]" : "text-slate-500"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section: Player Card + Theme & Logout Controls */}
      <div className="flex flex-col gap-2">
        {/* Compact Player Card (Clickable to switch to Profile) */}
        <div 
          onClick={onProfileClick}
          className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/90 hover:border-slate-300 transition-all cursor-pointer group shadow-xs"
          title="View full player profile"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-[#bef226] font-extrabold text-xs border border-slate-800 shrink-0">
              {player.name.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 truncate group-hover:text-black">
                  {player.name} (Player)
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
              </div>
              <span className="text-[10px] text-slate-500 truncate font-medium">
                {player.activeGame} • {player.region}
              </span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />
              <span className="text-slate-700 font-semibold">{player.availabilityStatus}</span>
            </div>
            <span className="text-slate-400 font-mono text-[9px]">ID #8842</span>
          </div>
        </div>

        {/* Theme Toggle & Logout Utility Row */}
        <div className="flex items-center gap-1.5 pt-0.5">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 hover:text-slate-950 transition-all cursor-pointer shadow-2xs"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[11px] font-bold text-rose-700 transition-all cursor-pointer shadow-2xs"
            title="Log out of ScoutForge session"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
