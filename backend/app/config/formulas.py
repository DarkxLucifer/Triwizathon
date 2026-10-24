"""ScoutForge Central Scoring Formulas & Weights Configuration.

Non-negotiable rule 5:
Every formula, weight, and assumption lives here and in docs/formulas.md.
"""

from typing import Dict, Any

# Formula system version
CURRENT_FORMULA_VERSION = "v1.0.0"

# Role Performance Weights
ROLE_WEIGHTS: Dict[str, Dict[str, float]] = {
    "Entry": {
        "kd": 0.25,
        "adr": 0.20,
        "kpr": 0.15,
        "opening_impact": 0.20,
        "tradeability": 0.20,
    },
    "Support": {
        "kd": 0.15,
        "adr": 0.15,
        "kpr": 0.20,
        "utility_value": 0.25,
        "trade_structure": 0.25,
    },
    "Lurker": {
        "kd": 0.20,
        "adr": 0.15,
        "kpr": 0.15,
        "late_round_impact": 0.25,
        "survival_value": 0.25,
    },
    "AWPer": {
        "kd": 0.25,
        "adr": 0.20,
        "kpr": 0.20,
        "opening_duel_winrate": 0.20,
        "clutch_value": 0.15,
    },
    "IGL": {
        "command_ratio": 0.30,  # Audio-derived
        "calls_per_round": 0.20,
        "clarity": 0.15,        # Audio-derived
        "win_after_call": 0.20, # Association only, NOT causation
        "adaptation": 0.15,
    },
}

# IGL Audio metrics that can be missing and redistributed
IGL_AUDIO_METRICS = ["command_ratio", "clarity"]

# Confidence Formula Weights
# Confidence = 0.50*DataCoverage + 0.30*SampleReliability + 0.20*Recency
CONFIDENCE_WEIGHTS = {
    "data_coverage": 0.50,
    "sample_reliability": 0.30,
    "recency": 0.20,
}

# Reliability shrinkage parameter: alpha = n / (n + SHRINKAGE_K)
SHRINKAGE_K = 10.0
FULL_SAMPLE_THRESHOLD = 30  # 30+ matches is considered full sample

# Fit Score Weights
# FitScore = 0.55*RolePerformance + 0.20*RosterNeedMatch + 0.15*SynergyContribution + 0.10*ConstraintMatch
FIT_SCORE_WEIGHTS = {
    "role_performance": 0.55,
    "roster_need_match": 0.20,
    "synergy_contribution": 0.15,
    "constraint_match": 0.10,
}

# Hidden Gem Score Weights
# HiddenGemScore = 0.45*AdjustedPerformancePercentile + 0.25*VisibilityGap + 0.20*Confidence + 0.10*ImprovementTrend
HIDDEN_GEM_WEIGHTS = {
    "adjusted_performance_percentile": 0.45,
    "visibility_gap": 0.25,
    "confidence": 0.20,
    "improvement_trend": 0.10,
}

# ASSUMPTION: Baseline visibility gaps based on team competition tier
TIER_VISIBILITY_GAP: Dict[str, float] = {
    "Tier 1": 0.20,  # Highly visible, minimal scouting gap
    "Tier 2": 0.65,  # Moderate visibility, prime scouting pool
    "Tier 3": 0.90,  # High obscurity, largest visibility gap
}

# ASSUMPTION: Thresholds for classification labels
HIGH_FIT_THRESHOLD = 75.0
LOW_CONFIDENCE_THRESHOLD = 0.65
MISSING_CRITICAL_CONFIDENCE_CAP = 0.60
MINIMUM_HIDDEN_GEM_SAMPLE = 10


def get_default_formula_config() -> Dict[str, Any]:
    """Returns serialized snapshot of the active formula configuration."""
    return {
        "version": CURRENT_FORMULA_VERSION,
        "role_weights": ROLE_WEIGHTS,
        "igl_audio_metrics": IGL_AUDIO_METRICS,
        "confidence_weights": CONFIDENCE_WEIGHTS,
        "fit_score_weights": FIT_SCORE_WEIGHTS,
        "hidden_gem_weights": HIDDEN_GEM_WEIGHTS,
        "tier_visibility_gap": TIER_VISIBILITY_GAP,
        "shrinkage_k": SHRINKAGE_K,
        "full_sample_threshold": FULL_SAMPLE_THRESHOLD,
        "assumptions": {
            "roster_need_match_default": "1.0 if target slot matches weakest role, 0.5 if secondary, 0.0 otherwise",
            "synergy_contribution_rule": "Complementary pace (aggressive vs structured balance) scores 0.85-1.0; identical overlap scores 0.50",
            "visibility_gap_rule": "Calculated from competition tier and team prominence (Tier 1=0.2, Tier 2=0.65, Tier 3=0.90)",
            "igl_win_after_call_note": "WinAfterCall represents an observed statistical association with round victory following a confirmed tactical call, never a causal proof.",
        },
    }
