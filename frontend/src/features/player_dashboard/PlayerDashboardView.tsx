'use client';

import React, { useState } from 'react';
import { OverviewTab } from './tabs/OverviewTab';
import { RoleBenchmarkTab } from './tabs/RoleBenchmarkTab';
import { EvidenceAudioTab } from './tabs/EvidenceAudioTab';
import { ScoutingFeedTab } from './tabs/ScoutingFeedTab';
import { PlayerProfileTab } from './tabs/PlayerProfileTab';
import { RosterOpeningsTab } from './tabs/RosterOpeningsTab';
import { AvailabilityModal } from './components/AvailabilityModal';
import { ExportPdfModal } from './components/ExportPdfModal';
import { LogoutModal } from './components/LogoutModal';
import { PlayerLoginView } from './components/PlayerLoginView';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  TabType,
  PlayerProfile,
  TrajectoryPoint,
  GameType,
  GameProfile,
  RosterOpening,
  RoleApplication,
  GameplayPost,
} from '@/types/dashboard';
import {
  Activity,
  Briefcase,
  BarChart2,
  Mic,
  Eye,
  User,
  Download,
  Calendar,
  LogOut,
  ChevronRight,
  Shield,
  Crosshair,
  Flame,
  Swords,
  Zap,
  Search,
} from 'lucide-react';

import { PlayerDirectoryView } from '@/features/players/PlayerDirectoryView';
import { INITIAL_PLAYERS } from '@/lib/mock/initialData';
import { Player } from '@/types';

interface PlayerDashboardViewProps {
  theme?: 'dark' | 'light';
  onNavigate?: (screen: string) => void;
  onToggleTheme?: () => void;
  players?: Player[];
  onToggleCompare?: (playerId: string) => void;
  comparisonPlayerIds?: string[];
}

export function PlayerDashboardView({
  theme = 'dark',
  onNavigate,
  onToggleTheme,
  players = INITIAL_PLAYERS,
  onToggleCompare,
  comparisonPlayerIds = [],
}: PlayerDashboardViewProps) {
  const isLight = theme === 'light';

  // Navigation State for Player Tabs
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Multi-game data profiles
  const gamesCatalog: Record<
    GameType,
    {
      role: string;
      secondaryRole: string;
      fitScore: number;
      matches: number;
      cohort: string;
      topStrength: string;
      priorityImprovement: string;
      primaryMastery: string;
    }
  > = {
    Valorant: {
      role: 'Duelist',
      secondaryRole: 'Initiator',
      fitScore: 84,
      matches: 52,
      cohort: 'VCT South Asia Challengers',
      topStrength: 'First Blood Conversion (84th %ile)',
      priorityImprovement: 'Post-Plant Flash Utility Efficiency',
      primaryMastery: 'Jett / Raze Entry Fragger & Sova Recon',
    },
    BGMI: {
      role: 'Assaulter',
      secondaryRole: 'IGL',
      fitScore: 88,
      matches: 64,
      cohort: 'BGIS Tier 1 Contender',
      topStrength: 'Close-Range Spray Transfer (91st %ile)',
      priorityImprovement: 'Phase 5 Compound Rotation Timing',
      primaryMastery: 'M416 + DBS Frontline Assault & Zone Calling',
    },
    'Free Fire': {
      role: 'Rusher',
      secondaryRole: 'Sniper',
      fitScore: 81,
      matches: 48,
      cohort: 'FFWS South Asia Pro League',
      topStrength: 'Gloo Wall Placement Speed (89th %ile)',
      priorityImprovement: 'Mid-Range Drag Headshot Stability',
      primaryMastery: 'AWM Long-Sight Sniping & Shotgun Rush',
    },
    'Mobile Legends': {
      role: 'Jungler',
      secondaryRole: 'Assassin',
      fitScore: 86,
      matches: 58,
      cohort: 'MPL Regional Qualifier',
      topStrength: 'Lord Retribution Timing (92nd %ile)',
      priorityImprovement: 'Early Gold Lane Gank Frequency',
      primaryMastery: 'Ling, Fanny & Hayabusa Jungle Carry',
    },
    CS2: {
      role: 'AWPer',
      secondaryRole: 'Lurker',
      fitScore: 76,
      matches: 45,
      cohort: 'Tier 2 South Asia Semi-Pro',
      topStrength: 'Late-Round Survival (88th %ile)',
      priorityImprovement: 'Opening Duel Win Rate (41st %ile)',
      primaryMastery: 'IGL (In-Game Leader) & Secondary AWPer',
    },
  };

  const initialGamesPlayed: GameProfile[] = [
    {
      id: 'BGMI',
      name: 'BGMI',
      shortName: 'BGMI',
      badge: 'Mobile BR',
      ign: '5128940192 (Vortex)',
      rank: 'Conqueror Top 100',
      primaryRole: 'Assaulter',
      secondaryRole: 'IGL',
      tier: 'BGIS Verified',
      fitScore: 88,
      matchesSampled: 64,
      kdOrKda: '5.82',
      primaryStatLabel: 'Avg Dmg',
      primaryStatValue: '842.0',
      winRate: '72%',
      server: 'India (20ms)',
    },
    {
      id: 'Valorant',
      name: 'Valorant',
      shortName: 'VAL',
      badge: 'PC FPS',
      ign: 'Vortex#VAL',
      rank: 'Radiant #412',
      primaryRole: 'Duelist',
      secondaryRole: 'Initiator',
      tier: 'Tier 1 VCT',
      fitScore: 84,
      matchesSampled: 52,
      kdOrKda: '1.34',
      primaryStatLabel: 'ACS',
      primaryStatValue: '284.5',
      winRate: '68%',
      server: 'Mumbai (18ms)',
    },
    {
      id: 'CS2',
      name: 'CS2',
      shortName: 'CS2',
      badge: 'PC Tactical',
      ign: 'Vortex_CS',
      rank: 'FACEIT Level 10',
      primaryRole: 'AWPer',
      secondaryRole: 'Lurker',
      tier: 'Semi-Pro Cohort',
      fitScore: 76,
      matchesSampled: 45,
      kdOrKda: '1.35',
      primaryStatLabel: 'ADR',
      primaryStatValue: '87.4',
      winRate: '62%',
      server: 'Mumbai (15ms)',
    },
    {
      id: 'Free Fire',
      name: 'Free Fire',
      shortName: 'FF',
      badge: 'Mobile BR',
      ign: 'Vortex_FF#77',
      rank: 'Grandmaster V',
      primaryRole: 'Rusher',
      secondaryRole: 'Sniper',
      tier: 'FFWS Circuit',
      fitScore: 81,
      matchesSampled: 48,
      kdOrKda: '4.60',
      primaryStatLabel: 'HS Rate',
      primaryStatValue: '68.4%',
      winRate: '64%',
      server: 'India (24ms)',
    },
    {
      id: 'Mobile Legends',
      name: 'Mobile Legends',
      shortName: 'MLBB',
      badge: 'Mobile MOBA',
      ign: 'VortexMLBB',
      rank: 'Mythical Glory 1,240★',
      primaryRole: 'Jungler',
      secondaryRole: 'Assassin',
      tier: 'MPL Qualifier',
      fitScore: 86,
      matchesSampled: 58,
      kdOrKda: '8.40',
      primaryStatLabel: 'Gold/Min',
      primaryStatValue: '740 GPM',
      winRate: '76%',
      server: 'South Asia (32ms)',
    },
  ];

  // Roster Openings
  const initialOpenings: RosterOpening[] = [
    {
      id: 'op-1',
      teamName: 'Velocity Gaming',
      teamTag: 'VLT',
      game: 'Valorant',
      roleNeeded: 'Primary Duelist / Entry Fragger',
      organizationType: 'Tier 1 Esports Org',
      tier: 'VCT Tier 1 Contender',
      priority: 'Immediate Trial',
      minRank: 'Radiant Top 500',
      scrimHours: '18:00 – 23:30 IST (6 Days/Wk)',
      region: 'South Asia / Mumbai Server',
      compensation: '₹45,000/mo Stipend + 20% Prize Cut',
      description:
        'Looking for an explosive entry fragger on Jett/Raze with proven First Blood consistency and tournament experience. Clear comms required.',
      postedBy: "Coach 'Marzil' (VLT Staff)",
      postedAgo: '2 hours ago',
      applied: false,
      skillCategory: 'Entry Fragger',
      skillsRequired: ['Entry Fragger', 'First Blood Conversion', 'Jett Dash Entry', 'Micro-Flicks'],
    },
    {
      id: 'op-2',
      teamName: 'Team GodLike',
      teamTag: 'GODL',
      game: 'BGMI',
      roleNeeded: 'Frontline Assaulter & Secondary Finisher',
      organizationType: 'Tier 1 Esports Org',
      tier: 'BGIS Tier 1 Certified',
      priority: 'High Priority',
      minRank: 'Conqueror (5.0+ K/D)',
      scrimHours: '17:30 – 00:00 IST (Daily)',
      region: 'India (Bootcamp in Mumbai)',
      compensation: '₹65,000/mo Salary + Accommodation',
      description:
        'Seeking fearless close-range sprayer with high damage output in Phase 4/5 circles. Experience in official Krafton tournaments required.',
      postedBy: "Manager 'Ghatak'",
      postedAgo: '5 hours ago',
      applied: true,
      skillCategory: 'Assaulter',
      skillsRequired: ['Assaulter', 'Phase 5 Close-Range Spray', 'Compound Breach', 'M416 3x Laser'],
    },
    {
      id: 'op-3',
      teamName: 'Reckoning Esports',
      teamTag: 'REC',
      game: 'CS2',
      roleNeeded: 'Dedicated Primary AWPer & Site Anchor',
      organizationType: 'Pro Esports Org',
      tier: 'Semi-Pro Cohort',
      priority: 'Immediate Trial',
      minRank: 'FACEIT Level 10 (2400+ Elo)',
      scrimHours: '19:00 – 23:00 IST (5 Days/Wk)',
      region: 'South Asia (Mumbai 15ms)',
      compensation: 'Contract Stipend + Gear Sponsorships',
      description:
        'Reckoning CS2 is seeking a disciplined sniper/AWPer capable of holding Inferno Banana and Mirage Mid under high-pressure rounds.',
      postedBy: "Captain 'Aki'",
      postedAgo: '1 day ago',
      applied: false,
      skillCategory: 'Sniper',
      skillsRequired: ['Sniper', 'AWM Reaction Hold (<190ms)', 'Late-Round Anchor', 'Clutch Composure'],
    },
    {
      id: 'op-4',
      teamName: 'Total Gaming Esports',
      teamTag: 'TG',
      game: 'Free Fire',
      roleNeeded: 'Flank Rusher & Shotgun Specialist',
      organizationType: 'Pro Esports Org',
      tier: 'FFWS Pro League',
      priority: 'Academy Stipend',
      minRank: 'Grandmaster IV+',
      scrimHours: '18:00 – 22:30 IST (6 Days/Wk)',
      region: 'India / South Asia',
      compensation: '₹30,000/mo Base + Bonuses',
      description:
        'Recruiting an ultra-fast Gloo Wall player who excels in 1v2 close quarters clutching. Weekly scrims against top Asian squads.',
      postedBy: "Scout 'Fozy'",
      postedAgo: '1 day ago',
      applied: false,
      skillCategory: 'Rusher',
      skillsRequired: ['Rusher', 'Gloo Wall Placement Speed', 'M1887 Shotgun', 'Flank Timing'],
    },
    {
      id: 'op-5',
      teamName: 'Enigma Gaming',
      teamTag: 'EG',
      game: 'Mobile Legends',
      roleNeeded: 'Jungle Assassin & Objective Marksman',
      organizationType: 'Semi-Pro Team',
      tier: 'MPL Regional Qualifier',
      priority: 'Standard Need',
      minRank: 'Mythical Glory 1,000+ Stars',
      scrimHours: '19:00 – 23:00 IST (Flexible)',
      region: 'South Asia / SEA Server',
      compensation: 'Stipend + Tournament Revenue Share',
      description:
        'Looking for high-mechanic Ling, Fanny, and Hayabusa players for upcoming regional qualifiers. Fast retributions and strong objective calling.',
      postedBy: "Coach 'Raven'",
      postedAgo: '2 days ago',
      applied: false,
      skillCategory: 'Sniper',
      skillsRequired: ['Sniper', 'Lord Retribution Smite', 'Objective Precision', 'Fast Gank Burst'],
    },
    {
      id: 'op-6',
      teamName: 'Global Esports Academy',
      teamTag: 'GEA',
      game: 'Valorant',
      roleNeeded: 'Bomber / Spike Specialist & Controller',
      organizationType: 'Tier 2 Academy',
      tier: 'Tier 2 VCT Academy',
      priority: 'Standard Need',
      minRank: 'Immortal 3+',
      scrimHours: '17:00 – 21:00 IST (5 Days/Wk)',
      region: 'South Asia / Mumbai',
      compensation: '₹25,000/mo Academy Stipend + Pathway',
      description:
        'Developing next-generation VCT talent. Seeking a dedicated Bomber and Spike defense specialist with post-plant lineups (Viper/Sova/Brimstone).',
      postedBy: "Lead Coach 'Eraser'",
      postedAgo: '3 days ago',
      applied: false,
      skillCategory: 'Bomber',
      skillsRequired: ['Bomber', 'Spike Defusal Denial', 'Post-Plant Lineups', 'Controller Smokes', 'Molly Timing'],
    },
  ];

  // Gameplay Showcase Highlights
  const initialGameplayPosts: GameplayPost[] = [
    {
      id: 'gp-1',
      title: '1v3 AWP Reaction Hold & Retake on Inferno B-Site',
      playerIgn: "Sam 'Vortex'",
      playerTag: 'SAM#8842',
      playerRole: 'AWPer / Sniper',
      fitScore: 84,
      game: 'CS2',
      skillCategory: 'Sniper',
      skillTags: ['Sniper', 'AWM Hold', 'Reaction Time (180ms)', 'Late-Round Clutch'],
      videoUrl: 'https://scoutforge.gg/clips/sam-awp-clutch',
      matchContext: 'FACEIT Level 10 Scrim • Round 28 Retake',
      keyStats: '3 AWP Kills • 180ms Reaction • 0 Dmg Taken',
      description:
        'Disciplined sniper anchor holding banana push, instant flick onto second entry and taking down the defuser with 2 seconds on the clock.',
      postedAgo: '3 hours ago',
      likesCount: 42,
      viewsCount: 890,
      verifiedScoutScore: true,
    },
    {
      id: 'gp-2',
      title: 'Post-Plant Sova Shock Dart Double Kill (Spike Denied)',
      playerIgn: "Aman 'Shock' Verma",
      playerTag: 'SHOCK#9901',
      playerRole: 'Initiator / Bomber',
      fitScore: 89,
      game: 'Valorant',
      skillCategory: 'Bomber',
      skillTags: ['Bomber', 'Spike Plant Defense', 'Double Shock Lineup', 'Ascent B-Site'],
      videoUrl: 'https://scoutforge.gg/clips/shock-sova-bomber',
      matchContext: 'VCT South Asia Challengers • Map 2 Ascent',
      keyStats: '2 Kills via Shock Darts • Defusal Denied at 0.3s',
      description:
        'Calculated double bounce shock dart lineup from B-Main to default plant site denying ninja defuse in sudden death overtime.',
      postedAgo: '6 hours ago',
      likesCount: 68,
      viewsCount: 1420,
      verifiedScoutScore: true,
    },
    {
      id: 'gp-3',
      title: 'Phase 5 Compound Spray Transfer (4v1 Squad Clutch)',
      playerIgn: "Rohan 'SprayGod' Das",
      playerTag: 'SPRAY#4412',
      playerRole: 'Frontline Assaulter',
      fitScore: 88,
      game: 'BGMI',
      skillCategory: 'Assaulter',
      skillTags: ['Assaulter', 'Spray Transfer', 'M416 3x', 'Close Quarters'],
      videoUrl: 'https://scoutforge.gg/clips/spraygod-bgmi-clutch',
      matchContext: 'BGIS Tier 1 Scrims • Erangel School Compound',
      keyStats: '1v4 Clutch • 840 Damage • 91st %ile Spray',
      description:
        'Down to last player against 4-man push, transferred M416 spray across 3 targets with zero reloads to secure match win.',
      postedAgo: '1 day ago',
      likesCount: 95,
      viewsCount: 2310,
      verifiedScoutScore: true,
    },
    {
      id: 'gp-4',
      title: '4-Man Gloo Wall Breach & Double Shotgun Wipe',
      playerIgn: "Karan 'Nitro' Roy",
      playerTag: 'NITRO#7723',
      playerRole: 'Flank Rusher',
      fitScore: 81,
      game: 'Free Fire',
      skillCategory: 'Rusher',
      skillTags: ['Rusher', 'Shotgun Specialist', 'Gloo Wall Speed (89ms)'],
      videoUrl: 'https://scoutforge.gg/clips/nitro-ffws-wipe',
      matchContext: 'FFWS Pro League Qualifiers • Final Circle',
      keyStats: '4 Kills in 8 seconds • 89% Gloo Speed',
      description:
        'High-speed rusher breach breaking enemy compound wall and wiping entire final squad under heavy crossfire.',
      postedAgo: '1 day ago',
      likesCount: 54,
      viewsCount: 1120,
      verifiedScoutScore: true,
    },
  ];

  // Initial applications
  const initialApplications: RoleApplication[] = [
    {
      id: 'app-1',
      openingId: 'op-2',
      teamName: 'Team GodLike',
      game: 'BGMI',
      roleApplied: 'Frontline Assaulter & Secondary Finisher',
      submittedAt: 'Yesterday at 14:20 IST',
      status: 'Shortlisted for Trial',
      coachNote:
        'Impressive spray transfer and 88/100 fit score. Scrim trial scheduled for Tuesday 19:30 IST. Be in our Discord waiting lobby.',
      applicantIgn: 'Vortex',
      fitScore: 88,
      message:
        'Hi Ghatak, applying as Frontline Assaulter. BGIS verified player with 5.82 K/D and 91st %ile spray transfers.',
      gameUid: '5128940192 (Character ID)',
      experienceYears: 3,
      experienceMonths: 4,
      currentRank: 'Conqueror (5.82 K/D)',
      primaryAgentOrWeapon: 'M416 + DBS Frontline',
      playerAge: '19',
      locationCity: 'Pune, Maharashtra',
      discordContact: 'vortex_cs2#1337',
      phoneContact: '+91 98765 43210',
      scrimAvailability: '17:30 – 00:00 IST (Daily)',
      hardwareSetup: 'iPhone 15 Pro Max (60-90 FPS) • 20ms',
      pastTournaments: 'BGIS 2025 Round of 32, BMPS Tier 1 Scrims',
      bootcampReady: true,
    },
    {
      id: 'app-2',
      openingId: 'op-6',
      teamName: 'Global Esports Academy',
      game: 'Valorant',
      roleApplied: 'Bomber / Spike Specialist & Controller',
      submittedAt: '3 days ago',
      status: 'Under Review',
      coachNote: 'Dossier received and verified by ScoutForge automated pipeline. Coaching staff review in progress.',
      applicantIgn: "Sam 'Vortex'",
      fitScore: 84,
      message: 'Interested in GE Academy roster pathway. Fluent comms, reliable scrim attendance, Radiant peak.',
      gameUid: 'Vortex#VAL (Riot ID)',
      experienceYears: 2,
      experienceMonths: 8,
      currentRank: 'Radiant #412 (Peak 550RR)',
      primaryAgentOrWeapon: 'Omen / Viper / Sova',
      playerAge: '19',
      locationCity: 'Pune, India',
      discordContact: 'vortex_cs2#1337',
      phoneContact: '+91 98765 43210',
      scrimAvailability: '18:00 – 23:30 IST (6 Days/Wk)',
      hardwareSetup: '240Hz Zowie • Ryzen 7 7800X3D (18ms Mumbai)',
      pastTournaments: 'VCT South Asia Challengers Open Qualifiers Top 8',
      bootcampReady: true,
    },
  ];

  // Player State
  const [player, setPlayer] = useState<PlayerProfile>({
    name: 'Sam',
    fullName: `Sam "Vortex" Sharma`,
    tag: 'SAM#8842',
    playerId: '8842',
    title: 'Multi-Title Competitive Player',
    activeGame: 'BGMI',
    role: 'Assaulter',
    secondaryRole: 'IGL',
    region: 'India & APAC',
    availabilityStatus: 'Open to Offers',
    fitScore: 88,
    fitFormula: 'Formula v1.2',
    confidence: 'High Confidence',
    dataCoverage: 92,
    matchesSampled: 64,
    cohort: 'BGIS Tier 1 Contender',
    profileStatus: 'Hidden Gem Eligible',
    topStrength: 'Close-Range Spray Transfer (91st %ile)',
    topStrengthPercentile: 91,
    priorityImprovement: 'Phase 5 Compound Rotation Timing',
    priorityImprovementPercentile: 45,

    // Multi-game details
    gamesPlayed: initialGamesPlayed,

    // Contact & Details
    email: 'sam.vortex.esports@gmail.com',
    phone: '+91 98765 43210',
    discord: 'vortex_esports#1337',
    faceitElo: 'FACEIT Lvl 10 (2,480 ELO)',
    location: 'Pune, India (South Asia)',
    languages: 'English, Hindi (Fluent Comms)',

    // Playtime & Logistics
    totalHours: '4,250 Hours',
    currentGrind: '38 hrs / week',
    scrimWindow: '18:00 – 23:30 IST',
    scrimDays: '6 Days/Week',
    bootcampReady: true,
    lanReady: true,
    preferredServers: 'Mumbai (15ms), Singapore (55ms)',

    // Tactical Mastery & Map Pool
    primaryMastery: 'M416 + DBS Frontline Assault & Zone Calling',
    expertiseTags: [
      'Compound Breaches',
      'Phase 5 Spray Transfers',
      'Zone Rotations',
      'Mid-Round Calling',
    ],
    signatureMaps: [
      { name: 'Erangel', winRate: 76, note: 'School Compound & Pochinki' },
      { name: 'Miramar', winRate: 71, note: 'Hacienda Push & Ridge Anchor' },
      { name: 'Sanhok', winRate: 68, note: 'Bootcamp Drop & Close CQC' },
    ],

    // Past Experience & Achievements
    previousRoster: {
      team: 'Team Eclipse (Tier 2 South Asia)',
      tier: 'Tier 2',
      role: 'Assaulter / IGL',
      period: 'Jan 2026 – Aug 2026',
    },
    notableTournament: {
      name: 'BGIS 2025 Tier 1 Contender Series',
      finish: 'Top 4 Finish',
    },
    hardwareSetup: 'iPhone 15 Pro Max / 240Hz PC • HyperX QuadCast (Verified)',
  });

  // 6-Week Trajectory Data
  const trajectory: TrajectoryPoint[] = [
    { week: 'W1', score: 74.5, matches: 8, date: '09/14' },
    { week: 'W2', score: 76.0, matches: 7, date: '09/21' },
    { week: 'W3', score: 78.2, matches: 9, date: '09/28' },
    { week: 'W4', score: 80.8, matches: 6, date: '10/05' },
    { week: 'W5', score: 84.5, matches: 8, date: '10/12' },
    { week: 'W6', score: 88.0, matches: 7, date: '10/19' },
  ];

  // Modals & Auth State
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Openings & Posts State
  const [openings, setOpenings] = useState<RosterOpening[]>(initialOpenings);
  const [applications, setApplications] = useState<RoleApplication[]>(initialApplications);
  const [gameplayPosts, setGameplayPosts] = useState<GameplayPost[]>(initialGameplayPosts);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSelectGame = (game: GameType) => {
    const gameConfig = gamesCatalog[game];
    setPlayer(prev => ({
      ...prev,
      activeGame: game,
      role: gameConfig.role,
      secondaryRole: gameConfig.secondaryRole,
      fitScore: gameConfig.fitScore,
      matchesSampled: gameConfig.matches,
      cohort: gameConfig.cohort,
      topStrength: gameConfig.topStrength,
      priorityImprovement: gameConfig.priorityImprovement,
      primaryMastery: gameConfig.primaryMastery,
    }));
    addToast(`Switched active scouting title to ${game}!`, 'success');
  };

  const handleUpdateAvailability = (updated: Partial<PlayerProfile>) => {
    setPlayer(prev => {
      const newPlayer = { ...prev, ...updated };
      if (updated.activeGame && updated.activeGame !== prev.activeGame) {
        const gameConfig = gamesCatalog[updated.activeGame];
        newPlayer.role = gameConfig.role;
        newPlayer.secondaryRole = gameConfig.secondaryRole;
        newPlayer.fitScore = gameConfig.fitScore;
        newPlayer.cohort = gameConfig.cohort;
      }
      return newPlayer;
    });
    addToast('Player profile details and availability updated.', 'success');
  };

  const handleApplyToOpening = (
    opening: RosterOpening,
    appData: {
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
  ) => {
    setOpenings(prev =>
      prev.map(op => (op.id === opening.id ? { ...op, applied: true } : op))
    );

    const newApp: RoleApplication = {
      id: `app-${Date.now()}`,
      openingId: opening.id,
      teamName: opening.teamName,
      game: opening.game,
      roleApplied: opening.roleNeeded,
      submittedAt: 'Just now',
      status: 'Under Review',
      coachNote:
        'Application received with verified Game UID and competitive experience dossier. Coaching staff notified.',
      applicantIgn: player.name,
      fitScore: player.fitScore,
      ...appData,
    };

    setApplications(prev => [newApp, ...prev]);
    addToast(
      `Application sent to ${opening.teamName}! Your Game UID (${appData.gameUid}) and ${appData.experienceYears}y ${appData.experienceMonths}m experience were submitted.`,
      'success'
    );
  };

  const handlePostGameplay = (
    newPostData: Omit<GameplayPost, 'id' | 'postedAgo' | 'likesCount' | 'viewsCount'>
  ) => {
    const createdPost: GameplayPost = {
      ...newPostData,
      id: `gp-${Date.now()}`,
      postedAgo: 'Just now',
      likesCount: 1,
      viewsCount: 1,
    };

    setGameplayPosts(prev => [createdPost, ...prev]);
    addToast(
      'Gameplay highlight published! Organizations and scouts can now evaluate your skills.',
      'success'
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="space-y-6">
        <PlayerLoginView
          onLogin={() => setIsLoggedIn(true)}
          theme={theme}
          onToggleTheme={onToggleTheme || (() => {})}
        />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  const tabsConfig: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'openings', label: 'Roster Openings & Applications', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'players', label: 'Player Directory', icon: <Search className="w-4 h-4" /> },
    { id: 'benchmark', label: 'Role Benchmark', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'evidence', label: 'Comms & Evidence', icon: <Mic className="w-4 h-4" /> },
    { id: 'scouting', label: 'Scouting Timeline', icon: <Eye className="w-4 h-4" /> },
    { id: 'profile', label: 'My Dossier', icon: <User className="w-4 h-4" /> },
  ];

  const gameOptions: GameType[] = ['BGMI', 'Valorant', 'CS2', 'Free Fire', 'Mobile Legends'];

  return (
    <div className="space-y-6">
      {/* Top Banner: Player Identity & Action Bar */}
      <div
        className={`p-5 rounded-[6px] border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-[#131315] border-[#26262a] text-[#ededed]'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-[6px] flex items-center justify-center font-mono font-bold text-base border shrink-0 ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-800'
                : 'bg-[#0b0b0c] border-[#26262a] text-[#e8ff59]'
            }`}
          >
            {player.tag.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold tracking-tight">
                {player.fullName}
              </h1>
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded-[4px] border ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-700'
                    : 'bg-[#0b0b0c] border-[#26262a] text-[#9a9aa2]'
                }`}
              >
                {player.tag}
              </span>
              <button
                type="button"
                onClick={() => setIsAvailabilityOpen(true)}
                className={`text-xs px-2 py-0.5 rounded-[4px] border font-medium cursor-pointer transition-colors ${
                  player.availabilityStatus === 'Available for Trial'
                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                    : player.availabilityStatus === 'Open to Offers'
                    ? 'border-[#e8ff59]/40 text-[#e8ff59] bg-[#e8ff59]/10'
                    : 'border-[#26262a] text-[#9a9aa2] bg-[#0b0b0c]'
                }`}
              >
                ● {player.availabilityStatus}
              </button>
            </div>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
              {player.title} • {player.region} • {player.role} ({player.activeGame})
            </p>
          </div>
        </div>

        {/* Action Controls: Game Switcher & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Game Selector */}
          <div className="flex items-center gap-1 border border-[#26262a] p-1 rounded-[6px] bg-[#0b0b0c]">
            {gameOptions.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => handleSelectGame(g)}
                className={`text-xs px-2.5 py-1 rounded-[4px] font-medium transition-colors ${
                  player.activeGame === g
                    ? 'bg-[#131315] text-[#e8ff59] font-bold shadow-xs'
                    : 'text-[#9a9aa2] hover:text-[#ededed]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsExportPdfOpen(true)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-[6px] border font-medium transition-colors ${
              isLight
                ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800'
                : 'border-[#26262a] bg-[#0b0b0c] hover:bg-[#18181b] text-[#ededed]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            title="Log out of player session"
            className={`p-1.5 rounded-[6px] border text-xs transition-colors ${
              isLight
                ? 'border-slate-300 text-slate-600 hover:bg-slate-100'
                : 'border-[#26262a] text-[#9a9aa2] hover:text-red-400 hover:bg-[#0b0b0c]'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div
        className={`flex items-center gap-1 overflow-x-auto border-b pb-2 ${
          isLight ? 'border-slate-200' : 'border-[#26262a]'
        }`}
      >
        {tabsConfig.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-[6px] transition-colors whitespace-nowrap ${
                isActive
                  ? isLight
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-[#131315] text-[#e8ff59] border-b-2 border-[#e8ff59] font-bold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-[#9a9aa2] hover:text-[#ededed] hover:bg-[#131315]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <OverviewTab player={player} trajectory={trajectory} theme={theme} />
        )}

        {activeTab === 'openings' && (
          <RosterOpeningsTab
            player={player}
            openings={openings}
            applications={applications}
            gameplayPosts={gameplayPosts}
            onApply={handleApplyToOpening}
            onPostGameplay={handlePostGameplay}
            onShowToast={addToast}
            theme={theme}
          />
        )}

        {activeTab === 'benchmark' && (
          <RoleBenchmarkTab initialRole={player.role} theme={theme} />
        )}

        {activeTab === 'evidence' && (
          <EvidenceAudioTab onShowToast={addToast} theme={theme} />
        )}

        {activeTab === 'scouting' && <ScoutingFeedTab theme={theme} />}

        {activeTab === 'profile' && (
          <PlayerProfileTab
            player={player}
            onEditClick={() => setIsAvailabilityOpen(true)}
            onSelectGame={handleSelectGame}
            onShowToast={addToast}
            onLogout={() => setIsLogoutModalOpen(true)}
            theme={theme}
          />
        )}

        {activeTab === 'players' && (
          <div className="pt-2">
            <PlayerDirectoryView
              players={players}
              onToggleCompare={onToggleCompare || (() => {})}
              comparisonPlayerIds={comparisonPlayerIds}
              onNavigate={onNavigate || (() => {})}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <AvailabilityModal
        player={player}
        isOpen={isAvailabilityOpen}
        onClose={() => setIsAvailabilityOpen(false)}
        onSave={handleUpdateAvailability}
      />

      <ExportPdfModal
        player={player}
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
        onShowToast={addToast}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        player={player}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={() => {
          setIsLogoutModalOpen(false);
          setIsLoggedIn(false);
          addToast('Logged out of player portal.', 'info');
        }}
      />

      {/* Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
