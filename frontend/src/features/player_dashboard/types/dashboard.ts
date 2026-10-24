export type TabType = "overview" | "benchmark" | "evidence" | "scouting" | "profile" | "openings" | "players" | "applied";

export type GameType = "CS2" | "Valorant" | "League of Legends" | "Rocket League" | "BGMI";

export function normalizeGameType(game?: string): GameType {
  if (!game) return "CS2";
  const lower = game.toLowerCase().trim();
  if (lower.includes("counter-strike") || lower.includes("cs2") || lower.includes("cs:go") || lower.includes("counterstrike")) return "CS2";
  if (lower.includes("valorant")) return "Valorant";
  if (lower.includes("league") || lower.includes("lol") || lower.includes("riot")) return "League of Legends";
  if (lower.includes("rocket") || lower.includes("rlcs")) return "Rocket League";
  if (lower.includes("battlegrounds") || lower.includes("bgmi") || lower.includes("pubg")) return "BGMI";
  return "CS2";
}

export interface GameProfile {
  id: GameType;
  name: string;
  shortName: string;
  badge: string;
  ign: string;
  rank: string;
  primaryRole: string;
  secondaryRole: string;
  tier: string;
  fitScore: number;
  matchesSampled: number;
  kdOrKda: string;
  primaryStatLabel: string;
  primaryStatValue: string;
  winRate: string;
  server: string;
}

export interface SignatureMap {
  name: string;
  winRate: number;
  note: string;
}

export type AvailabilityStatus = "Available for Trial" | "Open to Offers" | "In Active Scrims" | "Restricted";

export interface GameplayVideoClip {
  id: string;
  title: string;
  game: GameType;
  videoUrl?: string;
  thumbnail?: string;
  duration: string;
  resolution: string;
  tag: string;
  uploadedAt: string;
  fileSize?: string;
  tacticalVerdict?: string;
  aiScore?: number;
}

export interface PlayerProfile {
  name: string;
  fullName: string;
  tag: string;
  playerId: string;
  title: string;
  activeGame: GameType;
  role: string;
  secondaryRole: string;
  region: string;
  availabilityStatus: AvailabilityStatus;
  fitScore: number;
  fitFormula: string;
  confidence: "High Confidence" | "Calibrating";
  dataCoverage: number;
  matchesSampled: number;
  cohort: string;
  profileStatus: string;
  topStrength: string;
  topStrengthPercentile: number;
  priorityImprovement: string;
  priorityImprovementPercentile: number;
  
  // Multi-game details
  gamesPlayed: GameProfile[];

  // Contact & Identity
  email: string;
  phone: string;
  discord: string;
  faceitElo: string;
  location: string;
  languages: string;

  // Extended Dossier Credentials
  gameUid?: string;
  steamId?: string; // For Leetify CS2 match telemetry
  pandascoreId?: string; // For PandaScore official pro verification
  riotId?: string; // For Valorant API verification
  mobileUid?: string; // For BGMI / Free Fire tournament UID
  deviceSetup?: string;
  controlStyle?: string;
  primaryWeaponCombo?: string;
  peakTier?: string;
  tournamentExperience?: string;
  expectedContract?: string;
  videoHighlightUrl?: string;
  videoClips?: GameplayVideoClip[];

  // Playtime & Logistics
  totalHours: string;
  currentGrind: string;
  scrimWindow: string;
  scrimDays: string;
  bootcampReady: boolean;
  lanReady: boolean;
  preferredServers: string;

  // Expertise & Maps
  primaryMastery: string;
  expertiseTags: string[];
  signatureMaps: SignatureMap[];

  // Past Experience
  previousRoster: {
    team: string;
    tier: string;
    role: string;
    period: string;
  };
  notableTournament: {
    name: string;
    finish: string;
  };
  hardwareSetup: string;
}

export interface TrajectoryPoint {
  week: string;
  score: number;
  matches: number;
  date: string;
}

export interface BenchmarkComparisonMetric {
  id: string;
  name: string;
  yourValue: string;
  cohortAverage: string;
  percentile: number;
  unit?: string;
  description?: string;
}

export interface TranscriptSnippet {
  time: string;
  speaker: string;
  text: string;
}

export interface EvidenceItem {
  id: string;
  filename: string;
  type: "Match Log" | "Comms Audio" | "Gameplay Video";
  durationOrRounds: string;
  status: "Queued" | "Processing" | "Needs Review" | "Complete";
  submittedAt: string;
  filesize?: string;
  videoUrl?: string;
  transcript?: TranscriptSnippet[];
}

export interface ScoutingTimelineEvent {
  id: string;
  author: string;
  organization?: string;
  action: string;
  target: string;
  timeAgo: string;
  type: "analyst" | "coach" | "system" | "audit";
  detail?: string;
}

// Roster Opening & Recruitment by Organizations and Teams
export interface RosterOpening {
  id: string;
  teamName: string;
  teamTag: string;
  game: GameType;
  roleNeeded: string;
  tier: string;
  organizationType: "Tier 1 Esports Org" | "Pro Esports Org" | "Tier 2 Academy" | "Semi-Pro Team";
  priority: "High Priority" | "Immediate Trial" | "Standard Need" | "Academy Stipend";
  minRank: string;
  scrimHours: string;
  region: string;
  compensation: string;
  description: string;
  postedBy: string; // e.g., "Org Head Coach" or "General Manager"
  postedAgo: string;
  applied?: boolean;
  skillCategory: "Sniper" | "Bomber" | "Entry Fragger" | "IGL" | "Assaulter" | "Rusher" | "Support";
  skillsRequired: string[];
}

// Role Application submitted by a player
export interface RoleApplication {
  id: string;
  openingId: string;
  teamName: string;
  game: GameType;
  roleApplied: string;
  submittedAt: string;
  status: "Under Review" | "Shortlisted for Trial" | "Interview Scheduled" | "Accepted" | "Archived";
  coachNote?: string;
  applicantIgn: string;
  fitScore: number;
  message: string;

  // Verification & Background Details
  gameUid: string;              // In-game UID / Character ID / Steam ID
  experienceYears: number;      // Years playing
  experienceMonths: number;     // Months playing
  currentRank: string;          // e.g. "Radiant Top 500" or "Conqueror"
  primaryAgentOrWeapon: string; // e.g. "Jett / Raze" or "AWP / M416"
  playerAge?: string;           // e.g. "19"
  locationCity?: string;        // e.g. "Pune, India"
  discordContact: string;       // e.g. "vortex#1337"
  phoneContact?: string;        // e.g. "+91 98765 43210"
  scrimAvailability: string;    // e.g. "18:00 – 23:30 IST (6 Days/Wk)"
  hardwareSetup?: string;       // e.g. "240Hz PC • 15ms Mumbai Server"
  pastTournaments?: string;     // e.g. "BGIS 2025 Round of 32"
  bootcampReady?: boolean;
}

// Player Gameplay Highlight Post
export interface GameplayPost {
  id: string;
  title: string;
  playerIgn: string;
  playerTag: string;
  playerRole: string;
  fitScore: number;
  game: GameType;
  skillCategory: "Sniper" | "Bomber" | "Entry Fragger" | "IGL" | "Assaulter" | "Rusher" | "Support";
  skillTags: string[];
  videoUrl?: string;
  matchContext: string;
  keyStats: string;
  description: string;
  postedAgo: string;
  likesCount: number;
  viewsCount: number;
  verifiedScoutScore: boolean;
}
