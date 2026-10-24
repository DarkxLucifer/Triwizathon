"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileText, 
  FileAudio, 
  CheckCircle2, 
  Loader2, 
  Trash2, 
  Eye, 
  ShieldCheck,
  RotateCcw,
  Video,
  Play
} from "lucide-react";
import { EvidenceItem, GameplayVideoClip } from "@/types/dashboard";
import { TranscriptModal } from "../components/TranscriptModal";
import { VideoPlayerModal } from "../components/VideoPlayerModal";

interface EvidenceAudioTabProps {
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
  theme?: "dark" | "light";
}

export const EvidenceAudioTab: React.FC<EvidenceAudioTabProps> = ({
  onShowToast,
  theme = "dark",
}) => {
  const isLight = theme === "light";
  const [consentChecked, setConsentChecked] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedItemForTranscript, setSelectedItemForTranscript] = useState<EvidenceItem | null>(null);
  const [selectedClipForPlayback, setSelectedClipForPlayback] = useState<GameplayVideoClip | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([
    {
      id: "ev-1",
      filename: "Scrim_Erangel_Phase5_Clutch_POV.mp4",
      type: "Gameplay Video",
      durationOrRounds: "1m 45s",
      status: "Complete",
      submittedAt: "Today, 14:10 IST",
      filesize: "48.2 MB",
    },
    {
      id: "ev-2",
      filename: "TeamComms_Round18_Clutch.wav",
      type: "Comms Audio",
      durationOrRounds: "1m 48s",
      status: "Complete",
      submittedAt: "Today, 12:15 PM",
      filesize: "18.4 MB",
    },
    {
      id: "ev-3",
      filename: "Scrim_Mirage_Tier2_Map1.json",
      type: "Match Log",
      durationOrRounds: "24 Rounds",
      status: "Complete",
      submittedAt: "Today, 11:30 AM",
      filesize: "4.2 MB",
    },
    {
      id: "ev-4",
      filename: "Scrim_Inferno_Map2_Demo.csv",
      type: "Match Log",
      durationOrRounds: "21 Rounds",
      status: "Complete",
      submittedAt: "Yesterday",
      filesize: "6.8 MB",
    },
  ]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (consentChecked) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!consentChecked) {
      onShowToast("Consent confirmation required prior to uploading telemetry.", "warning");
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUpload(e.target.files[0]);
      e.target.value = "";
    }
  };

  const processUpload = (file: File) => {
    const isVideo =
      file.type.startsWith("video") ||
      file.name.endsWith(".mp4") ||
      file.name.endsWith(".webm") ||
      file.name.endsWith(".mov") ||
      file.name.endsWith(".mkv");

    const isAudio =
      file.type.startsWith("audio") ||
      file.name.endsWith(".wav") ||
      file.name.endsWith(".m4a") ||
      file.name.endsWith(".mp3");

    const newId = `ev-${Date.now()}`;
    const videoUrl = isVideo ? URL.createObjectURL(file) : undefined;

    const newItem: EvidenceItem = {
      id: newId,
      filename: file.name,
      type: isVideo ? "Gameplay Video" : isAudio ? "Comms Audio" : "Match Log",
      durationOrRounds: isVideo ? "1m 45s" : isAudio ? "2m 14s" : "24 Rounds",
      status: "Processing",
      submittedAt: "Just now",
      filesize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      videoUrl: videoUrl,
    };

    setEvidenceList((prev) => [newItem, ...prev]);
    onShowToast(`Uploaded ${file.name}. Commencing automated telemetry check.`, "info");

    setTimeout(() => {
      setEvidenceList((prev) =>
        prev.map((item) =>
          item.id === newId ? { ...item, status: "Complete" } : item
        )
      );
      onShowToast(`${file.name} verification & transcription complete.`, "success");
    }, 2800);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEvidenceList((prev) => prev.filter((item) => item.id !== id));
    onShowToast("Evidence item removed from player dossier.", "info");
  };

  const handlePlayVideo = (item: EvidenceItem) => {
    setSelectedClipForPlayback({
      id: item.id,
      title: item.filename,
      game: "BGMI",
      duration: item.durationOrRounds,
      resolution: "1080p 60fps",
      tag: "Uploaded Match Evidence",
      uploadedAt: item.submittedAt,
      fileSize: item.filesize,
      videoUrl: item.videoUrl,
      aiScore: 28.5,
      tacticalVerdict: "Synchronized telemetry clip: verified player POV, clean audio callouts, zero crosshair drift."
    });
    setIsVideoModalOpen(true);
  };

  const handleResetSampleData = () => {
    setEvidenceList([
      {
        id: "ev-1",
        filename: "Scrim_Erangel_Phase5_Clutch_POV.mp4",
        type: "Gameplay Video",
        durationOrRounds: "1m 45s",
        status: "Complete",
        submittedAt: "Today, 14:10 IST",
        filesize: "48.2 MB",
      },
      {
        id: "ev-2",
        filename: "TeamComms_Round18_Clutch.wav",
        type: "Comms Audio",
        durationOrRounds: "1m 48s",
        status: "Complete",
        submittedAt: "Today, 12:15 PM",
        filesize: "18.4 MB",
      },
      {
        id: "ev-3",
        filename: "Scrim_Mirage_Tier2_Map1.json",
        type: "Match Log",
        durationOrRounds: "24 Rounds",
        status: "Complete",
        submittedAt: "Today, 11:30 AM",
        filesize: "4.2 MB",
      },
      {
        id: "ev-4",
        filename: "Scrim_Inferno_Map2_Demo.csv",
        type: "Match Log",
        durationOrRounds: "21 Rounds",
        status: "Complete",
        submittedAt: "Yesterday",
        filesize: "6.8 MB",
      },
    ]);
    onShowToast("Default evidence ledger restored.", "info");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".csv,.json,.wav,.mp4,.webm,.mov,.mkv,.m4a,.mp3"
        className="hidden"
      />

      {/* Top: Clean Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Minimal Drag-and-Drop Card */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!consentChecked) {
              onShowToast("Please check the consent box below to enable upload.", "warning");
              return;
            }
            fileInputRef.current?.click();
          }}
          className={`border-2 border-dashed rounded-[6px] p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none ${
            !consentChecked
              ? isLight
                ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                : "border-[#26262a] bg-[#0b0b0c] opacity-60 cursor-not-allowed"
              : isDragging
              ? isLight
                ? "border-slate-950 bg-lime-50"
                : "border-[#e8ff59] bg-[#131315]"
              : isLight
              ? "border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400"
              : "border-[#26262a] bg-[#131315] hover:bg-[#1a1a1d] hover:border-[#36363c]"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-[6px] border flex items-center justify-center mb-3 shadow-2xs ${
              isLight
                ? "bg-slate-100 border-slate-200 text-slate-800"
                : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
            }`}
          >
            <UploadCloud
              className={`w-6 h-6 ${isLight ? "text-slate-900" : "text-[#e8ff59]"}`}
            />
          </div>

          <h3
            className={`text-sm font-black ${
              isLight ? "text-slate-950" : "text-[#ededed]"
            }`}
          >
            Upload Match Telemetry, Comms Audio, or Gameplay Video
          </h3>
          <p
            className={`text-xs mt-1 max-w-xs ${
              isLight ? "text-slate-500" : "text-[#9a9aa2]"
            }`}
          >
            Drag and drop recordings (.csv, .json, .wav, .mp3, .mp4, .webm)
          </p>

          <span
            className={`text-[10px] mt-2 font-mono ${
              isLight ? "text-slate-400" : "text-[#9a9aa2]"
            }`}
          >
            Supported across BGMI, Valorant, CS2, Free Fire & MLBB (Up to 1.5 GB)
          </span>

          {/* Consent Checkbox */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className={`mt-5 pt-4 border-t w-full flex items-start justify-center gap-2.5 text-left ${
              isLight ? "border-slate-200" : "border-[#26262a]"
            }`}
          >
            <input
              type="checkbox"
              id="consent-check"
              checked={consentChecked}
              onChange={(e) => {
                setConsentChecked(e.target.checked);
                if (e.target.checked) {
                  onShowToast("Consent confirmed. Uploads enabled.", "info");
                } else {
                  onShowToast("Consent unchecked. Uploads disabled.", "warning");
                }
              }}
              className="mt-0.5 rounded border-[#26262a] accent-[#e8ff59] focus:ring-0 cursor-pointer w-4 h-4"
            />
            <label
              htmlFor="consent-check"
              className={`text-xs cursor-pointer leading-tight font-medium ${
                isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-[#9a9aa2] hover:text-[#ededed]"
              }`}
            >
              &ldquo;I confirm player consent for Whisper-small audio transcription and video evidence indexing.&rdquo;
            </label>
          </div>
        </div>

        {/* Right: Data Quality Summary */}
        <div
          className={`rounded-[6px] border p-6 flex flex-col justify-between shadow-xs ${
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
              <h3
                className={`text-sm font-black flex items-center gap-2 ${
                  isLight ? "text-slate-950" : "text-[#ededed]"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verification & Integrity Stats</span>
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                  isLight
                    ? "bg-lime-100 text-slate-800 border-lime-300"
                    : "bg-[#e8ff59]/10 text-[#e8ff59] border-[#e8ff59]/30"
                }`}
              >
                90 FPS Gyro Cam Calibrated
              </span>
            </div>

            {/* Micro Stats Grid */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div>
                <div
                  className={`text-[11px] font-bold ${
                    isLight ? "text-slate-500" : "text-[#9a9aa2]"
                  }`}
                >
                  Voice Confidence
                </div>
                <div
                  className={`text-2xl font-black font-mono mt-1 ${
                    isLight ? "text-slate-950" : "text-[#ededed]"
                  }`}
                >
                  95%
                </div>
                <div
                  className={`text-[10px] font-bold mt-0.5 ${
                    isLight ? "text-emerald-700" : "text-[#4ade80]"
                  }`}
                >
                  High integrity
                </div>
              </div>
              <div>
                <div
                  className={`text-[11px] font-bold ${
                    isLight ? "text-slate-500" : "text-[#9a9aa2]"
                  }`}
                >
                  Dual-AI Models
                </div>
                <div
                  className={`text-sm font-black mt-1 truncate ${
                    isLight ? "text-slate-950" : "text-[#ededed]"
                  }`}
                >
                  Groq + Whisper
                </div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    isLight ? "text-slate-400" : "text-[#9a9aa2]"
                  }`}
                >
                  Self-hosted stack
                </div>
              </div>
              <div>
                <div
                  className={`text-[11px] font-bold ${
                    isLight ? "text-slate-500" : "text-[#9a9aa2]"
                  }`}
                >
                  Pending Reviews
                </div>
                <div
                  className={`text-2xl font-black font-mono mt-1 ${
                    isLight ? "text-slate-950" : "text-[#ededed]"
                  }`}
                >
                  0
                </div>
                <div
                  className={`text-[10px] font-bold mt-0.5 ${
                    isLight ? "text-emerald-700" : "text-[#4ade80]"
                  }`}
                >
                  All indexed
                </div>
              </div>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-[6px] border text-xs leading-relaxed ${
              isLight
                ? "border-slate-200 bg-slate-50 text-slate-600"
                : "border-[#26262a] bg-[#0b0b0c] text-[#9a9aa2]"
            }`}
          >
            All submitted voice recordings and video clips are automatically transcribed and correlated with match round tick rates to verify player communication, target callouts, and clutch execution.
          </div>
        </div>
      </div>

      {/* Bottom: Submitted Evidence Table */}
      <div
        className={`rounded-[6px] border p-6 shadow-xs ${
          isLight
            ? "border-slate-200 bg-white"
            : "border-[#26262a] bg-[#131315]"
        }`}
      >
        <div
          className={`flex items-center justify-between pb-4 border-b ${
            isLight ? "border-slate-200" : "border-[#26262a]"
          }`}
        >
          <div>
            <h3
              className={`text-sm font-black ${
                isLight ? "text-slate-950" : "text-[#ededed]"
              }`}
            >
              Submitted Evidence Ledger
            </h3>
            <p
              className={`text-xs mt-0.5 ${
                isLight ? "text-slate-500" : "text-[#9a9aa2]"
              }`}
            >
              Indexed match logs, tactical voice recordings, and gameplay VODs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono ${
                isLight ? "text-slate-500" : "text-[#9a9aa2]"
              }`}
            >
              {evidenceList.length} items recorded
            </span>
            <button
              onClick={handleResetSampleData}
              className={`p-1 rounded transition-colors ${
                isLight
                  ? "text-slate-400 hover:text-slate-950"
                  : "text-[#9a9aa2] hover:text-[#ededed]"
              }`}
              title="Reset default evidence items"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Evidence Table */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr
                className={`border-b font-bold ${
                  isLight
                    ? "border-slate-200 text-slate-400"
                    : "border-[#26262a] text-[#9a9aa2]"
                }`}
              >
                <th className="py-3 px-2 font-semibold">File / Match ID</th>
                <th className="py-3 px-2 font-semibold">Type</th>
                <th className="py-3 px-2 font-semibold">Duration / Rounds</th>
                <th className="py-3 px-2 font-semibold">Status</th>
                <th className="py-3 px-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isLight ? "divide-slate-100" : "divide-[#26262a]"
              }`}
            >
              {evidenceList.map((item) => {
                const isVideo = item.type === "Gameplay Video";
                const isAudio = item.type === "Comms Audio";
                const isComplete = item.status === "Complete";
                const isProcessing = item.status === "Processing";

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors group ${
                      isLight ? "hover:bg-slate-50" : "hover:bg-[#0b0b0c]"
                    }`}
                  >
                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 ${
                            isLight
                              ? "bg-slate-100 border-slate-200 text-slate-700"
                              : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                          }`}
                        >
                          {isVideo ? (
                            <Video className="w-3.5 h-3.5 text-rose-500" />
                          ) : isAudio ? (
                            <FileAudio className="w-3.5 h-3.5 text-amber-500" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-sky-500" />
                          )}
                        </div>
                        <div>
                          <div
                            className={`font-bold font-mono transition-colors ${
                              isLight
                                ? "text-slate-900 group-hover:text-black"
                                : "text-[#ededed] group-hover:text-[#e8ff59]"
                            }`}
                          >
                            {item.filename}
                          </div>
                          <div
                            className={`text-[10px] ${
                              isLight ? "text-slate-400" : "text-[#9a9aa2]"
                            }`}
                          >
                            {item.submittedAt} {item.filesize ? `• ${item.filesize}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      className={`py-3.5 px-2 font-medium ${
                        isLight ? "text-slate-600" : "text-[#9a9aa2]"
                      }`}
                    >
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isVideo
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : isAudio
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                      }`}>
                        {item.type}
                      </span>
                    </td>

                    <td
                      className={`py-3.5 px-2 font-mono ${
                        isLight ? "text-slate-800" : "text-[#ededed]"
                      }`}
                    >
                      {item.durationOrRounds}
                    </td>

                    <td className="py-3.5 px-2">
                      {isComplete && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isLight
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-emerald-950/40 text-emerald-300 border border-emerald-800/40"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Indexed
                        </span>
                      )}
                      {isProcessing && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isLight
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-amber-950/40 text-amber-300 border border-amber-800/40"
                          }`}
                        >
                          <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
                          Verifying
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isVideo && isComplete && (
                          <button
                            onClick={() => handlePlayVideo(item)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-[4px] border text-[11px] font-bold cursor-pointer transition-colors ${
                              isLight
                                ? "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                                : "border-[#26262a] bg-[#18181b] hover:bg-[#202024] text-[#ededed]"
                            }`}
                          >
                            <Play className="w-3 h-3 text-emerald-400 fill-current" />
                            <span>Watch VOD</span>
                          </button>
                        )}
                        {isAudio && isComplete && (
                          <button
                            onClick={() => setSelectedItemForTranscript(item)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-[4px] border text-[11px] font-bold cursor-pointer transition-colors ${
                              isLight
                                ? "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                                : "border-[#26262a] bg-[#18181b] hover:bg-[#202024] text-[#ededed]"
                            }`}
                          >
                            <Eye className="w-3 h-3" />
                            <span>Transcript</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteItem(item.id, e)}
                          className={`p-1 rounded cursor-pointer transition-colors ${
                            isLight
                              ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              : "text-[#9a9aa2] hover:text-rose-400 hover:bg-rose-950/30"
                          }`}
                          title="Delete file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transcript Modal */}
      {selectedItemForTranscript && (
        <TranscriptModal
          item={selectedItemForTranscript}
          isOpen={true}
          onClose={() => setSelectedItemForTranscript(null)}
          theme={theme}
        />
      )}

      {/* Video Player Modal */}
      <VideoPlayerModal
        clip={selectedClipForPlayback}
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        theme={theme}
      />
    </div>
  );
};
