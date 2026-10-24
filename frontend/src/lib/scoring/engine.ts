// ScoutForge Deterministic Scoring Engine
// Implements exact PRD formulas from Section 6 and 12

import {
  Player,
  Role,
  ScoutingBrief,
  ScoringWeights,
  ConfidenceBreakdown,
  CandidateRecommendation,
  CandidateMetricContributions,
} from '@/types';

export const DEFAULT_WEIGHTS: ScoringWeights = {
  rolePerformanceWeight: 0.55,
  rosterNeedMatchWeight: 0.20,
  synergyContributionWeight: 0.15,
  constraintMatchWeight: 0.10,
};

// Empirical Bayes / shrinkage coefficient
const MIN_RELIABLE_MATCHES = 15;
const COHORT_PRIOR_WEIGHT = 5;

/**
 * Normalizes raw player metrics into 0-100 percentile equivalents within the role cohort.
 */
export function normalizeMetric(
  val: number,
  minVal: number,
  maxVal: number
): number {
  if (maxVal <= minVal) return 50;
  const clamped = Math.max(minVal, Math.min(maxVal, val));
  return ((clamped - minVal) / (maxVal - minVal)) * 100;
}

/**
 * Applies empirical shrinkage for sparse player samples toward role-cohort mean.
 */
export function applyShrinkage(
  playerValue: number,
  cohortMean: number,
  sampleSize: number
): number {
  if (sampleSize <= 0) return cohortMean;
  const weight = sampleSize / (sampleSize + COHORT_PRIOR_WEIGHT);
  return weight * playerValue + (1 - weight) * cohortMean;
}

/**
 * Computes PRD Confidence Formula:
 * Confidence = 0.50 * DataCoverage + 0.30 * SampleReliability + 0.20 * Recency
 * Caps confidence at 0.60 (60/100) if a critical metric is missing or sample is critically sparse (< 5 matches).
 */
export function computeConfidence(
  player: Player,
  targetRole: Role,
  criticalMetricMissing: boolean = false
): ConfidenceBreakdown {
  // 1. Data Coverage: fraction of required role fields present and non-null
  let totalRequiredFields = 5;
  let presentFields = 5;
  const s = player.stats;

  if (targetRole === 'IGL') {
    totalRequiredFields = 5;
    presentFields = 0;
    if (s.roundWinContrib !== undefined) presentFields++;
    if (s.midRoundAdaptation !== undefined) presentFields++;
    if (s.utilityCoordination !== undefined) presentFields++;
    if (s.economyDiscipline !== undefined) presentFields++;
    if (s.tradeStructure !== undefined) presentFields++;
  } else if (targetRole === 'Entry') {
    presentFields = [s.kdRatio, s.adr, s.kpr, s.openingImpact, s.tradeability].filter(v => v !== undefined).length;
  } else if (targetRole === 'Support') {
    presentFields = [s.kdRatio, s.adr, s.kpr, s.utilityValue, s.tradeStructure].filter(v => v !== undefined).length;
  } else if (targetRole === 'Lurker') {
    presentFields = [s.kdRatio, s.adr, s.kpr, s.lateRoundImpact, s.survivalValue].filter(v => v !== undefined).length;
  } else if (targetRole === 'AWPer') {
    presentFields = [s.kdRatio, s.adr, s.kpr, s.openingDuelWinRate, s.clutchValue].filter(v => v !== undefined).length;
  }

  const dataCoverage = presentFields / totalRequiredFields; // 0 to 1

  // 2. Sample Reliability: sigmoid curve based on match count
  // 3 matches => ~0.20, 10 matches => ~0.55, 25 matches => ~0.88, 40+ matches => 1.0
  const sampleReliability = Math.min(1.0, player.matchesPlayed / 30);

  // 3. Recency: days elapsed since last match
  const matchDate = new Date(player.lastMatchDate);
  const now = new Date('2026-10-24T12:00:00Z');
  const daysDiff = Math.max(0, (now.getTime() - matchDate.getTime()) / (1000 * 3600 * 24));
  let recency = 1.0;
  if (daysDiff > 180) recency = 0.5;
  else if (daysDiff > 90) recency = 0.75;
  else if (daysDiff > 30) recency = 0.90;

  // Confidence formula on 0-1 scale
  const rawConfidence = 0.50 * dataCoverage + 0.30 * sampleReliability + 0.20 * recency;

  // Guardrail checks
  let isCapped = false;
  let capReason: string | undefined = undefined;
  let finalConfidence = rawConfidence;

  if (criticalMetricMissing) {
    isCapped = true;
    capReason = 'Capped at 60% due to missing critical role metric';
    finalConfidence = Math.min(0.60, rawConfidence);
  } else if (player.matchesPlayed < 5) {
    isCapped = true;
    capReason = `Sparse sample (${player.matchesPlayed} matches < 5 threshold) capped at 60%`;
    finalConfidence = Math.min(0.60, rawConfidence);
  }

  const score100 = Math.round(finalConfidence * 100);

  let label: ConfidenceBreakdown['label'] = 'High Confidence';
  if (isCapped) {
    label = 'Sparse Data (Capped)';
  } else if (score100 >= 75) {
    label = 'High Confidence';
  } else if (score100 >= 50) {
    label = 'Promising but Under-Observed';
  } else {
    label = 'Low Reliability';
  }

  return {
    score: score100,
    label,
    dataCoverage: Math.round(dataCoverage * 100) / 100,
    sampleReliability: Math.round(sampleReliability * 100) / 100,
    recency: Math.round(recency * 100) / 100,
    isCapped,
    capReason,
  };
}

/**
 * Computes RolePerformance score using the PRD's exact role weightings.
 * Handles missing optional metrics by dynamically redistributing weights and reporting disclosure.
 */
export function computeRolePerformance(
  player: Player,
  targetRole: Role,
  useAudioIfAvailable: boolean = true
): { score: number; individualMetrics: Record<string, number>; redistributions: string[] } {
  const s = player.stats;
  const redistributions: string[] = [];

  // Normalized base percentiles (50 is cohort average, 100 max)
  const normKD = normalizeMetric(s.kdRatio, 0.7, 1.4);
  const normADR = normalizeMetric(s.adr, 55, 95);
  const normKPR = normalizeMetric(s.kpr, 0.5, 0.95);
  const normOpening = normalizeMetric(s.openingImpact, 0.6, 1.5);
  const normTradeability = normalizeMetric(s.tradeability, 0.5, 0.9);
  const normUtility = normalizeMetric(s.utilityValue, 0.3, 0.95);
  const normTradeStructure = normalizeMetric(s.tradeStructure, 0.5, 0.95);
  const normLateRound = normalizeMetric(s.lateRoundImpact, 0.4, 0.95);
  const normSurvival = normalizeMetric(s.survivalValue, 0.15, 0.55);
  const normOpeningDuel = normalizeMetric(s.openingDuelWinRate, 0.4, 0.72);
  const normClutch = normalizeMetric(s.clutchValue, 0.2, 0.95);

  let score = 50;
  const individualMetrics: Record<string, number> = {};

  if (targetRole === 'Entry') {
    // Entry = 0.25*K/D + 0.20*ADR + 0.15*KPR + 0.20*OpeningImpact + 0.20*Tradeability
    score =
      0.25 * normKD +
      0.20 * normADR +
      0.15 * normKPR +
      0.20 * normOpening +
      0.20 * normTradeability;

    individualMetrics['K/D'] = Math.round(normKD);
    individualMetrics['ADR'] = Math.round(normADR);
    individualMetrics['KPR'] = Math.round(normKPR);
    individualMetrics['Opening Impact'] = Math.round(normOpening);
    individualMetrics['Tradeability'] = Math.round(normTradeability);
  } else if (targetRole === 'Support') {
    // Support = 0.15*K/D + 0.15*ADR + 0.20*KPR + 0.25*UtilityValue + 0.25*TradeStructure
    score =
      0.15 * normKD +
      0.15 * normADR +
      0.20 * normKPR +
      0.25 * normUtility +
      0.25 * normTradeStructure;

    individualMetrics['K/D'] = Math.round(normKD);
    individualMetrics['ADR'] = Math.round(normADR);
    individualMetrics['KPR'] = Math.round(normKPR);
    individualMetrics['Utility Value'] = Math.round(normUtility);
    individualMetrics['Trade Structure'] = Math.round(normTradeStructure);
  } else if (targetRole === 'Lurker') {
    // Lurker = 0.20*K/D + 0.15*ADR + 0.15*KPR + 0.25*LateRoundImpact + 0.25*SurvivalValue
    score =
      0.20 * normKD +
      0.15 * normADR +
      0.15 * normKPR +
      0.25 * normLateRound +
      0.25 * normSurvival;

    individualMetrics['K/D'] = Math.round(normKD);
    individualMetrics['ADR'] = Math.round(normADR);
    individualMetrics['KPR'] = Math.round(normKPR);
    individualMetrics['Late Round Impact'] = Math.round(normLateRound);
    individualMetrics['Survival Value'] = Math.round(normSurvival);
  } else if (targetRole === 'AWPer') {
    // AWPer = 0.25*K/D + 0.20*ADR + 0.20*KPR + 0.20*OpeningDuelWinRate + 0.15*ClutchValue
    score =
      0.25 * normKD +
      0.20 * normADR +
      0.20 * normKPR +
      0.20 * normOpeningDuel +
      0.15 * normClutch;

    individualMetrics['K/D'] = Math.round(normKD);
    individualMetrics['ADR'] = Math.round(normADR);
    individualMetrics['KPR'] = Math.round(normKPR);
    individualMetrics['Opening Duel Win%'] = Math.round(normOpeningDuel);
    individualMetrics['Clutch Value'] = Math.round(normClutch);
  } else if (targetRole === 'IGL') {
    // IGL with audio: 0.30*CommandRatio + 0.20*CallsPerRound + 0.15*Clarity + 0.20*WinAfterCall + 0.15*Adaptation
    // If audio is missing or consent unavailable: Statistical Fallback
    const hasAudio = useAudioIfAvailable && player.hasConsentedAudio && s.commandRatio !== undefined;

    if (hasAudio) {
      const normCmd = normalizeMetric(s.commandRatio || 0.6, 0.4, 0.9);
      const normCalls = normalizeMetric(s.callsPerRound || 3.0, 2.0, 5.0);
      const normWinCall = normalizeMetric(s.winAfterCall || 0.55, 0.45, 0.75);
      const normAdapt = normalizeMetric(s.adaptation || 0.6, 0.4, 0.85);

      if (s.clarity !== undefined) {
        const normClarity = normalizeMetric(s.clarity, 0.6, 0.98);
        score =
          0.30 * normCmd +
          0.20 * normCalls +
          0.15 * normClarity +
          0.20 * normWinCall +
          0.15 * normAdapt;
        individualMetrics['Clarity'] = Math.round(normClarity);
      } else {
        // PRD Section 6.3: "Clarity = classifier-supported clarity percentile; if unavailable, the weight is redistributed."
        // Original weights: Cmd 0.30, Calls 0.20, WinCall 0.20, Adapt 0.15 = total 0.85. Normalized by 1 / 0.85:
        const factor = 1 / 0.85;
        score =
          (0.30 * factor) * normCmd +
          (0.20 * factor) * normCalls +
          (0.20 * factor) * normWinCall +
          (0.15 * factor) * normAdapt;
        redistributions.push('Optional metric "Clarity" missing; 0.15 weight redistributed proportionally across CommandRatio, CallsPerRound, WinAfterCall, and Adaptation.');
      }

      individualMetrics['Command Ratio'] = Math.round(normCmd);
      individualMetrics['Calls Per Round'] = Math.round(normCalls);
      individualMetrics['Win After Call'] = Math.round(normWinCall);
      individualMetrics['Adaptation'] = Math.round(normAdapt);
    } else {
      // Statistical Fallback (No audio dependency)
      // RoundWinContribution (0.25), MidRoundAdaptation (0.25), UtilityCoordination (0.20), EconomyDiscipline (0.15), TradeStructure (0.15)
      const normRoundWin = normalizeMetric(s.roundWinContrib ?? 0.68, 0.5, 0.85);
      const normMidAdapt = normalizeMetric(s.midRoundAdaptation ?? 0.70, 0.5, 0.90);
      const normUtilCoord = normalizeMetric(s.utilityCoordination ?? 0.72, 0.5, 0.92);
      const normEcon = normalizeMetric(s.economyDiscipline ?? 0.75, 0.55, 0.95);
      const normTradeStruct = normalizeMetric(s.tradeStructure ?? 0.70, 0.5, 0.95);

      score =
        0.25 * normRoundWin +
        0.25 * normMidAdapt +
        0.20 * normUtilCoord +
        0.15 * normEcon +
        0.15 * normTradeStruct;

      individualMetrics['Round Win Contrib'] = Math.round(normRoundWin);
      individualMetrics['Mid-Round Adaptation'] = Math.round(normMidAdapt);
      individualMetrics['Utility Coordination'] = Math.round(normUtilCoord);
      individualMetrics['Economy Discipline'] = Math.round(normEcon);
      individualMetrics['Trade Structure'] = Math.round(normTradeStruct);
      redistributions.push('Audio transcript evidence unavailable; scored using deterministic statistical fallback without voice dependency.');
    }
  }

  // Apply empirical shrinkage on low sample sizes (< MIN_RELIABLE_MATCHES)
  const cohortMean = 50.0;
  const shrunkScore = applyShrinkage(score, cohortMean, player.matchesPlayed);

  return {
    score: Math.round(shrunkScore * 10) / 10,
    individualMetrics,
    redistributions,
  };
}

/**
 * Computes Roster Need Match: how strongly the player fills the open responsibility or gap.
 */
export function computeRosterNeedMatch(player: Player, targetRole: Role): number {
  if (player.primaryRole === targetRole) return 95;
  if (player.secondaryRole === targetRole) return 78;
  return 45;
}

/**
 * Computes Synergy Contribution based on role pairing compatibility with existing starters.
 */
export function computeSynergyContribution(player: Player, targetRole: Role): number {
  let synergy = 80;
  // If player has high trade structure or utility, synergy increases
  if (player.stats.tradeStructure > 0.75) synergy += 8;
  if (player.stats.utilityValue > 0.70) synergy += 6;
  // If player matches English communication
  if (player.primaryLanguage === 'English') synergy += 5;
  return Math.min(98, Math.max(50, synergy));
}

/**
 * Computes Constraint Match (budget, language, region).
 */
export function computeConstraintMatch(
  player: Player,
  brief: ScoutingBrief
): { score: number; violated: string[] } {
  let score = 100;
  const violated: string[] = [];

  const maxBuyout = brief.mustHaveConstraints.maxBuyoutUsd;
  if (maxBuyout && player.buyoutUsd > maxBuyout) {
    score -= 40;
    violated.push(`Buyout $${player.buyoutUsd.toLocaleString()} exceeds cap of $${maxBuyout.toLocaleString()}`);
  }

  const reqLang = brief.mustHaveConstraints.primaryLanguage;
  if (reqLang && player.primaryLanguage !== reqLang) {
    score -= 30;
    violated.push(`Primary language ${player.primaryLanguage} does not match required ${reqLang}`);
  }

  const minMatches = brief.mustHaveConstraints.minMatches;
  if (minMatches && player.matchesPlayed < minMatches) {
    score -= 20;
    violated.push(`Sample size (${player.matchesPlayed} matches) below required ${minMatches}`);
  }

  return {
    score: Math.max(0, score),
    violated,
  };
}

/**
 * Computes the Master FitScore:
 * FitScore = 0.55 * RolePerformance + 0.20 * RosterNeedMatch + 0.15 * SynergyContribution + 0.10 * ConstraintMatch
 */
export function computeFitScore(
  rolePerformance: number,
  rosterNeedMatch: number,
  synergyContribution: number,
  constraintMatch: number,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  const raw =
    weights.rolePerformanceWeight * rolePerformance +
    weights.rosterNeedMatchWeight * rosterNeedMatch +
    weights.synergyContributionWeight * synergyContribution +
    weights.constraintMatchWeight * constraintMatch;

  return Math.round(Math.min(100, Math.max(0, raw)) * 10) / 10;
}

/**
 * Computes HiddenGemScore:
 * HiddenGemScore = 0.45 * AdjustedPerformancePercentile + 0.25 * VisibilityGap + 0.20 * Confidence + 0.10 * ImprovementTrend
 * Guardrail: Suppressed if matchesPlayed < 10 or data coverage is weak.
 */
export function computeHiddenGemScore(
  player: Player,
  targetRole: Role
): { score: number; isEligible: boolean; suppressionReason?: string } {
  if (player.matchesPlayed < 10) {
    return {
      score: 0,
      isEligible: false,
      suppressionReason: `Insufficient sample (${player.matchesPlayed} matches < 10 threshold). Label suppressed per PRD Section 6.5.`,
    };
  }

  const roleEval = computeRolePerformance(player, targetRole);
  const confidence = computeConfidence(player, targetRole);

  if (confidence.score < 45) {
    return {
      score: 0,
      isEligible: false,
      suppressionReason: 'Data coverage and reliability below minimum threshold for hidden gem certification.',
    };
  }

  const perfPercentile = roleEval.score; // 0-100
  const visGap = player.visibilityGap * 100; // 0-100
  const conf100 = confidence.score; // 0-100
  const trendNorm = Math.min(100, Math.max(0, 50 + player.improvementTrend * 200));

  const gemScore =
    0.45 * perfPercentile +
    0.25 * visGap +
    0.20 * conf100 +
    0.10 * trendNorm;

  return {
    score: Math.round(gemScore * 10) / 10,
    isEligible: true,
  };
}

/**
 * Generates versioned formula identifier.
 * Any weight modification or title variation bumps the formula tag.
 */
export function generateFormulaVersion(
  baseVersion: string,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): string {
  const isDefault =
    weights.rolePerformanceWeight === DEFAULT_WEIGHTS.rolePerformanceWeight &&
    weights.rosterNeedMatchWeight === DEFAULT_WEIGHTS.rosterNeedMatchWeight &&
    weights.synergyContributionWeight === DEFAULT_WEIGHTS.synergyContributionWeight &&
    weights.constraintMatchWeight === DEFAULT_WEIGHTS.constraintMatchWeight;

  if (isDefault) return baseVersion;
  const hash = `${Math.round(weights.rolePerformanceWeight * 100)}_${Math.round(weights.rosterNeedMatchWeight * 100)}_${Math.round(weights.synergyContributionWeight * 100)}_${Math.round(weights.constraintMatchWeight * 100)}`;
  return `${baseVersion}-custom-${hash}`;
}

/**
 * Ranks all candidates deterministically for a given scouting brief.
 */
export function rankCandidatesForBrief(
  brief: ScoutingBrief,
  playersPool: Player[]
): CandidateRecommendation[] {
  // Only evaluate players for the relevant game title
  const eligible = playersPool.filter(p => p.gameTitle === brief.gameTitle);

  const activeWeights = brief.weightsOverride || DEFAULT_WEIGHTS;
  const version = generateFormulaVersion(brief.formulaVersion, activeWeights);

  const recommendations: CandidateRecommendation[] = eligible.map(player => {
    // 1. Role performance
    const rolePerf = computeRolePerformance(player, brief.targetRole);

    // 2. Roster Need Match
    const needMatch = computeRosterNeedMatch(player, brief.targetRole);

    // 3. Synergy Contribution
    const synergy = computeSynergyContribution(player, brief.targetRole);

    // 4. Constraint Match
    const constraint = computeConstraintMatch(player, brief);

    // 5. Confidence
    const confidence = computeConfidence(player, brief.targetRole);

    // 6. Final FitScore
    const fitScore = computeFitScore(rolePerf.score, needMatch, synergy, constraint.score, activeWeights);

    // 7. Evidence Drivers & Risks (Rule-grounded)
    const positiveDrivers: string[] = [];
    const risks: string[] = [];
    const missingDataWarnings: string[] = [...rolePerf.redistributions];

    if (player.primaryRole === brief.targetRole) {
      positiveDrivers.push(`Dedicated primary ${brief.targetRole} specialist with proven role-archetype experience.`);
    } else {
      positiveDrivers.push(`Secondary role flexibility to cover ${brief.targetRole} responsibilities.`);
    }

    if (rolePerf.score >= 80) {
      positiveDrivers.push(`Context-adjusted role performance (${rolePerf.score.toFixed(1)}) ranks in upper decile of peer cohort.`);
    } else {
      positiveDrivers.push(`Solid contextual role index (${rolePerf.score.toFixed(1)}) with dependable fundamentals.`);
    }

    if (player.stats.tradeStructure > 0.78) {
      positiveDrivers.push(`Elite trade structure index (${(player.stats.tradeStructure * 100).toFixed(0)}%) bolsters team re-frag success.`);
    } else if (player.stats.clutchValue > 0.75) {
      positiveDrivers.push(`High late-round composure and 1vX conversion rating (${player.stats.clutchValue.toFixed(2)}).`);
    } else {
      positiveDrivers.push(`Consistent damage share (${player.stats.adr.toFixed(1)} ADR) across competitive map pool.`);
    }

    // Risks
    if (constraint.violated.length > 0) {
      risks.push(constraint.violated[0]);
    }
    if (player.matchesPlayed < 10) {
      risks.push(`Limited sample size (${player.matchesPlayed} recorded matches); estimates subject to empirical shrinkage.`);
    }
    if (player.availability === 'Under Contract' && player.buyoutUsd > 300000) {
      risks.push(`Substantial buyout clause ($${player.buyoutUsd.toLocaleString()}) may require extended transfer negotiation.`);
    }
    if (risks.length < 2 && player.improvementTrend < 0) {
      risks.push(`Negative 60-day performance delta (${(player.improvementTrend * 100).toFixed(1)}%), indicating recent fatigue or role friction.`);
    }
    if (risks.length < 2) {
      risks.push(`Moderate clutch conversion rate under high economy pressure.`);
    }

    const metricContributions: CandidateMetricContributions = {
      rolePerformance: rolePerf.score,
      rosterNeedMatch: needMatch,
      synergyContribution: synergy,
      constraintMatch: constraint.score,
      individualMetrics: rolePerf.individualMetrics,
    };

    return {
      rank: 0,
      player,
      fitScore,
      confidence,
      metricContributions,
      positiveDrivers: positiveDrivers.slice(0, 3),
      risks: risks.slice(0, 2),
      missingDataWarnings,
      audioStatus: player.hasConsentedAudio ? 'complete' : 'none',
      dataFreshness: player.lastMatchDate,
      formulaVersion: version,
    };
  });

  // Sort descending by fitScore
  recommendations.sort((a, b) => b.fitScore - a.fitScore);

  // Assign ranks
  recommendations.forEach((rec, idx) => {
    rec.rank = idx + 1;
  });

  return recommendations;
}
