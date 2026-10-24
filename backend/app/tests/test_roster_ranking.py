"""Test Acceptance Check 1: A known roster gap returns the planted expected candidates in the top 3."""

import pytest
from app.core.database import SessionLocal, Base, engine
from app.services.seed_service import seed_database
from app.models.user import User
from app.models.roster import Roster
from app.models.esports import Player, Role
from app.schemas.brief import BriefCreate
from app.api.briefs import create_brief_and_generate_recommendations
from app.api.rosters import get_roster_health


@pytest.fixture(scope="module")
def seeded_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    yield db
    db.close()


def test_roster_health_identifies_weak_igl_gap(seeded_db):
    db = seeded_db
    user_sentinels = db.query(User).filter(User.email == "analyst@sentinels.gg").first()
    sentinels_roster = db.query(Roster).filter(Roster.org_id == user_sentinels.org_id).first()

    health = get_roster_health(sentinels_roster.id, db=db, current_user=user_sentinels)

    # Slot 1 (IGL) with R00K MUST be identified as the weakest role
    assert health.weakest_role == "IGL"
    assert health.weakest_slot_index == 1
    assert any(alert.severity == "high" for alert in health.alerts)


def test_known_roster_gap_returns_planted_candidate_in_top_3(seeded_db):
    db = seeded_db
    user_sentinels = db.query(User).filter(User.email == "analyst@sentinels.gg").first()
    sentinels_roster = db.query(Roster).filter(Roster.org_id == user_sentinels.org_id).first()

    # Generate recommendations for target role IGL to solve the gap
    brief_in = BriefCreate(
        title_id=sentinels_roster.title_id,
        roster_id=sentinels_roster.id,
        target_role="IGL",
    )

    response = create_brief_and_generate_recommendations(brief_in, db=db, current_user=user_sentinels)

    assert response.target_role == "IGL"
    assert len(response.recommendations) > 0

    # Top 3 candidates handles
    top_3_handles = [rec.handle for rec in response.recommendations[:3]]
    print("Top 3 IGL Candidates:", top_3_handles)

    # Planted IGL hidden gem 'Strat' MUST be in the top 3!
    assert "Strat" in top_3_handles, f"Planted candidate 'Strat' not found in top 3: {top_3_handles}"
