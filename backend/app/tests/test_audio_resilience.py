"""Test Acceptance Check 5: Audio failure does not block ranking."""

import pytest
from app.services.scoring import calculate_role_performance, calculate_fit_score
from app.models.scouting import Recommendation


def test_audio_failure_does_not_block_ranking():
    # Simulate a scenario where audio processing failed
    audio_status = "failed"

    norm_metrics = {
        "calls_per_round": 0.8,
        "win_after_call": 0.7,
        "adaptation": 0.75,
    }

    # Calculation proceeds seamlessly without audio
    role_perf, active_weights, redistributed = calculate_role_performance(
        role="IGL",
        normalized_metrics=norm_metrics,
        has_valid_audio=(audio_status == "completed"),
    )

    fit_score = calculate_fit_score(
        role_performance_100=role_perf,
        roster_need_match=1.0,
        synergy_contribution=0.85,
        constraint_match=1.0,
    )

    # Ranking computation succeeds completely
    assert role_perf > 0.0
    assert fit_score > 0.0
    assert redistributed is True
    # The audio failure leaves ranking intact, returning status
    assert audio_status in ["failed", "unavailable", "pending"]
