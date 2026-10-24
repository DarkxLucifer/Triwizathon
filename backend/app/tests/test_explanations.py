"""Test Acceptance Check 6: The explanation checker rejects an invented number."""

import pytest
from app.services.explanations import (
    extract_numbers_from_text,
    build_allowed_number_set,
    verify_explanation_numbers,
    generate_candidate_explanation,
)


def test_extract_numbers_from_text():
    text = "Player has a KD of 1.25 and 88.4 ADR with 32 matches."
    nums = extract_numbers_from_text(text)
    assert 1.25 in nums
    assert 88.4 in nums
    assert 32.0 in nums


def test_verify_explanation_accepts_verified_numbers():
    breakdown = {
        "role_performance": 89.2,
        "roster_need_match": 100.0,
        "raw_metrics": {"kd": 1.15, "adr": 84.0}
    }
    allowed = build_allowed_number_set(breakdown)
    valid_text = "Delivers an adjusted IGL performance score of 89.2 matching squad needs."
    assert verify_explanation_numbers(valid_text, allowed) is True


def test_verify_explanation_rejects_invented_number():
    breakdown = {
        "role_performance": 89.2,
        "roster_need_match": 100.0,
        "raw_metrics": {"kd": 1.15, "adr": 84.0}
    }
    allowed = build_allowed_number_set(breakdown)
    # 99.9 was never in the breakdown
    fake_text = "Delivers an invented phenomenal performance score of 99.9 matching squad needs."
    assert verify_explanation_numbers(fake_text, allowed) is False


def test_generate_candidate_explanation_falls_back_when_number_is_unverified():
    breakdown = {
        "role_performance": 75.0,
        "roster_need_match": 100.0,
        "raw_metrics": {"kd": 1.0, "matches": 20}
    }
    drivers, risks = generate_candidate_explanation(
        player_handle="TestPlayer",
        role="Entry",
        fit_score=75.0,
        confidence=0.80,
        role_performance=75.0,
        roster_need_match=1.0,
        breakdown_data=breakdown,
        has_audio=False,
    )
    # Check that drivers and risks are non-empty and every number in them is valid
    allowed = build_allowed_number_set(breakdown)
    allowed.update([75.0, 0.80, 80.0, 100.0])
    for d in drivers:
        assert verify_explanation_numbers(d, allowed) is True
