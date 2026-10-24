'use client';

import React, { useState } from 'react';
import {
  User,
  Shield,
  Lock,
  ArrowRight,
  Sparkles,
  Gamepad2,
  Building2,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Trophy,
  Users,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { authApi } from '@/lib/api/auth';

export type UserRole = 'player' | 'organiser';

interface RoleLoginViewProps {
  onLogin: (role: UserRole, token?: string, user?: any) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  initialRole?: UserRole;
}

export function RoleLoginView({
  onLogin,
  theme = 'dark',
  onToggleTheme,
  initialRole = 'organiser',
}: RoleLoginViewProps) {
  const isLight = theme === 'light';
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [identifier, setIdentifier] = useState(
    initialRole === 'player' ? 'player@scoutforge.gg' : 'analyst@cloud9.gg'
  );
  const [password, setPassword] = useState(
    initialRole === 'player' ? 'player123' : 'scoutforge123'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'player') {
      setIdentifier('player@scoutforge.gg');
      setPassword('player123');
    } else {
      setIdentifier('analyst@cloud9.gg');
      setPassword('scoutforge123');
    }
  };

  const doLogin = async (email: string, pass: string, role: UserRole) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authApi.login(email, pass);
      localStorage.setItem('scoutforge_access_token', res.access_token);
      localStorage.setItem('scoutforge_user', JSON.stringify(res.user));
      localStorage.setItem('scoutforge_auth_role', res.user.active_context);
      localStorage.setItem(
        'scoutforge_available_contexts',
        JSON.stringify(res.user.available_contexts)
      );
      onLogin(res.user.active_context as UserRole, res.access_token, res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin(identifier, password, selectedRole);
  };

  const handleQuickLogin = (role: UserRole) => {
    const demoEmail = role === 'player' ? 'player@scoutforge.gg' : 'analyst@cloud9.gg';
    const demoPass = role === 'player' ? 'player123' : 'scoutforge123';
    doLogin(demoEmail, demoPass, role);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between select-none transition-colors duration-200 ${
        isLight
          ? 'bg-[#f8fafc] text-slate-900'
          : 'bg-[#0b0b0c] text-[#ededed]'
      }`}
    >
      {/* Top Navbar */}
      <header
        className={`w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b ${
          isLight ? 'border-slate-200' : 'border-[#26262a]'
        }`}
      >
        <div className="flex items-center gap-3">
          <Logo size="md" theme={theme} />
          <span
            className={`hidden sm:inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] border ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-[#131315] border-[#26262a] text-[#9a9aa2]'
            }`}
          >
            ROLE-BASED AUTHENTICATION
          </span>
        </div>

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] border text-xs font-medium transition-colors cursor-pointer ${
              isLight
                ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
                : 'border-[#26262a] bg-[#131315] hover:bg-[#18181b] text-[#ededed]'
            }`}
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light Mode</span>
              </>
            )}
          </button>
        )}
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg space-y-6">
          {/* Role Selection Switcher */}
          <div
            className={`p-1 rounded-[8px] border flex gap-1 ${
              isLight
                ? 'bg-slate-200/80 border-slate-300'
                : 'bg-[#131315] border-[#26262a]'
            }`}
          >
            {/* User / Player Option */}
            <button
              type="button"
              onClick={() => handleRoleChange('player')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-[6px] text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'player'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                    : 'bg-[#0b0b0c] text-[#e8ff59] border border-[#e8ff59]/50 shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-[#9a9aa2] hover:text-[#ededed]'
              }`}
            >
              <Gamepad2 className="w-4 h-4 shrink-0" />
              <span>Login as User (Player)</span>
            </button>

            {/* Organiser Option */}
            <button
              type="button"
              onClick={() => handleRoleChange('organiser')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-[6px] text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'organiser'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                    : 'bg-[#0b0b0c] text-[#e8ff59] border border-[#e8ff59]/50 shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-[#9a9aa2] hover:text-[#ededed]'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Login as Organiser (Scout)</span>
            </button>
          </div>

          {/* Form Card */}
          <div
            className={`rounded-[8px] border p-7 sm:p-8 relative overflow-hidden transition-colors ${
              isLight
                ? 'bg-white border-slate-200 shadow-md'
                : 'bg-[#131315] border-[#26262a] text-[#ededed]'
            }`}
          >
            {/* Role Header */}
            <div className="text-center mb-6">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-mono font-bold border mb-2.5 ${
                  selectedRole === 'player'
                    ? isLight
                      ? 'bg-lime-50 text-lime-900 border-lime-300'
                      : 'bg-[#0b0b0c] text-[#e8ff59] border-[#e8ff59]/40'
                    : isLight
                    ? 'bg-blue-50 text-blue-900 border-blue-300'
                    : 'bg-[#0b0b0c] text-[#e8ff59] border-[#e8ff59]/40'
                }`}
              >
                {selectedRole === 'player' ? (
                  <>
                    <Gamepad2 className="w-3.5 h-3.5" />
                    GAMER & TALENT PORTAL
                  </>
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5" />
                    ESPORTS ORG & MANAGEMENT
                  </>
                )}
              </span>

              <h1 className="text-xl font-black tracking-tight">
                {selectedRole === 'player'
                  ? 'Sign in as Competitive Player'
                  : 'Sign in as Esports Organiser'}
              </h1>

              <p
                className={`text-xs mt-1.5 ${
                  isLight ? 'text-slate-500' : 'text-[#9a9aa2]'
                }`}
              >
                {selectedRole === 'player'
                  ? 'Access your verified FitScore dossier, trajectory analytics, and apply to roster trials.'
                  : 'Manage 5-slot tactical rosters, evaluate candidate leaderboards, and process audio telemetry.'}
              </p>
            </div>

            {/* Quick 1-Click Demo Login Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => handleQuickLogin(selectedRole)}
                disabled={loading}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-[6px] border transition-all cursor-pointer group ${
                  isLight
                    ? 'bg-slate-900 hover:bg-black text-white border-slate-900 shadow-sm'
                    : 'bg-[#0b0b0c] hover:bg-[#18181b] text-[#ededed] border-[#26262a] hover:border-[#e8ff59]/50'
                }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-[4px] font-mono font-black flex items-center justify-center text-xs shrink-0 bg-[#e8ff59] text-black">
                    {selectedRole === 'player' ? 'P' : 'O'}
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>
                        {selectedRole === 'player'
                          ? "1-Click Sign In: Sam 'Vortex'"
                          : "1-Click Sign In: The Shadow GM"}
                      </span>
                      <span className="text-[10px] text-[#e8ff59] font-mono font-normal">
                        (Demo)
                      </span>
                    </div>
                    <div
                      className={`text-[11px] ${
                        isLight ? 'text-slate-300' : 'text-[#9a9aa2]'
                      }`}
                    >
                      {selectedRole === 'player'
                        ? 'Assaulter / IGL • BGMI & Valorant'
                        : 'Pro Roster Organization • 5 Rosters'}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#e8ff59] transition-transform group-hover:translate-x-1 shrink-0" />
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-5">
              <div
                className={`absolute inset-0 flex items-center ${
                  isLight ? 'border-slate-200' : 'border-[#26262a]'
                }`}
              >
                <div
                  className={`w-full border-t ${
                    isLight ? 'border-slate-200' : 'border-[#26262a]'
                  }`}
                />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                <span
                  className={`px-2 ${
                    isLight
                      ? 'bg-white text-slate-400'
                      : 'bg-[#131315] text-[#9a9aa2]'
                  }`}
                >
                  or sign in with credentials
                </span>
              </div>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-2.5 rounded-[6px] border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono">
                  {errorMessage}
                </div>
              )}
              {/* Identifier Input */}
              <div className="space-y-1.5">
                <label
                  className={`block text-xs font-bold ${
                    isLight ? 'text-slate-700' : 'text-[#ededed]'
                  }`}
                >
                  {selectedRole === 'player'
                    ? 'In-Game Tag / Riot ID / Character ID'
                    : 'Organization Email / Staff ID'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User
                      className={`w-4 h-4 ${
                        isLight ? 'text-slate-400' : 'text-[#9a9aa2]'
                      }`}
                    />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder={
                      selectedRole === 'player'
                        ? 'e.g., Vortex#VAL or 5128940192'
                        : 'e.g., scout@theshadow.gg'
                    }
                    className={`w-full pl-9 pr-3 py-2 rounded-[6px] text-xs font-mono font-medium border focus:outline-none transition-colors ${
                      isLight
                        ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900 focus:bg-white'
                        : 'border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]'
                    }`}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label
                  className={`block text-xs font-bold ${
                    isLight ? 'text-slate-700' : 'text-[#ededed]'
                  }`}
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock
                      className={`w-4 h-4 ${
                        isLight ? 'text-slate-400' : 'text-[#9a9aa2]'
                      }`}
                    />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className={`w-full pl-9 pr-10 py-2 rounded-[6px] text-xs font-mono font-medium border focus:outline-none transition-colors ${
                      isLight
                        ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900 focus:bg-white'
                        : 'border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#9a9aa2] hover:text-[#ededed] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded-[3px] accent-[#c6ff00]"
                  />
                  <span
                    className={isLight ? 'text-slate-600' : 'text-[#9a9aa2]'}
                  >
                    Remember active role
                  </span>
                </label>
                <span
                  className={`text-[11px] font-mono ${
                    isLight ? 'text-slate-400' : 'text-[#9a9aa2]'
                  }`}
                >
                  SSL 256-Bit Encrypted
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-[6px] font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer bg-[#e8ff59] hover:bg-[#d4eb44] text-black shadow-sm"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>
                      {selectedRole === 'player'
                        ? 'Enter Player Dashboard'
                        : 'Enter Organiser Platform'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`py-4 text-center text-[11px] font-mono border-t ${
          isLight
            ? 'border-slate-200 text-slate-500'
            : 'border-[#26262a] text-[#9a9aa2]'
        }`}
      >
        ScoutForge Intelligence Systems • Dual-Role Esports Platform
      </footer>
    </div>
  );
}
