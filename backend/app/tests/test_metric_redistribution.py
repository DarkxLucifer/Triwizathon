"""Test Acceptance Check 3: Removing an optional metric redistributes weights and shows it."""

import pytest
from app.services.scoring import calculate_role_performance
from app.config.formulas import ROLE_WEIGHTS, IGL_AUDIO_METRICS


def test_igl_metric_redistribution_without_audio():
    # Synthetic normalized metrics
    norm_metrics = {
        "command_ratio": 0.8,
        "calls_per_round": 0.7,
        "clarity": 0.8,
        "win_after_call": 0.65,
        "adaptation": 0.75,
    }

    # 1. With valid audio
    score_with_audio, weights_with_audio, redist_with = calculate_role_performance(
        role="IGL",
        normalized_metrics=norm_metrics,
        has_valid_audio=True,
    )
    assert redist_with is False
    assert weights_with_audio["command_ratio"] == 0.30
    assert weights_with_audio["clarity"] == 0.15

    # 2. Without valid audio: Audio metrics must be 0.0 and redistributed
    score_no_audio, weights_no_audio, redist_no = calculate_role_performance(
        role="IGL",
        normalized_metrics=norm_metrics,
        has_valid_audio=False,
    )
    assert redist_no is True
    # Audio metrics weights should be 0.0
    for m in IGL_AUDIO_METRICS:
        assert weights_no_audio[m] == 0.0

    # Non-audio metrics weights must increase to cover the 0.45 audio weight
    assert weights_no_audio["calls_per_round"] > weights_with_audio["calls_per_round"]
    assert weights_no_audio["win_after_call"] > weights_with_audio["win_after_call"]
    assert weights_no_audio["adaptation"] > weights_with_audio["adaptation"]

    # Sum of active redistributed weights must equal 1.0 (within rounding 0.01)
    total_weight = sum(weights_no_audio.values())
    assert abs(total_weight - 1.0) < 0.01
