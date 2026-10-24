"use client";

import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Copy, 
  Check, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Crosshair, 
  Zap, 
  Award, 
  Server, 
  Edit3,
  MessageSquare,
  Gamepad2,
  Flame,
  Shield,
  Swords,
  LogOut
} from "lucide-react";
import { PlayerProfile, GameType } from "@/types/dashboard";

interface PlayerProfileTabProps {
  player: PlayerProfile;
  onEditClick: () => void;
  onSelectGame?: (game: GameType) => void;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
  onLogout?: () => void;
  theme?: "dark" | "light";
}

const gameIcons: Record<GameType, React.ReactNode> = {
  "Valorant": <Crosshair className="w-4 h-4 text-rose-500" />,
  "BGMI": <Shield className="w-4 h-4 text-amber-500" />,
  "Free Fire": <Flame className="w-4 h-4 text-orange-500" />,
  "Mobile Legends": <Swords className="w-4 h-4 text-blue-500" />,
  "CS2": <Zap className="w-4 h-4 text-emerald-500" />,
};

export const PlayerProfileTab: React.FC<PlayerProfileTabProps> = ({
  player,
  onEditClick,
  onSelectGame,
  onShowToast,
  onLogout,
  theme = "dark",
}) => {
  const isLight = theme === "light";
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(label);
    onShowToast(`${label} copied to clipboard!`, "success");
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Top Identity & Contact Card */}
      <div
        className={`rounded-[6px] border p-6 shadow-xs relative overflow-hidden transition-colors ${
          isLight
            ? "border-slate-200 bg-white"
            : "border-[#26262a] bg-[#131315]"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left side: Avatar, Name & Status */}
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`relative w-16 h-16 rounded-[6px] border-2 flex items-center justify-center text-2xl font-black shrink-0 shadow-sm ${
                isLight
                  ? "bg-slate-950 border-[#bef226] text-[#bef226]"
                  : "bg-[#0b0b0c] border-[#e8ff59] text-[#e8ff59]"
              }`}
            >
              {player.name.charAt(0)}
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ring-2 ${
                  isLight
                    ? "bg-[#bef226] ring-white"
                    : "bg-[#e8ff59] ring-[#131315]"
                }`}
              >
                <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className={`text-xl font-black tracking-tight ${
                    isLight ? "text-slate-950" : "text-[#ededed]"
                  }`}
                >
                  {player.fullName}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    isLight
                      ? "bg-lime-100 text-lime-900 border-lime-300"
                      : "bg-[#e8ff59]/10 text-[#e8ff59] border-[#e8ff59]/30"
                  }`}
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Verified Player
                </span>
                <span
                  className={`text-xs font-mono font-medium ${
                    isLight ? "text-slate-400" : "text-[#9a9aa2]"
                  }`}
                >
                  ID: #{player.playerId}
                </span>
              </div>

              <div
                className={`flex flex-wrap items-center gap-2.5 mt-1.5 text-xs ${
                  isLight ? "text-slate-500" : "text-[#9a9aa2]"
                }`}
              >
                <span
                  className={`font-bold ${
                    isLight ? "text-slate-900" : "text-[#ededed]"
                  }`}
                >
                  {player.title}
                </span>
                <span className={isLight ? "text-slate-300" : "text-[#26262a]"}>•</span>
                <span
                  className={`inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded ${
                    isLight
                      ? "bg-slate-100 text-slate-900"
                      : "bg-[#0b0b0c] text-[#ededed] border border-[#26262a]"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {player.availabilityStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Center (Direct Contact Details for Scouts/Coaches) */}
          <div
            className={`flex-1 max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-[6px] border ${
              isLight
                ? "border-slate-200 bg-slate-50"
                : "border-[#26262a] bg-[#0b0b0c]"
            }`}
          >
            {/* Email */}
            <div className="flex items-center justify-between gap-2 group">
              <div className="flex items-center gap-2 min-w-0">
                <Mail
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isLight ? "text-slate-600" : "text-[#9a9aa2]"
                  }`}
                />
                <span
                  className={`text-xs font-mono truncate font-semibold ${
                    isLight ? "text-slate-800" : "text-[#ededed]"
                  }`}
                  title={player.email}
                >
                  {player.email}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(player.email, "Email")}
                className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
                  isLight
                    ? "text-slate-400 hover:text-slate-900"
                    : "text-[#9a9aa2] hover:text-[#ededed]"
                }`}
                title="Copy Email"
              >
                {copiedField === "Email" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between gap-2 group">
              <div className="flex items-center gap-2 min-w-0">
                <Phone
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isLight ? "text-slate-600" : "text-[#9a9aa2]"
                  }`}
                />
                <span
                  className={`text-xs font-mono truncate font-semibold ${
                    isLight ? "text-slate-800" : "text-[#ededed]"
                  }`}
                  title={player.phone}
                >
                  {player.phone}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(player.phone, "Phone")}
                className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
                  isLight
                    ? "text-slate-400 hover:text-slate-900"
                    : "text-[#9a9aa2] hover:text-[#ededed]"
                }`}
                title="Copy Phone"
              >
                {copiedField === "Phone" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Discord & FACEIT */}
            <div
              className={`flex items-center gap-2 text-xs min-w-0 ${
                isLight ? "text-slate-600" : "text-[#9a9aa2]"
              }`}
            >
              <MessageSquare
                className={`w-3.5 h-3.5 shrink-0 ${
                  isLight ? "text-slate-500" : "text-[#9a9aa2]"
                }`}
              />
              <span className="truncate">
                <strong
                  className={`font-bold ${
                    isLight ? "text-slate-950" : "text-[#ededed]"
                  }`}
                >
                  {player.discord}
                </strong>{" "}
                • {player.faceitElo}
              </span>
            </div>

            {/* Location & Languages */}
            <div
              className={`flex items-center gap-2 text-xs min-w-0 ${
                isLight ? "text-slate-600" : "text-[#9a9aa2]"
              }`}
            >
              <MapPin
                className={`w-3.5 h-3.5 shrink-0 ${
                  isLight ? "text-slate-500" : "text-[#9a9aa2]"
                }`}
              />
              <span className="truncate">
                {player.location} •{" "}
                <span
                  className={`font-medium ${
                    isLight ? "text-slate-800" : "text-[#ededed]"
                  }`}
                >
                  {player.languages}
                </span>
              </span>
            </div>
          </div>

          {/* Right side: Edit Profile Details button */}
          <div className="shrink-0">
            <button
              onClick={onEditClick}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-[6px] border text-xs font-black shadow-xs transition-all cursor-pointer ${
                isLight
                  ? "bg-[#bef226] hover:bg-[#d0ff36] text-slate-950 border-[#a3e614]"
                  : "bg-[#e8ff59] hover:bg-[#d8ef49] text-[#0b0b0c] border-[#e8ff59]"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Edit Profile Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED GAMES ROSTER SECTION */}
      <div
        className={`rounded-[6px] border p-6 shadow-xs ${
          isLight
            ? "border-slate-200 bg-white"
            : "border-[#26262a] bg-[#131315]"
        }`}
      >
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b ${
            isLight ? "border-slate-200" : "border-[#26262a]"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <Gamepad2
                className={`w-4 h-4 ${
                  isLight ? "text-slate-950" : "text-[#ededed]"
                }`}
              />
              <h2
                className={`text-sm font-black tracking-wide ${
                  isLight ? "text-slate-950" : "text-[#ededed]"
                }`}
              >
                COMPETITIVE TITLES & GAME PROFILES
              </h2>
            </div>
            <p
              className={`text-xs mt-0.5 ${
                isLight ? "text-slate-500" : "text-[#9a9aa2]"
              }`}
            >
              Verified competitive ratings across major mobile & desktop esports titles
            </p>
          </div>
          <span
            className={`text-xs font-mono font-bold ${
              isLight ? "text-slate-500" : "text-[#9a9aa2]"
            }`}
          >
            Current Active:{" "}
            <strong
              className={isLight ? "text-slate-950" : "text-[#e8ff59]"}
            >
              {player.activeGame}
            </strong>
          </span>
        </div>

        {/* 5-Game Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3.5 mt-4">
          {player.gamesPlayed.map((gameItem) => {
            const isActive = player.activeGame === gameItem.id;
            return (
              <div
                key={gameItem.id}
                onClick={() => onSelectGame && onSelectGame(gameItem.id)}
                className={`p-4 rounded-[6px] border transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? isLight
                      ? "border-slate-950 bg-slate-950 text-white shadow-md ring-2 ring-[#bef226]"
                      : "border-[#e8ff59] bg-[#18181b] text-[#ededed] shadow-md ring-2 ring-[#e8ff59]/60"
                    : isLight
                    ? "border-slate-200 bg-slate-50 hover:bg-white text-slate-900"
                    : "border-[#26262a] bg-[#0b0b0c] hover:bg-[#18181b] text-[#ededed]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-black">
                      {gameIcons[gameItem.id]}
                      <span>{gameItem.name}</span>
                    </span>
                    {isActive ? (
                      <span
                        className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${
                          isLight
                            ? "bg-[#bef226] text-black"
                            : "bg-[#e8ff59] text-black"
                        }`}
                      >
                        Active
                      </span>
                    ) : (
                      <span
                        className={`text-[9px] font-mono px-1 py-0.5 rounded ${
                          isLight
                            ? "bg-slate-200 text-slate-600"
                            : "bg-[#18181b] text-[#9a9aa2] border border-[#26262a]"
                        }`}
                      >
                        {gameItem.tier}
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-extrabold truncate">
                    {gameItem.rank}
                  </div>
                  <div
                    className={`text-[11px] font-mono mt-0.5 truncate ${
                      isActive
                        ? isLight ? "text-slate-400" : "text-[#9a9aa2]"
                        : isLight ? "text-slate-500" : "text-[#9a9aa2]"
                    }`}
                  >
                    IGN: {gameItem.ign}
                  </div>
                </div>

                <div
                  className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs ${
                    isActive
                      ? isLight ? "border-slate-800" : "border-[#26262a]"
                      : isLight ? "border-slate-200" : "border-[#26262a]"
                  }`}
                >
                  <div>
                    <span
                      className={`text-[10px] block ${
                        isActive
                          ? isLight ? "text-slate-400" : "text-[#9a9aa2]"
                          : isLight ? "text-slate-500" : "text-[#9a9aa2]"
                      }`}
                    >
                      {gameItem.primaryStatLabel}
                    </span>
                    <strong className="font-mono font-black">
                      {gameItem.primaryStatValue}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] block ${
                        isActive
                          ? isLight ? "text-slate-400" : "text-[#9a9aa2]"
                          : isLight ? "text-slate-500" : "text-[#9a9aa2]"
                      }`}
                    >
                      Win Rate
                    </span>
                    <strong className="font-mono font-black">
                      {gameItem.winRate}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Middle Row: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Playtime, Grind & Availability */}
        <div
          className={`rounded-[6px] border p-6 shadow-xs flex flex-col justify-between ${
            isLight
              ? "border-slate-200 bg-white"
              : "border-[#26262a] bg-[#131315]"
          }`}
        >
          <div>
            <div
              className={`flex items-center justify-between pb-3 border-b ${
                isLight ? "border-slate-200" : "border-[#26262a]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock
                  className={`w-4 h-4 ${
                    isLight ? "text-slate-800" : "text-[#ededed]"
                  }`}
                />
                <h2
                  className={`text-sm font-black tracking-wide ${
                    isLight ? "text-slate-950" : "text-[#ededed]"
                  }`}
                >
                  Playtime, Grind & Availability
                </h2>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  isLight
                    ? "text-slate-800 bg-lime-100 border-lime-300"
                    : "text-[#e8ff59] bg-[#e8ff59]/10 border-[#e8ff59]/30"
                }`}
              >
                Tier 2 Verified
              </span>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div
                className={`p-3 rounded-[6px] border ${
                  isLight
                    ? "border-slate-200 bg-slate-50"
                    : "border-[#26262a] bg-[#0b0b0c]"
                }`}
              >
                <div
                  className={`text-[10px] font-mono font-bold ${
                    isLight ? "text-slate-500" : "text-[#9a9aa2]"
                  }`}
                >
                  TOTAL HOURS
                </div>
                <div
                  className={`text-base font-black font-mono mt-0.5 ${
                    isLight ? "text-slate-950" : "text-[#ededed]"
                  }`}
                >
                  {player.totalHours}
                </div>
                <div
                  className={`text-[10px] ${
                    isLight ? "text-slate-400" : "text-[#9a9aa2]"
                  }`}
                >
                  Tracked telemetry
                </div>
              </div>

              <div
                className={`p-3 rounded-[6px] border ${
                  isLight
                    ? "border-slate-200 bg-slate-50"
                    : "border-[#26262a] bg-[#0b0b0c]"
                }`}
              >
                <div
                  className={`text-[10px] font-mono font-bold ${
                    isLight ? "text-slate-500" : "text-[#9a9aa2]"
                  }`}
                >
                  CURRENT GRIND
                </div>
                <div
                  className={`text-base font-black font-mono mt-0.5 ${
                    isLight ? "text-slate-950" : "text-[#ededed]"
                  }`}
                >
                  {player.currentGrind}
                </div>
                <div className="text-[10px] text-emerald-400 font-bold">
                  Last 14 days active
                </div>
              </div>

              <div
                className={`p-3 rounded-[6px] border ${
                  isLight
                    ? "border-slate-200 bg-slate-50"
                    : "border-[#26262a] bg-[#0b0b0c]"
                }`}
              >
                <div
                  className={`text-[10px] font-mono font-bold ${
                    isLight ? "text-slate-500" : "text-[#9a9aa2]"
                  }`}
                >
                  SCRIM WINDOW
                </div>
                <div
                  className={`text-xs font-black font-mono mt-1 ${
                    isLight ? "text-slate-950" : "text-[#ededed]"
                  }`}
                >
                  {player.scrimWindow}
                </div>
                <div
                  className={`text-[10px] font-bold mt-0.5 ${
                    isLight ? "text-slate-600" : "text-[#9a9aa2]"
                  }`}
                >
                  {player.scrimDays}
                </div>
              </div>
            </div>

            {/* Logistics Checklist */}
            <div className="space-y-2.5 mt-2">
              <div
                className={`text-xs font-bold ${
                  isLight ? "text-slate-800" : "text-[#ededed]"
                }`}
              >
                Logistics & Availability Readiness
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  className={`flex items-center gap-2 p-2.5 rounded-[6px] border ${
                    isLight
                      ? "border-slate-200 bg-slate-50"
                      : "border-[#26262a] bg-[#0b0b0c]"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className={isLight ? "text-slate-700" : "text-[#ededed]"}>
                    Bootcamp Ready:{" "}
                    <strong className={isLight ? "text-slate-950" : "text-[#e8ff59]"}>
                      Yes
                    </strong>
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 p-2.5 rounded-[6px] border ${
                    isLight
                      ? "border-slate-200 bg-slate-50"
                      : "border-[#26262a] bg-[#0b0b0c]"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className={isLight ? "text-slate-700" : "text-[#ededed]"}>
                    LAN Ready:{" "}
                    <strong className={isLight ? "text-slate-950" : "text-[#e8ff59]"}>
                      Yes
                    </strong>
                  </span>
                </div>
              </div>

              <div
                className={`flex items-center gap-2 p-2.5 rounded-[6px] border text-xs ${
                  isLight
                    ? "border-slate-200 bg-slate-50"
                    : "border-[#26262a] bg-[#0b0b0c]"
                }`}
              >
                <Server
                  className={`w-4 h-4 shrink-0 ${
                    isLight ? "text-slate-600" : "text-[#9a9aa2]"
                  }`}
                />
                <span className={isLight ? "text-slate-600" : "text-[#9a9aa2]"}>
                  Preferred Servers:{" "}
                  <strong className={isLight ? "text-slate-950" : "text-[#ededed]"}>
                    {player.preferredServers}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Tactical Expertise */}
        <div
          className={`rounded-[6px] border p-6 shadow-xs flex flex-col justify-between ${
            isLight
              ? "border-slate-200 bg-white"
              : "border-[#26262a] bg-[#131315]"
          }`}
        >
          <div>
            <div
              className={`flex items-center justify-between pb-3 border-b ${
                isLight ? "border-slate-200" : "border-[#26262a]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Crosshair
                  className={`w-4 h-4 ${
                    isLight ? "text-slate-800" : "text-[#ededed]"
                  }`}
                />
                <h2
                  className={`text-sm font-black tracking-wide ${
                    isLight ? "text-slate-950" : "text-[#ededed]"
                  }`}
                >
                  Tactical Expertise & Specializations
                </h2>
              </div>
              <span
                className={`text-[10px] font-mono ${
                  isLight ? "text-slate-600" : "text-[#9a9aa2]"
                }`}
              >
                Role Mastery:{" "}
                <strong className={isLight ? "text-slate-950" : "text-[#ededed]"}>
                  {player.primaryMastery}
                </strong>
              </span>
            </div>

            {/* Weapon & Utility Tags */}
            <div className="my-3.5">
              <div
                className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${
                  isLight ? "text-slate-500" : "text-[#9a9aa2]"
                }`}
              >
                Weapon & Tactical Specialization Tags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {player.expertiseTags.map((tag, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-xs font-bold border transition-colors ${
                      isLight
                        ? "bg-slate-100 border-slate-200 text-slate-800"
                        : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                    }`}
                  >
                    <Zap
                      className={`w-3 h-3 ${
                        isLight ? "text-slate-900" : "text-[#e8ff59]"
                      }`}
                    />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Signature Map Pool */}
            <div
              className={`space-y-3 mt-4 pt-3 border-t ${
                isLight ? "border-slate-200" : "border-[#26262a]"
              }`}
            >
              <div
                className={`flex items-center justify-between text-xs font-bold ${
                  isLight ? "text-slate-800" : "text-[#ededed]"
                }`}
              >
                <span>Signature Map Pool & Strategic Comfort</span>
                <span
                  className={`text-[10px] font-mono ${
                    isLight ? "text-slate-500" : "text-[#9a9aa2]"
                  }`}
                >
                  Tournament Scrim Data
                </span>
              </div>

              {player.signatureMaps.map((mapItem, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-extrabold ${
                          isLight ? "text-slate-950" : "text-[#ededed]"
                        }`}
                      >
                        {mapItem.name}
                      </span>
                      <span
                        className={`text-[11px] font-mono ${
                          isLight ? "text-slate-500" : "text-[#9a9aa2]"
                        }`}
                      >
                        ({mapItem.note})
                      </span>
                    </div>
                    <span
                      className={`font-mono font-black ${
                        isLight ? "text-slate-950" : "text-[#ededed]"
                      }`}
                    >
                      {mapItem.winRate}% WR
                    </span>
                  </div>

                  <div
                    className={`w-full h-2 rounded-full border overflow-hidden ${
                      isLight
                        ? "bg-slate-100 border-slate-200"
                        : "bg-[#0b0b0c] border-[#26262a]"
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLight ? "bg-[#bef226]" : "bg-[#e8ff59]"
                      }`}
                      style={{ width: `${mapItem.winRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Past Experience */}
      <div
        className={`rounded-[6px] border p-6 shadow-xs ${
          isLight
            ? "border-slate-200 bg-white"
            : "border-[#26262a] bg-[#131315]"
        }`}
      >
        <div
          className={`flex items-center justify-between pb-3 border-b mb-4 ${
            isLight ? "border-slate-200" : "border-[#26262a]"
          }`}
        >
          <div className="flex items-center gap-2">
            <Award
              className={`w-4 h-4 ${
                isLight ? "text-slate-800" : "text-[#ededed]"
              }`}
            />
            <h2
              className={`text-sm font-black tracking-wide ${
                isLight ? "text-slate-950" : "text-[#ededed]"
              }`}
            >
              Past Experience & Verified Achievements
            </h2>
          </div>
          <span
            className={`text-xs font-mono ${
              isLight ? "text-slate-500" : "text-[#9a9aa2]"
            }`}
          >
            Authenticated Competitive History
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`p-4 rounded-[6px] border flex flex-col justify-between ${
              isLight
                ? "border-slate-200 bg-slate-50"
                : "border-[#26262a] bg-[#0b0b0c]"
            }`}
          >
            <div>
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isLight ? "text-slate-500" : "text-[#9a9aa2]"
                }`}
              >
                Previous Roster
              </span>
              <div
                className={`text-sm font-black mt-1 ${
                  isLight ? "text-slate-950" : "text-[#ededed]"
                }`}
              >
                {player.previousRoster.team}
              </div>
              <div
                className={`text-xs mt-0.5 font-medium ${
                  isLight ? "text-slate-600" : "text-[#9a9aa2]"
                }`}
              >
                Role:{" "}
                <strong className={isLight ? "text-slate-900" : "text-[#ededed]"}>
                  {player.previousRoster.role}
                </strong>
              </div>
            </div>
            <div
              className={`text-[11px] font-mono mt-3 pt-2 border-t ${
                isLight
                  ? "border-slate-200 text-slate-500"
                  : "border-[#26262a] text-[#9a9aa2]"
              }`}
            >
              {player.previousRoster.period}
            </div>
          </div>

          <div
            className={`p-4 rounded-[6px] border flex flex-col justify-between ${
              isLight
                ? "border-slate-200 bg-slate-50"
                : "border-[#26262a] bg-[#0b0b0c]"
            }`}
          >
            <div>
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isLight ? "text-slate-500" : "text-[#9a9aa2]"
                }`}
              >
                Notable Tournament
              </span>
              <div
                className={`text-sm font-black mt-1 ${
                  isLight ? "text-slate-950" : "text-[#ededed]"
                }`}
              >
                {player.notableTournament.name}
              </div>
              <div className="text-xs text-emerald-400 font-bold mt-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {player.notableTournament.finish}
              </div>
            </div>
            <div
              className={`text-[11px] font-mono mt-3 pt-2 border-t ${
                isLight
                  ? "border-slate-200 text-slate-500"
                  : "border-[#26262a] text-[#9a9aa2]"
              }`}
            >
              South Asia Regional Circuit
            </div>
          </div>

          <div
            className={`p-4 rounded-[6px] border flex flex-col justify-between ${
              isLight
                ? "border-slate-200 bg-slate-50"
                : "border-[#26262a] bg-[#0b0b0c]"
            }`}
          >
            <div>
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isLight ? "text-slate-500" : "text-[#9a9aa2]"
                }`}
              >
                Hardware & Audio Verified
              </span>
              <div
                className={`text-xs font-bold mt-1 leading-snug ${
                  isLight ? "text-slate-900" : "text-[#ededed]"
                }`}
              >
                {player.hardwareSetup}
              </div>
              <p
                className={`text-[11px] mt-1 ${
                  isLight ? "text-slate-500" : "text-[#9a9aa2]"
                }`}
              >
                Clean voice profile indexing with verified acoustic isolation.
              </p>
            </div>
            <div
              className={`text-[11px] font-mono font-bold mt-3 pt-2 border-t flex items-center gap-1 ${
                isLight
                  ? "border-slate-200 text-emerald-700"
                  : "border-[#26262a] text-emerald-400"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Whisper-small Consent Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Session Management */}
      <div
        className={`rounded-[6px] border p-6 shadow-xs ${
          isLight
            ? "border-slate-200 bg-white"
            : "border-[#26262a] bg-[#131315]"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4 text-rose-500" />
              <h2
                className={`text-sm font-black tracking-wide ${
                  isLight ? "text-slate-950" : "text-[#ededed]"
                }`}
              >
                PLAYER SESSION & ACCOUNT CONTROLS
              </h2>
            </div>
            <p
              className={`text-xs mt-1 ${
                isLight ? "text-slate-500" : "text-[#9a9aa2]"
              }`}
            >
              Logged in as{" "}
              <strong
                className={isLight ? "text-slate-900" : "text-[#ededed]"}
              >
                {player.fullName}
              </strong>{" "}
              ({player.tag}). Active on {player.activeGame} competitive circuit.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onLogout}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-[6px] border text-xs font-bold shadow-xs transition-all cursor-pointer ${
                isLight
                  ? "border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700"
                  : "border-rose-900/60 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300"
              }`}
              title="Log out of ScoutForge player portal"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500 stroke-[2.5]" />
              <span>Log Out of ScoutForge</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
