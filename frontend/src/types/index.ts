// ScoutForge Canonical Type Definitions
// Compliant with PRD Section 5, 6, 8, 9, 12

export type GameTitle = 'Counter-Strike 2' | 'Valorant';

export type RoleCS2 = 'Entry' | 'AWPer' | 'Lurker' | 'Support' | 'IGL';
export type RoleValorant = 'Initiator' | 'Duelist' | 'Controller' | 'Sentinel' | 'Flex/IGL';
export type Role = RoleCS2 | RoleValorant;

export type CompetitionTier = 'Tier 1' | 'Tier 2' | 'Tier 3';

export type AvailabilityStatus = 'Available' | 'Transfer Listed' | 'Under Contract' | 'Free Agent';

export type AudioProcessingStatus = 'none' | 'queued' | 'processing' | 'needs-review' | 'complete' | 'failed';

export interface PlayerStats {
  rating: number;
  kdRatio: number;
  adr: number;
  kpr: number;
  openingImpact: number;
  tradeability: number;
  utilityValue: number;
  tradeStructure: number;
  lateRoundImpact: number;
  survivalValue: number;
  openingDuelWinRate: number;
  clutchValue: number;
  // IGL specific
  commandRatio?: number;
  callsPerRound?: number;
  clarity?: number;
  winAfterCall?: number;
  adaptation?: number;
  // Statistical fallbacks for IGL
  roundWinContrib?: number;
  midRoundAdaptation?: number;
  utilityCoordination?: number;
  economyDiscipline?: number;
}

export interface Player {
  id: string;
  handle: string;
  realName: string;
  currentTeamId: string;
  currentTeamName: string;
  gameTitle: GameTitle;
  primaryRole: Role;
  secondaryRole?: Role;
  region: string;
  tier: CompetitionTier;
  matchesPlayed: number;
  roundsPlayed: number;
  lastMatchDate: string;
  stats: PlayerStats;
  visibilityGap: number; // 0 to 1, higher = under-observed / hidden gem candidate
  improvementTrend: number; // e.g. +0.12 or -0.04
  buyoutUsd: number;
  contractUntil: string;
  availability: AvailabilityStatus;
  primaryLanguage: string;
  isSimulated: boolean;
  provenanceSource: string;
  hasConsentedAudio: boolean;
}

export interface RosterSlot {
  slotNumber: number;
  assignedRole: Role;
  player: Player | null;
  isStarter: boolean;
  roleScore?: number;
}

export interface Roster {
  id: string;
  organizationId: string;
  teamId: string;
  teamName: string;
  name: string;
  gameTitle: GameTitle;
  slots: RosterSlot[];
  weakestRole: {
    role: Role;
    reason: string;
    gapSeverity: 'Critical' | 'Moderate' | 'Minor';
  } | null;
  roleCoverageScore: number; // 0-100
  roleOverlapAlerts: string[];
  lastUpdated: string;
}

export interface ScoringWeights {
  rolePerformanceWeight: number; // 0.55 default
  rosterNeedMatchWeight: number; // 0.20 default
  synergyContributionWeight: number; // 0.15 default
  constraintMatchWeight: number; // 0.10 default
  customRoleMetricWeights?: Record<string, number>;
}

export interface ScoutingBrief {
  id: string;
  organizationId: string;
  rosterId: string;
  title: string;
  gameTitle: GameTitle;
  targetRole: Role;
  evaluationWindowDays: number;
  competitionTier: CompetitionTier;
  mustHaveConstraints: {
    maxBuyoutUsd?: number;
    primaryLanguage?: string;
    minMatches?: number;
  };
  preferredConstraints: {
    region?: string;
    minClutchWinPct?: number;
  };
  weightsOverride?: ScoringWeights;
  formulaVersion: string;
  decisionStatus: 'open' | 'evaluated' | 'closed';
  createdAt: string;
}

export interface CandidateMetricContributions {
  rolePerformance: number;
  rosterNeedMatch: number;
  synergyContribution: number;
  constraintMatch: number;
  individualMetrics: Record<string, number>;
}

export interface ConfidenceBreakdown {
  score: number; // 0 to 100
  label: 'High Confidence' | 'Promising but Under-Observed' | 'Sparse Data (Capped)' | 'Low Reliability';
  dataCoverage: number; // 0 to 1
  sampleReliability: number; // 0 to 1
  recency: number; // 0 to 1
  isCapped: boolean;
  capReason?: string;
}

export interface CandidateRecommendation {
  rank: number;
  player: Player;
  fitScore: number; // 0-100
  confidence: ConfidenceBreakdown;
  metricContributions: CandidateMetricContributions;
  positiveDrivers: string[];
  risks: string[];
  missingDataWarnings: string[];
  weightRedistributions?: string[];
  audioStatus: AudioProcessingStatus;
  dataFreshness: string;
  formulaVersion: string;
}

export type DecisionAction = 'advance' | 'trial' | 'watch' | 'reject';

export interface DecisionLog {
  id: string;
  organizationId: string;
  briefId: string;
  briefTitle: string;
  playerId: string;
  playerHandle: string;
  action: DecisionAction;
  rationale: string;
  userEmail: string;
  timestamp: string;
  fitScore: number;
  formulaVersion: string;
  outcomeFeedback?: string; // e.g. "Trial passed: signed 1-year contract"
}

export interface AudioTranscriptSegment {
  timestampStart: string;
  timestampEnd: string;
  speaker: string;
  text: string;
  confidence: number; // 0 to 1
  tacticalCalloutTags: string[];
  needsHumanReview: boolean;
}

export interface AudioJob {
  id: string;
  organizationId: string;
  playerId: string;
  playerHandle: string;
  fileName: string;
  fileSizeBytes: number;
  consentSigned: boolean;
  status: AudioProcessingStatus;
  uploadedAt: string;
  completedAt?: string;
  modelVersion: string;
  transcriptSegments: AudioTranscriptSegment[];
  overallClarityScore: number;
  averageConfidence: number;
  humanReviewRequired: boolean;
}

export interface IngestionValidationSummary {
  source: string;
  totalRows: number;
  acceptedRows: number;
  rejectedRows: number;
  rejectionReasons: { rowNumber: number; reason: string; column?: string }[];
  affectedPlayers: string[];
  sourceFreshness: string;
  isStale: boolean;
  isSimulated: boolean;
  importedAt: string;
}
