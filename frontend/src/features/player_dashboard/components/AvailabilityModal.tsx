"use client";

import React, { useState } from "react";
import { X, User, Gamepad2 } from "lucide-react";
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
    fullName: player.fullName,
    email: player.email,
    phone: player.phone,
    activeGame: player.activeGame,
    availabilityStatus: player.availabilityStatus,
    currentGrind: player.currentGrind,
    scrimWindow: player.scrimWindow,
    primaryMastery: player.primaryMastery,
    expertiseTagsStr: player.expertiseTags.join(", "),
    region: player.region,
    discord: player.discord,
  });

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const tagsArray = formData.expertiseTagsStr
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setTimeout(() => {
      onSave({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        activeGame: formData.activeGame as GameType,
        availabilityStatus: formData.availabilityStatus as AvailabilityStatus,
        currentGrind: formData.currentGrind,
        scrimWindow: formData.scrimWindow,
        primaryMastery: formData.primaryMastery,
        expertiseTags: tagsArray.length > 0 ? tagsArray : player.expertiseTags,
        region: formData.region,
        discord: formData.discord,
      });
      setSaving(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg rounded-[6px] border border-slate-200 dark:border-[#26262a] bg-white dark:bg-[#131315] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] shrink-0">
          <div>
            <h3 className="text-sm font-black text-slate-950 dark:text-[#ededed] flex items-center gap-2">
              <User className="w-4 h-4 text-slate-900 dark:text-[#ededed]" />
              <span>Edit Profile Details & Availability</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#9a9aa2] mt-0.5">
              Update direct contact details, primary title, grind schedule, and scout visibility
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-800 dark:text-[#ededed] hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Active Game Selection & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-slate-900 dark:text-[#ededed]" />
                Active Primary Game
              </label>
              <select
                value={formData.activeGame}
                onChange={(e) => setFormData({ ...formData, activeGame: e.target.value as GameType })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              >
                <option value="Valorant">Valorant (PC)</option>
                <option value="BGMI">BGMI (Battlegrounds Mobile India)</option>
                <option value="Free Fire">Free Fire (Mobile)</option>
                <option value="Mobile Legends">Mobile Legends: Bang Bang (Mobile)</option>
                <option value="CS2">Counter-Strike 2 (PC)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5">
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
                <option value="Restricted">Restricted / Inactive</option>
              </select>
            </div>
          </div>

          {/* Full Name & Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5">
                Full Name & IGN
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5">
                Location & Region
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5">
                Phone / WhatsApp (Verified)
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              />
            </div>
          </div>

          {/* Weekly Grind & Scrim Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5">
                Current Grind (Hours / Week)
              </label>
              <input
                type="text"
                value={formData.currentGrind}
                onChange={(e) => setFormData({ ...formData, currentGrind: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
                placeholder="38 hrs / week"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5">
                Daily Scrim Window
              </label>
              <input
                type="text"
                value={formData.scrimWindow}
                onChange={(e) => setFormData({ ...formData, scrimWindow: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
                placeholder="18:00 – 23:30 IST"
              />
            </div>
          </div>

          {/* Primary Role Mastery */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#ededed] mb-1.5">
              Primary Role Mastery & Playstyle
            </label>
            <input
              type="text"
              value={formData.primaryMastery}
              onChange={(e) => setFormData({ ...formData, primaryMastery: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-300 dark:border-[#26262a] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:border-slate-900 dark:focus:border-[#e8ff59]"
              placeholder="Assaulter / Duelist & Secondary IGL"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#26262a] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white dark:bg-[#131315] text-slate-700 dark:text-[#ededed] hover:bg-slate-100 dark:bg-[#18181b] text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-[#bef226] hover:bg-[#d0ff36] text-slate-950 dark:text-[#ededed] border border-[#a3e614] text-xs font-black transition-all shadow-xs cursor-pointer"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
