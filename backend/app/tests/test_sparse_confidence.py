"""Test Acceptance Check 4: Sparse data cannot produce high confidence."""

import pytest
from app.services.scoring import calculate_confidence, classify_evaluation_label


def test_sparse_sample_cannot_produce_high_confidence():
    # Player with only 3 matches (sparse sample)
    conf_sparse, warning = calculate_confidence(data_coverage=1.0, match_count=3)
    # Expected confidence: 0.50*1.0 + 0.30*(3/30 = 0.10) + 0.20*1.0 = 0.50 + 0.03 + 0.20 = 0.73 max
    # And warning must flag sparse sample
    assert conf_sparse < 0.75
    assert warning is not None
    assert "Sparse match sample" in warning

    # Player with only 1 match
    conf_1, _ = calculate_confidence(data_coverage=1.0, match_count=1)
    assert conf_1 < 0.72


def test_missing_critical_metric_caps_confidence_at_0_60():
    # Player has 35 matches (full sample) and coverage 1.0, but critical metric is missing
    conf_capped, warning = calculate_confidence(
        data_coverage=1.0,
        match_count=35,
        recency_score=1.0,
        has_missing_critical_metric=True,
    )
    # Even though raw formula would be 1.0, it must be capped at 0.60
    assert conf_capped <= 0.60
    assert warning is not None
    assert "capped at 0.60" in warning


def test_promising_but_under_observed_label():
    # High fit (>= 75.0) but low confidence (< 0.65)
    label = classify_evaluation_label(fit_score=82.0, confidence=0.55)
    assert label == "Promising but Under-Observed"
