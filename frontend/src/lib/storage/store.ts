// ScoutForge Reactive Store & Multi-Tenant State
// Complies with PRD Section 5, 8, 9, 12

'use client';

import { useState, useEffect } from 'react';
import {
  Player,
  Roster,
  ScoutingBrief,
  CandidateRecommendation,
  DecisionLog,
  AudioJob,
  GameTitle,
  IngestionValidationSummary,
} from '@/types';
import {
  INITIAL_PLAYERS,
  INITIAL_ROSTERS,
  INITIAL_AUDIO_JOBS,
  INITIAL_DECISIONS,
} from '@/lib/mock/initialData';
import { rankCandidatesForBrief } from '@/lib/scoring/engine';
import { apiFetch } from '@/lib/api/client';

export interface AppState {
  currentOrgId: string;
  currentGameTitle: GameTitle;
  players: Player[];
  rosters: Roster[];
  briefs: ScoutingBrief[];
  decisions: DecisionLog[];
  audioJobs: AudioJob[];
  activeBrief: ScoutingBrief | null;
  activeRecommendations: CandidateRecommendation[];
  comparisonPlayerIds: string[];
  ingestionHistory: IngestionValidationSummary[];
  isPandaScoreConnected: boolean;
  isPandaScoreStale: boolean;
  dataSourceBanner: string;
}

const DEFAULT_BRIEF: ScoutingBrief = {
  id: 'brief-cs2-igl-01',
  organizationId: 'org-apex',
  rosterId: 'roster-cs2-apex',
  title: 'Tier 1 CS2 IGL Gap Replacement Brief',
  gameTitle: 'Counter-Strike 2',
  targetRole: 'IGL',
  evaluationWindowDays: 180,
  competitionTier: 'Tier 1',
  mustHaveConstraints: {
    maxBuyoutUsd: 350000,
    primaryLanguage: 'English',
    minMatches: 10,
  },
  preferredConstraints: {
    region: 'EU',
    minClutchWinPct: 0.25,
  },
  formulaVersion: 'v1.0.0-cs2-igl',
  decisionStatus: 'open',
  createdAt: '2026-10-23T10:00:00Z',
};

export function useScoutForgeStore() {
  const [currentOrgId, setCurrentOrgId] = useState<string>('org-apex');
  const [currentGameTitle, setCurrentGameTitle] = useState<GameTitle>('Counter-Strike 2');
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [rosters, setRosters] = useState<Roster[]>(INITIAL_ROSTERS);
  const [briefs, setBriefs] = useState<ScoutingBrief[]>([DEFAULT_BRIEF]);
  const [activeBrief, setActiveBrief] = useState<ScoutingBrief | null>(DEFAULT_BRIEF);
  const [decisions, setDecisions] = useState<DecisionLog[]>(INITIAL_DECISIONS);
  const [audioJobs, setAudioJobs] = useState<AudioJob[]>(INITIAL_AUDIO_JOBS);
  const [comparisonPlayerIds, setComparisonPlayerIds] = useState<string[]>(['p-siuhy', 'p-aleksib']);
  const [isPandaScoreConnected, setIsPandaScoreConnected] = useState<boolean>(true);
  const [isPandaScoreStale, setIsPandaScoreStale] = useState<boolean>(false);
  const [ingestionHistory, setIngestionHistory] = useState<IngestionValidationSummary[]>([
    {
      source: 'PandaScore CS2 Major Snapshot',
      totalRows: 12,
      acceptedRows: 12,
      rejectedRows: 0,
      rejectionReasons: [],
      affectedPlayers: ['siuhy', 'aleksib', 'cadian', 'neok'],
      sourceFreshness: '2026-10-24T08:00:00Z',
      isStale: false,
      isSimulated: true,
      importedAt: '2026-10-24T08:05:00Z',
    },
  ]);

  // Sync real players from FastAPI backend
  useEffect(() => {
    async function syncRealPlayers() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('scoutforge_access_token') || undefined : undefined;
        const res = await apiFetch<{ items: any[] }>('/players?limit=100', { token });
        if (res?.items && res.items.length > 0) {
          const mapped: Player[] = res.items.map((p, idx) => ({
            id: String(p.id),
            handle: p.handle,
            realName: p.name || p.handle,
            currentTeamId: 't-1',
            currentTeamName: p.team_name || 'Free Agent',
            gameTitle: 'Counter-Strike 2',
            primaryRole: p.role,
            region: p.region || 'EU',
            tier: p.tier || 'Tier 2',
            matchesPlayed: p.matches_count || 12,
            roundsPlayed: (p.matches_count || 12) * 24,
            lastMatchDate: '2026-10-24',
            stats: {
              rating: 1.15,
              kdRatio: p.kd || 1.10,
              adr: p.adr || 78.5,
              kpr: p.kpr || 0.72,
              openingImpact: 0.65,
              tradeability: 0.72,
              utilityValue: 0.60,
              tradeStructure: 0.70,
              lateRoundImpact: 0.62,
              survivalValue: 0.58,
              openingDuelWinRate: 0.52,
              clutchValue: 0.68,
              commandRatio: 1.25,
              callsPerRound: 3.4,
              clarity: 0.88,
              winAfterCall: 0.62,
              adaptation: 0.78,
            },
            visibilityGap: Math.round((1 - (p.confidence || 0.75)) * 100) / 100,
            improvementTrend: 0.08,
            buyoutUsd: p.tier === 'Tier 1' ? 350000 : 45000,
            contractUntil: '2026-12-31',
            availability: (p.is_available ? 'Available' : 'Under Contract') as any,
            primaryLanguage: 'English',
            isSimulated: p.source === 'simulated',
            provenanceSource: p.source || 'simulated',
            hasConsentedAudio: true,
          }));
          setPlayers(mapped);
        }
      } catch (err) {
        console.warn('Real players live sync notice:', err);
      }
    }
    syncRealPlayers();
  }, []);

  // Compute recommendations for the active brief
  const activeRecommendations = activeBrief
    ? rankCandidatesForBrief(activeBrief, players)
    : [];

  // Filtered by current organization (Multi-tenant scoping)
  const scopedRosters = rosters.filter(r => r.organizationId === currentOrgId && r.gameTitle === currentGameTitle);
  const scopedBriefs = briefs.filter(b => b.organizationId === currentOrgId);
  const scopedDecisions = decisions.filter(d => d.organizationId === currentOrgId);
  const scopedAudioJobs = audioJobs.filter(a => a.organizationId === currentOrgId);

  // Actions
  const addDecision = async (decision: Omit<DecisionLog, 'id' | 'timestamp' | 'organizationId'>) => {
    const newDecision: DecisionLog = {
      ...decision,
      id: `dec-${Date.now()}`,
      organizationId: currentOrgId,
      timestamp: new Date().toISOString(),
    };
    setDecisions(prev => [newDecision, ...prev]);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('scoutforge_access_token') || undefined : undefined;
      const pIdNum = parseInt(decision.playerId, 10);
      if (!isNaN(pIdNum)) {
        await apiFetch('/decisions', {
          method: 'POST',
          token,
          body: JSON.stringify({
            player_id: pIdNum,
            action: decision.action,
            rationale: decision.rationale,
            outcome_label: 'pending_trial',
          }),
        });
      }
    } catch (e) {
      console.warn('Backend decision sync notice:', e);
    }
  };

  const updateDecisionOutcome = (decisionId: string, outcomeFeedback: string) => {
    setDecisions(prev =>
      prev.map(d => (d.id === decisionId ? { ...d, outcomeFeedback } : d))
    );
  };

  const createBrief = (newBrief: Omit<ScoutingBrief, 'id' | 'createdAt' | 'organizationId'>) => {
    const created: ScoutingBrief = {
      ...newBrief,
      id: `brief-${Date.now()}`,
      organizationId: currentOrgId,
      createdAt: new Date().toISOString(),
    };
    setBriefs(prev => [created, ...prev]);
    setActiveBrief(created);
    return created;
  };

  const toggleComparisonPlayer = (playerId: string) => {
    setComparisonPlayerIds(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      }
      if (prev.length >= 3) {
        // max 3 candidates in side-by-side
        return [...prev.slice(1), playerId];
      }
      return [...prev, playerId];
    });
  };

  const addAudioJob = (job: Omit<AudioJob, 'id' | 'uploadedAt' | 'organizationId'>) => {
    const created: AudioJob = {
      ...job,
      id: `audio-job-${Date.now()}`,
      organizationId: currentOrgId,
      uploadedAt: new Date().toISOString(),
    };
    setAudioJobs(prev => [created, ...prev]);
    return created;
  };

  const recordIngestion = (summary: IngestionValidationSummary) => {
    setIngestionHistory(prev => [summary, ...prev]);
  };

  const togglePandaScoreStatus = () => {
    setIsPandaScoreConnected(prev => !prev);
    setIsPandaScoreStale(prev => !prev);
  };

  return {
    currentOrgId,
    setCurrentOrgId,
    currentGameTitle,
    setCurrentGameTitle,
    players,
    setPlayers,
    rosters: scopedRosters,
    allRosters: rosters,
    setRosters,
    briefs: scopedBriefs,
    activeBrief,
    setActiveBrief,
    activeRecommendations,
    decisions: scopedDecisions,
    addDecision,
    updateDecisionOutcome,
    createBrief,
    audioJobs: scopedAudioJobs,
    addAudioJob,
    comparisonPlayerIds,
    setComparisonPlayerIds,
    toggleComparisonPlayer,
    ingestionHistory,
    recordIngestion,
    isPandaScoreConnected,
    isPandaScoreStale,
    togglePandaScoreStatus,
  };
}
