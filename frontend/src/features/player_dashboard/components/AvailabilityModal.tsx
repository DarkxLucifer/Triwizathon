"use client";

import React, { useState, useRef } from "react";
import { 
  X, 
  User, 
  Gamepad2, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Crosshair, 
  Smartphone, 
  Video, 
  UploadCloud, 
  ShieldCheck, 
  DollarSign, 
  Trophy,
  MessageSquare
} from "lucide-react";
import { PlayerProfile, GameType, AvailabilityStatus } from "@/types/dashboard";

interface AvailabilityModalProps {
  player: PlayerProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<PlayerProfile>) => void;
}

export const AvailabilityModal: React.FC<AvailabilityModalProps> = ({
  player,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    activeGame: player.activeGame || "BGMI",
    availabilityStatus: player.availabilityStatus || "Open to Offers",
    fullName: player.fullName || 'Sam "Vortex" Sharma',
    region: player.region || "India & APAC",
    email: player.email || "sam.vortex.esports@gmail.com",
    phone: player.phone || "+91 98765 43210",
    currentGrind: player.currentGrind || "38 hrs / week",
    scrimWindow: player.scrimWindow || "18:00 – 23:30 IST",
    primaryMastery: player.primaryMastery || "M416 + DBS Frontline Assault & Zone Calling",
    gameUid: player.gameUid || "5128940192 (Vortex)",
    deviceSetup: player.deviceSetup || "iPhone 15 Pro Max (90/120 FPS Gyroscope Always-On)",
    controlStyle: player.controlStyle || "4-Finger Claw + Full Gyroscope",
    discord: player.discord || "sam.vortex#9999",
    languages: player.languages || "English, Hindi (Fluent Callouts)",
    tournamentExperience: player.tournamentExperience || "BGIS 2025 Round of 32, BMPS Tier 1 Scrims",
    expectedContract: player.expectedContract || "₹60,000 – ₹1,00,000 / month (Open to Trial)",
    videoHighlightUrl: player.videoHighlightUrl || "https://youtu.be/vortex-bgmi-highlights",
    bootcampReady: player.bootcampReady ?? true,
    lanReady: player.lanReady ?? true,
  });

  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedVideoFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    setTimeout(() => {
      onSave({
        activeGame: formData.activeGame as GameType,
        availabilityStatus: formData.availabilityStatus as AvailabilityStatus,
        fullName: formData.fullName,
        region: formData.region,
        email: formData.email,
        phone: formData.phone,
        currentGrind: formData.currentGrind,
        scrimWindow: formData.scrimWindow,
        primaryMastery: formData.primaryMastery,
        gameUid: formData.gameUid,
        deviceSetup: formData.deviceSetup,
        controlStyle: formData.controlStyle,
        discord: formData.discord,
        languages: formData.languages,
        tournamentExperience: formData.tournamentExperience,
        expectedContract: formData.expectedContract,
        videoHighlightUrl: formData.videoHighlightUrl,
        bootcampReady: formData.bootcampReady,
        lanReady: formData.lanReady,
      });
      setSaving(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-[8px] border border-slate-200 dark:border-[#26262a] bg-white dark:bg-[#131315] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] shrink-0">
          <div>
            <h3 className="text-sm font-black text-slate-950 dark:text-[#ededed] flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" />
              <span>Edit Pro Dossier & Competitive Profile</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#9a9aa2] mt-0.5">
              Update direct contact details, primary title, hardware setup, scrim windows, and VOD showcase
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 dark:text-[#ededed] hover:bg-slate-200 dark:hover:bg-[#18181b] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Active Game & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-emerald-500" />
                Active Primary Game
              </label>
              <select
                value={formData.activeGame}
                onChange={(e) => setFormData({ ...formData, activeGame: e.target.value as GameType })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              >
                <option value="BGMI">BGMI (Battlegrounds Mobile India)</option>
                <option value="CS2">Counter-Strike 2 (PC)</option>
                <option value="Valorant">Valorant (PC)</option>
                <option value="Free Fire">Free Fire (Mobile)</option>
                <option value="Mobile Legends">Mobile Legends: Bang Bang (Mobile)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Availability Status
              </label>
              <select
                value={formData.availabilityStatus}
                onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value as AvailabilityStatus })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              >
                <option value="Open to Offers">Open to Offers / Free Agent</option>
                <option value="Available for Trial">Available for Trial (High Priority)</option>
                <option value="In Active Scrims">In Active Scrims</option>
                <option value="Restricted">Restricted / Under Contract</option>
              </select>
            </div>
          </div>

          {/* Full Name & Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Full Name & IGN
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                placeholder='Sam "Vortex" Sharma'
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Location & Region
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="India & APAC"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                Contact Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="sam.vortex.esports@gmail.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                Phone / WhatsApp (Verified)
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              />
            </div>
          </div>

          {/* Weekly Grind & Scrim Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Current Grind (Hours / Week)
              </label>
              <input
                type="text"
                value={formData.currentGrind}
                onChange={(e) => setFormData({ ...formData, currentGrind: e.target.value })}
                placeholder="38 hrs / week"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Daily Scrim Window
              </label>
              <input
                type="text"
                value={formData.scrimWindow}
                onChange={(e) => setFormData({ ...formData, scrimWindow: e.target.value })}
                placeholder="18:00 – 23:30 IST"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              />
            </div>
          </div>

          {/* Primary Role Mastery */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5 flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-emerald-500" />
              Primary Role Mastery & Playstyle
            </label>
            <input
              type="text"
              value={formData.primaryMastery}
              onChange={(e) => setFormData({ ...formData, primaryMastery: e.target.value })}
              placeholder="M416 + DBS Frontline Assault & Zone Calling"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
            />
          </div>

          {/* In-Game UID & Discord Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5">
                In-Game ID / UID (Official Anti-Cheat Verification)
              </label>
              <input
                type="text"
                value={formData.gameUid}
                onChange={(e) => setFormData({ ...formData, gameUid: e.target.value })}
                placeholder="5128940192 (Vortex)"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                Discord Handle / Tag
              </label>
              <input
                type="text"
                value={formData.discord}
                onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                placeholder="sam.vortex#9999"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              />
            </div>
          </div>

          {/* Hardware & Control Setup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                Device & Hardware Setup
              </label>
              <input
                type="text"
                value={formData.deviceSetup}
                onChange={(e) => setFormData({ ...formData, deviceSetup: e.target.value })}
                placeholder="iPhone 15 Pro Max (90/120 FPS Gyroscope Always-On)"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5">
                Control & Sensor Layout
              </label>
              <input
                type="text"
                value={formData.controlStyle}
                onChange={(e) => setFormData({ ...formData, controlStyle: e.target.value })}
                placeholder="4-Finger Claw + Full Gyroscope"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              />
            </div>
          </div>

          {/* Tournament Experience & Expected Contract */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Tournament & Scrim Experience
              </label>
              <input
                type="text"
                value={formData.tournamentExperience}
                onChange={(e) => setFormData({ ...formData, tournamentExperience: e.target.value })}
                placeholder="BGIS 2025 Round of 32, BMPS Tier 1 Scrims"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                Expected Salary / Contract Range
              </label>
              <input
                type="text"
                value={formData.expectedContract}
                onChange={(e) => setFormData({ ...formData, expectedContract: e.target.value })}
                placeholder="₹60,000 – ₹1,00,000 / month (Open to Trial)"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              />
            </div>
          </div>

          {/* Video Upload & VOD Link Section */}
          <div className="p-4 rounded-lg border border-slate-200 dark:border-[#26262a] bg-slate-50/70 dark:bg-[#0b0b0c]/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-950 dark:text-[#ededed] flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-rose-500" />
                Featured Highlight VOD & Gameplay Video Evidence
              </span>
              <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Scout Video Portal
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-[#9a9aa2]">
                Video Highlight URL (YouTube, Twitch VOD, Google Drive)
              </label>
              <input
                type="url"
                value={formData.videoHighlightUrl}
                onChange={(e) => setFormData({ ...formData, videoHighlightUrl: e.target.value })}
                placeholder="https://youtu.be/vortex-bgmi-highlights"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#131315] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-[#9a9aa2] mb-1.5">
                Or Upload Direct Video File (.MP4, .WEBM, .MOV)
              </label>
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoSelect}
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                className="hidden"
              />
              <div
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-[#26262a] hover:border-emerald-500 dark:hover:border-[#e8ff59] p-3 rounded-lg text-center cursor-pointer transition-colors bg-white dark:bg-[#131315]"
              >
                <UploadCloud className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                {uploadedVideoFile ? (
                  <span className="text-xs font-bold text-emerald-500 truncate block">
                    Selected: {uploadedVideoFile.name} ({(uploadedVideoFile.size / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 dark:text-[#9a9aa2]">
                    Click to select gameplay VOD or clutch video from disk
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Readiness Toggles */}
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-[#ededed]">
              <input
                type="checkbox"
                checked={formData.bootcampReady}
                onChange={(e) => setFormData({ ...formData, bootcampReady: e.target.checked })}
                className="rounded accent-emerald-500 w-4 h-4"
              />
              <span>Bootcamp Ready (Immediate Relocation)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-[#ededed]">
              <input
                type="checkbox"
                checked={formData.lanReady}
                onChange={(e) => setFormData({ ...formData, lanReady: e.target.checked })}
                className="rounded accent-emerald-500 w-4 h-4"
              />
              <span>LAN Event & Official Stage Ready</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#26262a] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-[#26262a] bg-white dark:bg-[#131315] text-slate-700 dark:text-[#ededed] hover:bg-slate-100 dark:hover:bg-[#18181b] text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-[#bef226] hover:bg-[#d0ff36] text-slate-950 font-black border border-[#a3e614] text-xs transition-all shadow-xs cursor-pointer"
            >
              {saving ? "Saving Changes..." : "Save Dossier Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
