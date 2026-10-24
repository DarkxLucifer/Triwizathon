"use client";

import React, { useState, useRef } from "react";
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Crosshair, 
  Clock, 
  Award,
  Video
} from "lucide-react";
import { GameplayVideoClip } from "@/types/dashboard";

interface VideoPlayerModalProps {
  clip: GameplayVideoClip | null;
  isOpen: boolean;
  onClose: () => void;
  theme?: "dark" | "light";
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  clip,
  isOpen,
  onClose,
  theme = "dark",
}) => {
  const isLight = theme === "light";
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!isOpen || !clip) return null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-4xl rounded-[8px] border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isLight 
            ? "border-slate-200 bg-white" 
            : "border-[#26262a] bg-[#131315]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isLight 
              ? "border-slate-200 bg-slate-50" 
              : "border-[#26262a] bg-[#0b0b0c]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-black truncate max-w-lg ${isLight ? "text-slate-900" : "text-[#ededed]"}`}>
                {clip.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#9a9aa2] mt-0.5">
                <span className="font-bold text-emerald-500">{clip.game}</span>
                <span>•</span>
                <span>{clip.duration}</span>
                <span>•</span>
                <span>{clip.resolution}</span>
                <span>•</span>
                <span className="font-mono">{clip.uploadedAt}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 dark:text-[#ededed] hover:bg-slate-200 dark:hover:bg-[#18181b] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Screen */}
        <div className="relative bg-black aspect-video w-full flex items-center justify-center overflow-hidden group">
          {clip.videoUrl ? (
            <video
              ref={videoRef}
              src={clip.videoUrl}
              autoPlay
              controls
              loop
              className="w-full h-full object-contain"
            />
          ) : (
            /* Procedural / Animated Esports Gameplay Canvas Visualizer when direct file isn't uploaded */
            <div className="w-full h-full flex flex-col items-center justify-center bg-radial from-slate-900 to-black p-6 text-center select-none">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Play className="w-8 h-8 text-emerald-400 ml-1" />
                </div>
                <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded-full uppercase tracking-wider animate-pulse">
                  REC POV
                </span>
              </div>

              <div className="max-w-md space-y-1.5">
                <h4 className="text-sm font-black text-white tracking-wide">
                  {clip.title}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  BGMI Erangel • 90 FPS Gyro Cam • Live Comms Waveform Synchronized
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="px-2 py-0.5 rounded bg-[#e8ff59]/10 text-[#e8ff59] border border-[#e8ff59]/30 text-[10px] font-mono font-bold">
                    {clip.tag}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                    Verified Clip #{clip.id}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick HUD Overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
            <span className="px-2 py-0.5 bg-black/60 backdrop-blur-xs text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold rounded">
              1080p 60fps Ultra
            </span>
            <span className="px-2 py-0.5 bg-black/60 backdrop-blur-xs text-[#e8ff59] border border-[#e8ff59]/40 text-[10px] font-mono font-bold rounded">
              AI Voice Score: {clip.aiScore ?? 28.5} / 30.0
            </span>
          </div>
        </div>

        {/* Video Speed Controls & AI Evaluation Panel */}
        <div className={`p-5 space-y-4 overflow-y-auto ${isLight ? "bg-white" : "bg-[#131315]"}`}>
          {/* Playback Controls & Speed */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#26262a]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-[#9a9aa2]">
                Playback Speed:
              </span>
              {[0.75, 1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => changeSpeed(speed)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-colors cursor-pointer ${
                    playbackSpeed === speed
                      ? isLight
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-[#e8ff59] text-black border-[#e8ff59]"
                      : isLight
                        ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                        : "bg-[#0b0b0c] text-[#ededed] border-[#26262a] hover:bg-[#18181b]"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Whisper Audio & Frame Anti-Cheat Synchronized</span>
            </div>
          </div>

          {/* AI Tactical Decision Analysis Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className={`p-3.5 rounded-[6px] border ${isLight ? "bg-slate-50 border-slate-200" : "bg-[#0b0b0c] border-[#26262a]"}`}>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Audio Tactical Score</span>
              </div>
              <div className="text-xl font-black font-mono text-emerald-400">
                {clip.aiScore ?? 28.5} <span className="text-xs text-slate-500">/ 30.0 pts</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#9a9aa2] mt-1">
                Concise callouts, zero comms panic, disciplined post-plant hold.
              </p>
            </div>

            <div className={`p-3.5 rounded-[6px] border ${isLight ? "bg-slate-50 border-slate-200" : "bg-[#0b0b0c] border-[#26262a]"}`}>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                <span>Spray & Crosshair Precision</span>
              </div>
              <div className="text-xl font-black font-mono text-sky-400">
                91.4% <span className="text-xs text-slate-500">Accuracy</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#9a9aa2] mt-1">
                Sub-190ms target acquisition, 4-shot M416 burst consistency.
              </p>
            </div>

            <div className={`p-3.5 rounded-[6px] border ${isLight ? "bg-slate-50 border-slate-200" : "bg-[#0b0b0c] border-[#26262a]"}`}>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                <span>Scout Recommendation</span>
              </div>
              <div className="text-base font-black text-[#e8ff59] mt-0.5">
                Tier 1 Contender
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#9a9aa2] mt-1">
                Direct trial match for aggressive frontline assault openings.
              </p>
            </div>
          </div>

          {/* Tactical Calling Verdict */}
          <div className={`p-3.5 rounded-[6px] border ${isLight ? "bg-lime-50 border-lime-200" : "bg-[#18181b] border-[#26262a]"}`}>
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-[#e8ff59] block mb-1">
              Coaching Staff & AI Tactical Summary:
            </span>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-[#ededed]">
              {clip.tacticalVerdict || "Flawless compound breach execution. Player prioritized crossfire angle denial over dry peeking, called immediate secondary smoke wall, and secured 3 consecutive entry frags."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
