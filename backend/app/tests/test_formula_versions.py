"""Test Acceptance Check 2: Changing one weight changes the score and creates a new formula version."""

import pytest
from app.services.scoring import calculate_fit_score
from app.config.formulas import FIT_SCORE_WEIGHTS


def test_changing_weight_changes_fit_score():
    base_role_perf = 90.0
    roster_need = 0.5  # Secondary role
    synergy = 0.8
    constraint = 1.0

    # Baseline fit score
    base_score = calculate_fit_score(
        role_performance_100=base_role_perf,
        roster_need_match=roster_need,
        synergy_contribution=synergy,
        constraint_match=constraint,
    )

    # Modified weights: Roster need heavily boosted to 0.40, role performance reduced to 0.35
    modified_weights = {
        "role_performance": 0.35,
        "roster_need_match": 0.40,
        "synergy_contribution": 0.15,
        "constraint_match": 0.10,
    }

    modified_score = calculate_fit_score(
        role_performance_100=base_role_perf,
        roster_need_match=roster_need,
        synergy_contribution=synergy,
        constraint_match=constraint,
        custom_fit_weights=modified_weights,
    )

    # Score MUST change when weights change
    assert base_score != modified_score
    # Difference should reflect the lower weight on role performance (90) and higher on roster need (50)
    assert base_score > modified_score


def test_creating_new_formula_version_in_db():
    from app.core.database import SessionLocal, Base, engine
    from app.models.esports import FormulaVersion

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Create a new version v1.1.0 with customized weights
        new_weights = FIT_SCORE_WEIGHTS.copy()
        new_weights["roster_need_match"] = 0.30
        new_weights["role_performance"] = 0.45

        new_version = FormulaVersion(
            version_tag="v1.1.0-test",
            weights_json={"fit_score_weights": new_weights},
            is_active=False,
            notes="Experimental formula version with increased roster need weight.",
        )
        db.add(new_version)
        db.commit()
        db.refresh(new_version)

        assert new_version.id is not None
        assert new_version.version_tag == "v1.1.0-test"

        # Cleanup test version
        db.delete(new_version)
        db.commit()
    finally:
        db.close()
