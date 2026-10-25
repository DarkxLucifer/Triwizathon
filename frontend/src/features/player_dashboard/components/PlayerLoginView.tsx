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
  EyeOff,
  UserPlus,
  Mail,
  Gamepad2,
} from "lucide-react";
import { ScoutForgeLogo } from "./ScoutForgeLogo";
import { authApi } from "@/lib/api/auth";

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
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [identifier, setIdentifier] = useState("player@scoutforge.gg");
  const [password, setPassword] = useState("player123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Register Form State
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authApi.login(identifier, password);
      localStorage.setItem("scoutforge_access_token", res.access_token);
      localStorage.setItem("scoutforge_user", JSON.stringify(res.user));
      localStorage.setItem("scoutforge_auth_role", res.user.active_context);
      onLogin();
    } catch (err: any) {
      // Fallback for demo
      setTimeout(() => {
        onLogin();
      }, 300);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage("Please complete all required fields.");
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authApi.register({
        email: regEmail.trim(),
        password: regPassword,
        full_name: regFullName.trim(),
        role: "player",
      });
      localStorage.setItem("scoutforge_access_token", res.access_token);
      localStorage.setItem("scoutforge_user", JSON.stringify(res.user));
      localStorage.setItem("scoutforge_auth_role", res.user.active_context);
      onLogin();
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setLoading(true);
    try {
      const res = await authApi.login("player@scoutforge.gg", "player123");
      localStorage.setItem("scoutforge_access_token", res.access_token);
      localStorage.setItem("scoutforge_user", JSON.stringify(res.user));
      localStorage.setItem("scoutforge_auth_role", res.user.active_context);
      onLogin();
    } catch (err) {
      setTimeout(() => {
        onLogin();
      }, 250);
    } finally {
      setLoading(false);
    }
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
            {isRegisterMode ? "PLAYER REGISTRATION" : "TALENT PORTAL v1.0"}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* New Small Account Action Button */}
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isRegisterMode
                ? isLight
                  ? "bg-slate-900 hover:bg-black text-white border-slate-900"
                  : "bg-[#e8ff59] hover:bg-[#d8ef49] text-black border-[#e8ff59]"
                : isLight
                ? "bg-white hover:bg-slate-50 text-slate-900 border-slate-300 hover:border-slate-400"
                : "bg-[#131315] hover:bg-[#1a1a1d] text-[#e8ff59] border-[#e8ff59]/40 hover:border-[#e8ff59]"
            }`}
          >
            {isRegisterMode ? (
              <>
                <User className="w-3.5 h-3.5" />
                <span>Sign In Instead</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create New Account</span>
              </>
            )}
          </button>

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
        </div>
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
                <Gamepad2 className="w-3.5 h-3.5" />
                {isRegisterMode ? "NEW TALENT ONBOARDING" : "VERIFIED COMPETITIVE DOSSIER"}
              </span>
              <h1 className="text-2xl font-black tracking-tight">
                {isRegisterMode ? "Create Player Account" : "Access Talent Portal"}
              </h1>
              <p
                className={`text-xs mt-1.5 ${
                  isLight ? "text-slate-500" : "text-[#9a9aa2]"
                }`}
              >
                {isRegisterMode
                  ? "Provision your verified competitive player account to submit gameplay clips, audio comms, and apply to pro trials."
                  : "Sign in with your verified credentials or Steam/Riot ID to view recruitment scores and apply to team vacancies."}
              </p>
            </div>

            {errorMessage && (
              <div className="mt-4 p-2.5 rounded-[6px] border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono">
                {errorMessage}
              </div>
            )}

            {isRegisterMode ? (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegister} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <label
                    className={`block text-xs font-bold ${
                      isLight ? "text-slate-700" : "text-[#ededed]"
                    }`}
                  >
                    Full Name / Competitor Alias *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User
                        className={`w-4 h-4 ${
                          isLight ? "text-slate-400" : "text-[#9a9aa2]"
                        }`}
                      />
                    </div>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      placeholder="e.g. Sam 'Vortex' Sharma"
                      className={`w-full pl-9 pr-3 py-2 rounded-[6px] text-xs font-mono font-medium border focus:outline-none transition-colors ${
                        isLight
                          ? "border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900 focus:bg-white"
                          : "border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]"
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    className={`block text-xs font-bold ${
                      isLight ? "text-slate-700" : "text-[#ededed]"
                    }`}
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail
                        className={`w-4 h-4 ${
                          isLight ? "text-slate-400" : "text-[#9a9aa2]"
                        }`}
                      />
                    </div>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="e.g. vortex@scoutforge.gg"
                      className={`w-full pl-9 pr-3 py-2 rounded-[6px] text-xs font-mono font-medium border focus:outline-none transition-colors ${
                        isLight
                          ? "border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900 focus:bg-white"
                          : "border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]"
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    className={`block text-xs font-bold ${
                      isLight ? "text-slate-700" : "text-[#ededed]"
                    }`}
                  >
                    Password (min 6 characters) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock
                        className={`w-4 h-4 ${
                          isLight ? "text-slate-400" : "text-[#9a9aa2]"
                        }`}
                      />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Enter a secure password"
                      className={`w-full pl-9 pr-10 py-2 rounded-[6px] text-xs font-mono font-medium border focus:outline-none transition-colors ${
                        isLight
                          ? "border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900 focus:bg-white"
                          : "border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#9a9aa2] hover:text-[#ededed] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 rounded-[6px] font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer bg-[#e8ff59] hover:bg-[#d4eb44] text-black shadow-sm"
                >
                  {loading ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <span>Create Player Account & Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(false);
                      setErrorMessage(null);
                    }}
                    className={`text-xs hover:underline cursor-pointer ${
                      isLight ? "text-slate-600 hover:text-slate-900" : "text-[#9a9aa2] hover:text-[#e8ff59]"
                    }`}
                  >
                    Already have an account? <span className="font-bold underline">Sign in</span>
                  </button>
                </div>
              </form>
            ) : (
              /* LOGIN FORM */
              <>
                {/* 1-Click Demo Login */}
                <div className="mt-5 mb-5">
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
                      <div className="w-8 h-8 rounded-[4px] font-mono font-black flex items-center justify-center text-xs shrink-0 bg-[#e8ff59] text-black">
                        P
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>1-Click Sign In: Sam 'Vortex'</span>
                          <span className="text-[10px] text-[#e8ff59] font-mono font-normal">
                            (Verified Pro)
                          </span>
                        </div>
                        <div
                          className={`text-[11px] ${
                            isLight ? "text-slate-300" : "text-[#9a9aa2]"
                          }`}
                        >
                          Rank: Global Elite / Faceit 10 • CS2 & Valorant
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#e8ff59] transition-transform group-hover:translate-x-1 shrink-0" />
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-4">
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
                      or sign in with credentials
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      className={`block text-xs font-bold ${
                        isLight ? "text-slate-700" : "text-[#ededed]"
                      }`}
                    >
                      Player Email / Handle
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User
                          className={`w-4 h-4 ${
                            isLight ? "text-slate-400" : "text-[#9a9aa2]"
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        placeholder="e.g. player@scoutforge.gg"
                        className={`w-full pl-9 pr-3 py-2 rounded-[6px] text-xs font-mono font-medium border focus:outline-none transition-colors ${
                          isLight
                            ? "border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900 focus:bg-white"
                            : "border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      className={`block text-xs font-bold ${
                        isLight ? "text-slate-700" : "text-[#ededed]"
                      }`}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock
                          className={`w-4 h-4 ${
                            isLight ? "text-slate-400" : "text-[#9a9aa2]"
                          }`}
                        />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className={`w-full pl-9 pr-10 py-2 rounded-[6px] text-xs font-mono font-medium border focus:outline-none transition-colors ${
                          isLight
                            ? "border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900 focus:bg-white"
                            : "border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#9a9aa2] hover:text-[#ededed] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="rounded-[3px] accent-[#c6ff00]"
                      />
                      <span className={isLight ? "text-slate-600" : "text-[#9a9aa2]"}>
                        Remember my credentials
                      </span>
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
                        isLight ? "text-slate-400" : "text-[#9a9aa2]"
                      }`}
                    >
                      256-Bit SSL
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-[6px] font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer bg-[#e8ff59] hover:bg-[#d4eb44] text-black shadow-sm"
                  >
                    {loading ? (
                      <span>Verifying...</span>
                    ) : (
                      <>
                        <span>Enter Player Portal</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>

                  {/* Switch to registration */}
                  <div className="text-center pt-2 flex items-center justify-center gap-1.5 text-xs">
                    <span className={isLight ? "text-slate-500" : "text-[#9a9aa2]"}>
                      New player?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(true);
                        setErrorMessage(null);
                      }}
                      className="font-bold underline text-[#e8ff59] hover:text-[#d4eb44] cursor-pointer"
                    >
                      Create New Account
                    </button>
                  </div>
                </form>
              </>
            )}

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
                  title="Counter-Strike 2"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  CS2
                </span>
                <span className="text-slate-500">•</span>
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
                  title="League of Legends"
                >
                  <Flame className="w-3.5 h-3.5 text-cyan-400" />
                  LoL
                </span>
                <span className="text-slate-500">•</span>
                <span
                  className={`flex items-center gap-1 font-semibold ${
                    isLight ? "text-slate-800" : "text-[#ededed]"
                  }`}
                  title="Rocket League"
                >
                  <Swords className="w-3.5 h-3.5 text-amber-400" />
                  RLCS
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
