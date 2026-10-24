"use client";

import React, { useState } from "react";
import { X, Download, Copy, Check, FileText } from "lucide-react";
import { PlayerProfile } from "@/types/dashboard";

interface ExportPdfModalProps {
  player: PlayerProfile;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  player,
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      onShowToast(`ScoutForge Dossier for ${player.name} (${player.activeGame}) exported as PDF.`, "success");
      onClose();
    }, 800);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(`https://scoutforge.gg/dossier/${player.name.toLowerCase()}-8842`);
    setCopied(true);
    onShowToast("Public verified scout link copied to clipboard.", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg rounded-[6px] border border-slate-200 dark:border-[#26262a] bg-white dark:bg-[#131315] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-800 dark:text-[#ededed]" />
            <h3 className="text-sm font-black text-slate-950 dark:text-[#ededed]">
              Export Official Scout Dossier
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-800 dark:text-[#ededed] hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Document Preview Card */}
          <div className="p-5 rounded-[6px] border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] text-xs space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#26262a] pb-3">
              <div>
                <span className="font-black text-slate-950 dark:text-[#ededed] tracking-wide font-mono text-sm">
                  {player.name.toUpperCase()} (ID: #{player.playerId})
                </span>
                <div className="text-[11px] text-slate-500 dark:text-[#9a9aa2] font-mono mt-0.5 font-medium">
                  Title: <strong className="text-slate-900 dark:text-[#ededed]">{player.activeGame}</strong> • Role: {player.role} / {player.secondaryRole}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono font-bold">FIT SCORE</span>
                <div className="text-xl font-black text-slate-950 dark:text-[#ededed] font-mono">
                  {player.fitScore}/100
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#131315] border border-slate-200 dark:border-[#26262a] shadow-2xs">
                <span className="text-slate-500 dark:text-[#9a9aa2]">Primary Ratio:</span> <span className="text-slate-950 dark:text-[#ededed] font-black">1.35 (P82)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#131315] border border-slate-200 dark:border-[#26262a] shadow-2xs">
                <span className="text-slate-500 dark:text-[#9a9aa2]">Damage / ACS:</span> <span className="text-slate-950 dark:text-[#ededed] font-black">87.4 (P78)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#131315] border border-slate-200 dark:border-[#26262a] shadow-2xs">
                <span className="text-slate-500 dark:text-[#9a9aa2]">Clutch Rate:</span> <span className="text-emerald-700 font-black">84.0% (P88)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#131315] border border-slate-200 dark:border-[#26262a] shadow-2xs">
                <span className="text-slate-500 dark:text-[#9a9aa2]">Sample Depth:</span> <span className="text-slate-950 dark:text-[#ededed] font-black">{player.matchesSampled} Matches</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 dark:text-[#9a9aa2] leading-relaxed pt-1">
              Deterministic scout summary: High mechanical consistency with verified anti-cheat integrity in {player.activeGame}. Meets criteria for Tier 2 to Tier 1 trial evaluation.
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] flex items-center justify-between">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#9a9aa2] hover:text-slate-950 dark:text-[#ededed] font-semibold transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Scout Link</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white dark:bg-[#131315] text-slate-700 dark:text-[#ededed] hover:bg-slate-100 dark:bg-[#18181b] text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-1.5 rounded-lg bg-[#bef226] hover:bg-[#d0ff36] text-slate-950 dark:text-[#ededed] border border-[#a3e614] text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {downloading ? (
                <span>Generating...</span>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-slate-950 dark:text-[#ededed] stroke-[2.5]" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
