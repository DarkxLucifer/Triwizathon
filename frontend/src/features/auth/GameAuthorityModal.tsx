'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Gamepad2,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react';

export type GameAuthorityType = 'steam' | 'riot' | 'faceit';

interface GameAuthorityModalProps {
  isOpen: boolean;
  authority: GameAuthorityType;
  onClose: () => void;
  onAuthorize: (authority: GameAuthorityType) => Promise<void>;
  isLight?: boolean;
}

interface AuthorityConfig {
  id: GameAuthorityType;
  name: string;
  company: string;
  gateway: string;
  brandColor: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  accountHandle: string;
  accountId: string;
  avatarLetter: string;
  antiCheatName: string;
  antiCheatStatus: string;
  antiCheatDetails: string;
  competitiveRank: string;
  statsDetail: string;
  verificationChecks: {
    title: string;
    description: string;
  }[];
}

const AUTHORITIES_CONFIG: Record<GameAuthorityType, AuthorityConfig> = {
  steam: {
    id: 'steam',
    name: 'Steam OpenID 2.0',
    company: 'Valve Corporation',
    gateway: 'https://steamcommunity.com/openid/login',
    brandColor: '#66c0f4',
    badgeBg: 'bg-[#1b2838]',
    badgeBorder: 'border-[#66c0f4]/40',
    textColor: 'text-[#66c0f4]',
    accountHandle: "Sam 'Vortex'",
    accountId: 'SteamID64: 76561198048291024',
    avatarLetter: 'S',
    antiCheatName: 'Valve Anti-Cheat (VAC)',
    antiCheatStatus: 'Clean Standing (0 bans)',
    antiCheatDetails: 'Account in good standing. No recorded infractions across Valve Secure Servers.',
    competitiveRank: '21,480 Premier Rating (CS2 Global Tier)',
    statsDetail: '1,840 Hours Logged • CS2 Premier Rank: Top 0.8% Global • Dota 2: Immortal (6,420 MMR)',
    verificationChecks: [
      {
        title: 'Steam Guard Cryptographic Handshake',
        description: 'HMAC-SHA256 signature verified via Steamworks Web API endpoint.',
      },
      {
        title: 'VAC & Valve Network Integrity Audit',
        description: 'Zero active or historical bans detected across CS2, TF2, and Dota 2 secure clusters.',
      },
      {
        title: 'In-Game Competitive Telemetry Synchronization',
        description: 'Match history and verified Premier rating successfully retrieved from Valve servers.',
      },
    ],
  },
  riot: {
    id: 'riot',
    name: 'Riot Sign On (RSO)',
    company: 'Riot Games, Inc.',
    gateway: 'https://auth.riotgames.com/authorize',
    brandColor: '#ff4655',
    badgeBg: 'bg-[#201416]',
    badgeBorder: 'border-[#ff4655]/40',
    textColor: 'text-[#ff4655]',
    accountHandle: 'Vortex#EUW',
    accountId: 'PUUID: c4a18f92-5b91-4473-b26a-81014e3922c1',
    avatarLetter: 'R',
    antiCheatName: 'Riot Vanguard (Ring 0)',
    antiCheatStatus: 'Secure & Active (Kernel Enforced)',
    antiCheatDetails: 'TPM 2.0 + Secure Boot verified. Zero hardware spoofing or unauthorized driver detections.',
    competitiveRank: 'Immortal 3 (285 RR - Peak Radiant)',
    statsDetail: 'Act Winrate: 61.8% • K/D Ratio: 1.44 • Headshot Accuracy: 32.4% (Vandal / Phantom)',
    verificationChecks: [
      {
        title: 'Riot Games OAuth2 Token Exchange',
        description: 'PKCE Authorization Code verified and bound to Riot ID Vortex#EUW.',
      },
      {
        title: 'Vanguard Hardware Security Attestation',
        description: 'Kernel-level integrity validated. System hardware IDs match tournament-cleared profile.',
      },
      {
        title: 'Valorant Competitive Rating Import',
        description: 'Rank tier, RR delta, and combat score telemetry imported from official Riot API.',
      },
    ],
  },
  faceit: {
    id: 'faceit',
    name: 'FACEIT Competitive Connect',
    company: 'ESL FACEIT Group',
    gateway: 'https://api.faceit.com/auth/v1/oauth/authorize',
    brandColor: '#ff5500',
    badgeBg: 'bg-[#221814]',
    badgeBorder: 'border-[#ff5500]/40',
    textColor: 'text-[#ff5500]',
    accountHandle: 'Vortex_CS',
    accountId: 'GUID: 8fa901bc-6204-4e3b-9a1f-823902930412',
    avatarLetter: 'F',
    antiCheatName: 'FACEIT Anti-Cheat (Client)',
    antiCheatStatus: 'Mandatory AC Running & Enforced',
    antiCheatDetails: 'Live driver integrity monitor passed. Zero blacklisted background processes.',
    competitiveRank: 'Level 10 (2,450 ELO - Master)',
    statsDetail: '1,420 Matches Played • 64.2% Winrate • 1.48 K/D Ratio • FPL-C Qualified',
    verificationChecks: [
      {
        title: 'FACEIT Connect OAuth2 Authorization',
        description: 'Secure token verified via ESL FACEIT competitive authentication mesh.',
      },
      {
        title: 'FACEIT Anti-Cheat Hardware Signature',
        description: 'AC client active with clean hardware attestation and zero driver mismatches.',
      },
      {
        title: 'Competitive Match History & ELO Import',
        description: 'Verified Level 10 stats and FPL-Challenger qualification dossier synced.',
      },
    ],
  },
};

export function GameAuthorityModal({
  isOpen,
  authority,
  onClose,
  onAuthorize,
  isLight = false,
}: GameAuthorityModalProps) {
  const [step, setStep] = useState<number>(1);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);

  const config = AUTHORITIES_CONFIG[authority] || AUTHORITIES_CONFIG.steam;

  // Run mock verification sequence on modal open
  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setIsVerifying(true);
    setIsAuthorizing(false);

    const t1 = setTimeout(() => setStep(2), 500);
    const t2 = setTimeout(() => setStep(3), 1000);
    const t3 = setTimeout(() => {
      setStep(4);
      setIsVerifying(false);
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen, authority]);

  if (!isOpen) return null;

  const handleAuthorizeClick = async () => {
    setIsAuthorizing(true);
    try {
      await onAuthorize(authority);
    } finally {
      setIsAuthorizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-[10px] border shadow-2xl overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-slate-300 text-slate-900'
            : 'bg-[#131315] border-[#26262a] text-[#ededed]'
        }`}
      >
        {/* Top Header / Gateway Bar */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-[6px] font-black text-xs flex items-center justify-center ${config.badgeBg} ${config.badgeBorder} border ${config.textColor}`}
            >
              {config.avatarLetter}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#9a9aa2]">
                  {config.company}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <Lock className="w-2.5 h-2.5" /> SSL 256-Bit
                </span>
              </div>
              <h3 className="text-sm font-bold">{config.name}</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#9a9aa2] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Simulated Gateway URL Pill */}
          <div
            className={`p-2 rounded-[6px] text-[11px] font-mono flex items-center justify-between border ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-600'
                : 'bg-[#0b0b0c] border-[#26262a] text-[#9a9aa2]'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate">{config.gateway}</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60 ml-2" />
          </div>

          {/* Verification Pipeline Steps */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#9a9aa2] uppercase font-bold">Authority Attestation Pipeline</span>
              <span className="text-[#e8ff59]">
                {isVerifying ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin text-[#e8ff59]" />
                    Verifying Credentials ({step}/3)...
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Attested
                  </span>
                )}
              </span>
            </div>

            <div className="space-y-2">
              {config.verificationChecks.map((check, index) => {
                const stepNum = index + 1;
                const isPassed = step > stepNum || step === 4;
                const isCurrent = step === stepNum && isVerifying;

                return (
                  <div
                    key={index}
                    className={`p-2.5 rounded-[6px] border text-xs transition-colors flex items-start gap-3 ${
                      isPassed
                        ? isLight
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                          : 'bg-emerald-950/10 border-emerald-500/20 text-[#ededed]'
                        : isCurrent
                        ? isLight
                          ? 'bg-blue-50/50 border-blue-200 text-slate-800 animate-pulse'
                          : 'bg-[#18181b] border-[#e8ff59]/30 text-[#ededed]'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                        : 'bg-[#0b0b0c] border-[#26262a] text-[#9a9aa2] opacity-60'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-[#e8ff59] animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px] font-mono">
                          {stepNum}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{check.title}</span>
                        {isPassed && (
                          <span className="text-[10px] font-mono text-emerald-400">PASSED</span>
                        )}
                      </div>
                      <p className="text-[11px] opacity-80 mt-0.5">{check.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verified In-Game Dossier Card */}
          <div
            className={`p-4 rounded-[8px] border transition-all ${
              step === 4
                ? isLight
                  ? 'bg-white border-slate-300 shadow-sm'
                  : 'bg-[#0b0b0c] border-[#26262a]'
                : 'opacity-50 pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#26262a]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-black bg-[#e8ff59] shadow-sm`}
                >
                  {config.accountHandle.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-[#ededed]">{config.accountHandle}</h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      VERIFIED COMPETITOR
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-[#9a9aa2]">{config.accountId}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-[#9a9aa2] block">Anti-Cheat Status</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {config.antiCheatStatus}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#9a9aa2] block">Verified Rank & Tier</span>
                <p className="font-bold text-[#ededed] mt-0.5">{config.competitiveRank}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#9a9aa2] block">Telemetry Record</span>
                <p className="text-[11px] text-[#9a9aa2] mt-0.5 truncate">{config.statsDetail}</p>
              </div>
            </div>
          </div>

          {/* Privacy & Anti-Fraud Notice */}
          <div
            className={`p-3 rounded-[6px] border text-[11px] flex items-start gap-2.5 ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-600'
                : 'bg-[#0b0b0c] border-[#26262a] text-[#9a9aa2]'
            }`}
          >
            <Shield className="w-4 h-4 text-[#e8ff59] shrink-0 mt-0.5" />
            <p>
              Signing in with <strong>{config.company}</strong> grants ScoutForge read-only access to your public
              competitive profile, match telemetry, and anti-cheat clearance. Your login credentials and passwords are
              never accessible to ScoutForge.
            </p>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between gap-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isAuthorizing}
            className={`px-4 py-2 rounded-[6px] text-xs font-semibold border transition-colors cursor-pointer ${
              isLight
                ? 'border-slate-300 text-slate-700 hover:bg-slate-200'
                : 'border-[#26262a] text-[#9a9aa2] hover:text-white hover:bg-[#19191d]'
            }`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAuthorizeClick}
            disabled={isVerifying || isAuthorizing}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-[6px] text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#e8ff59] hover:bg-[#d4eb44] text-black shadow-md shadow-lime-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAuthorizing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Authorizing ScoutForge Session...</span>
              </>
            ) : isVerifying ? (
              <span>Verifying Attestation...</span>
            ) : (
              <>
                <span>Authorize & Sign In with {config.company}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
