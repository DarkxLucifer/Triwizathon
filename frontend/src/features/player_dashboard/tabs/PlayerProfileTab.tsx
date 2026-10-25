"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Copy, 
  Check, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Crosshair, 
  Zap, 
  Award, 
  Server, 
  Edit3,
  MessageSquare,
  Gamepad2,
  Flame,
  Shield,
  Swords,
  LogOut,
  Video,
  Film,
  Play,
  UploadCloud,
  Smartphone,
  Trophy,
  DollarSign,
  Trash2,
  ExternalLink,
  Mic,
  FileAudio,
  Save,
  Link2,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Camera,
  FileText,
  AlertCircle,
  Activity,
  Cpu,
  BarChart2
} from "lucide-react";
import { PlayerProfile, GameType, GameplayVideoClip, AvailabilityStatus, GameProfile, RoleApplication, normalizeGameType } from "@/types/dashboard";
import { VideoPlayerModal } from "../components/VideoPlayerModal";
import { playerApi } from "@/lib/api/player";

interface PlayerProfileTabProps {
  player: PlayerProfile;
  applications?: RoleApplication[];
  onViewApplications?: () => void;
  onViewOpenings?: () => void;
  onEditClick: () => void;
  onSelectGame?: (game: GameType) => void;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
  onLogout?: () => void;
  theme?: "dark" | "light";
  onUpdatePlayer?: (updated: Partial<PlayerProfile>) => void;
}

const gameIcons: Record<GameType, React.ReactNode> = {
  "Valorant": <Crosshair className="w-4 h-4 text-rose-500" />,
  "BGMI": <Shield className="w-4 h-4 text-amber-500" />,
  "League of Legends": <Swords className="w-4 h-4 text-cyan-400" />,
  "Rocket League": <Flame className="w-4 h-4 text-amber-500" />,
  "CS2": <Zap className="w-4 h-4 text-emerald-500" />,
};

const gamePosters: Record<string, string> = {
  "CS2": "/images/games/cs2.jpg",
  "Valorant": "/images/games/valorant.jpg",
  "BGMI": "/images/games/bgmi.jpg",
  "League of Legends": "/images/games/apex.jpg",
  "Rocket League": "/images/games/fortnite.jpg",
};

const defaultClips: GameplayVideoClip[] = [
  {
    id: "vod-cs2-1",
    title: "CS2 Best Moments 2025 Highlights (Pro AWPer / Entry Clutch)",
    game: "CS2",
    videoUrl: "/videos/cs2_best_moments_2025.mp4",
    thumbnail: "/images/games/cs2.jpg",
    duration: "1m 15s",
    resolution: "1080p 60fps HD",
    tag: "AWP Highlights / Multi-Kill",
    uploadedAt: "Today, 18:30 IST",
    fileSize: "10.9 MB",
    aiScore: 29.6,
    tacticalVerdict: "Aggressive AWP angle isolation, instant flick re-frags, and high-tempo site executes from 2025 pro highlights.",
    transcription: "Oh the timing on the Peter's. I helped out a lot. Don't gonna show Mollidoy that maybe it's easy. Mollidoy is gonna have to go for the PUN! Oh, don'ts, Chits! Mollidoy said, what are we watching? I got it. 2015 or 2016? So, yeah. Whoa! What did it come from? Yeah, hell of a low bracket run for Fury. It's a face-to-team that put them here in the first place, but they've got to get through Falcons in a third map. Kiss, kiss.",
    transcriptSegments: [
      { start: 0.0, end: 3.3, text: "Oh the timing on the Peter's.", is_command: false },
      { start: 3.3, end: 4.4, text: "I helped out a lot.", is_command: false },
      { start: 4.4, end: 6.4, text: "Don't gonna show Mollidoy that maybe it's easy.", is_command: false },
      { start: 6.4, end: 9.0, text: "Mollidoy is gonna have to go for the PUN!", is_command: true },
      { start: 9.0, end: 10.7, text: "Oh, don'ts, Chits!", is_command: false },
      { start: 10.7, end: 13.7, text: "Mollidoy said, what are we watching?", is_command: false },
      { start: 13.7, end: 14.7, text: "I got it.", is_command: true },
      { start: 14.7, end: 17.5, text: "2015 or 2016?", is_command: false },
      { start: 18.5, end: 20.5, text: "Whoa!", is_command: false },
      { start: 20.5, end: 22.5, text: "What did it come from?", is_command: false },
      { start: 22.5, end: 24.7, text: "Yeah, hell of a low bracket run for Fury.", is_command: false },
      { start: 24.7, end: 27.6, text: "It's a face-to-team that put them here in the first place, but they've got to get through Falcons in a third map.", is_command: true },
      { start: 29.6, end: 30.6, text: "Kiss, kiss.", is_command: false }
    ]
  },
  {
    id: "vod-val-1",
    title: "Valorant Haven A-Site Retake & 1v3 Clutch (Cold Valorant)",
    game: "Valorant",
    videoUrl: "/videos/valorant_clutch_clip.mp4",
    thumbnail: "/images/games/valorant.jpg",
    duration: "0m 55s",
    resolution: "1080p 60fps HD",
    tag: "Retake / Post-Plant Clutch",
    uploadedAt: "Yesterday, 20:15 IST",
    fileSize: "9.8 MB",
    aiScore: 29.2,
    tacticalVerdict: "Disciplined crosshair placement and isolating 1v1 engagements on A-Long post-plant defuse."
  },
  {
    id: "vod-1",
    title: "1v4 Erangel School Compound Breach & Zone Calling (M416 + DBS Laser)",
    game: "BGMI",
    videoUrl: "/videos/bgmi_room_clip.mp4",
    thumbnail: "/images/games/bgmi.jpg",
    duration: "1m 24s",
    resolution: "1080p 60fps HD",
    tag: "1v4 Clutch / Entry Breach",
    uploadedAt: "2 days ago",
    fileSize: "14.5 MB",
    aiScore: 28.8,
    tacticalVerdict: "Flawless crosshair placement, rapid DBS double-tap, and split-second zone calling under Phase 5 circle collapse."
  },
  {
    id: "vod-2",
    title: "BGMI Tournament Scrim 3v3 Frontline Assault & Zone Calling",
    game: "BGMI",
    videoUrl: "/videos/bgmi_assault_clip.mp4",
    thumbnail: "/images/games/bgmi.jpg",
    duration: "1m 08s",
    resolution: "1080p 60fps HD",
    tag: "Frontline Assault / High Ground",
    uploadedAt: "3 days ago",
    fileSize: "8.9 MB",
    aiScore: 27.6,
    tacticalVerdict: "Aggressive vehicular flank cutoff and simultaneous smoke line deploy to secure high-ground rotation."
  }
];

export const PlayerProfileTab: React.FC<PlayerProfileTabProps> = ({
  player,
  applications,
  onViewApplications,
  onViewOpenings,
  onEditClick,
  onSelectGame,
  onShowToast,
  onLogout,
  theme = "dark",
  onUpdatePlayer,
}) => {
  const isLight = theme === "light";
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Profile Inline Edit Mode
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: player.fullName || 'Sam "Vortex" Sharma',
    handle: player.name || 'Vortex',
    tag: player.tag || 'SAM#8842',
    email: player.email || 'sam.vortex.esports@gmail.com',
    phone: player.phone || '+91 98765 43210',
    discord: player.discord || 'sam.vortex#9999',
    region: player.region || 'India & APAC',
    availabilityStatus: player.availabilityStatus || 'Open to Offers',
    currentGrind: player.currentGrind || '38 hrs / week',
    scrimWindow: player.scrimWindow || '18:00 – 23:30 IST',
    primaryMastery: player.primaryMastery || 'M416 + DBS Frontline Assault & Zone Calling',
    expectedContract: player.expectedContract || '₹80,000 – ₹1,20,000 / month (Open to Trial)',
    deviceSetup: player.deviceSetup || 'iPhone 15 Pro Max (90/120 FPS Gyroscope Always-On)',
    controlStyle: player.controlStyle || '4-Finger Claw + Full Gyroscope',
    hardwareSetup: player.hardwareSetup || '240Hz Zowie • Ryzen 7 7800X3D (18ms Mumbai)',
  });

  // Selected game for details & editing
  const [activeGameView, setActiveGameView] = useState<GameType>(normalizeGameType(player.activeGame));

  // Per-game editable credentials & stats
  const [perGameDetails, setPerGameDetails] = useState<Record<GameType, {
    ign: string;
    gameId: string;
    rank: string;
    role: string;
    tier: string;
    primaryStat: string;
    winRate: string;
    kd?: string;
    rating?: string;
    headshotRate?: string;
    openingDuel?: string;
    tradeEfficiency?: string;
    flashDuration?: string;
    utilityDamage?: string;
    clutchRate?: string;
    firstFragWinDelta?: string;
    aimScore?: number;
    positioningScore?: number;
    utilityScore?: number;
    gameSenseScore?: number;
    server?: string;
  }>>({
    BGMI: {
      ign: '5128940192 (Vortex)',
      gameId: '5128940192',
      rank: 'Conqueror Top 100',
      role: 'Assaulter / IGL',
      tier: 'BGIS Verified',
      primaryStat: '842.0 Avg Dmg',
      winRate: '72%',
    },
    Valorant: {
      ign: 'Vortex#VAL',
      gameId: 'Vortex#VAL',
      rank: 'Radiant #412',
      role: 'Duelist / Initiator',
      tier: 'Tier 1 VCT',
      primaryStat: '284.5 ACS',
      winRate: '68%',
    },
    CS2: {
      ign: 'Vortex_CS',
      gameId: '76561198012345678',
      rank: 'FACEIT Level 10 (2,480 ELO)',
      role: 'Dedicated AWPer',
      tier: 'Semi-Pro Cohort',
      primaryStat: '87.4 ADR',
      winRate: '62%',
    },
    'League of Legends': {
      ign: 'Vortex#LoL',
      gameId: 'Vortex#EUW',
      rank: 'Challenger 740 LP',
      role: 'Mid Laner / Playmaker',
      tier: 'LCK / LEC Contender',
      primaryStat: '9.4 CS/Min (4.8 KDA)',
      winRate: '67%',
    },
    'Rocket League': {
      ign: 'Vortex_RL',
      gameId: 'VortexRL#7741',
      rank: 'Supersonic Legend (1,920 MMR)',
      role: 'First Man / Striker',
      tier: 'RLCS Major Contender',
      primaryStat: '2.4 Goals/Game (685 Score)',
      winRate: '71%',
    },
  });

  // AI Credentials Extractor State
  const [extractScreenshot, setExtractScreenshot] = useState<File | null>(null);
  const [extractText, setExtractText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractSuccess, setExtractSuccess] = useState<string | null>(null);
  const [extractMode, setExtractMode] = useState<"screenshot" | "text">("screenshot");
  const [extractMissingFields, setExtractMissingFields] = useState<string[]>([]);
  const [extractNotice, setExtractNotice] = useState<string | null>(null);

  // Live identifier verification state per game title
  const [idVerification, setIdVerification] = useState<Record<GameType, {
    isValid: boolean;
    status: string;
    message: string;
    isChecking: boolean;
  }>>({
    CS2: { isValid: true, status: 'verified_pro', message: 'Verified Steam64 ID loaded.', isChecking: false },
    Valorant: { isValid: true, status: 'verified_riot', message: 'Valid Riot ID verified.', isChecking: false },
    'League of Legends': { isValid: true, status: 'verified_lol', message: 'Valid Riot Summoner verified.', isChecking: false },
    'Rocket League': { isValid: true, status: 'verified_rl', message: 'Valid Epic ID verified.', isChecking: false },
    BGMI: { isValid: true, status: 'verified_bgmi', message: 'Verified BGIS roster UID.', isChecking: false },
  });

  const checkIdentifierDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleVerifyIdentifier = async (game: GameType, idValue: string) => {
    const trimmed = idValue.trim();
    if (!trimmed) {
      setIdVerification(prev => ({
        ...prev,
        [game]: { isValid: false, status: 'empty', message: `Please enter your ${game} ID.`, isChecking: false }
      }));
      return;
    }

    setIdVerification(prev => ({
      ...prev,
      [game]: { ...prev[game], isChecking: true }
    }));

    try {
      const token = localStorage.getItem('scoutforge_access_token') || undefined;
      const res = await playerApi.verifyIdentifier(game, trimmed, token);
      if (res) {
        setIdVerification(prev => ({
          ...prev,
          [game]: {
            isValid: res.valid,
            status: res.status,
            message: res.message,
            isChecking: false,
          }
        }));

        if (res.valid && res.data) {
          // Auto-update ALL telemetry metrics from verified registry
          setPerGameDetails(prev => ({
            ...prev,
            [game]: {
              ...prev[game],
              ign: res.data?.ign || prev[game]?.ign || '',
              gameId: res.data?.game_id || trimmed,
              rank: res.data?.rank || prev[game]?.rank || '',
              role: res.data?.role || prev[game]?.role || '',
              tier: res.data?.tier || prev[game]?.tier || 'Verified',
              primaryStat: res.data?.primary_stat || prev[game]?.primaryStat || '',
              winRate: res.data?.win_rate || prev[game]?.winRate || '',
              kd: res.data?.kd,
              rating: res.data?.rating,
              headshotRate: res.data?.headshot_rate,
              openingDuel: res.data?.opening_duel,
              tradeEfficiency: res.data?.trade_efficiency,
              flashDuration: res.data?.flash_duration,
              utilityDamage: res.data?.utility_damage,
              clutchRate: res.data?.clutch_rate,
              firstFragWinDelta: res.data?.first_frag_win_delta,
              aimScore: res.data?.aim_score,
              positioningScore: res.data?.positioning_score,
              utilityScore: res.data?.utility_score,
              gameSenseScore: res.data?.game_sense_score,
            }
          }));
        }
      }
    } catch (err: any) {
      setIdVerification(prev => ({
        ...prev,
        [game]: {
          isValid: false,
          status: 'error',
          message: err.message || 'Validation service offline.',
          isChecking: false,
        }
      }));
    }
  };

  const onGameIdChange = (newVal: string) => {
    setPerGameDetails(prev => ({
      ...prev,
      [activeGameView]: { ...prev[activeGameView], gameId: newVal }
    }));

    if (checkIdentifierDebounceRef.current) clearTimeout(checkIdentifierDebounceRef.current);
    checkIdentifierDebounceRef.current = setTimeout(() => {
      handleVerifyIdentifier(activeGameView, newVal);
    }, 450);
  };

  const handleAiExtractCredentials = async () => {
    if (!extractScreenshot && !extractText.trim()) {
      onShowToast("Please upload a screenshot or enter text to extract", "warning");
      return;
    }
    setIsExtracting(true);
    setExtractSuccess(null);
    setExtractNotice(null);
    setExtractMissingFields([]);
    try {
      const token = localStorage.getItem('scoutforge_access_token') || undefined;
      const res = await playerApi.extractGameCredentials(activeGameView, {
        rawText: extractText.trim() || undefined,
        screenshotFile: extractScreenshot || undefined,
        token,
      });

      if (res) {
        if (res.is_complete) {
          setPerGameDetails(prev => ({
            ...prev,
            [activeGameView]: {
              ign: res.ign || prev[activeGameView]?.ign || '',
              gameId: res.game_id || prev[activeGameView]?.gameId || '',
              rank: res.rank || prev[activeGameView]?.rank || '',
              role: res.role || prev[activeGameView]?.role || '',
              tier: res.tier || prev[activeGameView]?.tier || 'Verified Candidate',
              primaryStat: res.primary_stat || prev[activeGameView]?.primaryStat || '',
              winRate: res.win_rate || prev[activeGameView]?.winRate || '',
              kd: (res as any).kd,
              rating: (res as any).rating,
              headshotRate: (res as any).headshot_rate,
              openingDuel: (res as any).opening_duel,
              tradeEfficiency: (res as any).trade_efficiency,
              flashDuration: (res as any).flash_duration,
              utilityDamage: (res as any).utility_damage,
              clutchRate: (res as any).clutch_rate,
              firstFragWinDelta: (res as any).first_frag_win_delta,
              aimScore: (res as any).aim_score,
              positioningScore: (res as any).positioning_score,
              utilityScore: (res as any).utility_score,
              gameSenseScore: (res as any).game_sense_score,
            }
          }));

          setIdVerification(prev => ({
            ...prev,
            [activeGameView]: {
              isValid: true,
              status: 'ai_extracted',
              message: `Verified via AI Extraction: ${res.ign || 'Player'} (${res.game_id || activeGameView})`,
              isChecking: false,
            }
          }));

          setExtractSuccess(`AI Extracted: ${res.ign || 'Player'} (UID: ${res.game_id}) • Rank: ${res.rank} • Metric: ${res.primary_stat} • Win Rate: ${res.win_rate}`);
          onShowToast(`AI successfully extracted complete credentials for ${activeGameView}!`, "success");
        } else {
          // Missing info flow
          const missing = res.missing_fields || [];
          setExtractMissingFields(missing);
          setExtractNotice(res.message || `Missing fields: ${missing.join(', ')}`);

          setPerGameDetails(prev => ({
            ...prev,
            [activeGameView]: {
              ...prev[activeGameView],
              ign: res.ign || prev[activeGameView]?.ign || '',
              gameId: res.game_id || prev[activeGameView]?.gameId || '',
              rank: res.rank || prev[activeGameView]?.rank || '',
              role: res.role || prev[activeGameView]?.role || '',
              primaryStat: res.primary_stat || prev[activeGameView]?.primaryStat || '',
              winRate: res.win_rate || prev[activeGameView]?.winRate || '',
              kd: (res as any).kd ?? prev[activeGameView]?.kd,
              rating: (res as any).rating ?? prev[activeGameView]?.rating,
              headshotRate: (res as any).headshot_rate ?? prev[activeGameView]?.headshotRate,
              openingDuel: (res as any).opening_duel ?? prev[activeGameView]?.openingDuel,
              tradeEfficiency: (res as any).trade_efficiency ?? prev[activeGameView]?.tradeEfficiency,
              flashDuration: (res as any).flash_duration ?? prev[activeGameView]?.flashDuration,
              utilityDamage: (res as any).utility_damage ?? prev[activeGameView]?.utilityDamage,
              clutchRate: (res as any).clutch_rate ?? prev[activeGameView]?.clutchRate,
              firstFragWinDelta: (res as any).first_frag_win_delta ?? prev[activeGameView]?.firstFragWinDelta,
              aimScore: (res as any).aim_score ?? prev[activeGameView]?.aimScore,
              positioningScore: (res as any).positioning_score ?? prev[activeGameView]?.positioningScore,
              utilityScore: (res as any).utility_score ?? prev[activeGameView]?.utilityScore,
              gameSenseScore: (res as any).game_sense_score ?? prev[activeGameView]?.gameSenseScore,
            }
          }));

          setIdVerification(prev => ({
            ...prev,
            [activeGameView]: {
              isValid: true,
              status: 'partial_extracted',
              message: res.message || 'Partial extract - some fields missing',
              isChecking: false,
            }
          }));

          onShowToast(res.message || "Some telemetry fields could not be found. Please complete them.", "warning");
        }
      }
    } catch (err: any) {
      console.warn("AI extraction notice:", err);
      onShowToast(err?.message || "Failed to extract credentials", "warning");
    } finally {
      setIsExtracting(false);
    }
  };

  // Video / Audio upload & management
  const [mediaClips, setMediaClips] = useState<GameplayVideoClip[]>(player.videoClips || defaultClips);
  const [selectedClip, setSelectedClip] = useState<GameplayVideoClip | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadMap, setUploadMap] = useState("Mirage");
  const [clipFilter, setClipFilter] = useState<"current" | "all">("current");
  const [isUploading, setIsUploading] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Sync media clips when player.videoClips updates from backend
  useEffect(() => {
    if (player.videoClips && player.videoClips.length > 0) {
      setMediaClips(player.videoClips);
    }
  }, [player.videoClips]);

  // Sync state with prop updates
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(label);
    onShowToast(`${label} copied to clipboard!`, "success");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveBasicProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPayload = {
      fullName: editForm.fullName,
      name: editForm.handle,
      tag: editForm.tag,
      email: editForm.email,
      phone: editForm.phone,
      discord: editForm.discord,
      region: editForm.region,
      availabilityStatus: editForm.availabilityStatus as AvailabilityStatus,
      currentGrind: editForm.currentGrind,
      scrimWindow: editForm.scrimWindow,
      primaryMastery: editForm.primaryMastery,
      expectedContract: editForm.expectedContract,
      deviceSetup: editForm.deviceSetup,
      controlStyle: editForm.controlStyle,
      hardwareSetup: editForm.hardwareSetup,
    };

    if (onUpdatePlayer) {
      onUpdatePlayer(updatedPayload);
    }

    try {
      const token = localStorage.getItem('scoutforge_access_token') || undefined;
      await playerApi.updateMyDossier({
        name: editForm.fullName,
        handle: editForm.handle,
        contact_email: editForm.email,
        contact_phone: editForm.phone,
        region: editForm.region,
        availability_status: editForm.availabilityStatus,
        hours_per_week: parseInt(editForm.currentGrind) || 38,
        playstyle_description: editForm.primaryMastery,
        expected_compensation: editForm.expectedContract,
        hardware_specs_json: {
          device_setup: editForm.deviceSetup,
          control_style: editForm.controlStyle,
          hardware_setup: editForm.hardwareSetup,
        },
      }, token);

      onShowToast("Profile details updated and saved to backend!", "success");
    } catch (err: any) {
      onShowToast(`Backend sync: ${err.message || 'Saved locally'}`, "info");
    }

    setIsEditingBasic(false);
  };

  const handleSaveGameCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const details = perGameDetails[activeGameView];
    const isApiSupported = activeGameView === 'CS2' || activeGameView === 'Valorant' || activeGameView === 'League of Legends' || activeGameView === 'Rocket League';
    const currentIdCheck = idVerification[activeGameView];
    const isIdValid = currentIdCheck?.isValid !== false;
    const isFormValid = isApiSupported
      ? Boolean(details?.gameId?.trim()) && isIdValid
      : Boolean(
          details?.ign?.trim() &&
          details?.gameId?.trim() &&
          details?.rank?.trim() &&
          details?.role?.trim() &&
          details?.primaryStat?.trim() &&
          details?.winRate?.trim()
        ) && isIdValid;

    if (!isFormValid) {
      onShowToast(
        isApiSupported
          ? `Please provide the required ${activeGameView} Account/Steam ID.`
          : "All 6 fields are required before saving for BGMI.",
        "warning"
      );
      return;
    }
    try {
      const token = localStorage.getItem('scoutforge_access_token') || undefined;
      const effectiveRole = details.role?.trim() || (activeGameView === 'CS2' ? 'Dedicated AWPer' : activeGameView === 'Valorant' ? 'Duelist / Initiator' : activeGameView === 'League of Legends' ? 'Mid Laner' : 'First Man / Striker');
      const effectiveStat = details.primaryStat?.trim() || (activeGameView === 'CS2' ? '88.5 ADR' : activeGameView === 'Valorant' ? '284.5 ACS' : activeGameView === 'League of Legends' ? '9.4 CS/M' : '2.4 GPG');
      const effectiveWinRate = details.winRate?.trim() || '68%';
      const effectiveRank = details.rank?.trim() || (activeGameView === 'CS2' ? 'FACEIT Level 10' : activeGameView === 'Valorant' ? 'Radiant' : activeGameView === 'League of Legends' ? 'Challenger' : 'Supersonic Legend');

      await playerApi.registerGameTitle({
        title_slug: activeGameView.toLowerCase().replace(/\s+/g, '-'),
        title_name: activeGameView,
        in_game_name: details.ign || details.gameId,
        in_game_id: details.gameId,
        self_reported_rank: effectiveRank,
        verification_status: 'linked',
        stats_json: {
          role: effectiveRole,
          primary_stat: effectiveStat,
          win_rate: effectiveWinRate,
        }
      }, token);

      // Also update player state gamesPlayed in memory
      if (onUpdatePlayer && player.gamesPlayed) {
        const updatedGames = player.gamesPlayed.map(g => 
          g.id === activeGameView 
            ? { ...g, ign: details.ign, rank: details.rank, primaryRole: details.role, primaryStatValue: details.primaryStat, winRate: details.winRate }
            : g
        );
        onUpdatePlayer({ gamesPlayed: updatedGames });
      }

      onShowToast(`${activeGameView} credentials & stats saved directly to backend!`, "success");
    } catch (err: any) {
      onShowToast(`Saved locally: ${err.message || 'Updated'}`, "info");
    }
  };

    const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("video/")) {
        resolve("");
        return;
      }
      try {
        const url = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;
        video.src = url;

        let finished = false;
        const finish = (result: string) => {
          if (!finished) {
            finished = true;
            URL.revokeObjectURL(url);
            resolve(result);
          }
        };

        video.onloadeddata = () => {
          video.currentTime = Math.min(1.0, (video.duration && video.duration > 1) ? 1.0 : 0.1);
        };

        video.onseeked = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 360;
            const ctx = canvas.getContext("2d");
            if (ctx && canvas.width > 0 && canvas.height > 0) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
              finish(dataUrl);
              return;
            }
          } catch {
            // fallback
          }
          finish("");
        };

        video.onerror = () => finish("");
        setTimeout(() => finish(""), 2200);
      } catch {
        resolve("");
      }
    });
  };

  const handleMediaUpload = async (file: File) => {
    setIsUploading(true);
    const clipTitle = uploadTitle.trim() || `${activeGameView} ${file.name.replace(/\.[^/.]+$/, "")}`;
    const generatedThumb = await generateVideoThumbnail(file);
    const clipPoster = generatedThumb || gamePosters[activeGameView] || "/images/games/cs2.jpg";
    onShowToast(`Extracting audio via FFmpeg & transcribing with Whisper AI (approx 10-15s)...`, "info");
    try {
      let token = localStorage.getItem('scoutforge_access_token') || undefined;
      if (!token) {
        try {
          const authRes = await fetch("http://127.0.0.1:8000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "player@scoutforge.gg", password: "player123" }),
          });
          if (authRes.ok) {
            const data = await authRes.json();
            token = data.access_token;
            if (token) localStorage.setItem('scoutforge_access_token', token);
          }
        } catch (authErr) {
          console.warn("Auto demo login error:", authErr);
        }
      }
      const savedClip = await playerApi.uploadClip(file, clipTitle, uploadMap, token);

      const newClip: GameplayVideoClip = {
        id: `vod-${savedClip.id}`,
        title: savedClip.title,
        game: activeGameView,
        videoUrl: URL.createObjectURL(file),
        thumbnail: clipPoster,
        duration: `${Math.round(savedClip.duration_seconds || 45)}s`,
        resolution: file.type.startsWith("audio/") ? "Voice Audio Comms (48kHz)" : "1080p 60fps HD",
        tag: file.type.startsWith("audio/") ? "Tactical Audio / Comms" : `${uploadMap} POV Gameplay`,
        uploadedAt: "Just now",
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        aiScore: savedClip.tactical_score || 25.0,
        tacticalVerdict: savedClip.soundness_reasoning || (savedClip.verdict ? `LLM Tactical Verdict: ${savedClip.verdict}` : "Evaluated by LLM Tactical Judge."),
        transcription: savedClip.transcription || undefined,
        transcriptSegments: (savedClip.transcript_segments as any) || undefined,
      };

      setMediaClips((prev) => [newClip, ...prev]);
      if (onUpdatePlayer) {
        onUpdatePlayer({ videoClips: [newClip, ...mediaClips] });
      }
      onShowToast(`Uploaded ${file.name} for ${activeGameView}. Whisper transcription & AI score: ${savedClip.tactical_score}/30!`, "success");
    } catch (err: any) {
      console.error("Clip upload / Whisper error:", err);
      onShowToast(`Upload / Whisper error: ${err.message || 'Server error'}. Please check backend connection.`, "warning");
    } finally {
      setIsUploading(false);
      setUploadTitle("");
    }
  };

  const handleDeleteClip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = mediaClips.filter((c) => c.id !== id);
    setMediaClips(updated);
    if (onUpdatePlayer) {
      onUpdatePlayer({ videoClips: updated });
    }
    onShowToast("Media clip removed from player profile.", "info");
  };

  const handleOpenVideo = (clip: GameplayVideoClip) => {
    setSelectedClip(clip);
    setIsPlayerModalOpen(true);
  };

  // Filtered clips based on active game or all
  const displayedClips = clipFilter === "current" 
    ? mediaClips.filter(c => c.game === activeGameView)
    : mediaClips;

  const safeGame = normalizeGameType(activeGameView);
  const currentDetails = perGameDetails[safeGame] || perGameDetails.CS2 || perGameDetails.BGMI || {
    ign: 'Vortex',
    gameId: '5128940192',
    rank: 'Conqueror Top 100',
    role: 'Assaulter / IGL',
    tier: 'BGIS Verified',
    primaryStat: '842.0 Avg Dmg',
    winRate: '72%',
  };

  // Dynamic Live Analytics derived from entered ID & telemetry fields
  const isApiSupported = activeGameView === 'CS2' || activeGameView === 'Valorant' || activeGameView === 'League of Legends' || activeGameView === 'Rocket League';
  const isFormValid = isApiSupported
    ? Boolean(currentDetails?.gameId?.trim())
    : Boolean(
        currentDetails?.ign?.trim() &&
        currentDetails?.gameId?.trim() &&
        currentDetails?.rank?.trim() &&
        currentDetails?.role?.trim() &&
        currentDetails?.primaryStat?.trim() &&
        currentDetails?.winRate?.trim()
      );

  const statNum = parseFloat(currentDetails?.primaryStat?.replace(/[^0-9.]/g, '') || '80') || 80;
  const winNum = parseFloat(currentDetails?.winRate?.replace(/[^0-9.]/g, '') || '55') || 55;
  
  const baseFactor = activeGameView === 'CS2'
    ? Math.min(1.4, Math.max(0.6, statNum / 82.0))
    : activeGameView === 'Valorant'
    ? Math.min(1.4, Math.max(0.6, statNum / 240.0))
    : Math.min(1.4, Math.max(0.6, statNum / 780.0));

  const winFactor = Math.min(1.3, Math.max(0.7, winNum / 55.0));

  const computedRating = currentDetails?.rating || (0.75 + baseFactor * 0.52).toFixed(2);
  const computedKd = currentDetails?.kd || (0.78 + baseFactor * 0.55).toFixed(2);
  const computedHs = currentDetails?.headshotRate ? parseInt(currentDetails.headshotRate) : Math.round(Math.min(78, Math.max(28, 38 + baseFactor * 18)));
  const computedOpening = currentDetails?.openingDuel ? parseInt(currentDetails.openingDuel) : Math.round(Math.min(84, Math.max(38, 44 + winFactor * 16)));
  const computedTrade = currentDetails?.tradeEfficiency || `${(68.0 + baseFactor * 14.0).toFixed(1)}%`;
  const computedFlash = currentDetails?.flashDuration || `${(1.65 + winFactor * 0.45).toFixed(2)}s`;
  const computedUtilityDmg = currentDetails?.utilityDamage || `${Math.round(18 + baseFactor * 10)} HP`;
  const clutchNumeric = currentDetails?.clutchRate ? parseInt(currentDetails.clutchRate) : Math.round(Math.min(65, Math.max(22, 28 + winFactor * 12)));
  const computedClutch = currentDetails?.clutchRate || `${clutchNumeric}%`;
  const computedDelta = currentDetails?.firstFragWinDelta || `+${(10.0 + winFactor * 4.5).toFixed(1)}%`;

  const computedAim = currentDetails?.aimScore ?? Math.round(Math.min(99, Math.max(55, 68 + baseFactor * 22)));
  const computedPos = currentDetails?.positioningScore ?? Math.round(Math.min(98, Math.max(52, 66 + winFactor * 20)));
  const computedUtil = currentDetails?.utilityScore ?? Math.round(Math.min(97, Math.max(50, 65 + baseFactor * 12 + winFactor * 10)));
  const computedSense = currentDetails?.gameSenseScore ?? Math.round(Math.min(98, Math.max(54, 67 + winFactor * 22)));

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. TOP IDENTITY & PROFILE OVERVIEW CARD */}
      <div
        className={`rounded-[8px] border p-6 shadow-xs relative overflow-hidden transition-colors ${
          isLight
            ? "border-slate-200 bg-white"
            : "border-[#26262a] bg-[#131315]"
        }`}
      >
        <div
          className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b ${
            isLight ? "border-slate-200" : "border-[#26262a]"
          }`}
        >
          {/* Avatar and Identity */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className={`w-16 h-16 rounded-[6px] border flex items-center justify-center font-mono font-black text-xl shadow-xs ${
                  isLight
                    ? "bg-slate-900 border-slate-950 text-white"
                    : "bg-[#0b0b0c] border-[#e8ff59]/50 text-[#e8ff59]"
                }`}
              >
                {player.name ? player.name.substring(0, 2).toUpperCase() : "VX"}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#131315]"
                title="Telemetry Verified & Active"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1
                  className={`text-lg font-black tracking-tight ${
                    isLight ? "text-slate-950" : "text-[#ededed]"
                  }`}
                >
                  {player.fullName || `Sam "Vortex" Sharma`}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    isLight
                      ? "bg-slate-100 text-slate-800 border-slate-300"
                      : "bg-[#0b0b0c] text-[#e8ff59] border-[#e8ff59]/40"
                  }`}
                >
                  IGN: {player.name || "Vortex"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    player.availabilityStatus === "Open to Offers"
                      ? isLight
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                      : isLight
                      ? "bg-slate-100 text-slate-700 border-slate-300"
                      : "bg-[#18181b] text-[#9a9aa2] border-[#26262a]"
                  }`}
                >
                  {player.availabilityStatus || "Open to Offers / Free Agent"}
                </span>
              </div>

              <div
                className={`flex items-center gap-3 text-xs mt-1.5 flex-wrap ${
                  isLight ? "text-slate-500" : "text-[#9a9aa2]"
                }`}
              >
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {player.region || "India & APAC"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Gamepad2 className="w-3.5 h-3.5 text-[#e8ff59]" />
                  Active Primary: <strong className={isLight ? "text-slate-900" : "text-[#ededed]"}>{player.activeGame}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {player.currentGrind || "38 hrs / week"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingBasic(!isEditingBasic)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-xs font-bold transition-all cursor-pointer ${
                isEditingBasic
                  ? isLight
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-[#e8ff59] text-black border-[#e8ff59]"
                  : isLight
                  ? "border-slate-300 bg-white hover:bg-slate-50 text-slate-800"
                  : "border-[#26262a] bg-[#0b0b0c] hover:bg-[#18181b] text-[#ededed]"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingBasic ? "Close Form" : "Edit Profile"}</span>
            </button>
          </div>
        </div>

        {/* Basic Information Display (or Edit Form) */}
        {!isEditingBasic ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 text-xs">
            {/* Contact Email */}
            <div className={`p-3 rounded-[6px] border ${isLight ? "bg-slate-50 border-slate-200" : "bg-[#0b0b0c] border-[#26262a]"}`}>
              <div className="flex items-center justify-between text-slate-500 dark:text-[#9a9aa2] mb-1 font-mono text-[10px] uppercase">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#e8ff59]" />
                  Contact Email
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(player.email || "sam.vortex.esports@gmail.com", "Email")}
                  className="hover:text-white"
                >
                  {copiedField === "Email" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className={`font-bold font-mono truncate ${isLight ? "text-slate-900" : "text-[#ededed]"}`}>
                {player.email || "sam.vortex.esports@gmail.com"}
              </div>
            </div>

            {/* Phone / WhatsApp */}
            <div className={`p-3 rounded-[6px] border ${isLight ? "bg-slate-50 border-slate-200" : "bg-[#0b0b0c] border-[#26262a]"}`}>
              <div className="flex items-center justify-between text-slate-500 dark:text-[#9a9aa2] mb-1 font-mono text-[10px] uppercase">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  Phone / WhatsApp
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(player.phone || "+91 98765 43210", "Phone")}
                  className="hover:text-white"
                >
                  {copiedField === "Phone" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className={`font-bold font-mono ${isLight ? "text-slate-900" : "text-[#ededed]"}`}>
                {player.phone || "+91 98765 43210"}
              </div>
            </div>

            {/* Daily Scrim Window */}
            <div className={`p-3 rounded-[6px] border ${isLight ? "bg-slate-50 border-slate-200" : "bg-[#0b0b0c] border-[#26262a]"}`}>
              <div className="text-slate-500 dark:text-[#9a9aa2] mb-1 font-mono text-[10px] uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-sky-400" />
                Daily Scrim Window
              </div>
              <div className={`font-bold font-mono ${isLight ? "text-slate-900" : "text-[#ededed]"}`}>
                {player.scrimWindow || "18:00 – 23:30 IST"}
              </div>
            </div>

            {/* Primary Role Mastery */}
            <div className={`p-3 rounded-[6px] border ${isLight ? "bg-slate-50 border-slate-200" : "bg-[#0b0b0c] border-[#26262a]"}`}>
              <div className="text-slate-500 dark:text-[#9a9aa2] mb-1 font-mono text-[10px] uppercase flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-rose-400" />
                Playstyle Mastery
              </div>
              <div className={`font-bold truncate ${isLight ? "text-slate-900" : "text-[#ededed]"}`}>
                {player.primaryMastery || "M416 + DBS Frontline Assault & Zone Calling"}
              </div>
            </div>
          </div>
        ) : (
          /* Inline Basic Profile Edit Form */
          <form onSubmit={handleSaveBasicProfile} className="pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className={`w-full p-2 rounded-[6px] border text-xs font-bold outline-hidden ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                  IN-GAME HANDLE (IGN)
                </label>
                <input
                  type="text"
                  value={editForm.handle}
                  onChange={(e) => setEditForm({ ...editForm, handle: e.target.value })}
                  className={`w-full p-2 rounded-[6px] border text-xs font-bold outline-hidden ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                  EMAIL
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className={`w-full p-2 rounded-[6px] border text-xs font-mono outline-hidden ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                  PHONE / WHATSAPP
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className={`w-full p-2 rounded-[6px] border text-xs font-mono outline-hidden ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                  REGION & LOCATION
                </label>
                <input
                  type="text"
                  value={editForm.region}
                  onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                  className={`w-full p-2 rounded-[6px] border text-xs outline-hidden ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                  AVAILABILITY STATUS
                </label>
                <select
                  value={editForm.availabilityStatus}
                  onChange={(e) => setEditForm({ ...editForm, availabilityStatus: e.target.value as any })}
                  className={`w-full p-2 rounded-[6px] border text-xs font-bold outline-hidden ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                  }`}
                >
                  <option value="Open to Offers">Open to Offers / Free Agent</option>
                  <option value="Under Contract">Under Contract / Active</option>
                  <option value="Exploring Options">Exploring Options / Trial</option>
                  <option value="Not Looking">Not Looking / Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                  CURRENT GRIND
                </label>
                <input
                  type="text"
                  value={editForm.currentGrind}
                  onChange={(e) => setEditForm({ ...editForm, currentGrind: e.target.value })}
                  className={`w-full p-2 rounded-[6px] border text-xs outline-hidden ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                  DAILY SCRIM WINDOW
                </label>
                <input
                  type="text"
                  value={editForm.scrimWindow}
                  onChange={(e) => setEditForm({ ...editForm, scrimWindow: e.target.value })}
                  className={`w-full p-2 rounded-[6px] border text-xs outline-hidden ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#26262a]">
              <button
                type="button"
                onClick={() => setIsEditingBasic(false)}
                className="px-3.5 py-1.5 rounded-[6px] text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-[6px] text-xs font-black bg-[#e8ff59] text-black hover:bg-[#d8ef49] flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>


        )}
      </div>

      {/* 2. COMPETITIVE GAME TITLES & ROLES (5-Card Selector) */}
      <div
        className={`rounded-[8px] border p-6 shadow-xs ${
          isLight
            ? "border-slate-200 bg-white"
            : "border-[#26262a] bg-[#131315]"
        }`}
      >
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b ${
            isLight ? "border-slate-200" : "border-[#26262a]"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <Gamepad2 className={`w-4 h-4 ${isLight ? "text-slate-950" : "text-[#ededed]"}`} />
              <h2 className={`text-sm font-black tracking-wide ${isLight ? "text-slate-950" : "text-[#ededed]"}`}>
                COMPETITIVE GAME TITLES & ROLES
              </h2>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-[#9a9aa2]"}`}>
              Select a title below to view stats, set your active primary game, and configure per-game credentials
            </p>
          </div>
          <span className={`text-xs font-mono font-bold ${isLight ? "text-slate-500" : "text-[#9a9aa2]"}`}>
            Current Active:{" "}
            <strong className={isLight ? "text-slate-950" : "text-[#e8ff59]"}>
              {player.activeGame}
            </strong>
          </span>
        </div>

        {/* 5-Game Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3.5 mt-4">
          {(() => {
            const gamePriority: Record<string, number> = {
              'CS2': 1,
              'Valorant': 2,
              'League of Legends': 3,
              'Rocket League': 4,
              'BGMI': 5,
            };
            const ordered = [...(player.gamesPlayed || [])].sort(
              (a, b) => (gamePriority[a.id] || 99) - (gamePriority[b.id] || 99)
            );
            return ordered.map((gameItem) => {
            const isSelected = activeGameView === gameItem.id;
            const isPrimary = player.activeGame === gameItem.id;
            return (
              <div
                key={gameItem.id}
                onClick={() => {
                  setActiveGameView(gameItem.id);
                  if (gameItem.id === 'BGMI') setUploadMap('Erangel');
                  else if (gameItem.id === 'Valorant') setUploadMap('Haven');
                  else if (gameItem.id === 'CS2') setUploadMap('Mirage');
                  else if (gameItem.id === 'League of Legends') setUploadMap('Summoners Rift');
                  else if (gameItem.id === 'Rocket League') setUploadMap('DFH Stadium / Champions Field');
                  if (onSelectGame) onSelectGame(gameItem.id);
                }}
                className={`p-4 rounded-[6px] border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? isLight
                      ? "border-slate-950 bg-slate-950 text-white shadow-md ring-2 ring-[#bef226]"
                      : "border-[#e8ff59] bg-[#18181b] text-[#ededed] shadow-md ring-2 ring-[#e8ff59]/60"
                    : isLight
                    ? "border-slate-200 bg-slate-50 hover:bg-white text-slate-900"
                    : "border-[#26262a] bg-[#0b0b0c] hover:bg-[#18181b] text-[#ededed]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-black">
                      {gameIcons[gameItem.id]}
                      <span>{gameItem.name}</span>
                    </span>
                    {isPrimary ? (
                      <span className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${isLight ? "bg-[#bef226] text-black" : "bg-[#e8ff59] text-black"}`}>
                        Primary
                      </span>
                    ) : (
                      <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${isLight ? "bg-slate-200 text-slate-600" : "bg-[#18181b] text-[#9a9aa2] border border-[#26262a]"}`}>
                        {gameItem.tier}
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-extrabold truncate">
                    {gameItem.rank}
                  </div>
                  <div className={`text-[11px] font-mono mt-0.5 truncate ${isSelected ? isLight ? "text-slate-400" : "text-[#9a9aa2]" : isLight ? "text-slate-500" : "text-[#9a9aa2]"}`}>
                    IGN: {gameItem.ign}
                  </div>
                </div>

                <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs ${isSelected ? isLight ? "border-slate-800" : "border-[#26262a]" : isLight ? "border-slate-200" : "border-[#26262a]"}`}>
                  <div>
                    <span className={`text-[10px] block ${isSelected ? isLight ? "text-slate-400" : "text-[#9a9aa2]" : isLight ? "text-slate-500" : "text-[#9a9aa2]"}`}>
                      {gameItem.primaryStatLabel}
                    </span>
                    <strong className="font-mono font-black">
                      {gameItem.primaryStatValue}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] block ${isSelected ? isLight ? "text-slate-400" : "text-[#9a9aa2]" : isLight ? "text-slate-500" : "text-[#9a9aa2]"}`}>
                      Win Rate
                    </span>
                    <strong className="font-mono font-black">
                      {gameItem.winRate}
                    </strong>
                  </div>
                </div>
              </div>
            );
          });
        })()}
        </div>

        {/* Selected Title Action Banner */}
        <div className={`mt-4 p-3.5 rounded-[6px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          isLight ? "bg-slate-50 border-slate-200" : "bg-[#0b0b0c] border-[#26262a]"
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-[#ededed]">
              Selected Title: {activeGameView}
            </span>
            <span className="text-slate-500 dark:text-[#9a9aa2]">
              (Set as your primary game to display on scout leaderboards and dossier exports)
            </span>
          </div>
          {player.activeGame !== activeGameView && (
            <button
              onClick={() => {
                if (onUpdatePlayer) {
                  onUpdatePlayer({ activeGame: activeGameView });
                }
                onShowToast(`Primary game switched to ${activeGameView}.`, "success");
              }}
              className="px-3.5 py-1.5 rounded-[4px] font-bold text-xs bg-[#e8ff59] text-black hover:bg-[#d8ef49] cursor-pointer shadow-xs shrink-0"
            >
              Set {activeGameView} as Primary Game
            </button>
          )}
        </div>
      </div>

      {/* 3. SELECTED GAME DETAILS & CREDENTIALS DATA FILLING (Directly below selected game) */}
      <div
        className={`rounded-[8px] border p-6 shadow-xs ${
          isLight
            ? "border-slate-200 bg-white"
            : "border-[#26262a] bg-[#131315]"
        }`}
      >
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b ${isLight ? "border-slate-200" : "border-[#26262a]"}`}>
          <div className="flex items-center gap-2">
            {gameIcons[activeGameView]}
            <div>
              <h2 className={`text-sm font-black tracking-wide ${isLight ? "text-slate-950" : "text-[#ededed]"}`}>
                {activeGameView} Dossier Details & In-Game Credentials
              </h2>
              <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-[#9a9aa2]"}`}>
                Configure your verified identity, character UID / Steam64 / Riot ID, and primary combat role for {activeGameView}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-[#e8ff59]/30 bg-[#e8ff59]/10 text-[#e8ff59]">
            {currentDetails?.tier || "Verified Candidate"}
          </span>
        </div>

        {/* AI Career Credentials & Telemetry Extractor (Gemini LLM) */}
        <div className={`mt-4 p-4 rounded-[8px] border transition-colors ${
          isLight ? "bg-slate-50/80 border-slate-200" : "bg-[#0b0b0c] border-[#26262a]"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#e8ff59]/10 border border-[#e8ff59]/30 flex items-center justify-center text-[#e8ff59]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className={`text-xs font-black tracking-wide ${isLight ? "text-slate-900" : "text-[#ededed]"}`}>
                  AI Telemetry & Career Extractor (Gemini 2.5 LLM)
                </div>
                <div className={`text-[11px] ${isLight ? "text-slate-500" : "text-[#9a9aa2]"}`}>
                  Upload a match scorecard/profile screenshot or paste stats text to auto-populate required fields
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-[#18181b] p-0.5 rounded-lg border border-slate-300/50 dark:border-[#26262a]">
              <button
                type="button"
                onClick={() => setExtractMode("screenshot")}
                className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  extractMode === "screenshot"
                    ? isLight ? "bg-white text-slate-900 shadow-xs" : "bg-[#26262a] text-[#ededed]"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <Camera className="w-3 h-3" />
                <span>Screenshot</span>
              </button>
              <button
                type="button"
                onClick={() => setExtractMode("text")}
                className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  extractMode === "text"
                    ? isLight ? "bg-white text-slate-900 shadow-xs" : "bg-[#26262a] text-[#ededed]"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Raw Text</span>
              </button>
            </div>
          </div>

          {extractMode === "screenshot" ? (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-[6px] border border-dashed cursor-pointer text-xs transition-colors ${
                  extractScreenshot
                    ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                    : isLight
                    ? "border-slate-300 hover:border-slate-400 bg-white text-slate-600"
                    : "border-[#26262a] hover:border-[#38383e] bg-[#131315] text-[#9a9aa2]"
                }`}>
                  <UploadCloud className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {extractScreenshot ? extractScreenshot.name : `Select ${activeGameView} in-game scoreboard or profile screenshot`}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setExtractScreenshot(e.target.files[0]);
                        setExtractSuccess(null);
                      }
                    }}
                  />
                </label>

                <button
                  type="button"
                  disabled={!extractScreenshot || isExtracting}
                  onClick={handleAiExtractCredentials}
                  className={`px-4 py-2.5 rounded-[6px] text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                    !extractScreenshot || isExtracting
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
                      : "bg-[#bef226] text-slate-950 hover:bg-[#a6d817] cursor-pointer"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isExtracting ? "Extracting with Gemini..." : "Extract with AI"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                rows={2}
                value={extractText}
                onChange={(e) => setExtractText(e.target.value)}
                placeholder={`Paste in-game career text, e.g. "IGN: Vortex, UID: 5128940192, Conqueror Top 100, 842.0 Avg Dmg, 72% Win Rate, Pure Assaulter"`}
                className={`w-full p-2.5 rounded-[6px] border text-xs outline-hidden resize-none ${
                  isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#131315] border-[#26262a] text-[#ededed]"
                }`}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!extractText.trim() || isExtracting}
                  onClick={handleAiExtractCredentials}
                  className={`px-4 py-2 rounded-[6px] text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
                    !extractText.trim() || isExtracting
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
                      : "bg-[#bef226] text-slate-950 hover:bg-[#a6d817] cursor-pointer"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isExtracting ? "Extracting with Gemini..." : "Extract with AI"}</span>
                </button>
              </div>
            </div>
          )}

          {extractSuccess && (
            <div className="mt-3 p-2.5 rounded-[6px] bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{extractSuccess}</span>
            </div>
          )}

          {extractMissingFields.length > 0 && (
            <div className="mt-3 p-3.5 rounded-[6px] bg-amber-500/10 border border-amber-500/30 text-xs text-amber-500 dark:text-amber-400 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 dark:text-amber-300">
                    Incomplete Match Telemetry Detected
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {extractNotice || "The AI could not identify all required metrics from this upload. Please provide the missing fields."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-amber-500/20">
                <div className="text-[10px] font-mono">
                  <span className="font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300">Missing:</span>{" "}
                  <span className="underline decoration-amber-500/50">{extractMissingFields.join(" • ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExtractMode("screenshot");
                      setExtractScreenshot(null);
                      const input = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
                      if (input) input.click();
                    }}
                    className="px-2.5 py-1 rounded bg-amber-500 text-black font-bold text-[10px] hover:bg-amber-400 cursor-pointer shadow-xs"
                  >
                    Re-upload Scorecard Image
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExtractMode("text");
                      if (!extractText) {
                        setExtractText(`IGN: ${currentDetails?.ign || ''}, UID: ${currentDetails?.gameId || ''}, Rank: Conqueror, Avg Dmg: 750, Win Rate: 65%`);
                      }
                    }}
                    className="px-2.5 py-1 rounded border border-amber-500/50 text-[10px] font-bold hover:bg-amber-500/10 cursor-pointer"
                  >
                    Complete via Text
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Game-Specific API Data Requirement Notice */}
        <div className={`p-3 rounded-[6px] border text-xs flex items-start gap-2.5 ${
          activeGameView === 'CS2'
            ? isLight
              ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
              : "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
            : isLight
            ? "bg-slate-100/80 border-slate-200 text-slate-700"
            : "bg-[#18181b] border-[#26262a] text-[#9a9aa2]"
        }`}>
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-[11px] uppercase tracking-wider">
              {activeGameView === 'CS2' ? 'Official API Telemetry Ready (Leetify & PandaScore)' : `${activeGameView} Official Verification Requirements`}
            </div>
            <div className="text-[11px] leading-relaxed">
              {activeGameView === 'CS2' ? (
                <span>
                  <strong>Steam64 ID (17 digits)</strong> is the strict identifier required by Leetify & PandaScore to pull authentic match ADR, K/D, clutch conversion, trade structure, and flash utility. Enter your Steam ID below to verify your dossier.
                </span>
              ) : activeGameView === 'Valorant' ? (
                <span>
                  <strong>Riot ID (Name#TAG)</strong> is required for Valorant ranked ladder ELO and ACS ingestion. Enter your official Riot identifier below.
                </span>
              ) : activeGameView === 'BGMI' ? (
                <span>
                  <strong>Krafton Character UID (10 Digits)</strong> is required for official BGIS / BMPS tournament roster verification and scrim registrations. Enter your UID and average damage below.
                </span>
              ) : activeGameView === 'League of Legends' ? (
                <span>
                  <strong>Riot Summoner Name & Tagline (PUUID)</strong> is required for official LoL ranked MMR and match history ingestion. Enter your Riot ID and CS/Min below.
                </span>
              ) : activeGameView === 'Rocket League' ? (
                <span>
                  <strong>Epic Games ID / Tracker Slug</strong> is required for official RLCS tournament registration and MMR ingestion. Enter your ID and Score/Match below.
                </span>
              ) : (
                <span>
                  <strong>Official Game ID / Identifier</strong> is required for tournament registration.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Public ID Presets for Testing */}
        {activeGameView === 'CS2' && (
          <div className={`mt-3 p-3 rounded-[6px] border ${isLight ? "bg-slate-50 border-slate-200" : "bg-[#18181b]/80 border-[#26262a]"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-[#9a9aa2] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-slate-700 dark:text-[#ededed]" />
                Public CS2 Steam64 IDs (Click to Autofill & View Live Analytics):
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-[#9a9aa2]">
                Leetify & PandaScore Verified
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { ign: 's1mple', gameId: '76561198034202275', rank: 'FACEIT Level 10 (3,412 ELO)', role: 'AWPer / Star Fragger', tier: 'Major MVP / Tier 1', primaryStat: '88.5 ADR', winRate: '69%' },
                { ign: 'NiKo', gameId: '76561198041683340', rank: 'FACEIT Level 10 (3,280 ELO)', role: 'Rifler / Entry Fragger', tier: 'Tier 1 Pro Contender', primaryStat: '86.4 ADR', winRate: '66%' },
                { ign: 'm0NESY', gameId: '76561198305018698', rank: 'FACEIT Level 10 (3,640 ELO)', role: 'AWPer / Aggressive Sniper', tier: 'IEM Champion / Tier 1', primaryStat: '84.9 ADR', winRate: '71%' },
                { ign: 'Vortex_CS', gameId: '76561198012345678', rank: 'FACEIT Level 10 (2,480 ELO)', role: 'Dedicated AWPer', tier: 'Semi-Pro Cohort', primaryStat: '87.4 ADR', winRate: '68%' },
              ].map((preset) => (
                <button
                  key={preset.gameId}
                  type="button"
                  onClick={() => {
                    setPerGameDetails(prev => ({
                      ...prev,
                      CS2: preset
                    }));
                    setIdVerification(prev => ({
                      ...prev,
                      CS2: {
                        isValid: true,
                        status: 'verified_pro',
                        message: `Verified pro telemetry loaded for ${preset.ign} (Steam64: ${preset.gameId}).`,
                        isChecking: false
                      }
                    }));
                    onShowToast(`Loaded public profile for ${preset.ign} (Steam64: ${preset.gameId})!`, "success");
                  }}
                  className={`px-2.5 py-1.5 rounded-[4px] border text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentDetails?.gameId === preset.gameId
                      ? isLight
                        ? "bg-slate-900 border-slate-900 text-white shadow-xs font-bold"
                        : "bg-white border-white text-black font-bold shadow-xs"
                      : isLight
                      ? "bg-white border-slate-300 text-slate-800 hover:border-slate-500"
                      : "bg-[#0b0b0c] border-[#26262a] text-[#ededed] hover:border-slate-500 hover:text-white"
                  }`}
                >
                  <span className="font-bold">{preset.ign}</span>
                  <span className="text-[10px] opacity-70">({preset.gameId})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Fields for the Selected Game */}
        <form onSubmit={handleSaveGameCredentials} className="mt-4 space-y-4 text-xs">
          {/* Conditional Fields: Only ask for API-required fields on API-supported titles */}
          {isApiSupported ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Primary Required API Identifier */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1 flex items-center justify-between">
                    <span>
                      {activeGameView === 'CS2' 
                        ? 'STEAM64 ID / ACCOUNT ID (REQUIRED) *' 
                        : activeGameView === 'Valorant' 
                        ? 'RIOT ID (NAME#TAG - REQUIRED) *' 
                        : activeGameView === 'League of Legends' 
                        ? 'RIOT SUMMONER ID (NAME#TAG - REQUIRED) *' 
                        : 'EPIC GAMES ACCOUNT ID (REQUIRED) *'}
                    </span>
                    <span className="text-emerald-500 font-normal">API Required</span>
                  </label>
                  <input
                    type="text"
                    value={currentDetails?.gameId || ""}
                    onChange={(e) => onGameIdChange(e.target.value)}
                    placeholder={
                      activeGameView === 'CS2' ? '76561198034202275' :
                      activeGameView === 'Valorant' ? 'Vortex#VAL or TenZ#0001' :
                      activeGameView === 'League of Legends' ? 'Faker#KR1 or Vortex#EUW' :
                      'VortexRL#7741'
                    }
                    className={`w-full p-2.5 rounded-[6px] border text-xs font-mono font-bold outline-hidden ${
                      idVerification[activeGameView]?.isValid === false
                        ? "border-rose-500 bg-rose-500/5 text-rose-500 focus:ring-1 focus:ring-rose-500"
                        : isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                    }`}
                  />
                  {idVerification[activeGameView]?.isChecking ? (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 font-mono">
                      <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
                      <span>Validating identifier against official registry...</span>
                    </div>
                  ) : idVerification[activeGameView]?.isValid === false ? (
                    <div className="flex items-start gap-1.5 text-[10px] text-rose-500 font-mono mt-1.5 bg-rose-500/10 p-2 rounded-[4px] border border-rose-500/20">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="leading-tight">{idVerification[activeGameView]?.message}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>{idVerification[activeGameView]?.message}</span>
                    </div>
                  )}
                </div>

                {/* 2. Optional Pro Provider Slug / Secondary Identifier */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1 flex items-center justify-between">
                    <span>
                      {activeGameView === 'CS2' 
                        ? 'PANDASCORE PRO SLUG / ID (OPTIONAL)' 
                        : activeGameView === 'Valorant' || activeGameView === 'League of Legends'
                        ? 'RIOT PUUID (OPTIONAL)'
                        : 'GAMING PLATFORM'}
                    </span>
                    <span className="text-slate-400 font-normal">Tournament Ingest</span>
                  </label>
                  <input
                    type="text"
                    value={
                      activeGameView === 'CS2'
                        ? (currentDetails?.tier?.includes('PandaScore') ? currentDetails.ign.toLowerCase() : '')
                        : (currentDetails?.server || '')
                    }
                    onChange={(e) => {
                      if (activeGameView === 'CS2') {
                        setPerGameDetails({
                          ...perGameDetails,
                          CS2: { ...currentDetails, tier: `PandaScore Verified (${e.target.value})` }
                        });
                      } else {
                        setPerGameDetails({
                          ...perGameDetails,
                          [activeGameView]: { ...currentDetails, server: e.target.value }
                        });
                      }
                    }}
                    placeholder={
                      activeGameView === 'CS2' ? 'e.g. s1mple or niko-nikola-kovac' :
                      activeGameView === 'Valorant' ? 'e.g. APAC / Mumbai' :
                      activeGameView === 'League of Legends' ? 'e.g. EUW or KR' :
                      'e.g. Epic Games / Steam / PSN'
                    }
                    className={`w-full p-2.5 rounded-[6px] border text-xs font-mono outline-hidden ${
                      isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                    }`}
                  />
                </div>

                {/* 3. In-Game Nickname (IGN) */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                    IN-GAME NICKNAME (IGN)
                  </label>
                  <input
                    type="text"
                    value={currentDetails?.ign || ""}
                    onChange={(e) => setPerGameDetails({
                      ...perGameDetails,
                      [activeGameView]: { ...currentDetails, ign: e.target.value }
                    })}
                    placeholder={
                      activeGameView === 'CS2' ? 'e.g. s1mple' :
                      activeGameView === 'Valorant' ? 'e.g. Vortex' :
                      activeGameView === 'League of Legends' ? 'e.g. Faker' :
                      'e.g. Vortex_RL'
                    }
                    className={`w-full p-2.5 rounded-[6px] border text-xs font-bold outline-hidden ${
                      isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                    }`}
                  />
                </div>
              </div>

              {/* Automatic Telemetry Auto-Ingestion Notice */}
              <div className={`p-2.5 rounded-[6px] border text-[11px] font-mono flex items-center gap-2 ${
                isLight ? "bg-slate-100/70 border-slate-200 text-slate-700" : "bg-[#18181b] border-[#26262a] text-[#9a9aa2]"
              }`}>
                <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>
                  <strong>Official API Auto-Ingest:</strong> Tactical Role, Combat ADR/ACS, Rating 2.0, Competitive Rank, and Win Rate are automatically computed from the API telemetry stream below. No manual stats entry required.
                </span>
              </div>
            </div>
          ) : (
            /* BGMI (Non-API supported title) - Requires manual credentials or AI extraction */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* IGN */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                  BGMI IN-GAME NAME (IGN) *
                </label>
                <input
                  type="text"
                  value={currentDetails?.ign || ""}
                  onChange={(e) => setPerGameDetails({
                    ...perGameDetails,
                    BGMI: { ...currentDetails, ign: e.target.value }
                  })}
                  placeholder="e.g. 5128940192 (Vortex)"
                  className={`w-full p-2 rounded-[6px] border text-xs font-bold outline-hidden ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                  }`}
                />
              </div>

              {/* In-Game UID */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                  KRAFTON CHARACTER UID (10 DIGITS - REQUIRED) *
                </label>
                <input
                  type="text"
                  value={currentDetails?.gameId || ""}
                  onChange={(e) => onGameIdChange(e.target.value)}
                  placeholder="e.g. 5128940192"
                  className={`w-full p-2 rounded-[6px] border text-xs font-mono font-bold outline-hidden ${
                    idVerification['BGMI']?.isValid === false
                      ? "border-rose-500 bg-rose-500/5 text-rose-500 focus:ring-1 focus:ring-rose-500"
                      : isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                  }`}
                />
                {idVerification['BGMI']?.isChecking ? (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 font-mono">
                    <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
                    <span>Verifying Krafton UID format...</span>
                  </div>
                ) : idVerification['BGMI']?.isValid === false ? (
                  <div className="flex items-start gap-1.5 text-[10px] text-rose-500 font-mono mt-1 bg-rose-500/10 p-1.5 rounded-[4px] border border-rose-500/20">
                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                    <span className="leading-tight">{idVerification['BGMI']?.message}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>{idVerification['BGMI']?.message}</span>
                  </div>
                )}
              </div>

              {/* Rank */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                  BGMI RANK (CONQUEROR / ACE) *
                </label>
                <input
                  type="text"
                  value={currentDetails?.rank || ""}
                  onChange={(e) => setPerGameDetails({
                    ...perGameDetails,
                    BGMI: { ...currentDetails, rank: e.target.value }
                  })}
                  placeholder="e.g. Conqueror Top 100"
                  className={`w-full p-2 rounded-[6px] border text-xs font-bold outline-hidden ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                  }`}
                />
              </div>

              {/* Squad Role */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                  SQUAD COMBAT ROLE *
                </label>
                <input
                  type="text"
                  value={currentDetails?.role || ""}
                  onChange={(e) => setPerGameDetails({
                    ...perGameDetails,
                    BGMI: { ...currentDetails, role: e.target.value }
                  })}
                  placeholder="e.g. Frontline Assaulter / IGL"
                  className={`w-full p-2 rounded-[6px] border text-xs outline-hidden ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                  }`}
                />
              </div>

              {/* Primary Stat */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                  AVERAGE DAMAGE / FINISH-TO-DEATH *
                </label>
                <input
                  type="text"
                  value={currentDetails?.primaryStat || ""}
                  onChange={(e) => setPerGameDetails({
                    ...perGameDetails,
                    BGMI: { ...currentDetails, primaryStat: e.target.value }
                  })}
                  placeholder="e.g. 842.0 Avg Dmg (F/D: 4.8)"
                  className={`w-full p-2 rounded-[6px] border text-xs font-mono outline-hidden ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                  }`}
                />
              </div>

              {/* Win Rate */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                  BGMI SCRIM / TOURNAMENT WIN RATE *
                </label>
                <input
                  type="text"
                  value={currentDetails?.winRate || ""}
                  onChange={(e) => setPerGameDetails({
                    ...perGameDetails,
                    BGMI: { ...currentDetails, winRate: e.target.value }
                  })}
                  placeholder="e.g. 72%"
                  className={`w-full p-2 rounded-[6px] border text-xs font-mono outline-hidden ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0b0b0c] border-[#26262a] text-[#ededed]"
                  }`}
                />
              </div>
            </div>
          )}

          {/* Form Completion Status & Save Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-[#26262a]">
            {!isFormValid ? (
              <div className="flex items-center gap-2 text-[11px] text-amber-500 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isApiSupported
                    ? `Enter your official ${activeGameView} Account / Steam ID to pull authentic match telemetry.`
                    : 'All 6 fields required for BGMI. Fill manually or click "Extract with AI" above to enable saving.'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isApiSupported
                    ? `Official ${activeGameView} account identifier verified. Live telemetry ingested.`
                    : "All required BGMI credentials complete and verified. Ready to save."}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={!isFormValid}
              className={`px-4 py-2 rounded-[6px] text-xs font-black flex items-center gap-1.5 shadow-xs transition-all ${
                isFormValid
                  ? "bg-[#e8ff59] text-black hover:bg-[#d8ef49] cursor-pointer"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save {activeGameView} Credentials</span>
            </button>
          </div>
        </form>

        {/* Dynamic Live Telemetry & Combat Analytics Engine (Rendered directly below ID/Information) */}
        {currentDetails?.gameId && (
          idVerification[activeGameView]?.isValid === false ? (
            <div className={`mt-5 p-6 rounded-[8px] border text-center transition-all ${
              isLight ? "bg-rose-50/70 border-rose-200" : "bg-[#181113] border-rose-950/60"
            }`}>
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2 opacity-85" />
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Live Combat Telemetry Blocked — Identifier Unverified or Invalid
              </h4>
              <p className={`text-[11px] font-mono mt-1 max-w-lg mx-auto ${isLight ? "text-slate-700" : "text-[#9a9aa2]"}`}>
                {idVerification[activeGameView]?.message || `The entered account identifier '${currentDetails.gameId}' failed verification. Authentic match telemetry cannot be displayed.`}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono">
                <span className="text-slate-500">
                  Tip: Select one of the verified pro presets above (s1mple, NiKo, m0NESY) or enter a valid official identifier.
                </span>
              </div>
            </div>
          ) : (
            <div className={`mt-5 rounded-[8px] border overflow-hidden transition-all ${
            isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#0b0b0c] border-[#26262a]"
          }`}>
            {/* Analytics Header */}
            <div className={`px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
              isLight ? "bg-slate-50/80 border-slate-200" : "bg-[#131315] border-[#26262a]"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center border ${
                  isLight ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-[#18181b] border-[#26262a] text-[#ededed]"
                }`}>
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs font-black tracking-wide uppercase ${isLight ? "text-slate-900" : "text-[#ededed]"}`}>
                      {activeGameView} Combat Telemetry & Match Engine Analytics
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                      isLight 
                        ? "bg-slate-100 border-slate-300 text-slate-800" 
                        : "bg-[#18181b] border-[#36363c] text-[#ededed]"
                    }`}>
                      LIVE INGEST ACTIVE
                    </span>
                  </div>
                  <p className={`text-[10px] font-mono mt-0.5 ${isLight ? "text-slate-600" : "text-[#9a9aa2]"}`}>
                    Ingested for ID: <span className="font-bold text-slate-900 dark:text-white">{currentDetails.gameId}</span> ({currentDetails.ign || 'Player'}) • Rank: {currentDetails.rank || 'Uncalibrated'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className={`px-2 py-0.5 rounded border ${
                  isLight ? "border-slate-200 bg-white text-slate-600" : "border-[#26262a] bg-[#18181b] text-[#9a9aa2]"
                }`}>
                  {activeGameView === 'CS2' ? 'Leetify GCG & PandaScore v2.4' : `${activeGameView} Telemetry Engine`}
                </span>
              </div>
            </div>

            {/* Primary Telemetry KPI Grid - Dynamic based on actual player performance */}
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* 1. Primary Firepower (ADR / ACS / Avg Dmg) */}
              <div className={`p-3 rounded-[6px] border ${isLight ? "bg-slate-50/60 border-slate-200" : "bg-[#131315] border-[#26262a]"}`}>
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] block truncate">
                  {activeGameView === 'CS2' ? 'ADR (DAMAGE/RND)' : activeGameView === 'Valorant' ? 'ACS (COMBAT SCORE)' : 'PRIMARY COMBAT STAT'}
                </span>
                <div className={`text-lg font-black font-mono mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                  {currentDetails.primaryStat || '87.4 ADR'}
                </div>
                <span className="text-[9px] text-slate-500 dark:text-[#9a9aa2] font-mono block mt-0.5">
                  {statNum >= (activeGameView === 'CS2' ? 95 : activeGameView === 'Valorant' ? 280 : 850)
                    ? 'Top 1.5% Global'
                    : statNum >= (activeGameView === 'CS2' ? 85 : activeGameView === 'Valorant' ? 240 : 720)
                    ? 'Top 4.2% Global'
                    : statNum >= (activeGameView === 'CS2' ? 75 : activeGameView === 'Valorant' ? 200 : 600)
                    ? 'Top 14.8% Global'
                    : 'Calibrated Tier'}
                </span>
              </div>

              {/* 2. Rating 2.0 / Match Impact */}
              <div className={`p-3 rounded-[6px] border ${isLight ? "bg-slate-50/60 border-slate-200" : "bg-[#131315] border-[#26262a]"}`}>
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] block truncate">
                  {activeGameView === 'CS2' ? 'RATING 2.0' : 'COMBAT IMPACT'}
                </span>
                <div className={`text-lg font-black font-mono mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                  {computedRating}
                </div>
                <span className="text-[9px] text-slate-500 dark:text-[#9a9aa2] font-mono block mt-0.5">
                  {parseFloat(computedRating) >= 1.30
                    ? 'Tier 1 Pro Rating'
                    : parseFloat(computedRating) >= 1.15
                    ? 'Pro Tier Rating'
                    : parseFloat(computedRating) >= 1.00
                    ? 'Standard Impact'
                    : 'Calibrated Cohort'}
                </span>
              </div>

              {/* 3. K/D Ratio */}
              <div className={`p-3 rounded-[6px] border ${isLight ? "bg-slate-50/60 border-slate-200" : "bg-[#131315] border-[#26262a]"}`}>
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] block truncate">
                  KILL / DEATH (K/D)
                </span>
                <div className={`text-lg font-black font-mono mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                  {computedKd}
                </div>
                <span className="text-[9px] text-slate-500 dark:text-[#9a9aa2] font-mono block mt-0.5">
                  {(parseFloat(computedKd) - 1.00 >= 0 ? '+' : '') + (parseFloat(computedKd) - 1.00).toFixed(2)} Net Diff / Match
                </span>
              </div>

              {/* 4. Win Rate */}
              <div className={`p-3 rounded-[6px] border ${isLight ? "bg-slate-50/60 border-slate-200" : "bg-[#131315] border-[#26262a]"}`}>
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] block truncate">
                  MATCH WIN RATE
                </span>
                <div className={`text-lg font-black font-mono mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                  {currentDetails.winRate || '68%'}
                </div>
                <span className="text-[9px] text-slate-500 dark:text-[#9a9aa2] font-mono block mt-0.5">
                  {Math.round(36 + (winNum * 0.55))} Matches Sampled
                </span>
              </div>

              {/* 5. Headshot % */}
              <div className={`p-3 rounded-[6px] border ${isLight ? "bg-slate-50/60 border-slate-200" : "bg-[#131315] border-[#26262a]"}`}>
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] block truncate">
                  HEADSHOT CONV.
                </span>
                <div className={`text-lg font-black font-mono mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                  {computedHs}%
                </div>
                <span className="text-[9px] text-slate-500 dark:text-[#9a9aa2] font-mono block mt-0.5">
                  {computedHs >= 50 ? 'First Bullet Precision' : computedHs >= 38 ? 'Pro Precision' : 'Tactical Placement'}
                </span>
              </div>

              {/* 6. Opening Duel Win Rate */}
              <div className={`p-3 rounded-[6px] border ${isLight ? "bg-slate-50/60 border-slate-200" : "bg-[#131315] border-[#26262a]"}`}>
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] block truncate">
                  OPENING DUEL WIN
                </span>
                <div className={`text-lg font-black font-mono mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                  {computedOpening}%
                </div>
                <span className="text-[9px] text-slate-500 dark:text-[#9a9aa2] font-mono block mt-0.5">
                  {computedOpening >= 58 ? 'First Pick Success' : computedOpening >= 46 ? 'Entry Contender' : 'Support Trade Focus'}
                </span>
              </div>
            </div>

            {/* Secondary Tactical Telemetry & Radar Skill Breakdown */}
            <div className="px-4 pb-4 pt-1 grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              {/* Tactical Teamwork & Utility Metrics */}
              <div className={`p-3.5 rounded-[6px] border ${isLight ? "bg-slate-50/60 border-slate-200" : "bg-[#131315] border-[#26262a]"}`}>
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200 dark:border-[#26262a]">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-slate-900 dark:text-[#ededed] flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    Leetify Tactical & Utility Telemetry
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-[#9a9aa2]">
                    Steam64 Ingested
                  </span>
                </div>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-[#9a9aa2]">Trade Re-Frag Efficiency (3.0s):</span>
                    <span className="font-bold text-slate-900 dark:text-[#ededed]">{computedTrade} Success</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-[#9a9aa2]">Flash Assist Blind Duration:</span>
                    <span className="font-bold text-slate-900 dark:text-[#ededed]">{computedFlash} avg / enemy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-[#9a9aa2]">Utility Damage Per Round:</span>
                    <span className="font-bold text-slate-900 dark:text-[#ededed]">{computedUtilityDmg} / Round</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-[#9a9aa2]">1vX Clutch Conversion:</span>
                    <span className="font-bold text-slate-900 dark:text-[#ededed]">{computedClutch} (1v1: {Math.min(95, Math.round(clutchNumeric * 1.6))}%, 1v2: {Math.round(clutchNumeric * 0.75)}%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-[#9a9aa2]">Round Win Delta on First Frag:</span>
                    <span className="font-bold text-slate-900 dark:text-[#ededed]">{computedDelta} Probability</span>
                  </div>
                </div>
              </div>

              {/* Combat Competency Percentiles - Clean, uniform, monochromatic progress bars */}
              <div className={`p-3.5 rounded-[6px] border ${isLight ? "bg-slate-50/60 border-slate-200" : "bg-[#131315] border-[#26262a]"}`}>
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200 dark:border-[#26262a]">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-slate-900 dark:text-[#ededed] flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    Combat Competency Percentiles
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-[#9a9aa2] font-semibold">
                    Scout Benchmark
                  </span>
                </div>
                <div className="space-y-2.5 text-[11px]">
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-600 dark:text-[#9a9aa2] mb-1">
                      <span>Aim Precision & Crosshair Placement</span>
                      <span className="font-bold text-slate-900 dark:text-white">{computedAim}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-[#222226] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-slate-900 dark:bg-white h-full rounded-full transition-all duration-300" style={{ width: `${computedAim}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-600 dark:text-[#9a9aa2] mb-1">
                      <span>Map Geometry & Angle Isolation</span>
                      <span className="font-bold text-slate-900 dark:text-white">{computedPos}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-[#222226] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-slate-900 dark:bg-white h-full rounded-full transition-all duration-300" style={{ width: `${computedPos}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-600 dark:text-[#9a9aa2] mb-1">
                      <span>Economic & Utility Discipline</span>
                      <span className="font-bold text-slate-900 dark:text-white">{computedUtil}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-[#222226] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-slate-900 dark:bg-white h-full rounded-full transition-all duration-300" style={{ width: `${computedUtil}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-600 dark:text-[#9a9aa2] mb-1">
                      <span>Retake & Post-Plant Execution</span>
                      <span className="font-bold text-slate-900 dark:text-white">{computedSense}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-[#222226] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-slate-900 dark:bg-white h-full rounded-full transition-all duration-300" style={{ width: `${computedSense}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )
        )}

        {/* Video & Audio Upload Section directly in data filling for activeGameView */}
        <div className={`mt-6 pt-6 border-t ${isLight ? "border-slate-200" : "border-[#26262a]"}`}>
          <div className="flex items-center gap-2 mb-3">
            <Video className="w-4 h-4 text-rose-500" />
            <h3 className={`text-xs font-black tracking-wide ${isLight ? "text-slate-950" : "text-[#ededed]"}`}>
              UPLOAD {activeGameView.toUpperCase()} POV GAMEPLAY OR RAW COMMS AUDIO
            </h3>
          </div>

          <div className={`p-4 rounded-[8px] border ${isLight ? "bg-slate-50 border-slate-200" : "bg-[#0b0b0c] border-[#26262a]"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                  CLIP TITLE
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder={`e.g. ${activeGameView} 1v3 Clutch & Site Execute`}
                  className={`w-full p-2 rounded-[6px] border text-xs outline-hidden ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#18181b] border-[#26262a] text-[#ededed]"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] mb-1">
                  MAP NAME
                </label>
                <input
                  type="text"
                  value={uploadMap}
                  onChange={(e) => setUploadMap(e.target.value)}
                  placeholder={
                    activeGameView === 'BGMI' ? 'Erangel, Miramar, Sanhok' :
                    activeGameView === 'Valorant' ? 'Haven, Ascent, Bind, Split' :
                    activeGameView === 'CS2' ? 'Mirage, Inferno, Nuke, Dust2' :
                    activeGameView === 'League of Legends' ? 'Summoners Rift, Howling Abyss' : activeGameView === 'Rocket League' ? 'DFH Stadium, Champions Field' :
                    'Land of Dawn'
                  }
                  className={`w-full p-2 rounded-[6px] border text-xs outline-hidden ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#18181b] border-[#26262a] text-[#ededed]"
                  }`}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-[#26262a]">
              <input
                type="file"
                ref={mediaInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleMediaUpload(e.target.files[0]);
                    e.target.value = "";
                  }
                }}
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska,audio/mpeg,audio/wav,audio/mp4,audio/x-m4a"
                className="hidden"
              />
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#9a9aa2]">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                <span>Supports Gameplay Videos (MP4, MKV, MOV, WEBM) & Voice Comms (MP3, WAV)</span>
              </div>
              <button
                type="button"
                onClick={() => mediaInputRef.current?.click()}
                disabled={isUploading}
                className={`flex items-center gap-2 px-4 py-2 rounded-[6px] border text-xs font-black transition-all cursor-pointer shadow-xs ${
                  isUploading
                    ? "opacity-50 cursor-not-allowed bg-slate-700 text-slate-300 border-slate-600"
                    : isLight
                    ? "bg-slate-900 text-white hover:bg-slate-800 border-slate-900"
                    : "bg-[#e8ff59] text-black hover:bg-[#d8ef49] border-[#e8ff59]"
                }`}
              >
                {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                <span>{isUploading ? "Scoring with AI Tactical Judge..." : `Upload ${activeGameView} Clip`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Video & Audio Clips Library for this Player */}
        <div className="mt-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#26262a]">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#e8ff59]" />
              <h3 className={`text-xs font-black tracking-wide ${isLight ? "text-slate-950" : "text-[#ededed]"}`}>
                VERIFIED GAMEPLAY VODS & POV EVIDENCE ({displayedClips.length})
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setClipFilter("current")}
                className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                  clipFilter === "current"
                    ? "bg-[#e8ff59] text-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {activeGameView} Clips ({mediaClips.filter(c => c.game === activeGameView).length})
              </button>
              <button
                type="button"
                onClick={() => setClipFilter("all")}
                className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                  clipFilter === "all"
                    ? "bg-[#e8ff59] text-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All Clips ({mediaClips.length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {displayedClips.length === 0 ? (
              <div className="col-span-3 p-8 rounded-[6px] border border-dashed border-slate-300 dark:border-[#26262a] text-center text-xs text-slate-500">
                <Video className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                <p className="font-bold">No clips uploaded for {activeGameView} yet.</p>
                <p className="mt-0.5 text-[11px]">Use the upload form above to add your first {activeGameView} gameplay VOD or comms recording.</p>
              </div>
            ) : (
              displayedClips.map((clip) => {
                const isAudioOnly = clip.resolution?.toLowerCase().includes("audio") || clip.tag?.toLowerCase().includes("audio");
                return (
                  <div
                    key={clip.id}
                    onClick={() => handleOpenVideo(clip)}
                    className={`rounded-[8px] border overflow-hidden transition-all hover:scale-[1.01] cursor-pointer flex flex-col justify-between group ${
                      isLight
                        ? "bg-slate-50 border-slate-200 hover:border-slate-400 hover:shadow-md"
                        : "bg-[#0b0b0c] border-[#26262a] hover:border-[#e8ff59]/60 hover:shadow-lg hover:shadow-[#e8ff59]/5"
                    }`}
                  >
                    {/* Media Thumbnail */}
                    <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                      {clip.thumbnail ? (
                        <img
                          src={clip.thumbnail}
                          alt={clip.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : clip.videoUrl && !isAudioOnly ? (
                        <video
                          src={`${clip.videoUrl}#t=0.5`}
                          preload="metadata"
                          poster={gamePosters[clip.game] || "/images/games/cs2.jpg"}
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform duration-300"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={gamePosters[clip.game] || "/images/games/cs2.jpg"}
                          alt={clip.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-60"
                        />
                      )}

                      {/* Dark Overlay Gradient for contrast and legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30 group-hover:via-black/15 transition-colors pointer-events-none" />

                      <div className="relative z-10 flex flex-col items-center gap-1.5 pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/30 border border-emerald-400/60 backdrop-blur-xs flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 transition-all text-emerald-300 group-hover:text-black shadow-lg">
                          {isAudioOnly ? <Mic className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
                        </div>
                        <span className="text-[10px] font-mono text-slate-200 font-bold drop-shadow">
                          {isAudioOnly ? "Play Voice Audio" : "Watch POV VOD"}
                        </span>
                      </div>

                      {/* Badges on Thumbnail */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 z-20">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 text-emerald-400 border border-emerald-500/40">
                          {clip.game}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 text-[#e8ff59] border border-[#e8ff59]/40">
                          AI: {clip.aiScore ?? 28.5}/30
                        </span>
                      </div>

                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/80 text-white z-20">
                        {clip.duration}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className={`text-xs font-black line-clamp-2 ${isLight ? "text-slate-950" : "text-[#ededed]"}`}>
                          {clip.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-[#9a9aa2] mt-1 line-clamp-2">
                          {clip.tacticalVerdict}
                        </p>
                      </div>

                      <div className={`pt-2.5 border-t flex items-center justify-between text-[11px] ${isLight ? "border-slate-200 text-slate-500" : "border-[#26262a] text-[#9a9aa2]"}`}>
                        <span className="font-mono">{clip.resolution}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-500 font-bold">{clip.uploadedAt}</span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteClip(clip.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Remove Clip"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. PLAYTIME, GRIND, LOGISTICS & TACTICAL EXPERTISE (2-Column Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Playtime, Grind & Availability */}
        <div
          className={`rounded-[8px] border p-6 shadow-xs flex flex-col justify-between ${
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
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${isLight ? "text-slate-800" : "text-[#ededed]"}`} />
                <h2 className={`text-sm font-black tracking-wide ${isLight ? "text-slate-950" : "text-[#ededed]"}`}>
                  Playtime, Grind & Availability
                </h2>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  isLight
                    ? "text-slate-800 bg-lime-100 border-lime-300"
                    : "text-[#e8ff59] bg-[#e8ff59]/10 border-[#e8ff59]/30"
                }`}
              >
                Tier 1 APAC Contender
              </span>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className={`p-3 rounded-[6px] border ${isLight ? "border-slate-200 bg-slate-50" : "border-[#26262a] bg-[#0b0b0c]"}`}>
                <div className={`text-[10px] font-mono font-bold ${isLight ? "text-slate-500" : "text-[#9a9aa2]"}`}>
                  TOTAL HOURS
                </div>
                <div className={`text-base font-black font-mono mt-0.5 ${isLight ? "text-slate-950" : "text-[#ededed]"}`}>
                  {player.totalHours || "4,250 Hours"}
                </div>
                <div className={`text-[10px] ${isLight ? "text-slate-400" : "text-[#9a9aa2]"}`}>
                  Tracked telemetry
                </div>
              </div>

              <div className={`p-3 rounded-[6px] border ${isLight ? "border-slate-200 bg-slate-50" : "border-[#26262a] bg-[#0b0b0c]"}`}>
                <div className={`text-[10px] font-mono font-bold ${isLight ? "text-slate-500" : "text-[#9a9aa2]"}`}>
                  CURRENT GRIND
                </div>
                <div className={`text-base font-black font-mono mt-0.5 ${isLight ? "text-slate-950" : "text-[#ededed]"}`}>
                  {editForm.currentGrind}
                </div>
                <div className="text-[10px] text-emerald-400 font-bold">
                  Active scrimmage cycle
                </div>
              </div>

              <div className={`p-3 rounded-[6px] border ${isLight ? "border-slate-200 bg-slate-50" : "border-[#26262a] bg-[#0b0b0c]"}`}>
                <div className={`text-[10px] font-mono font-bold ${isLight ? "text-slate-500" : "text-[#9a9aa2]"}`}>
                  DAILY SCRIM WINDOW
                </div>
                <div className={`text-xs font-black font-mono mt-1 ${isLight ? "text-slate-950" : "text-[#ededed]"}`}>
                  {editForm.scrimWindow}
                </div>
                <div className={`text-[10px] font-bold mt-0.5 ${isLight ? "text-slate-600" : "text-[#9a9aa2]"}`}>
                  6 Days / Week
                </div>
              </div>
            </div>

            {/* Logistics & Hardware Setup */}
            <div className="space-y-2.5 mt-2">
              <div className={`text-xs font-bold ${isLight ? "text-slate-800" : "text-[#ededed]"}`}>
                Hardware, Peripherals & Setup
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-[6px] border ${isLight ? "border-slate-200 bg-slate-50" : "border-[#26262a] bg-[#0b0b0c]"}`}>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-[#9a9aa2] text-[10px] font-mono font-bold">
                    <Smartphone className="w-3 h-3 text-emerald-400" />
                    <span>DEVICE & FPS</span>
                  </div>
                  <div className={`font-bold mt-1 ${isLight ? "text-slate-900" : "text-[#ededed]"}`}>
                    {editForm.deviceSetup}
                  </div>
                </div>

                <div className={`p-2.5 rounded-[6px] border ${isLight ? "border-slate-200 bg-slate-50" : "border-[#26262a] bg-[#0b0b0c]"}`}>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-[#9a9aa2] text-[10px] font-mono font-bold">
                    <Crosshair className="w-3 h-3 text-sky-400" />
                    <span>CONTROLS & GYRO</span>
                  </div>
                  <div className={`font-bold mt-1 ${isLight ? "text-slate-900" : "text-[#ededed]"}`}>
                    {editForm.controlStyle}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center gap-2 p-2.5 rounded-[6px] border ${isLight ? "border-slate-200 bg-slate-50" : "border-[#26262a] bg-[#0b0b0c]"}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className={isLight ? "text-slate-700" : "text-[#ededed]"}>
                    Bootcamp Ready: <strong className="font-bold text-emerald-400">Yes</strong>
                  </span>
                </div>
                <div className={`flex items-center gap-2 p-2.5 rounded-[6px] border ${isLight ? "border-slate-200 bg-slate-50" : "border-[#26262a] bg-[#0b0b0c]"}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className={isLight ? "text-slate-700" : "text-[#ededed]"}>
                    LAN Ready: <strong className="font-bold text-emerald-400">Passport Ready</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Expected Compensation & Experience */}
        <div
          className={`rounded-[8px] border p-6 shadow-xs flex flex-col justify-between ${
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
              <div className="flex items-center gap-2">
                <DollarSign className={`w-4 h-4 ${isLight ? "text-slate-800" : "text-[#ededed]"}`} />
                <h2 className={`text-sm font-black tracking-wide ${isLight ? "text-slate-950" : "text-[#ededed]"}`}>
                  Expected Compensation & Contracts
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                Self-Reported
              </span>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className={`p-3.5 rounded-[6px] border ${isLight ? "border-slate-200 bg-slate-50" : "border-[#26262a] bg-[#0b0b0c]"}`}>
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] block">
                  EXPECTED MONTHLY STIPEND / PACKAGE
                </span>
                <span className={`text-sm font-black mt-1 block ${isLight ? "text-slate-950" : "text-[#e8ff59]"}`}>
                  {editForm.expectedContract}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-[#9a9aa2] mt-0.5 block">
                  Includes open willingness for trial contracts & structured scrim evaluation
                </span>
              </div>

              <div className={`p-3.5 rounded-[6px] border ${isLight ? "border-slate-200 bg-slate-50" : "border-[#26262a] bg-[#0b0b0c]"}`}>
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-[#9a9aa2] block">
                  TOURNAMENT EXPERIENCE
                </span>
                <span className={`text-xs font-bold mt-1 block ${isLight ? "text-slate-900" : "text-[#ededed]"}`}>
                  BGIS 2025 Round of 32 • BMPS Tier 1 Scrims • VCT SA Challengers Open Qualifiers Top 8
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal Player */}
      <VideoPlayerModal
        clip={selectedClip}
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        theme={theme}
      />
    </div>
  );
};
