"use client";

import React from "react";
import { X, FileAudio, User, ShieldCheck } from "lucide-react";
import { EvidenceItem } from "@/types/dashboard";

interface TranscriptModalProps {
  item: EvidenceItem | null;
  isOpen: boolean;
  onClose: () => void;
  theme?: "dark" | "light";
}

export const TranscriptModal: React.FC<TranscriptModalProps> = ({
  item,
  isOpen,
  onClose,
  theme = "dark",
}) => {
  if (!isOpen || !item) return null;
  const isLight = theme === "light";

  const defaultTranscript = [
    { time: "00:14", speaker: "Sam (Player)", text: "Mid smoke blooming. Holding deep connector angle." },
    { time: "00:28", speaker: "Teammate 2", text: "Two walking short B. Flash coming out." },
    { time: "00:32", speaker: "Sam (Player)", text: "Tagging 84 on the cross. One down mid, falling back to position." },
    { time: "00:49", speaker: "Teammate 3", text: "Objective / plant initiated." },
    { time: "01:04", speaker: "Sam (Player)", text: "Setting 1v2 crossfire from cover. Repositioning." },
    { time: "01:18", speaker: "Sam (Player)", text: "Covering the defuse. Round secured." },
  ];

  const transcript = item.transcript || defaultTranscript;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-xl rounded-[6px] border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
          isLight
            ? "border-slate-200 bg-white text-slate-900"
            : "border-[#26262a] bg-[#131315] text-[#ededed]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight
              ? "border-slate-200 bg-slate-50"
              : "border-[#26262a] bg-[#0b0b0c]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-[4px] flex items-center justify-center border ${
                isLight
                  ? "bg-slate-950 text-[#bef226] border-slate-900"
                  : "bg-[#18181b] text-[#e8ff59] border-[#26262a]"
              }`}
            >
              <FileAudio className="w-4 h-4" />
            </div>
            <div>
              <h3
                className={`text-sm font-black flex items-center gap-2 ${
                  isLight ? "text-slate-950" : "text-[#ededed]"
                }`}
              >
                <span>Whisper-small Transcript</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-bold ${
                    isLight
                      ? "bg-lime-100 text-lime-900 border-lime-300"
                      : "bg-[#e8ff59]/10 text-[#e8ff59] border-[#e8ff59]/30"
                  }`}
                >
                  Verified
                </span>
              </h3>
              <p
                className={`text-xs font-mono mt-0.5 ${
                  isLight ? "text-slate-500" : "text-[#9a9aa2]"
                }`}
              >
                {item.filename} • {item.durationOrRounds}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-[4px] transition-colors cursor-pointer ${
              isLight
                ? "text-slate-400 hover:text-slate-800 hover:bg-slate-200"
                : "text-[#9a9aa2] hover:text-[#ededed] hover:bg-[#18181b]"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transcript Body */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div
            className={`p-3 rounded-[6px] border text-xs flex items-center justify-between ${
              isLight
                ? "border-slate-200 bg-slate-50 text-slate-600"
                : "border-[#26262a] bg-[#0b0b0c] text-[#9a9aa2]"
            }`}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck
                className={`w-4 h-4 ${
                  isLight ? "text-emerald-600" : "text-[#4ade80]"
                }`}
              />
              <span
                className={`font-semibold ${
                  isLight ? "text-slate-800" : "text-[#ededed]"
                }`}
              >
                Whisper-small v1 Speech-to-Intent Model
              </span>
            </span>
            <span
              className={`font-mono font-bold ${
                isLight ? "text-emerald-700" : "text-[#4ade80]"
              }`}
            >
              Verified Match
            </span>
          </div>

          <div className="space-y-2">
            {transcript.map((line, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-[6px] border flex flex-col gap-1 shadow-2xs transition-colors ${
                  isLight
                    ? "border-slate-200 bg-white hover:bg-slate-50"
                    : "border-[#26262a] bg-[#0b0b0c] hover:bg-[#18181b]"
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span
                    className={`font-bold flex items-center gap-1.5 ${
                      isLight ? "text-slate-900" : "text-[#ededed]"
                    }`}
                  >
                    <User
                      className={`w-3 h-3 ${
                        isLight ? "text-slate-500" : "text-[#9a9aa2]"
                      }`}
                    />
                    {line.speaker}
                  </span>
                  <span
                    className={`font-mono text-[10px] ${
                      isLight ? "text-slate-400" : "text-[#9a9aa2]"
                    }`}
                  >
                    {line.time}
                  </span>
                </div>
                <p
                  className={`text-xs leading-relaxed font-mono ${
                    isLight ? "text-slate-700" : "text-[#ededed]"
                  }`}
                >
                  &ldquo;{line.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
            isLight
              ? "border-slate-200 bg-slate-50 text-slate-600"
              : "border-[#26262a] bg-[#0b0b0c] text-[#9a9aa2]"
          }`}
        >
          <span>
            Tagged with tactical intent:{" "}
            <strong
              className={isLight ? "text-slate-950" : "text-[#ededed]"}
            >
              Late-Round Anchor
            </strong>
          </span>
          <button
            onClick={onClose}
            className={`px-3.5 py-1.5 rounded-[6px] border text-xs font-bold transition-colors cursor-pointer shadow-xs ${
              isLight
                ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-900"
                : "border-[#26262a] bg-[#18181b] hover:bg-[#202024] text-[#ededed]"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
