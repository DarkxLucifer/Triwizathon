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
  UserPlus,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { authApi } from '@/lib/api/auth';
import { GameAuthorityModal, GameAuthorityType } from './GameAuthorityModal';

export type UserRole = 'player' | 'organiser';

interface RoleLoginViewProps {
  onLogin: (role: UserRole, token?: string, user?: any) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  initialRole?: UserRole;
  initialRegisterMode?: boolean;
  onBack?: () => void;
}

export function RoleLoginView({
  onLogin,
  theme = 'dark',
  onToggleTheme,
  initialRole = 'organiser',
  initialRegisterMode = false,
  onBack,
}: RoleLoginViewProps) {
  const isLight = theme === 'light';
  const [isRegisterMode, setIsRegisterMode] = useState(initialRegisterMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [identifier, setIdentifier] = useState(
    initialRole === 'player' ? 'player@scoutforge.gg' : 'analyst@cloud9.gg'
  );
  const [password, setPassword] = useState(
    initialRole === 'player' ? 'player123' : 'scoutforge123'
  );

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOrgName, setRegOrgName] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Game Authority Mock Authentication State
  const [authorityModalOpen, setAuthorityModalOpen] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState<GameAuthorityType>('steam');

  const handleOpenAuthorityModal = (authType: GameAuthorityType) => {
    setSelectedAuthority(authType);
    setAuthorityModalOpen(true);
  };

  const handleAuthorizeWithAuthority = async (authType: GameAuthorityType) => {
    // Authenticate with verified competitive gaming account
    if (selectedRole === 'player') {
      await doLogin('player@scoutforge.gg', 'player123', 'player');
    } else {
      await doLogin('analyst@cloud9.gg', 'scoutforge123', 'organiser');
    }
    setAuthorityModalOpen(false);
  };

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

  const doRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail.trim() || !regPassword.trim() || !regFullName.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authApi.register({
        email: regEmail.trim(),
        password: regPassword,
        full_name: regFullName.trim(),
        role: selectedRole,
        org_name: selectedRole === 'organiser' ? (regOrgName.trim() || undefined) : undefined,
      });

      localStorage.setItem('scoutforge_access_token', res.access_token);
      localStorage.setItem('scoutforge_user', JSON.stringify(res.user));
      localStorage.setItem('scoutforge_auth_role', res.user.active_context);
      localStorage.setItem(
        'scoutforge_available_contexts',
        JSON.stringify(res.user.available_contexts)
      );
      onLogin(res.user.active_context as UserRole, res.access_token, res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. A user with this email may already exist.');
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
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-[6px] border text-xs font-semibold transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-[#131315] hover:bg-[#1f1f23] text-[#ededed] border-[#26262a] hover:border-[#e8ff59]'
              }`}
            >
              ← Back to Home
            </button>
          )}
          <span
            className={`hidden sm:inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] border ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-[#131315] border-[#26262a] text-[#9a9aa2]'
            }`}
          >
            {isRegisterMode ? 'USER ONBOARDING & REGISTRATION' : 'ROLE-BASED AUTHENTICATION'}
          </span>
        </div>

        {/* Right Header Actions */}
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
                  ? 'bg-slate-900 hover:bg-black text-white border-slate-900'
                  : 'bg-[#e8ff59] hover:bg-[#d8ef49] text-black border-[#e8ff59]'
                : isLight
                ? 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 hover:border-slate-400'
                : 'bg-[#131315] hover:bg-[#1a1a1d] text-[#e8ff59] border-[#e8ff59]/40 hover:border-[#e8ff59]'
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
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg space-y-5">
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
              <span>{isRegisterMode ? 'Register as Player' : 'Login as User (Player)'}</span>
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
              <span>{isRegisterMode ? 'Register as Organiser' : 'Login as Organiser (Scout)'}</span>
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
                {isRegisterMode
                  ? selectedRole === 'player'
                    ? 'Create New Player Account'
                    : 'Create New Organiser Account'
                  : selectedRole === 'player'
                  ? 'Sign in as Competitive Player'
                  : 'Sign in as Esports Organiser'}
              </h1>

              <p
                className={`text-xs mt-1.5 ${
                  isLight ? 'text-slate-500' : 'text-[#9a9aa2]'
                }`}
              >
                {isRegisterMode
                  ? selectedRole === 'player'
                    ? 'Create your verified competitor account, upload gameplay telemetry, and apply to team trials.'
                    : 'Register your esports organization to publish vacancies, review applicants, and scout talent.'
                  : selectedRole === 'player'
                  ? 'Access your verified FitScore dossier, trajectory analytics, and apply to roster trials.'
                  : 'Manage 5-slot tactical rosters, evaluate candidate leaderboards, and process audio telemetry.'}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-2.5 rounded-[6px] border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono">
                {errorMessage}
              </div>
            )}

            {/* --- REGISTRATION MODE FORM --- */}
            {isRegisterMode ? (
              <form onSubmit={doRegister} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label
                    className={`block text-xs font-bold ${
                      isLight ? 'text-slate-700' : 'text-[#ededed]'
                    }`}
                  >
                    {selectedRole === 'player' ? 'Full Name / In-Game Alias *' : 'Full Name / Scout Lead *'}
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
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      placeholder={selectedRole === 'player' ? 'e.g. Alex "Apex" Mercer' : 'e.g. Alex Mercer'}
                      className={`w-full pl-9 pr-3 py-2 rounded-[6px] text-xs font-mono font-medium border focus:outline-none transition-colors ${
                        isLight
                          ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900 focus:bg-white'
                          : 'border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]'
                      }`}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label
                    className={`block text-xs font-bold ${
                      isLight ? 'text-slate-700' : 'text-[#ededed]'
                    }`}
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail
                        className={`w-4 h-4 ${
                          isLight ? 'text-slate-400' : 'text-[#9a9aa2]'
                        }`}
                      />
                    </div>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="e.g. player@example.com"
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
                    Create Password (min 6 characters) *
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
                      minLength={6}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Enter a secure password"
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

                {/* Organization Name (for Organiser) */}
                {selectedRole === 'organiser' && (
                  <div className="space-y-1.5">
                    <label
                      className={`block text-xs font-bold ${
                        isLight ? 'text-slate-700' : 'text-[#ededed]'
                      }`}
                    >
                      Organization / Team Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2
                          className={`w-4 h-4 ${
                            isLight ? 'text-slate-400' : 'text-[#9a9aa2]'
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        required
                        value={regOrgName}
                        onChange={e => setRegOrgName(e.target.value)}
                        placeholder="e.g. Apex Esports, Cloud9, Sentinels"
                        className={`w-full pl-9 pr-3 py-2 rounded-[6px] text-xs font-mono font-medium border focus:outline-none transition-colors ${
                          isLight
                            ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900 focus:bg-white'
                            : 'border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 rounded-[6px] font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer bg-[#e8ff59] hover:bg-[#d4eb44] text-black shadow-sm"
                >
                  {loading ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <span>
                        {selectedRole === 'player'
                          ? 'Create Account & Enter Player Dashboard'
                          : 'Create Account & Enter Organiser Platform'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {/* Switch back to sign in */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(false);
                      setErrorMessage(null);
                    }}
                    className={`text-xs hover:underline cursor-pointer ${
                      isLight ? 'text-slate-600 hover:text-slate-900' : 'text-[#9a9aa2] hover:text-[#e8ff59]'
                    }`}
                  >
                    Already have an account? <span className="font-bold underline">Sign in with credentials</span>
                  </button>
                </div>
              </form>
            ) : (
              /* --- SIGN IN MODE FORM --- */
              <>
                {/* Quick 1-Click Demo Login Button */}
                <div className="mb-5">
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

                {/* Game Authorities Authentication Section */}
                <div className="mb-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#9a9aa2] flex items-center gap-1.5">
                      <Gamepad2 className="w-3.5 h-3.5 text-[#e8ff59]" />
                      <span>Continue with Game Authorities</span>
                    </span>
                    <span className="text-[9px] font-mono text-[#e8ff59] bg-[#e8ff59]/10 px-1.5 py-0.5 rounded border border-[#e8ff59]/20 font-semibold">
                      Live Attestation
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Steam */}
                    <button
                      type="button"
                      onClick={() => handleOpenAuthorityModal('steam')}
                      disabled={loading}
                      className={`p-2.5 rounded-[6px] border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group ${
                        isLight
                          ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                          : 'bg-[#0b0b0c] hover:bg-[#18181b] border-[#26262a] hover:border-[#66c0f4]/50 text-[#ededed]'
                      }`}
                      title="Authenticate via Steam OpenID"
                    >
                      <div className="w-6 h-6 rounded flex items-center justify-center text-[#66c0f4] group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.524-4.524 4.524h-.105l-4.076 2.911c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.155-3.331-2.69L.618 14.88C2.08 20.08 6.822 24 12.49 24c6.627 0 12-5.373 12-12S18.607 0 11.979 0z"/>
                        </svg>
                      </div>
                      <span className="text-[11px] font-bold tracking-tight">Steam</span>
                    </button>

                    {/* Riot Games */}
                    <button
                      type="button"
                      onClick={() => handleOpenAuthorityModal('riot')}
                      disabled={loading}
                      className={`p-2.5 rounded-[6px] border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group ${
                        isLight
                          ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                          : 'bg-[#0b0b0c] hover:bg-[#18181b] border-[#26262a] hover:border-[#ff4655]/50 text-[#ededed]'
                      }`}
                      title="Authenticate via Riot Sign On"
                    >
                      <div className="w-6 h-6 rounded flex items-center justify-center text-[#ff4655] group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M13.727 3.313L2.617 8.016v7.968l11.11 4.703 7.656-3.242V6.555l-7.656-3.242zm-1.09 2.457l5.454 2.312v5.836l-5.454 2.313-7.818-3.308V8.082l7.818-3.312z" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-bold tracking-tight">Riot Games</span>
                    </button>

                    {/* FACEIT */}
                    <button
                      type="button"
                      onClick={() => handleOpenAuthorityModal('faceit')}
                      disabled={loading}
                      className={`p-2.5 rounded-[6px] border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group ${
                        isLight
                          ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                          : 'bg-[#0b0b0c] hover:bg-[#18181b] border-[#26262a] hover:border-[#ff5500]/50 text-[#ededed]'
                      }`}
                      title="Authenticate via FACEIT Connect"
                    >
                      <div className="w-6 h-6 rounded flex items-center justify-center text-[#ff5500] group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.999 2.247c-.015-.098-.077-.183-.166-.227-.089-.045-.194-.041-.28.01L.226 13.91c-.135.08-.22.228-.225.386-.005.158.07.31.2.399l10.05 6.94c.094.065.215.08.323.04.107-.04.186-.13.21-.242l2.36-11.082 10.9-8.082c.08-.059.125-.152.12-.25l-.015-.099z"/>
                        </svg>
                      </div>
                      <span className="text-[11px] font-bold tracking-tight">FACEIT</span>
                    </button>
                  </div>
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
                  {/* Identifier Input */}
                  <div className="space-y-1.5">
                    <label
                      className={`block text-xs font-bold ${
                        isLight ? 'text-slate-700' : 'text-[#ededed]'
                      }`}
                    >
                      {selectedRole === 'player'
                        ? 'Email / Player Identifier'
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
                            ? 'e.g., player@scoutforge.gg or Vortex'
                            : 'e.g., analyst@cloud9.gg'
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

                  {/* New small link to switch to registration */}
                  <div className="text-center pt-2 flex items-center justify-center gap-1.5 text-xs">
                    <span className={isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}>
                      Don't have an account yet?
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
      {/* Game Authority Interactive Verification Modal */}
      <GameAuthorityModal
        isOpen={authorityModalOpen}
        authority={selectedAuthority}
        onClose={() => setAuthorityModalOpen(false)}
        onAuthorize={handleAuthorizeWithAuthority}
        isLight={isLight}
      />
    </div>
  );
}
