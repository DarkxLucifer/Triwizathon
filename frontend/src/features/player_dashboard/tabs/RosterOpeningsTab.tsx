"use client";

import React, { useState, useRef } from "react";
import { 
  AlertTriangle,
  Globe,
  Briefcase, 
  Search, 
  Filter, 
  Plus, 
  Send, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  ChevronRight, 
  X, 
  Crosshair, 
  Shield, 
  Flame, 
  Swords, 
  Zap,
  Users,
  Award,
  DollarSign,
  MessageSquare,
  Sparkles,
  Check,
  Video,
  Play,
  Heart,
  Eye,
  Share2,
  Tag,
  Target,
  Bomb,
  Radio,
  SlidersHorizontal,
  Building2,
  Calendar,
  Gamepad,
  Phone,
  Monitor,
  Trophy,
  Upload,
  FileVideo,
  Film
} from "lucide-react";
import { 
  RosterOpening, 
  RoleApplication, 
  GameplayPost, 
  GameType, 
  PlayerProfile,
  GameProfile,
} from "@/types/dashboard";

interface RosterOpeningsTabProps {
  player: PlayerProfile;
  openings: RosterOpening[];
  applications: RoleApplication[];
  gameplayPosts: GameplayPost[];
  onUpdateGameProfile?: (updatedGame: GameProfile) => void;
  onApply: (
    opening: RosterOpening,
    formData: {
      gameUid: string;
      experienceYears: number;
      experienceMonths: number;
      currentRank: string;
      primaryAgentOrWeapon: string;
      playerAge: string;
      locationCity: string;
      discordContact: string;
      phoneContact: string;
      scrimAvailability: string;
      hardwareSetup: string;
      pastTournaments: string;
      bootcampReady: boolean;
      message: string;
    }
  ) => void;
  onPostGameplay: (newPost: Omit<GameplayPost, "id" | "postedAgo" | "likesCount" | "viewsCount">) => void;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
  theme?: 'dark' | 'light';
  initialSubTab?: 'org-roles' | 'player-gameplays' | 'my-applications';
}

const gameIcons: Record<GameType, React.ReactNode> = {
  "CS2": <Zap className="w-3.5 h-3.5 text-emerald-600" />,
  "Valorant": <Crosshair className="w-3.5 h-3.5 text-rose-500" />,
  "League of Legends": <Swords className="w-3.5 h-3.5 text-cyan-600" />,
  "Rocket League": <Flame className="w-3.5 h-3.5 text-amber-500" />,
  "BGMI": <Shield className="w-3.5 h-3.5 text-amber-600" />,
  "General": <Globe className="w-3.5 h-3.5 text-indigo-400" />,
};

type SkillCategory = "All" | "Sniper" | "Bomber" | "Entry Fragger" | "IGL" | "Assaulter" | "Rusher" | "Support";

const skillBadges: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  "Sniper": { label: "Sniper / Marksman", icon: <Target className="w-3.5 h-3.5" />, color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  "Bomber": { label: "Bomber / Spike Specialist", icon: <Bomb className="w-3.5 h-3.5" />, color: "bg-amber-50 text-amber-800 border-amber-200" },
  "Entry Fragger": { label: "Entry Fragger", icon: <Zap className="w-3.5 h-3.5" />, color: "bg-rose-50 text-rose-800 border-rose-200" },
  "IGL": { label: "IGL / Tactician", icon: <Radio className="w-3.5 h-3.5" />, color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  "Assaulter": { label: "Assaulter", icon: <Shield className="w-3.5 h-3.5" />, color: "bg-orange-50 text-orange-800 border-orange-200" },
  "Rusher": { label: "Rusher", icon: <Flame className="w-3.5 h-3.5" />, color: "bg-red-50 text-red-800 border-red-200" },
  "Support": { label: "Support / Smokes", icon: <Sparkles className="w-3.5 h-3.5" />, color: "bg-purple-50 text-purple-800 border-purple-200" },
};

// Helper for game-specific UID label & placeholder
const getGameUidConfig = (game: GameType) => {
  switch (game) {
    case "General":
      return {
        label: "Primary Competitive Handle / Platform ID *",
        placeholder: "e.g., Vortex or Player#0001",
        hint: "Your primary multi-title handle used across competitive platforms",
      };
    case "Valorant":
      return {
        label: "Riot ID & Tagline *",
        placeholder: "e.g., Vortex#VAL or Player#8842",
        hint: "Your official Riot identifier used for VCT tournament check-ins",
      };
    case "BGMI":
      return {
        label: "BGMI Character UID (10 Digits) *",
        placeholder: "e.g., 5128940192",
        hint: "Your numeric in-game character ID used for Krafton official roster verify",
      };
    case "League of Legends":
      return {
        label: "Riot Summoner Name / Tagline *",
        placeholder: "e.g., Faker#KR1 or Vortex#EUW",
        hint: "Your official Riot identifier used for LoL ranked MMR and tournament check-in",
      };
    case "Rocket League":
      return {
        label: "Epic Games / Tracker ID *",
        placeholder: "e.g., Vortex_RL or EpicAccountID",
        hint: "Your official Epic/Psyonix ID used for RLCS circuit rosters",
      };
    case "CS2":
      return {
        label: "Steam64 ID or FACEIT Profile URL *",
        placeholder: "e.g., steamcommunity.com/id/vortex or 76561198000000000",
        hint: "Your verified Steam profile or FACEIT Level 10 link",
      };
    default:
      return {
        label: "In-Game UID / Identifier *",
        placeholder: "e.g., Player#1234",
        hint: "Your official competitive identifier",
      };
  }
};

// Validation helper to determine if player's game profile has completed required in-game UID and telemetry
export function checkGameProfileStatus(player: PlayerProfile, game: GameType | string): {
  isComplete: boolean;
  gameProfile?: GameProfile;
  missingFields: string[];
  reason: string;
} {
  if (game === 'General') {
    const hasBasicInfo = !!(player.name && player.tag);
    const hasAnyGame = player.gamesPlayed && player.gamesPlayed.length > 0;
    if (!hasBasicInfo || !hasAnyGame) {
      return {
        isComplete: false,
        missingFields: ['General Player Dossier Handle', 'At least 1 Active Game Title'],
        reason: 'Your general player dossier is incomplete. Please configure your competitive handle and at least one active game title.',
      };
    }
    return { isComplete: true, missingFields: [], reason: '' };
  }

  const norm = (game || '').toLowerCase().trim();
  const matched = player.gamesPlayed?.find(g => {
    const gId = (g.id || '').toLowerCase();
    const gName = (g.name || '').toLowerCase();
    return gId === norm || gName === norm ||
      (norm.includes('cs2') && (gId.includes('cs2') || gName.includes('cs2'))) ||
      (norm.includes('counter-strike') && (gId.includes('cs2') || gName.includes('cs2'))) ||
      (norm.includes('valorant') && (gId.includes('valorant') || gName.includes('valorant'))) ||
      (norm.includes('league') && (gId.includes('league') || gName.includes('league'))) ||
      (norm.includes('rocket') && (gId.includes('rocket') || gName.includes('rocket'))) ||
      (norm.includes('bgmi') && (gId.includes('bgmi') || gName.includes('bgmi')));
  });

  const missing: string[] = [];

  if (!matched) {
    missing.push(`Verified In-Game UID / Account for ${game}`);
    missing.push(`Competitive Rank / ELO for ${game}`);
    missing.push(`Match Engine Telemetry (ADR / K/D / FitScore)`);
    return {
      isComplete: false,
      missingFields: missing,
      reason: `You have not added or configured ${game} in your player dossier.`,
    };
  }

  const ign = (matched.ign || '').trim().toLowerCase();
  if (!ign || ign === 'unlinked' || ign === 'not configured' || ign === 'pending' || ign === 'none') {
    missing.push(`Verified In-Game UID for ${game}`);
  }

  const rank = (matched.rank || '').trim().toLowerCase();
  if (!rank || rank === 'unranked' || rank === 'pending calibration' || rank === 'uncalibrated') {
    missing.push(`Competitive Rank / ELO for ${game}`);
  }

  if (!matched.matchesSampled || matched.matchesSampled === 0 || !matched.fitScore || matched.fitScore === 0) {
    missing.push(`Match Telemetry Ingestion for ${game}`);
  }

  if (missing.length > 0) {
    return {
      isComplete: false,
      gameProfile: matched,
      missingFields: missing,
      reason: `Your ${game} profile is missing required competitive telemetry.`,
    };
  }

  return {
    isComplete: true,
    gameProfile: matched,
    missingFields: [],
    reason: '',
  };
}

export const RosterOpeningsTab: React.FC<RosterOpeningsTabProps> = ({
  player,
  openings,
  applications,
  gameplayPosts,
  onApply,
  onUpdateGameProfile,
  onPostGameplay,
  onShowToast,
  theme = 'dark',
  initialSubTab,
}) => {
  const isLight = theme === 'light';
  const [activeSubTab, setActiveSubTab] = useState<"org-roles" | "player-gameplays" | "my-applications">(initialSubTab || "org-roles");

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>("All");
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<SkillCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>("All");

  // Liked posts local state
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Modal States
  const [applyingOpening, setApplyingOpening] = useState<RosterOpening | null>(null);
  const [isPostGameplayOpen, setIsPostGameplayOpen] = useState(false);

  // Incomplete Game Profile Warning Modal State
  const [incompleteWarning, setIncompleteWarning] = useState<{
    opening: RosterOpening;
    game: string;
    missingFields: string[];
    reason: string;
  } | null>(null);

  // Quick Complete Game Profile Modal State
  const [quickCompleteOpening, setQuickCompleteOpening] = useState<RosterOpening | null>(null);
  const [quickUid, setQuickUid] = useState("");
  const [quickRank, setQuickRank] = useState("");
  const [quickRole, setQuickRole] = useState("");
  const [quickMatches, setQuickMatches] = useState(52);
  const [quickKd, setQuickKd] = useState("1.34");
  const [quickStatValue, setQuickStatValue] = useState("88.4");
  const [quickFitScore, setQuickFitScore] = useState(88.5);

  // Apply Form State with detailed Player Fields
  const [applyGameUid, setApplyGameUid] = useState("");
  const [applyExpYears, setApplyExpYears] = useState(2);
  const [applyExpMonths, setApplyExpMonths] = useState(6);
  const [applyCurrentRank, setApplyCurrentRank] = useState("");
  const [applyPrimaryAgentWeapon, setApplyPrimaryAgentWeapon] = useState("");
  const [applyAge, setApplyAge] = useState("19");
  const [applyCity, setApplyCity] = useState("Pune, India");
  const [applyDiscord, setApplyDiscord] = useState(player.discord);
  const [applyPhone, setApplyPhone] = useState(player.phone);
  const [applyScrimTimes, setApplyScrimTimes] = useState(player.scrimWindow);
  const [applyHardware, setApplyHardware] = useState(player.hardwareSetup);
  const [applyPastTournaments, setApplyPastTournaments] = useState(
    player.notableTournament ? `${player.notableTournament.name} (${player.notableTournament.finish})` : "Tier 1/2 South Asia Circuit"
  );
  const [applyBootcampReady, setApplyBootcampReady] = useState(player.bootcampReady);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyConsent, setApplyConsent] = useState(true);
  const [isSubmittingApply, setIsSubmittingApply] = useState(false);

  // Post Gameplay Form State
  const [postTitle, setPostTitle] = useState("");
  const [postGame, setPostGame] = useState<GameType>(player.activeGame);
  const [postSkillCategory, setPostSkillCategory] = useState<SkillCategory>("Sniper");
  const [postSkillTags, setPostSkillTags] = useState("Sniper, AWM Reaction, 1v3 Clutch");
  const [postMatchContext, setPostMatchContext] = useState("South Asia Tournament • Map 3 Clutch");
  const [postKeyStats, setPostKeyStats] = useState("3 Kills • 180ms Reaction • 100% HS");
  const [postClipUrl, setPostClipUrl] = useState("https://scoutforge.gg/clips/vortex-clutch-01");
  const [postDescription, setPostDescription] = useState("");
  const [isSubmittingGameplay, setIsSubmittingGameplay] = useState(false);

  // Video Recording Upload State for Gameplay Post
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
  const [uploadedVideoPreviewUrl, setUploadedVideoPreviewUrl] = useState<string | null>(null);
  const [uploadedVideoInfo, setUploadedVideoInfo] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [uploadSourceMode, setUploadSourceMode] = useState<"file" | "link">("file");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active playing video modal
  const [activePlayingPost, setActivePlayingPost] = useState<GameplayPost | null>(null);

  // Video Recording Attachment State for Role Application
  const [applyVideoFile, setApplyVideoFile] = useState<File | null>(null);
  const [applyVideoInfo, setApplyVideoInfo] = useState<{ name: string; size: string } | null>(null);
  const applyFileInputRef = useRef<HTMLInputElement | null>(null);

  const processVideoFile = (file: File) => {
    if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|webm|mov|mkv|avi)$/i)) {
      onShowToast("Please upload a valid video file (MP4, WEBM, MOV, MKV).", "warning");
      return;
    }
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const previewUrl = URL.createObjectURL(file);
    setUploadedVideoFile(file);
    setUploadedVideoPreviewUrl(previewUrl);
    setUploadedVideoInfo({
      name: file.name,
      size: `${sizeMb} MB`,
      type: file.type || "video/mp4",
    });
    setPostClipUrl(previewUrl);

    if (!postTitle.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .trim();
      setPostTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
    onShowToast(`Video recording "${file.name}" (${sizeMb} MB) attached!`, "success");
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processVideoFile(file);
    }
  };

  const handleVideoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingVideo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processVideoFile(file);
    }
  };

  const handleRemoveUploadedVideo = () => {
    if (uploadedVideoPreviewUrl) {
      URL.revokeObjectURL(uploadedVideoPreviewUrl);
    }
    setUploadedVideoFile(null);
    setUploadedVideoPreviewUrl(null);
    setUploadedVideoInfo(null);
    setPostClipUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleApplyVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|webm|mov|mkv|avi)$/i)) {
        onShowToast("Please attach a valid video file.", "warning");
        return;
      }
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setApplyVideoFile(file);
      setApplyVideoInfo({
        name: file.name,
        size: `${sizeMb} MB`,
      });
      onShowToast(`Video proof "${file.name}" attached to application!`, "success");
    }
  };

  // Filtered Org Roles
  const filteredOpenings = openings.filter((op) => {
    const matchesGame = selectedGameFilter === "All" || op.game === selectedGameFilter;
    const matchesPriority = selectedPriorityFilter === "All" || op.priority === selectedPriorityFilter;
    const matchesSkill = selectedSkillFilter === "All" || op.skillCategory === selectedSkillFilter;
    
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      op.teamName.toLowerCase().includes(query) ||
      op.roleNeeded.toLowerCase().includes(query) ||
      op.description.toLowerCase().includes(query) ||
      op.skillCategory.toLowerCase().includes(query) ||
      op.skillsRequired.some((s) => s.toLowerCase().includes(query));

    return matchesGame && matchesPriority && matchesSkill && matchesSearch;
  });

  // Filtered Gameplay Posts
  const filteredGameplays = gameplayPosts.filter((post) => {
    const matchesGame = selectedGameFilter === "All" || post.game === selectedGameFilter;
    const matchesSkill = selectedSkillFilter === "All" || post.skillCategory === selectedSkillFilter;
    
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      post.title.toLowerCase().includes(query) ||
      post.playerIgn.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query) ||
      post.skillCategory.toLowerCase().includes(query) ||
      post.skillTags.some((t) => t.toLowerCase().includes(query));

    return matchesGame && matchesSkill && matchesSearch;
  });

  // When opening the Apply Modal, check if player has completed their profile for that specific game
  const handleOpenApplyModal = (opening: RosterOpening) => {
    const status = checkGameProfileStatus(player, opening.game);
    if (!status.isComplete) {
      setIncompleteWarning({
        opening,
        game: opening.game,
        missingFields: status.missingFields,
        reason: status.reason,
      });
      onShowToast(`Incomplete profile for ${opening.game}. You must complete your ${opening.game} profile before applying.`, 'warning');
      return;
    }

    setApplyingOpening(opening);

    // Look for matching game in player's played titles
    const gameMatch = player.gamesPlayed.find((g) => g.id === opening.game);

    if (gameMatch) {
      setApplyGameUid(gameMatch.ign);
      setApplyCurrentRank(gameMatch.rank);
      setApplyPrimaryAgentWeapon(gameMatch.primaryRole);
    } else {
      setApplyGameUid(player.tag);
      setApplyCurrentRank("High Competitive");
      setApplyPrimaryAgentWeapon(player.role);
    }

    setApplyDiscord(player.discord);
    setApplyPhone(player.phone);
    setApplyScrimTimes(player.scrimWindow);
    setApplyHardware(player.hardwareSetup);
    setApplyMessage(
      `Hi ${opening.postedBy}, I am applying for the ${opening.roleNeeded} position at ${opening.teamName} (${opening.game}). My verified ScoutForge Fit Score is ${player.fitScore}/100 with ${player.topStrength}. Ready for scrim trials immediately.`
    );
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingOpening) return;

    const status = checkGameProfileStatus(player, applyingOpening.game);
    if (!status.isComplete) {
      setIncompleteWarning({
        opening: applyingOpening,
        game: applyingOpening.game,
        missingFields: status.missingFields,
        reason: status.reason,
      });
      onShowToast(`Application blocked: Incomplete profile for ${applyingOpening.game}.`, 'warning');
      return;
    }
    
    if (!applyGameUid.trim()) {
      onShowToast("Please provide your in-game UID or identifier.", "warning");
      return;
    }

    if (!applyConsent) {
      onShowToast("Please confirm consent to share verified telemetry.", "warning");
      return;
    }

    setIsSubmittingApply(true);
    setTimeout(() => {
      onApply(applyingOpening, {
        gameUid: applyGameUid,
        experienceYears: applyExpYears,
        experienceMonths: applyExpMonths,
        currentRank: applyCurrentRank,
        primaryAgentOrWeapon: applyPrimaryAgentWeapon,
        playerAge: applyAge,
        locationCity: applyCity,
        discordContact: applyDiscord,
        phoneContact: applyPhone,
        scrimAvailability: applyScrimTimes,
        hardwareSetup: applyHardware,
        pastTournaments: applyPastTournaments,
        bootcampReady: applyBootcampReady,
        message: applyMessage,
      });

      setIsSubmittingApply(false);
      setApplyingOpening(null);
      onShowToast(
        `Application submitted to ${applyingOpening.teamName}! Your Game UID (${applyGameUid}) and ${applyExpYears}y ${applyExpMonths}m experience have been sent to the coach.`,
        "success"
      );
    }, 600);
  };

  const handleLaunchQuickComplete = (opening: RosterOpening) => {
    const game = opening.game;
    setQuickCompleteOpening(opening);
    setIncompleteWarning(null);

    // Pre-populate realistic defaults based on game
    if (game === 'CS2') {
      setQuickUid('765611980' + Math.floor(10000000 + Math.random() * 90000000));
      setQuickRank('FACEIT Level 10 (2,480 ELO)');
      setQuickRole(opening.roleNeeded || 'Dedicated AWPer');
      setQuickMatches(64);
      setQuickKd('1.38');
      setQuickStatValue('89.4 ADR');
      setQuickFitScore(91.5);
    } else if (game === 'Valorant') {
      setQuickUid(`${player.tag}#VAL`);
      setQuickRank('Radiant Top 500');
      setQuickRole(opening.roleNeeded || 'Duelist / Entry');
      setQuickMatches(52);
      setQuickKd('1.34');
      setQuickStatValue('284.5 ACS');
      setQuickFitScore(88.0);
    } else if (game === 'League of Legends') {
      setQuickUid(`${player.tag}#LoL`);
      setQuickRank('Challenger 740 LP');
      setQuickRole(opening.roleNeeded || 'Mid Laner');
      setQuickMatches(68);
      setQuickKd('4.8 KDA');
      setQuickStatValue('9.4 CS/M');
      setQuickFitScore(89.0);
    } else if (game === 'Rocket League') {
      setQuickUid(`${player.tag}_RL`);
      setQuickRank('Supersonic Legend (1,920 MMR)');
      setQuickRole(opening.roleNeeded || 'First Man / Striker');
      setQuickMatches(54);
      setQuickKd('2.40 GPG');
      setQuickStatValue('685 Score');
      setQuickFitScore(86.5);
    } else if (game === 'BGMI') {
      setQuickUid('5128940192');
      setQuickRank('Conqueror Top 100');
      setQuickRole(opening.roleNeeded || 'Assaulter / IGL');
      setQuickMatches(64);
      setQuickKd('5.82 KD');
      setQuickStatValue('842.0 Avg Dmg');
      setQuickFitScore(88.0);
    } else {
      setQuickUid(player.tag);
      setQuickRank('High Competitive Contender');
      setQuickRole(opening.roleNeeded || 'Flex');
      setQuickMatches(50);
      setQuickKd('1.30');
      setQuickStatValue('Top Tier');
      setQuickFitScore(85.0);
    }
  };

  const handleSaveQuickComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCompleteOpening) return;

    const game = quickCompleteOpening.game;
    const gameType = game as GameType;
    const updatedGame: GameProfile = {
      id: gameType,
      name: game,
      shortName: game === 'CS2' ? 'CS2' : game === 'Valorant' ? 'VAL' : game === 'League of Legends' ? 'LoL' : game === 'Rocket League' ? 'RLCS' : game === 'BGMI' ? 'BGMI' : 'GEN',
      badge: game === 'BGMI' ? 'Mobile BR' : 'PC Tactical',
      ign: quickUid.trim() || player.tag,
      rank: quickRank.trim() || 'High Competitive',
      primaryRole: quickRole.trim() || 'Specialist',
      secondaryRole: 'Flex',
      tier: 'Verified Competitor',
      fitScore: quickFitScore,
      matchesSampled: quickMatches,
      kdOrKda: quickKd,
      primaryStatLabel: game.includes('Valorant') ? 'ACS' : game.includes('League') ? 'KDA' : game.includes('Rocket') ? 'Score/Match' : 'ADR',
      primaryStatValue: quickStatValue,
      winRate: '67%',
      server: 'Mumbai / APAC (18ms)',
    };

    if (onUpdateGameProfile) {
      onUpdateGameProfile(updatedGame);
    }

    onShowToast(`Profile for ${game} completed! Telemetry ingested successfully.`, 'success');

    const targetOpening = quickCompleteOpening;
    setQuickCompleteOpening(null);

    // Automatically transition to apply modal with completed profile
    setTimeout(() => {
      setApplyingOpening(targetOpening);
      setApplyGameUid(updatedGame.ign);
      setApplyCurrentRank(updatedGame.rank);
      setApplyPrimaryAgentWeapon(updatedGame.primaryRole);
      setApplyDiscord(player.discord);
      setApplyPhone(player.phone);
      setApplyScrimTimes(player.scrimWindow);
      setApplyHardware(player.hardwareSetup);
      setApplyMessage(
        `Hi ${targetOpening.postedBy}, I have completed and verified my ${targetOpening.game} profile (UID: ${updatedGame.ign}, Rank: ${updatedGame.rank}) and am applying for the ${targetOpening.roleNeeded} position at ${targetOpening.teamName}. My FitScore is ${quickFitScore}/100. Ready for scrim trials immediately.`
      );
    }, 200);
  };

  const handleSubmitGameplayPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) {
      onShowToast("Please enter a title for your gameplay clip.", "warning");
      return;
    }

    setIsSubmittingGameplay(true);
    setTimeout(() => {
      const tagsArray = postSkillTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      onPostGameplay({
        title: postTitle,
        playerIgn: player.name,
        playerTag: player.tag,
        playerRole: player.role,
        fitScore: player.fitScore,
        game: postGame,
        skillCategory: postSkillCategory === "All" ? "Sniper" : postSkillCategory,
        skillTags: tagsArray.length > 0 ? tagsArray : [postSkillCategory],
        videoUrl: postClipUrl,
        matchContext: postMatchContext || "Competitive Scrim Match",
        keyStats: postKeyStats || "High Impact Round",
        description: postDescription || "Verified gameplay showcase evaluated by ScoutForge scouting network.",
        verifiedScoutScore: true,
      });

      setIsSubmittingGameplay(false);
      setIsPostGameplayOpen(false);

      // Reset form
      setPostTitle("");
      setPostDescription("");
      if (uploadedVideoPreviewUrl) {
        URL.revokeObjectURL(uploadedVideoPreviewUrl);
      }
      setUploadedVideoFile(null);
      setUploadedVideoPreviewUrl(null);
      setUploadedVideoInfo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onShowToast(`Gameplay highlight published! Organizations and scouts can now evaluate your skills.`, "success");
    }, 600);
  };

  const toggleLikePost = (postId: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
    onShowToast("Gameplay appreciation updated!", "info");
  };

  const games: string[] = ["All", "CS2", "Valorant", "League of Legends", "Rocket League", "BGMI"];
  const skillsList: SkillCategory[] = [
    "All", 
    "Sniper", 
    "Bomber", 
    "Entry Fragger", 
    "IGL", 
    "Assaulter", 
    "Rusher", 
    "Support"
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header Banner & Quick Actions */}
      <div className="rounded-[6px] border border-slate-200 dark:border-[#26262a]/90 bg-white dark:bg-[#131315] p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-[#26262a]">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-900 dark:text-[#ededed]" />
              <h1 className="text-lg font-black text-slate-950 dark:text-[#ededed] tracking-tight">
                ORGANIZATION ROSTER ROLES & PLAYER GAMEPLAYS
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#9a9aa2] mt-1 max-w-2xl leading-relaxed">
              Explore active roster openings posted by verified esports organizations, search roles tailored to your specific skillset (like <strong>Sniper, Bomber, Entry Fragger</strong>), or post your own gameplay clips so coaches can recruit you.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
            {/* View Switcher Tabs */}
            <div className="inline-flex p-1 rounded-[6px] bg-slate-100 dark:bg-[#18181b] border border-slate-200 dark:border-[#26262a] shadow-2xs">
              <button
                onClick={() => setActiveSubTab("org-roles")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === "org-roles"
                    ? isLight
                      ? "bg-slate-950 text-white shadow-xs"
                      : "bg-[#0b0b0c] text-[#e8ff59] border border-[#e8ff59]/40 shadow-xs"
                    : "text-slate-600 dark:text-[#9a9aa2] hover:text-slate-950 dark:hover:text-[#ededed]"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Org Roles ({openings.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab("player-gameplays")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === "player-gameplays"
                    ? isLight
                      ? "bg-slate-950 text-white shadow-xs"
                      : "bg-[#0b0b0c] text-[#e8ff59] border border-[#e8ff59]/40 shadow-xs"
                    : "text-slate-600 dark:text-[#9a9aa2] hover:text-slate-950 dark:hover:text-[#ededed]"
                }`}
              >
                <Video className="w-3.5 h-3.5 text-rose-500" />
                <span>Player Gameplays ({gameplayPosts.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab("my-applications")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === "my-applications"
                    ? isLight
                      ? "bg-slate-950 text-white shadow-xs"
                      : "bg-[#0b0b0c] text-[#e8ff59] border border-[#e8ff59]/40 shadow-xs"
                    : "text-slate-600 dark:text-[#9a9aa2] hover:text-slate-950 dark:hover:text-[#ededed]"
                }`}
              >
                <span>My Applications</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeSubTab === "my-applications" ? "bg-[#e8ff59] text-black font-extrabold" : "bg-slate-200 dark:bg-[#26262a] text-slate-700 dark:text-[#ededed]"
                }`}>
                  {applications.length}
                </span>
              </button>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Button to Upload a Video Recording */}
              <button
                onClick={() => {
                  setUploadSourceMode("file");
                  setIsPostGameplayOpen(true);
                  setTimeout(() => {
                    fileInputRef.current?.click();
                  }, 150);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-slate-900 text-white hover:bg-slate-800 dark:bg-[#18181b] dark:text-[#ededed] dark:border dark:border-[#26262a] dark:hover:bg-[#27272a] text-xs font-bold shadow-xs transition-all cursor-pointer transform active:scale-95"
                title="Upload a match video recording clip from your device"
              >
                <Upload className="w-3.5 h-3.5 text-[#bef226]" />
                <span>Upload Video Recording</span>
              </button>

              {/* Post Gameplay Button (Electric Lime Accent) */}
              <button
                onClick={() => setIsPostGameplayOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#bef226] hover:bg-[#d0ff36] text-slate-950 dark:text-[#ededed] border border-[#a3e614] text-xs font-black shadow-xs transition-all cursor-pointer transform active:scale-95"
                title="Post a gameplay highlight clip to be scouted by organizations"
              >
                <Video className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Post Gameplay</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c]">
            <span className="text-[10px] font-mono text-slate-500 dark:text-[#9a9aa2] font-bold uppercase">Org Roster Openings</span>
            <div className="text-xl font-black text-slate-950 dark:text-[#ededed] font-mono mt-0.5">{openings.length} Positions</div>
            <span className="text-[10px] text-emerald-700 font-bold">Verified Teams Only</span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c]">
            <span className="text-[10px] font-mono text-slate-500 dark:text-[#9a9aa2] font-bold uppercase">Player Gameplays</span>
            <div className="text-xl font-black text-slate-950 dark:text-[#ededed] font-mono mt-0.5">{gameplayPosts.length} Highlights</div>
            <span className="text-[10px] text-indigo-700 font-bold">Ready for Scouting</span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c]">
            <span className="text-[10px] font-mono text-slate-500 dark:text-[#9a9aa2] font-bold uppercase">Your Applications</span>
            <div className="text-xl font-black text-slate-950 dark:text-[#ededed] font-mono mt-0.5">{applications.length} Active</div>
            <span className="text-[10px] text-emerald-700 font-bold">1 Shortlisted for Trial</span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c]">
            <span className="text-[10px] font-mono text-slate-500 dark:text-[#9a9aa2] font-bold uppercase">Skill Match Rate</span>
            <div className="text-xl font-black text-slate-950 dark:text-[#ededed] font-mono mt-0.5">{player.fitScore}% Match</div>
            <span className="text-[10px] text-slate-600 dark:text-[#9a9aa2] font-medium">{player.role} Specialization</span>
          </div>
        </div>
      </div>

      {/* 2. Unified Filters & Search Bar */}
      <div className="rounded-[6px] border border-slate-200 dark:border-[#26262a]/90 bg-white dark:bg-[#131315] p-4 shadow-xs space-y-3">
        {/* Top Filter Row: Search Input + Game Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar supporting skills (Sniper, Bomber, etc.) */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by skill (e.g., 'sniper', 'bomber', 'entry'), team name, or role..."
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] text-xs text-slate-900 dark:text-[#ededed] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:bg-white dark:bg-[#131315] font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-[#ededed]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Game Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Game:
            </span>
            {games.map((g) => {
              const isSelected = selectedGameFilter === g;
              return (
                <button
                  key={g}
                  onClick={() => setSelectedGameFilter(g)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-950 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-[#18181b] hover:bg-slate-200/70 text-slate-700 dark:text-[#ededed]"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skill Specialization Filter Row (Sniper, Bomber, Entry Fragger, etc.) */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Target className="w-3 h-3 text-slate-500 dark:text-[#9a9aa2]" />
            <span>Skill Match:</span>
          </span>
          {skillsList.map((skill) => {
            const isSelected = selectedSkillFilter === skill;
            const badgeInfo = skill !== "All" ? skillBadges[skill] : null;

            return (
              <button
                key={skill}
                onClick={() => setSelectedSkillFilter(skill)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#bef226] text-slate-950 dark:text-[#ededed] border border-[#a3e614] font-bold shadow-xs"
                    : "bg-slate-50 dark:bg-[#0b0b0c] hover:bg-slate-100 dark:bg-[#18181b] text-slate-700 dark:text-[#ededed] border border-slate-200 dark:border-[#26262a]"
                }`}
              >
                {badgeInfo?.icon}
                <span>{skill === "All" ? "All Skills" : skill}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Sub-Tab 1: Organization Roles View */}
      {activeSubTab === "org-roles" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#9a9aa2] font-medium px-1">
            <span>
              Showing <strong>{filteredOpenings.length}</strong> roster roles posted by verified organizations
              {selectedSkillFilter !== "All" && ` matching skill: "${selectedSkillFilter}"`}
              {selectedGameFilter !== "All" && ` in ${selectedGameFilter}`}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Direct Coach Pipeline</span>
          </div>

          {openings.length === 0 ? (
            <div className="rounded-[8px] border border-slate-200 dark:border-[#26262a] bg-white dark:bg-[#131315] p-12 text-center">
              <Building2 className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#ededed]">No Roster Openings Available Yet</h3>
              <p className="text-xs text-slate-500 dark:text-[#9a9aa2] mt-1 max-w-md mx-auto leading-relaxed">
                Organizations have not posted any open roles yet. Log in as an organiser to publish roster openings, or check back soon for competitive trials.
              </p>
            </div>
          ) : filteredOpenings.length === 0 ? (
            <div className="rounded-[8px] border border-slate-200 dark:border-[#26262a] bg-white dark:bg-[#131315] p-12 text-center">
              <Building2 className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#ededed]">No Organization Roles Match Your Filters</h3>
              <p className="text-xs text-slate-500 dark:text-[#9a9aa2] mt-1 max-w-md mx-auto leading-relaxed">
                No roles found matching "{selectedGameFilter}" and "{selectedSkillFilter}". Reset your filters to see all {openings.length} active opportunities.
              </p>
              <button
                onClick={() => {
                  setSelectedGameFilter("All");
                  setSelectedSkillFilter("All");
                  setSelectedPriorityFilter("All");
                  setSearchQuery("");
                }}
                className="mt-4 px-4 py-2 rounded-[6px] bg-[#e8ff59] text-black text-xs font-black hover:bg-[#d8ef49] transition-colors cursor-pointer shadow-xs"
              >
                Reset All Filters ({openings.length} Roles)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOpenings.map((opening) => {
                const skillInfo = skillBadges[opening.skillCategory] || {
                  label: opening.skillCategory,
                  icon: <Target className="w-3.5 h-3.5" />,
                  color: "bg-slate-100 dark:bg-[#18181b] text-slate-800 dark:text-[#ededed] border-slate-200 dark:border-[#26262a]",
                };

                return (
                  <div
                    key={opening.id}
                    className="rounded-[6px] border border-slate-200 dark:border-[#26262a] bg-white dark:bg-[#131315] p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Org Name, Logo Tag & Urgency Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[6px] bg-slate-950 text-[#bef226] font-black text-sm flex items-center justify-center border border-slate-800 shrink-0 shadow-2xs">
                            {opening.teamTag}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-bold text-slate-950 dark:text-[#ededed] leading-tight">
                                {opening.teamName}
                              </h3>
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 border border-indigo-200 text-indigo-700">
                                <Building2 className="w-2.5 h-2.5" />
                                {opening.organizationType}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-[#9a9aa2]">
                              <span className="flex items-center gap-1">
                                {gameIcons[opening.game]}
                                <strong className="font-semibold text-slate-700 dark:text-[#ededed]">{opening.game}</strong>
                              </span>
                              <span>•</span>
                              <span className="text-slate-400 font-medium">{opening.tier}</span>
                            </div>
                          </div>
                        </div>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                            opening.priority === "Immediate Trial"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : opening.priority === "High Priority"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-slate-100 dark:bg-[#18181b] text-slate-700 dark:text-[#ededed] border-slate-200 dark:border-[#26262a]"
                          }`}
                        >
                          {opening.priority}
                        </span>
                      </div>

                      {/* Role Title */}
                      <div className="mt-3.5">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          Seeking Role
                        </div>
                        <div className="text-sm font-black text-slate-950 dark:text-[#ededed] mt-0.5">
                          {opening.roleNeeded}
                        </div>
                      </div>

                      {/* Primary Skill Requirement Pill (Sniper, Bomber, etc.) */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${skillInfo.color}`}>
                          {skillInfo.icon}
                          <span>Skill: {opening.skillCategory}</span>
                        </span>
                        {opening.skillsRequired.map((skillTag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-50 dark:bg-[#0b0b0c] border border-slate-200 dark:border-[#26262a] text-slate-600 dark:text-[#9a9aa2]"
                          >
                            {skillTag}
                          </span>
                        ))}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-[#9a9aa2] mt-2.5 leading-relaxed line-clamp-2">
                        {opening.description}
                      </p>

                      {/* Requirements Grid */}
                      <div className="grid grid-cols-2 gap-2 mt-3.5 p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b0b0c] border border-slate-200 dark:border-[#26262a]/80 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Min Rank</span>
                          <span className="font-bold text-slate-900 dark:text-[#ededed]">{opening.minRank}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Scrim Window</span>
                          <span className="font-bold text-slate-900 dark:text-[#ededed] truncate block">{opening.scrimHours}</span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-[#26262a]/60 flex items-center justify-between">
                          <span className="text-slate-500 dark:text-[#9a9aa2] font-medium">Package:</span>
                          <span className="font-extrabold text-emerald-700">{opening.compensation}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="text-slate-400 text-[10px]">
                        Posted by <strong className="text-slate-700 dark:text-[#ededed] font-semibold">{opening.postedBy}</strong> • {opening.postedAgo}
                      </div>

                      {opening.applied ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Applied</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenApplyModal(opening)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <Send className="w-3 h-3 text-[#bef226]" />
                          <span>Apply for Role</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Sub-Tab 2: Player Gameplay Showcase */}
      {activeSubTab === "player-gameplays" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#9a9aa2] font-medium px-1">
            <span>
              Showing <strong>{filteredGameplays.length}</strong> player gameplay clips evaluated by ScoutForge
              {selectedSkillFilter !== "All" && ` in "${selectedSkillFilter}"`}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setUploadSourceMode("file");
                  setIsPostGameplayOpen(true);
                  setTimeout(() => fileInputRef.current?.click(), 150);
                }}
                className="text-xs font-bold text-slate-900 dark:text-[#ededed] bg-slate-100 dark:bg-[#1f1f23] px-2.5 py-1 rounded border border-slate-200 dark:border-[#26262a] flex items-center gap-1.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-[#27272a]"
              >
                <Upload className="w-3 h-3 text-[#bef226]" />
                <span>Upload Video Recording</span>
              </button>
              <button
                onClick={() => setIsPostGameplayOpen(true)}
                className="text-xs font-bold text-slate-950 dark:text-[#ededed] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#bef226]" />
                <span>Share your gameplay</span>
              </button>
            </div>
          </div>

          {filteredGameplays.length === 0 ? (
            <div className="rounded-[6px] border border-slate-200 dark:border-[#26262a] bg-white dark:bg-[#131315] p-12 text-center">
              <Video className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#ededed]">No gameplay clips match the active filter</h3>
              <p className="text-xs text-slate-500 dark:text-[#9a9aa2] mt-1 max-w-sm mx-auto">
                Be the first to share a gameplay highlight in this category for scouts to review!
              </p>
              <button
                onClick={() => setIsPostGameplayOpen(true)}
                className="mt-4 px-3.5 py-1.5 rounded-lg bg-[#bef226] text-slate-950 dark:text-[#ededed] font-black text-xs border border-[#a3e614] cursor-pointer"
              >
                + Post Your Gameplay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGameplays.map((post) => {
                const isLiked = likedPosts[post.id];
                const skillInfo = skillBadges[post.skillCategory] || {
                  label: post.skillCategory,
                  icon: <Target className="w-3.5 h-3.5" />,
                  color: "bg-slate-100 dark:bg-[#18181b] text-slate-800 dark:text-[#ededed] border-slate-200 dark:border-[#26262a]",
                };

                return (
                  <div
                    key={post.id}
                    className="rounded-[6px] border border-slate-200 dark:border-[#26262a] bg-white dark:bg-[#131315] p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Video Player Card Header */}
                      <div className="relative rounded-lg bg-slate-950 h-44 flex flex-col justify-between p-3 overflow-hidden group shadow-inner">
                        {/* Top Video Overlay: Game Badge & Skill Category */}
                        <div className="flex items-center justify-between z-10">
                          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur border border-white/10 text-white text-[11px] font-bold">
                            {gameIcons[post.game]}
                            <span>{post.game}</span>
                          </span>

                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black border ${skillInfo.color}`}>
                            {skillInfo.icon}
                            <span>{post.skillCategory}</span>
                          </span>
                        </div>

                        {/* Center Play Button & Simulated Waveform */}
                        <div 
                          onClick={() => setActivePlayingPost(post)}
                          className="flex flex-col items-center justify-center my-auto z-10 cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-full bg-[#bef226] text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                          </div>
                          <span className="text-[10px] font-mono text-slate-300 font-bold mt-2 bg-black/50 px-2 py-0.5 rounded flex items-center gap-1">
                            <Film className="w-3 h-3 text-[#bef226]" />
                            <span>Play Video Recording</span>
                          </span>
                        </div>

                        {/* Bottom Video Progress Overlay */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 z-10">
                          <span>{post.matchContext}</span>
                          <span className="text-white font-bold">{post.keyStats}</span>
                        </div>

                        {/* Subtle background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 pointer-events-none" />
                      </div>

                      {/* Clip Title & Player Info */}
                      <div className="mt-3.5">
                        <h3 className="text-sm font-black text-slate-950 dark:text-[#ededed] leading-snug">
                          {post.title}
                        </h3>

                        <div className="flex items-center gap-2 mt-1.5 text-xs">
                          <div className="w-5 h-5 rounded-full bg-slate-950 text-[#bef226] flex items-center justify-center text-[10px] font-black">
                            {post.playerIgn.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-[#ededed]">{post.playerIgn}</span>
                          <span className="text-slate-400 font-mono text-[10px]">({post.playerTag})</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold text-[11px]">
                            Fit Score: {post.fitScore}/100
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-[#9a9aa2] mt-2 leading-relaxed">
                          {post.description}
                        </p>

                        {/* Skill Tags */}
                        <div className="flex flex-wrap items-center gap-1 mt-2.5">
                          {post.skillTags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-[#18181b] border border-slate-200 dark:border-[#26262a] text-slate-700 dark:text-[#ededed]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Row: Likes, Views, and Share */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-[#9a9aa2]">
                        <button
                          onClick={() => toggleLikePost(post.id)}
                          className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                            isLiked ? "text-rose-600 font-bold" : "hover:text-rose-500"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                          <span>{post.likesCount + (isLiked ? 1 : 0)}</span>
                        </button>

                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>{post.viewsCount} views</span>
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-medium">
                        {post.postedAgo}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Sub-Tab 3: My Sent Applications */}
      {activeSubTab === "my-applications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#9a9aa2] font-medium px-1">
            <span>
              Tracking <strong>{applications.length}</strong> active applications sent to organizations
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Real-time status updates</span>
          </div>

          {applications.length === 0 ? (
            <div className="rounded-[6px] border border-slate-200 dark:border-[#26262a] bg-white dark:bg-[#131315] p-12 text-center">
              <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#ededed]">No applications sent yet</h3>
              <p className="text-xs text-slate-500 dark:text-[#9a9aa2] mt-1 max-w-sm mx-auto">
                Browse open roster roles from organizations and apply with your verified ScoutForge telemetry dossier.
              </p>
              <button
                onClick={() => setActiveSubTab("org-roles")}
                className="mt-4 px-3.5 py-1.5 rounded-lg bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Browse Org Openings
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-[6px] border border-slate-200 dark:border-[#26262a] bg-white dark:bg-[#131315] p-5 shadow-xs space-y-3.5"
                >
                  {/* Top Bar: Team, Game & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-slate-950 dark:text-[#ededed]">{app.teamName}</h3>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-[#9a9aa2] bg-slate-100 dark:bg-[#18181b] px-2 py-0.5 rounded">
                        {gameIcons[app.game]}
                        <span>{app.game}</span>
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-[#ededed]">{app.roleApplied}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-md border text-center ${
                          app.status === "Shortlisted for Trial"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-black"
                            : app.status === "Under Review"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-slate-100 dark:bg-[#18181b] text-slate-700 dark:text-[#ededed] border-slate-200 dark:border-[#26262a]"
                        }`}
                      >
                        {app.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Submitted {app.submittedAt}
                      </span>
                    </div>
                  </div>

                  {/* Submitted Verification Credentials Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 dark:bg-[#0b0b0c]/80 p-3 rounded-[6px] border border-slate-200 dark:border-[#26262a]/80 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Game UID</span>
                      <span className="font-mono font-bold text-slate-950 dark:text-[#ededed] break-all">{app.gameUid || "Verified on File"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Playing Experience</span>
                      <span className="font-bold text-slate-900 dark:text-[#ededed] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{app.experienceYears}y {app.experienceMonths}m Comp</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Rank</span>
                      <span className="font-bold text-slate-900 dark:text-[#ededed] truncate block">{app.currentRank || "High Competitive"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Agent / Weapon</span>
                      <span className="font-bold text-slate-900 dark:text-[#ededed] truncate block">{app.primaryAgentOrWeapon || "Flex Fragger"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Discord Contact</span>
                      <span className="font-mono text-slate-700 dark:text-[#ededed]">{app.discordContact}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone / WhatsApp</span>
                      <span className="font-mono text-slate-700 dark:text-[#ededed]">{app.phoneContact || "Provided"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location & Age</span>
                      <span className="text-slate-700 dark:text-[#ededed] font-medium">Age {app.playerAge || "19"} • {app.locationCity || "India"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scrim Window</span>
                      <span className="text-slate-700 dark:text-[#ededed] font-medium truncate block">{app.scrimAvailability}</span>
                    </div>
                  </div>

                  {/* Submitted Pitch */}
                  <p className="text-xs text-slate-700 dark:text-[#ededed] leading-relaxed bg-white dark:bg-[#131315] p-3 rounded-lg border border-slate-200 dark:border-[#26262a]">
                    <strong className="text-slate-950 dark:text-[#ededed] font-bold block mb-0.5">Your Application Pitch:</strong> 
                    {app.message}
                  </p>

                  {/* Coach Response / Instructions if available */}
                  {app.coachNote && (
                    <div className="text-xs bg-lime-50 border border-lime-300 rounded-lg p-3 text-slate-900 dark:text-[#ededed] shadow-2xs">
                      <div className="flex items-center gap-1.5 text-slate-950 dark:text-[#ededed] font-bold mb-1">
                        <MessageSquare className="w-3.5 h-3.5 text-lime-700" />
                        <span>Coach Feedback & Trial Instructions:</span>
                      </div>
                      <p className="leading-relaxed">{app.coachNote}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Apply For Role Modal (With In-Game UID, Playing Experience, and Basic Details) */}
      {applyingOpening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-[6px] bg-white dark:bg-[#131315] border border-slate-200 dark:border-[#26262a] shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setApplyingOpening(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:text-[#ededed] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#bef226] border border-slate-900" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Official Organization Roster Application
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <div className="w-10 h-10 rounded-[6px] bg-slate-950 text-[#bef226] font-black text-sm flex items-center justify-center border border-slate-800 shrink-0">
                {applyingOpening.teamTag}
              </div>
              <div>
                <h2 className="text-base font-black text-slate-950 dark:text-[#ededed] leading-tight">
                  Apply to {applyingOpening.teamName}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#9a9aa2] mt-0.5">
                  <span className="flex items-center gap-1">
                    {gameIcons[applyingOpening.game]}
                    <strong>{applyingOpening.game}</strong>
                  </span>
                  <span>•</span>
                  <span>Role: <strong className="text-slate-900 dark:text-[#ededed]">{applyingOpening.roleNeeded}</strong></span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">Skill: {applyingOpening.skillCategory}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitApplication} className="mt-5 space-y-4">
              {/* SECTION 1: Game UID & Verification Details */}
              <div className="p-4 rounded-[6px] bg-slate-50 dark:bg-[#0b0b0c] border border-slate-200 dark:border-[#26262a]/90 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-[#ededed] uppercase tracking-wide border-b border-slate-200 dark:border-[#26262a]/60 pb-1.5">
                  <Gamepad className="w-4 h-4 text-slate-700 dark:text-[#ededed]" />
                  <span>1. In-Game Identity & Verification</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Game UID */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-[#ededed] uppercase mb-1">
                      {getGameUidConfig(applyingOpening.game).label}
                    </label>
                    <input
                      type="text"
                      required
                      value={applyGameUid}
                      onChange={(e) => setApplyGameUid(e.target.value)}
                      placeholder={getGameUidConfig(applyingOpening.game).placeholder}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#131315] text-xs text-slate-950 dark:text-[#ededed] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-slate-950"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-[#9a9aa2] mt-1 block">
                      {getGameUidConfig(applyingOpening.game).hint}
                    </span>
                  </div>

                  {/* Current Competitive Rank */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-[#ededed] uppercase mb-1">
                      Current / Peak Rank *
                    </label>
                    <input
                      type="text"
                      required
                      value={applyCurrentRank}
                      onChange={(e) => setApplyCurrentRank(e.target.value)}
                      placeholder="e.g., Radiant Top 500 / Conqueror"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#131315] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:ring-1 focus:ring-slate-950"
                    />
                  </div>

                  {/* Primary Signature Agent or Weapon */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-[#ededed] uppercase mb-1">
                      Signature Agent / Weapon / Hero *
                    </label>
                    <input
                      type="text"
                      required
                      value={applyPrimaryAgentWeapon}
                      onChange={(e) => setApplyPrimaryAgentWeapon(e.target.value)}
                      placeholder="e.g., Jett / Raze Entry, AWP, or M416"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#131315] text-xs text-slate-950 dark:text-[#ededed] font-semibold focus:outline-none focus:ring-1 focus:ring-slate-950"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Competitive Experience (How long playing) */}
              <div className="p-4 rounded-[6px] bg-slate-50 dark:bg-[#0b0b0c] border border-slate-200 dark:border-[#26262a]/90 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-[#ededed] uppercase tracking-wide border-b border-slate-200 dark:border-[#26262a]/60 pb-1.5">
                  <Clock className="w-4 h-4 text-slate-700 dark:text-[#ededed]" />
                  <span>2. Competitive Experience & Longevity</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Experience in Years & Months */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-[#ededed] uppercase mb-1">
                      How long have you been playing? (Years) *
                    </label>
                    <select
                      value={applyExpYears}
                      onChange={(e) => setApplyExpYears(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#131315] text-xs text-slate-950 dark:text-[#ededed] font-bold focus:outline-none"
                    >
                      <option value={0}>Less than 1 Year</option>
                      <option value={1}>1 Year of Competitive</option>
                      <option value={2}>2 Years of Competitive</option>
                      <option value={3}>3 Years of Competitive</option>
                      <option value={4}>4 Years of Competitive</option>
                      <option value={5}>5+ Years (Veteran)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-[#ededed] uppercase mb-1">
                      Additional Months *
                    </label>
                    <select
                      value={applyExpMonths}
                      onChange={(e) => setApplyExpMonths(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#131315] text-xs text-slate-950 dark:text-[#ededed] font-bold focus:outline-none"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {i} {i === 1 ? "Month" : "Months"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Past Tournaments & Scrims */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-[#ededed] uppercase mb-1">
                      Tournament History & Notable Finishes
                    </label>
                    <input
                      type="text"
                      value={applyPastTournaments}
                      onChange={(e) => setApplyPastTournaments(e.target.value)}
                      placeholder="e.g., BGIS 2025 Round of 32, VCT SA Qualifiers Top 8"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#131315] text-xs text-slate-950 dark:text-[#ededed] font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Logistics, Comms & Hardware */}
              <div className="p-4 rounded-[6px] bg-slate-50 dark:bg-[#0b0b0c] border border-slate-200 dark:border-[#26262a]/90 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-[#ededed] uppercase tracking-wide border-b border-slate-200 dark:border-[#26262a]/60 pb-1.5">
                  <Phone className="w-4 h-4 text-slate-700 dark:text-[#ededed]" />
                  <span>3. Basic Details, Contact & Scrim Logistics</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-[#ededed] uppercase mb-1">
                      Player Age *
                    </label>
                    <input
                      type="text"
                      required
                      value={applyAge}
                      onChange={(e) => setApplyAge(e.target.value)}
                      placeholder="e.g., 19"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#131315] text-xs text-slate-950 dark:text-[#ededed] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-[#ededed] uppercase mb-1">
                      City / State & Region *
                    </label>
                    <input
                      type="text"
                      required
                      value={applyCity}
                      onChange={(e) => setApplyCity(e.target.value)}
                      placeholder="e.g., Pune, Maharashtra (South Asia)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#131315] text-xs text-slate-950 dark:text-[#ededed] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-[#ededed] uppercase mb-1">
                      Discord Handle (Trial Lobby) *
                    </label>
                    <input
                      type="text"
                      required
                      value={applyDiscord}
                      onChange={(e) => setApplyDiscord(e.target.value)}
                      placeholder="e.g., vortex#1337"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#131315] text-xs text-slate-950 dark:text-[#ededed] font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-[#ededed] uppercase mb-1">
                      Phone / WhatsApp (Urgent Comms)
                    </label>
                    <input
                      type="text"
                      value={applyPhone}
                      onChange={(e) => setApplyPhone(e.target.value)}
                      placeholder="e.g., +91 98765 43210"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#131315] text-xs text-slate-950 dark:text-[#ededed] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-[#ededed] uppercase mb-1">
                      Daily Scrim Availability Window *
                    </label>
                    <input
                      type="text"
                      required
                      value={applyScrimTimes}
                      onChange={(e) => setApplyScrimTimes(e.target.value)}
                      placeholder="e.g., 18:00 – 23:30 IST (6 Days/Wk)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#131315] text-xs text-slate-950 dark:text-[#ededed] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-[#ededed] uppercase mb-1">
                      Hardware Setup & Ping *
                    </label>
                    <input
                      type="text"
                      required
                      value={applyHardware}
                      onChange={(e) => setApplyHardware(e.target.value)}
                      placeholder="e.g., 240Hz PC • 15ms Mumbai Server"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white dark:bg-[#131315] text-xs text-slate-950 dark:text-[#ededed] font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="bootcamp"
                      checked={applyBootcampReady}
                      onChange={(e) => setApplyBootcampReady(e.target.checked)}
                      className="rounded border-slate-300 text-slate-950 dark:text-[#ededed] focus:ring-slate-950 cursor-pointer"
                    />
                    <label htmlFor="bootcamp" className="text-xs text-slate-800 dark:text-[#ededed] font-semibold cursor-pointer select-none">
                      Ready for Bootcamp Relocation & LAN Travel if contract is offered.
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Pitch to Coach */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 dark:text-[#ededed] uppercase mb-1">
                  Custom Pitch to Coach / General Manager
                </label>
                <textarea
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] text-xs text-slate-900 dark:text-[#ededed] focus:bg-white dark:bg-[#131315] focus:outline-none focus:ring-1 focus:ring-slate-950 leading-relaxed font-medium"
                />
              </div>

              {/* SECTION: Optional Video Recording Attachment */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 dark:text-[#ededed] uppercase mb-1 flex items-center gap-1.5">
                  <FileVideo className="w-3.5 h-3.5 text-[#bef226]" />
                  <span>Attach Gameplay Video Recording (Optional)</span>
                </label>
                <input
                  ref={applyFileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/*"
                  className="hidden"
                  onChange={handleApplyVideoChange}
                />
                {!applyVideoInfo ? (
                  <button
                    type="button"
                    onClick={() => applyFileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-lg border border-dashed border-slate-300 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] text-xs font-semibold text-slate-700 dark:text-[#ededed] hover:border-slate-400 dark:hover:border-[#38383e] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 text-[#bef226]" />
                    <span>Upload Video Recording (.mp4, .webm, .mov)</span>
                  </button>
                ) : (
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <FileVideo className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-900 dark:text-[#ededed] truncate">
                        {applyVideoInfo.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        ({applyVideoInfo.size})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setApplyVideoFile(null);
                        setApplyVideoInfo(null);
                      }}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      title="Remove attached recording"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION 5: Verified Telemetry Attachment Notice */}
              <div className="p-3 rounded-[6px] bg-slate-50 dark:bg-[#0b0b0c] border border-slate-200 dark:border-[#26262a] flex items-start gap-2.5 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-slate-600 dark:text-[#9a9aa2] leading-snug">
                  <strong className="text-slate-900 dark:text-[#ededed] font-semibold block">Attached Verified Dossier:</strong>
                  Your ScoutForge <strong>Fit Score ({player.fitScore}/100)</strong>, 52 sampled matches telemetry, and verified comms audit will be securely shared with {applyingOpening.teamName}.
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="consent"
                  checked={applyConsent}
                  onChange={(e) => setApplyConsent(e.target.checked)}
                  className="rounded border-slate-300 text-slate-950 dark:text-[#ededed] focus:ring-slate-950 cursor-pointer"
                />
                <label htmlFor="consent" className="text-xs text-slate-700 dark:text-[#ededed] cursor-pointer select-none">
                  I agree to share my competitive telemetry, in-game UID, and match replays with {applyingOpening.teamName}.
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setApplyingOpening(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-[#26262a] text-xs font-semibold text-slate-600 dark:text-[#9a9aa2] hover:bg-slate-50 dark:bg-[#0b0b0c] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApply}
                  className="px-5 py-2 rounded-lg bg-[#bef226] hover:bg-[#d0ff36] text-slate-950 dark:text-[#ededed] border border-[#a3e614] text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingApply ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Application & Dossier</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Post Player Gameplay Modal */}
      {isPostGameplayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-[6px] bg-white dark:bg-[#131315] border border-slate-200 dark:border-[#26262a] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPostGameplayOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:text-[#ededed] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#bef226] border border-slate-900" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                ScoutForge Player Showcase
              </span>
            </div>

            <h2 className="text-base font-black text-slate-950 dark:text-[#ededed]">
              Post Your Gameplay Highlight
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#9a9aa2] mt-0.5">
              Share your best clips and clutch rounds. Organizations and scouting analysts filter gameplays by skill specialization to recruit top talent.
            </p>

            <form onSubmit={handleSubmitGameplayPost} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-[#ededed] uppercase mb-1">
                  Clip Title / Highlight Description *
                </label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g., 1v3 AWP Reaction Hold & Retake on Inferno B-Site"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] text-xs text-slate-900 dark:text-[#ededed] font-semibold focus:bg-white dark:bg-[#131315] focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-[#ededed] uppercase mb-1">
                    Competitive Game
                  </label>
                  <select
                    value={postGame}
                    onChange={(e) => setPostGame(e.target.value as GameType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] text-xs text-slate-900 dark:text-[#ededed] font-semibold focus:bg-white dark:bg-[#131315]"
                  >
                    <option value="Valorant">Valorant</option>
                    <option value="BGMI">BGMI</option>
                    <option value="League of Legends">League of Legends (LoL)</option>
                    <option value="Rocket League">Rocket League (RLCS)</option>
                    <option value="CS2">CS2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-[#ededed] uppercase mb-1">
                    Primary Skill Focus *
                  </label>
                  <select
                    value={postSkillCategory}
                    onChange={(e) => setPostSkillCategory(e.target.value as SkillCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] text-xs text-slate-900 dark:text-[#ededed] font-semibold focus:bg-white dark:bg-[#131315]"
                  >
                    <option value="Sniper">Sniper / Marksman</option>
                    <option value="Bomber">Bomber / Spike Specialist</option>
                    <option value="Entry Fragger">Entry Fragger</option>
                    <option value="IGL">IGL / Tactician</option>
                    <option value="Assaulter">Assaulter</option>
                    <option value="Rusher">Rusher</option>
                    <option value="Support">Support / Smokes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-[#ededed] uppercase mb-1">
                    Match Context
                  </label>
                  <input
                    type="text"
                    value={postMatchContext}
                    onChange={(e) => setPostMatchContext(e.target.value)}
                    placeholder="e.g., VCT SA Challengers • Map 3"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] text-xs text-slate-900 dark:text-[#ededed] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-[#ededed] uppercase mb-1">
                    Key Performance Stats
                  </label>
                  <input
                    type="text"
                    value={postKeyStats}
                    onChange={(e) => setPostKeyStats(e.target.value)}
                    placeholder="e.g., 3 Kills • 180ms Reaction • 100% HS"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] text-xs text-slate-900 dark:text-[#ededed] font-medium"
                  />
                </div>
              </div>

              {/* Video Recording Upload Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-[#ededed] uppercase flex items-center gap-1.5">
                    <FileVideo className="w-3.5 h-3.5 text-[#bef226]" />
                    <span>Video Recording / Highlight Clip *</span>
                  </label>
                  
                  {/* Mode Toggle: Upload File vs Stream URL */}
                  <div className="flex items-center bg-slate-100 dark:bg-[#18181b] p-0.5 rounded border border-slate-200 dark:border-[#26262a] text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setUploadSourceMode("file")}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        uploadSourceMode === "file"
                          ? "bg-white dark:bg-[#26262a] text-slate-950 dark:text-[#ededed] font-bold shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-[#ededed]"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadSourceMode("link")}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        uploadSourceMode === "link"
                          ? "bg-white dark:bg-[#26262a] text-slate-950 dark:text-[#ededed] font-bold shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-[#ededed]"
                      }`}
                    >
                      External URL
                    </button>
                  </div>
                </div>

                {uploadSourceMode === "file" ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/*"
                      className="hidden"
                      onChange={handleVideoFileChange}
                    />

                    {!uploadedVideoInfo ? (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                        onDragLeave={() => setIsDraggingVideo(false)}
                        onDrop={handleVideoDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                          isDraggingVideo
                            ? "border-[#bef226] bg-[#bef226]/10"
                            : "border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] hover:border-slate-300 dark:hover:border-[#38383e]"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#18181b] mx-auto flex items-center justify-center text-slate-700 dark:text-[#ededed] mb-2">
                          <Upload className="w-5 h-5 text-slate-900 dark:text-[#bef226]" />
                        </div>
                        <button
                          type="button"
                          className="px-3.5 py-1.5 rounded bg-slate-900 text-white dark:bg-[#bef226] dark:text-black text-xs font-bold shadow-xs hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Video Recording</span>
                        </button>
                        <p className="text-[11px] text-slate-500 dark:text-[#9a9aa2] mt-2">
                          Click to browse or drag & drop video recording here
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Supports MP4, WEBM, MOV, MKV (Up to 500 MB)
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] p-3 space-y-2">
                        {/* File details banner */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                              <FileVideo className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-900 dark:text-[#ededed] truncate">
                                {uploadedVideoInfo.name}
                              </div>
                              <div className="text-[10px] font-mono text-slate-500 dark:text-[#9a9aa2]">
                                {uploadedVideoInfo.size} • Video Recording Attached
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2 py-1 rounded text-[11px] font-semibold text-slate-700 dark:text-[#ededed] bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#26262a] hover:bg-slate-100 cursor-pointer"
                            >
                              Replace
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveUploadedVideo}
                              className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                              title="Remove video"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Video Preview Player */}
                        {uploadedVideoPreviewUrl && (
                          <div className="rounded overflow-hidden bg-black aspect-video relative max-h-48 flex items-center justify-center">
                            <video
                              src={uploadedVideoPreviewUrl}
                              controls
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Video verified and ready for scout evaluation</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={postClipUrl}
                      onChange={(e) => setPostClipUrl(e.target.value)}
                      placeholder="https://clips.twitch.tv/... or https://youtube.com/..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] text-xs text-slate-900 dark:text-[#ededed] font-mono"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-[#ededed] uppercase mb-1">
                  Skill Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={postSkillTags}
                  onChange={(e) => setPostSkillTags(e.target.value)}
                  placeholder="Sniper, AWM Reaction, Late Round Anchor"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] text-xs text-slate-900 dark:text-[#ededed] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-[#ededed] uppercase mb-1">
                  Tactical Breakdown / Notes for Coaches
                </label>
                <textarea
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  rows={2}
                  placeholder="Describe your positioning, comms, decision-making, and what makes this play high value..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-[#26262a] bg-slate-50 dark:bg-[#0b0b0c] text-xs text-slate-900 dark:text-[#ededed] focus:bg-white dark:bg-[#131315] focus:outline-none focus:ring-1 focus:ring-slate-950 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPostGameplayOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-[#26262a] text-xs font-semibold text-slate-600 dark:text-[#9a9aa2] hover:bg-slate-50 dark:bg-[#0b0b0c] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGameplay}
                  className="px-5 py-2 rounded-lg bg-[#bef226] hover:bg-[#d0ff36] text-slate-950 dark:text-[#ededed] border border-[#a3e614] text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingGameplay ? (
                    <span>Publishing...</span>
                  ) : (
                    <>
                      <Video className="w-3.5 h-3.5" />
                      <span>Publish Gameplay</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Video Recording Playback Modal */}
      {activePlayingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-3xl rounded-[6px] bg-[#131315] border border-[#26262a] shadow-2xl p-4 relative text-white">
            <button
              onClick={() => setActivePlayingPost(null)}
              className="absolute right-3 top-3 text-slate-400 hover:text-white p-1 cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#bef226]" />
              <span className="text-[10px] font-mono text-[#bef226] font-bold uppercase tracking-wider">
                {activePlayingPost.game} • {activePlayingPost.skillCategory} Showcase
              </span>
            </div>

            <h3 className="text-sm font-bold mb-3">{activePlayingPost.title}</h3>

            <div className="rounded overflow-hidden bg-black aspect-video relative flex items-center justify-center border border-white/10">
              {activePlayingPost.videoUrl && (activePlayingPost.videoUrl.startsWith('blob:') || activePlayingPost.videoUrl.endsWith('.mp4') || activePlayingPost.videoUrl.startsWith('data:')) ? (
                <video
                  src={activePlayingPost.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#bef226] text-black mx-auto flex items-center justify-center">
                    <Play className="w-8 h-8 fill-black ml-1" />
                  </div>
                  <p className="text-xs text-slate-300">
                    Verified match recording replay stream
                  </p>
                  <div className="text-[11px] font-mono text-slate-400 bg-black/60 px-3 py-1 rounded inline-block">
                    {activePlayingPost.videoUrl || "https://scoutforge.gg/replays/match-vortex-telemetry.mp4"}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <div>Player: <strong className="text-white">{activePlayingPost.playerIgn}</strong> ({activePlayingPost.playerTag})</div>
              <div>FitScore: <strong className="text-[#bef226]">{activePlayingPost.fitScore}/100</strong></div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: Incomplete Profile Warning Modal */}
      {incompleteWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-md rounded-[8px] border p-6 relative shadow-2xl transition-all ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#131315] border-[#26262a] text-[#ededed]'
          }`}>
            <button
              onClick={() => setIncompleteWarning(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-[#ededed] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-[6px] bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </span>
              <div>
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider block">
                  Application Blocked • Profile Required
                </span>
                <h3 className="text-base font-black">
                  Incomplete Profile for {incompleteWarning.game}
                </h3>
              </div>
            </div>

            <p className={`text-xs mb-4 leading-relaxed ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'}`}>
              You cannot apply for <strong className="text-[#ededed]">{incompleteWarning.opening.roleNeeded}</strong> at <strong className="text-[#ededed]">{incompleteWarning.opening.teamName}</strong> because your <strong className="text-[#e8ff59]">{incompleteWarning.game}</strong> competitive profile is incomplete.
              Organisers require verified in-game credentials, rank certification, and match engine telemetry before evaluating candidate dossiers.
            </p>

            <div className={`p-3.5 rounded-[6px] border text-xs space-y-2 mb-5 ${
              isLight ? 'bg-red-50/50 border-red-200' : 'bg-[#0b0b0c] border-[#26262a]'
            }`}>
              <div className="text-[10px] font-mono font-bold text-[#9a9aa2] uppercase tracking-wider">
                Missing Requirements:
              </div>
              {incompleteWarning.missingFields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-2 font-bold text-xs text-red-400">
                  <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{field}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-inherit">
              <button
                type="button"
                onClick={() => setIncompleteWarning(null)}
                className={`px-4 py-2 rounded-[6px] text-xs font-bold border transition-colors cursor-pointer ${
                  isLight ? 'border-slate-300 hover:bg-slate-100 text-slate-700' : 'border-[#26262a] hover:bg-[#1a1a1d] text-[#ededed]'
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleLaunchQuickComplete(incompleteWarning.opening)}
                className="px-4 py-2 rounded-[6px] text-xs font-black bg-[#e8ff59] hover:bg-[#d8ef49] text-black transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Complete {incompleteWarning.game} Profile Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Quick Complete Game Profile Modal */}
      {quickCompleteOpening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-lg rounded-[8px] border p-6 relative shadow-2xl transition-all ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#131315] border-[#26262a] text-[#ededed]'
          }`}>
            <button
              onClick={() => setQuickCompleteOpening(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-[#ededed] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-[6px] bg-[#e8ff59] text-black">
                <Gamepad className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#e8ff59] uppercase tracking-wider block">
                  Profile Certification & Telemetry Ingestion
                </span>
                <h3 className="text-base font-black">
                  Complete Profile for {quickCompleteOpening.game}
                </h3>
              </div>
            </div>

            <p className={`text-xs mb-4 ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'}`}>
              Provide your in-game identifier and rank for <strong>{quickCompleteOpening.game}</strong> to ingest your combat telemetry and unlock your application to <strong>{quickCompleteOpening.teamName}</strong>.
            </p>

            <form onSubmit={handleSaveQuickComplete} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold">
                  {quickCompleteOpening.game === 'CS2'
                    ? 'Steam64 ID (17 Digits) *'
                    : quickCompleteOpening.game === 'Valorant'
                    ? 'Riot ID & Tagline *'
                    : quickCompleteOpening.game === 'League of Legends'
                    ? 'Summoner Name & Tagline *'
                    : quickCompleteOpening.game === 'Rocket League'
                    ? 'Epic Games Account ID *'
                    : quickCompleteOpening.game === 'BGMI'
                    ? 'Character UID (10 Digits) *'
                    : 'In-Game UID / Identifier *'}
                </label>
                <input
                  type="text"
                  required
                  value={quickUid}
                  onChange={(e) => setQuickUid(e.target.value)}
                  placeholder="e.g. 76561198012345678 or Player#TAG"
                  className={`w-full px-3 py-2 rounded-[6px] text-xs font-mono font-bold border focus:outline-none transition-colors ${
                    isLight ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900' : 'border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold">Competitive Rank / ELO *</label>
                  <input
                    type="text"
                    required
                    value={quickRank}
                    onChange={(e) => setQuickRank(e.target.value)}
                    placeholder="e.g. FACEIT Level 10 / Radiant / Supersonic"
                    className={`w-full px-3 py-2 rounded-[6px] text-xs font-semibold border focus:outline-none transition-colors ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900' : 'border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold">Primary Tactical Role *</label>
                  <input
                    type="text"
                    required
                    value={quickRole}
                    onChange={(e) => setQuickRole(e.target.value)}
                    placeholder="e.g. AWPer / Duelist / Assaulter"
                    className={`w-full px-3 py-2 rounded-[6px] text-xs font-semibold border focus:outline-none transition-colors ${
                      isLight ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900' : 'border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]'
                    }`}
                  />
                </div>
              </div>

              <div className={`p-3.5 rounded-[6px] border text-xs space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'
              }`}>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#9a9aa2]">
                  <span>INGESTED COMBAT TELEMETRY</span>
                  <span className="text-[#e8ff59] font-bold">AUTO-CALIBRATED</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
                  <div className="p-2 rounded bg-[#131315] border border-[#26262a]">
                    <div className="text-[10px] text-[#9a9aa2]">SAMPLE MATCHES</div>
                    <div className="text-sm font-bold text-[#ededed]">{quickMatches}</div>
                  </div>
                  <div className="p-2 rounded bg-[#131315] border border-[#26262a]">
                    <div className="text-[10px] text-[#9a9aa2]">K/D RATIO</div>
                    <div className="text-sm font-bold text-[#ededed]">{quickKd}</div>
                  </div>
                  <div className="p-2 rounded bg-[#131315] border border-[#26262a]">
                    <div className="text-[10px] text-[#9a9aa2]">FITSCORE</div>
                    <div className="text-sm font-bold text-[#e8ff59]">{quickFitScore}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => setQuickCompleteOpening(null)}
                  className={`px-4 py-2 rounded-[6px] text-xs font-bold border transition-colors cursor-pointer ${
                    isLight ? 'border-slate-300 hover:bg-slate-100 text-slate-700' : 'border-[#26262a] hover:bg-[#1a1a1d] text-[#ededed]'
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-[6px] text-xs font-black bg-[#e8ff59] hover:bg-[#d8ef49] text-black transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Save & Complete Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
