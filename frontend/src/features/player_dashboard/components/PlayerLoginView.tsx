"use client";

import React, { useState } from "react";
import { 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Crosshair, 
  Flame, 
  Shield, 
  Swords, 
  Zap, 
  Sun, 
  Moon,
  Sparkles,
  Eye,
  EyeOff
} from "lucide-react";
import { ScoutForgeLogo } from "./ScoutForgeLogo";

interface PlayerLoginViewProps {
  onLogin: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const PlayerLoginView: React.FC<PlayerLoginViewProps> = ({
  onLogin,
  theme,
  onToggleTheme,
}) => {
  const isLight = theme === "light";
  const [identifier, setIdentifier] = useState("Vortex#VAL");
  const [password, setPassword] = useState("scoutforge2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 350);
  };

  const handleQuickLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 250);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between selection:bg-[#bef226]/40 selection:text-slate-950 transition-colors duration-200 ${
        isLight ? "bg-[#f8fafc] text-slate-900" : "bg-[#0b0b0c] text-[#ededed]"
      }`}
    >
      {/* Top Navbar */}
      <header
        className={`w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b ${
          isLight ? "border-slate-200" : "border-[#26262a]"
        }`}
      >
        <div className="flex items-center gap-3">
          <ScoutForgeLogo size="md" />
          <span
            className={`hidden sm:inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] border ${
              isLight
                ? "bg-slate-100 border-slate-300 text-slate-700"
                : "bg-[#131315] border-[#26262a] text-[#9a9aa2]"
            }`}
          >
            TALENT PORTAL v1.0
          </span>
        </div>

        {/* Theme Mode Toggle Button */}
        <button
          onClick={onToggleTheme}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] border text-xs font-bold transition-all cursor-pointer ${
            isLight
              ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-800"
              : "border-[#26262a] bg-[#131315] hover:bg-[#18181b] text-[#ededed]"
          }`}
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
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card Frame */}
          <div
            className={`rounded-[8px] border p-7 sm:p-8 relative overflow-hidden transition-colors ${
              isLight
                ? "bg-white border-slate-200 shadow-md"
                : "bg-[#131315] border-[#26262a] text-[#ededed]"
            }`}
          >
            {/* Badge & Heading */}
            <div className="text-center">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-mono font-bold border mb-3 ${
                  isLight
                    ? "bg-lime-50 text-lime-900 border-lime-300"
                    : "bg-[#0b0b0c] text-[#e8ff59] border-[#e8ff59]/40"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                ESPORTS PLAYER PORTAL
              </span>
              <h1 className="text-2xl font-black tracking-tight">
                Sign In to ScoutForge
              </h1>
              <p
                className={`text-xs mt-1.5 leading-relaxed ${
                  isLight ? "text-slate-500" : "text-[#9a9aa2]"
                }`}
              >
                Access your verified competitive dossier, AI telemetry benchmarks, and organization trial offers.
              </p>
            </div>

            {/* Quick 1-Click Demo Login Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleQuickLogin}
                disabled={loading}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-[6px] border transition-all cursor-pointer group ${
                  isLight
                    ? "bg-slate-900 hover:bg-black text-white border-slate-900 shadow-sm"
                    : "bg-[#0b0b0c] hover:bg-[#18181b] text-[#ededed] border-[#26262a] hover:border-[#e8ff59]/50"
                }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-[4px] bg-[#e8ff59] text-black font-mono font-black flex items-center justify-center text-xs shrink-0">
                    P
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#e8ff59] transition-colors">
                      Quick Login as Sam &quot;Vortex&quot;
                    </div>
                    <div
                      className={`text-[10px] font-mono ${
                        isLight ? "text-slate-400" : "text-[#9a9aa2]"
                      }`}
                    >
                      Duelist • Radiant #412 • ID #8842
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#e8ff59] group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-5">
              <div
                className={`absolute inset-0 flex items-center ${
                  isLight ? "border-slate-200" : "border-[#26262a]"
                }`}
              >
                <div
                  className={`w-full border-t ${
                    isLight ? "border-slate-200" : "border-[#26262a]"
                  }`}
                />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                <span
                  className={`px-2 ${
                    isLight
                      ? "bg-white text-slate-400"
                      : "bg-[#131315] text-[#9a9aa2]"
                  }`}
                >
                  or authenticate with credentials
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Player Tag / Email */}
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 flex items-center gap-1.5 ${
                    isLight ? "text-slate-700" : "text-[#ededed]"
                  }`}
                >
                  <User
                    className={`w-3.5 h-3.5 ${
                      isLight ? "text-slate-500" : "text-[#9a9aa2]"
                    }`}
                  />
                  Player Riot ID / In-Game Tag / Email
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. Vortex#VAL or sam.vortex@gmail.com"
                  className={`w-full px-3.5 py-2.5 rounded-[6px] text-xs font-mono font-medium border focus:outline-none transition-colors ${
                    isLight
                      ? "border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900 focus:bg-white"
                      : "border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]"
                  }`}
                />
              </div>

              {/* Password / Access Key */}
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 flex items-center justify-between ${
                    isLight ? "text-slate-700" : "text-[#ededed]"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Lock
                      className={`w-3.5 h-3.5 ${
                        isLight ? "text-slate-500" : "text-[#9a9aa2]"
                      }`}
                    />
                    Security Key / Player Passcode
                  </span>
                  <span
                    className={`text-[10px] font-normal cursor-pointer ${
                      isLight
                        ? "text-slate-400 hover:text-slate-800"
                        : "text-[#9a9aa2] hover:text-[#ededed]"
                    }`}
                  >
                    Forgot PIN?
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security key"
                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-[6px] text-xs font-mono font-medium border focus:outline-none transition-colors ${
                      isLight
                        ? "border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900 focus:bg-white"
                        : "border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 cursor-pointer ${
                      isLight
                        ? "text-slate-400 hover:text-slate-700"
                        : "text-[#9a9aa2] hover:text-[#ededed]"
                    }`}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label
                  className={`flex items-center gap-2 cursor-pointer text-xs font-medium ${
                    isLight ? "text-slate-600" : "text-[#9a9aa2]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-black border-[#26262a] accent-[#e8ff59] focus:ring-0 focus:outline-none cursor-pointer"
                  />
                  <span>Remember this gaming rig</span>
                </label>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[6px] bg-[#e8ff59] hover:bg-[#d4eb44] text-black text-xs font-extrabold shadow-sm transition-all cursor-pointer transform active:scale-95 disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Authenticating Session...
                  </span>
                ) : (
                  <>
                    <span>Enter Player Portal</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Supported Titles Bar */}
            <div
              className={`mt-6 pt-5 border-t ${
                isLight ? "border-slate-200" : "border-[#26262a]"
              }`}
            >
              <div
                className={`text-[10px] font-mono uppercase font-bold text-center mb-2.5 ${
                  isLight ? "text-slate-400" : "text-[#9a9aa2]"
                }`}
              >
                Supported Competitive Ecosystems
              </div>
              <div
                className={`flex items-center justify-center gap-3 text-xs ${
                  isLight ? "text-slate-600" : "text-[#9a9aa2]"
                }`}
              >
                <span
                  className={`flex items-center gap-1 font-semibold ${
                    isLight ? "text-slate-800" : "text-[#ededed]"
                  }`}
                  title="Valorant"
                >
                  <Crosshair className="w-3.5 h-3.5 text-rose-500" />
                  VAL
                </span>
                <span className="text-slate-500">•</span>
                <span
                  className={`flex items-center gap-1 font-semibold ${
                    isLight ? "text-slate-800" : "text-[#ededed]"
                  }`}
                  title="BGMI"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  BGMI
                </span>
                <span className="text-slate-500">•</span>
                <span
                  className={`flex items-center gap-1 font-semibold ${
                    isLight ? "text-slate-800" : "text-[#ededed]"
                  }`}
                  title="Free Fire"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  FF
                </span>
                <span className="text-slate-500">•</span>
                <span
                  className={`flex items-center gap-1 font-semibold ${
                    isLight ? "text-slate-800" : "text-[#ededed]"
                  }`}
                  title="Mobile Legends"
                >
                  <Swords className="w-3.5 h-3.5 text-blue-400" />
                  MLBB
                </span>
                <span className="text-slate-500">•</span>
                <span
                  className={`flex items-center gap-1 font-semibold ${
                    isLight ? "text-slate-800" : "text-[#ededed]"
                  }`}
                  title="CS2"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  CS2
                </span>
              </div>
            </div>
          </div>

          {/* Security & Verification Footer */}
          <div
            className={`mt-4 flex items-center justify-center gap-2 text-[11px] text-center ${
              isLight ? "text-slate-500" : "text-[#9a9aa2]"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>256-Bit Encrypted Audio & Telemetry Pipeline • ScoutForge Protocol</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`w-full max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2 border-t ${
          isLight
            ? "border-slate-200 text-slate-400"
            : "border-[#26262a] text-[#9a9aa2]"
        }`}
      >
        <div>© 2026 ScoutForge Intelligence. Tier-1 Esports Scouting Architecture.</div>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-200 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-200 cursor-pointer">Telemetry Consent</span>
          <span className="hover:text-slate-200 cursor-pointer">Support</span>
        </div>
      </footer>
    </div>
  );
};
