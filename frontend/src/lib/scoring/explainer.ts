// ScoutForge Explanation Integrity Checker
// PRD Section 9.5 & 12 Technical Acceptance Test 8
// Verifies every numerical claim against stored database metrics to prevent hallucinations.

import { Player, CandidateRecommendation } from '@/types';

export interface ExplanationVerificationResult {
  isValid: boolean;
  rejectedClaims: string[];
  verifiedClaims: string[];
  explanation: string;
}

/**
 * Extracts numeric tokens from explanation text and verifies each against player stats and scores.
 */
export function verifyExplanationIntegrity(
  claimText: string,
  player: Player,
  recommendation?: CandidateRecommendation
): ExplanationVerificationResult {
  const rejectedClaims: string[] = [];
  const verifiedClaims: string[] = [];

  // Match numbers like 1.28, 81.4, $250,000, 94%, etc.
  const regex = /(\$?\d+(?:,\d+)*(?:\.\d+)?%?)/g;
  const matches = claimText.match(regex) || [];

  // Collect all known numbers for this player
  const knownNumbers = new Set<string>();

  // Add stats numbers
  const addNum = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return;
    knownNumbers.add(val.toString());
    knownNumbers.add(val.toFixed(1));
    knownNumbers.add(val.toFixed(2));
    knownNumbers.add(Math.round(val).toString());
    knownNumbers.add(`${Math.round(val * 100)}%`);
    knownNumbers.add(`${(val * 100).toFixed(0)}%`);
    knownNumbers.add(`${(val * 100).toFixed(1)}%`);
  };

  const s = player.stats;
  addNum(s.kdRatio);
  addNum(s.adr);
  addNum(s.kpr);
  addNum(s.rating);
  addNum(s.openingImpact);
  addNum(s.tradeability);
  addNum(s.utilityValue);
  addNum(s.tradeStructure);
  addNum(s.clutchValue);
  addNum(s.openingDuelWinRate);
  addNum(s.lateRoundImpact);
  addNum(s.survivalValue);
  addNum(s.commandRatio);
  addNum(s.callsPerRound);
  addNum(s.clarity);
  addNum(s.winAfterCall);
  addNum(s.adaptation);
  addNum(player.matchesPlayed);
  addNum(player.buyoutUsd);
  knownNumbers.add(`$${player.buyoutUsd.toLocaleString()}`);
  knownNumbers.add(`$${player.buyoutUsd}`);

  if (recommendation) {
    addNum(recommendation.fitScore);
    addNum(recommendation.confidence.score);
    addNum(recommendation.metricContributions.rolePerformance);
    addNum(recommendation.metricContributions.rosterNeedMatch);
    addNum(recommendation.metricContributions.synergyContribution);
    addNum(recommendation.metricContributions.constraintMatch);
    Object.values(recommendation.metricContributions.individualMetrics).forEach(addNum);
  }

  // Also permit standard conversational/window numbers: 5 (roster slots), 60 (60-day window), 180 (180-day window), 30, 10
  const allowedGeneralNumbers = new Set(['1', '2', '3', '4', '5', '10', '15', '30', '60', '90', '180', '100', '100%', '60%']);

  for (const match of matches) {
    const cleanToken = match.trim();
    if (knownNumbers.has(cleanToken) || allowedGeneralNumbers.has(cleanToken)) {
      verifiedClaims.push(cleanToken);
    } else {
      rejectedClaims.push(`Unsupported claim '${cleanToken}' cannot be verified in candidate database records.`);
    }
  }

  const isValid = rejectedClaims.length === 0;

  return {
    isValid,
    rejectedClaims,
    verifiedClaims,
    explanation: isValid
      ? claimText
      : `[EXPLANATION REJECTED BY INTEGRITY CHECKER: Contains unverified numerical claims: ${rejectedClaims.join(', ')}]`,
  };
}
