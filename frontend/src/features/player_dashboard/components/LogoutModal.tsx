"use client";

import React, { useEffect } from "react";
import { LogOut, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { PlayerProfile } from "@/types/dashboard";

interface LogoutModalProps {
  isOpen: boolean;
  player: PlayerProfile;
  onClose: () => void;
  onConfirmLogout: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  player,
  onClose,
  onConfirmLogout,
}) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div
        className="w-full max-w-md rounded-[6px] border border-slate-200 dark:border-[#26262a] bg-white dark:bg-[#131315] p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:text-[#ededed] hover:bg-slate-100 dark:bg-[#18181b] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-[6px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-xs">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="pr-6">
            <h2 id="logout-modal-title" className="text-base font-black text-slate-950 dark:text-[#ededed] tracking-tight">
              Log Out of ScoutForge?
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#9a9aa2] mt-1 leading-relaxed">
              You are about to sign out of your competitive player account.
            </p>
          </div>
        </div>

        {/* Player Profile Context Card */}
        <div className="mt-5 p-3.5 rounded-[6px] border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-slate-950 border border-slate-800 flex items-center justify-center text-[#bef226] font-black text-sm shrink-0">
              {player.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-[#ededed] truncate">
                  {player.fullName}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ID #{player.playerId}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-[#9a9aa2]">
                <span className="font-semibold text-slate-700 dark:text-[#ededed]">{player.activeGame}</span>
                <span>•</span>
                <span>{player.role}</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {player.availabilityStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-[#26262a]/80 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-[#9a9aa2]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Applications & telemetry metrics will remain safely synced.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-[#26262a] bg-white dark:bg-[#131315] hover:bg-slate-50 dark:hover:bg-[#18181b] text-slate-700 dark:text-[#ededed] text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Stay Logged In
          </button>

          <button
            type="button"
            onClick={onConfirmLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer transform active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
