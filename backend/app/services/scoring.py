"""ScoutForge Pure Mathematical Scoring Engine.

NON-NEGOTIABLE RULE:
Pure functions with unit tests. NO database calls inside the mathematical functions.
All weights and parameters align with app/config/formulas.py.
"""

import math
from typing import Dict, List, Optional, Tuple, Any
from app.config.formulas import (
    ROLE_WEIGHTS,
    IGL_AUDIO_METRICS,
    CONFIDENCE_WEIGHTS,
    SHRINKAGE_K,
    FULL_SAMPLE_THRESHOLD,
    FIT_SCORE_WEIGHTS,
    HIDDEN_GEM_WEIGHTS,
    TIER_VISIBILITY_GAP,
    HIGH_FIT_THRESHOLD,
    LOW_CONFIDENCE_THRESHOLD,
    MISSING_CRITICAL_CONFIDENCE_CAP,
    MINIMUM_HIDDEN_GEM_SAMPLE,
)


def compute_percentile_rank(value: float, cohort_values: List[float]) -> float:
    """Computes empirical percentile rank within a cohort: [0.0, 1.0]."""
    if not cohort_values:
        return 0.5
    count_less_or_equal = sum(1 for v in cohort_values if v <= value)
    return round(count_less_or_equal / len(cohort_values), 4)


def apply_context_adjustment(raw_stat: float, opponent_strength: float, cohort_avg_strength: float = 1.0) -> float:
    """Weights match statistics by opponent strength rating."""
    if cohort_avg_strength <= 0:
        cohort_avg_strength = 1.0
    multiplier = opponent_strength / cohort_avg_strength
    return round(raw_stat * multiplier, 4)


def apply_bayesian_shrinkage(player_mean: float, cohort_mean: float, n_matches: int, k: float = SHRINKAGE_K) -> float:
    """Shrinks small samples toward the cohort mean using credibility theory: alpha = n / (n + k)."""
    if n_matches <= 0:
        return cohort_mean
    alpha = n_matches / (n_matches + k)
    return round((alpha * player_mean) + ((1.0 - alpha) * cohort_mean), 4)


def calculate_role_performance(
    role: str,
    normalized_metrics: Dict[str, float],
    has_valid_audio: bool = False,
    custom_role_weights: Optional[Dict[str, float]] = None,
) -> Tuple[float, Dict[str, float], bool]:
    """Calculates role performance score (0.0 to 100.0).

    Returns:
        (role_score, active_weights, weights_were_redistributed)
    """
    base_weights = custom_role_weights or ROLE_WEIGHTS.get(role, ROLE_WEIGHTS["Entry"])
    weights = base_weights.copy()
    redistributed = False

    # IGL Audio metrics redistribution logic
    if role == "IGL" and not has_valid_audio:
        audio_weight_sum = sum(weights.get(m, 0.0) for m in IGL_AUDIO_METRICS)
        non_audio_keys = [k for k in weights.keys() if k not in IGL_AUDIO_METRICS]
        non_audio_weight_sum = sum(weights[k] for k in non_audio_keys)

        if non_audio_weight_sum > 0 and audio_weight_sum > 0:
            redistributed = True
            for k in non_audio_keys:
                weights[k] = round(weights[k] + (audio_weight_sum * (weights[k] / non_audio_weight_sum)), 4)
            for m in IGL_AUDIO_METRICS:
                weights[m] = 0.0

    score = 0.0
    for metric_name, weight in weights.items():
        if weight > 0:
            val = normalized_metrics.get(metric_name, 0.5)
            score += weight * val

    return round(score * 100.0, 2), weights, redistributed


def calculate_confidence(
    data_coverage: float,
    match_count: int,
    recency_score: float = 1.0,
    has_missing_critical_metric: bool = False,
) -> Tuple[float, Optional[str]]:
    """Calculates confidence score (0.0 to 1.0).

    Formula: 0.50*DataCoverage + 0.30*SampleReliability + 0.20*Recency
    A missing critical metric caps confidence at 0.60 and adds a warning.
    """
    coverage = max(0.0, min(1.0, data_coverage))
    sample_reliability = max(0.0, min(1.0, match_count / FULL_SAMPLE_THRESHOLD))
    recency = max(0.0, min(1.0, recency_score))

    raw_confidence = (
        CONFIDENCE_WEIGHTS["data_coverage"] * coverage
        + CONFIDENCE_WEIGHTS["sample_reliability"] * sample_reliability
        + CONFIDENCE_WEIGHTS["recency"] * recency
    )

    warning = None
    if has_missing_critical_metric:
        if raw_confidence > MISSING_CRITICAL_CONFIDENCE_CAP:
            raw_confidence = MISSING_CRITICAL_CONFIDENCE_CAP
            warning = "Confidence capped at 0.60 due to missing critical role metric."

    if match_count < 10 and not warning:
        warning = f"Sparse match sample ({match_count} matches); rating shrunk toward cohort mean."

    return round(raw_confidence, 3), warning


def classify_evaluation_label(fit_score: float, confidence: float) -> str:
    """Labels candidate evaluation state."""
    if fit_score >= HIGH_FIT_THRESHOLD and confidence < LOW_CONFIDENCE_THRESHOLD:
        return "Promising but Under-Observed"
    if fit_score >= HIGH_FIT_THRESHOLD and confidence >= LOW_CONFIDENCE_THRESHOLD:
        return "High Fit Candidate"
    if fit_score >= 60.0:
        return "Viable Candidate"
    return "Developmental / Low Fit"


def calculate_fit_score(
    role_performance_100: float,
    roster_need_match: float = 1.0,
    synergy_contribution: float = 0.85,
    constraint_match: float = 1.0,
    custom_fit_weights: Optional[Dict[str, float]] = None,
) -> float:
    """Calculates overall FitScore scaled to 0 to 100.

    FitScore = 0.55*RolePerformance + 0.20*RosterNeedMatch + 0.15*SynergyContribution + 0.10*ConstraintMatch
    """
    weights = custom_fit_weights or FIT_SCORE_WEIGHTS
    norm_role = role_performance_100 / 100.0
    norm_need = max(0.0, min(1.0, roster_need_match))
    norm_synergy = max(0.0, min(1.0, synergy_contribution))
    norm_constraint = max(0.0, min(1.0, constraint_match))

    composite = (
        weights["role_performance"] * norm_role
        + weights["roster_need_match"] * norm_need
        + weights["synergy_contribution"] * norm_synergy
        + weights["constraint_match"] * norm_constraint
    )
    return round(composite * 100.0, 2)


def calculate_hidden_gem_score(
    adjusted_performance_percentile: float,
    tier: str,
    confidence: float,
    improvement_trend: float,
    match_count: int,
) -> Tuple[Optional[float], Optional[str]]:
    """Calculates HiddenGemScore (0 to 100).

    Formula: 0.45*AdjustedPerformancePercentile + 0.25*VisibilityGap + 0.20*Confidence + 0.10*ImprovementTrend
    Suppressed when data quality is weak (match_count < 10 or confidence < 0.40).
    """
    if match_count < MINIMUM_HIDDEN_GEM_SAMPLE:
        return None, f"Suppressed: insufficient match sample ({match_count} < {MINIMUM_HIDDEN_GEM_SAMPLE})"
    if confidence < 0.40:
        return None, f"Suppressed: low confidence score ({confidence:.2f} < 0.40)"

    visibility_gap = TIER_VISIBILITY_GAP.get(tier, 0.65)
    norm_trend = max(0.0, min(1.0, improvement_trend))
    norm_perf = max(0.0, min(1.0, adjusted_performance_percentile))
    norm_conf = max(0.0, min(1.0, confidence))

    score = 100.0 * (
        HIDDEN_GEM_WEIGHTS["adjusted_performance_percentile"] * norm_perf
        + HIDDEN_GEM_WEIGHTS["visibility_gap"] * visibility_gap
        + HIDDEN_GEM_WEIGHTS["confidence"] * norm_conf
        + HIDDEN_GEM_WEIGHTS["improvement_trend"] * norm_trend
    )
    return round(score, 2), None
