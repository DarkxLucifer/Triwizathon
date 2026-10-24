"""Test Acceptance Check 7: Org isolation test proves Org A cannot read Org B's data."""

import pytest
from fastapi import HTTPException
from app.core.database import SessionLocal, Base, engine
from app.services.seed_service import seed_database
from app.models.organization import Organization
from app.models.user import User
from app.models.roster import Roster
from app.api.deps import enforce_org_isolation


@pytest.fixture(scope="module")
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    yield db
    db.close()


def test_org_isolation_enforcement(setup_db):
    db = setup_db

    # Org A: Sentinels, Org B: Cloud9
    user_sentinels = db.query(User).filter(User.email == "analyst@sentinels.gg").first()
    user_c9 = db.query(User).filter(User.email == "analyst@cloud9.gg").first()

    assert user_sentinels is not None
    assert user_c9 is not None
    assert user_sentinels.org_id != user_c9.org_id

    # Sentinels Roster belongs to Sentinels Org
    sentinels_roster = db.query(Roster).filter(Roster.org_id == user_sentinels.org_id).first()
    # Cloud9 Roster belongs to Cloud9 Org
    c9_roster = db.query(Roster).filter(Roster.org_id == user_c9.org_id).first()

    assert sentinels_roster is not None
    assert c9_roster is not None

    # Sentinels user CAN access Sentinels roster
    enforce_org_isolation(sentinels_roster.org_id, user_sentinels)

    # Sentinels user CANNOT access Cloud9 roster -> Must raise HTTPException 403 Forbidden!
    with pytest.raises(HTTPException) as exc_info:
        enforce_org_isolation(c9_roster.org_id, user_sentinels)

    assert exc_info.value.status_code == 403
    assert "Access forbidden" in exc_info.value.detail

    # Cloud9 user CANNOT access Sentinels roster -> Must raise HTTPException 403 Forbidden!
    with pytest.raises(HTTPException) as exc_info_2:
        enforce_org_isolation(sentinels_roster.org_id, user_c9)

    assert exc_info_2.value.status_code == 403
