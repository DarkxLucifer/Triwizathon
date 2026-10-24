import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, Base, engine
from app.services.seed_service import seed_database
from app.core.security import create_access_token
from app.models.esports import Player, PlayerMatchStat


@pytest.fixture(scope="module")
def seeded_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    yield db
    db.close()


def test_search_and_import_pro_player_success(seeded_db):
    client = TestClient(app)
    token = create_access_token(data={"sub": "1"})
    headers = {"Authorization": f"Bearer {token}"}

    # Test importing a player (mocked adapter to ensure offline determinism and speed)
    mock_ps_player = {
        "id": 99991,
        "name": "TestPro",
        "first_name": "Test",
        "last_name": "Competitor",
        "role": "sniper",
        "image_url": "https://example.com/testpro.png",
        "nationality": "SE",
        "current_team": {
            "name": "Test Vikings",
            "slug": "test-vikings",
        }
    }

    with patch("app.services.pandascore_adapter.PandaScoreAdapter.search_player", new=AsyncMock(return_value=mock_ps_player)):
        resp = client.post("/api/ingestion/search-and-import", json={"query": "TestPro", "role": "AWPer"}, headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "success"
        assert data["source"] == "pandascore"
        assert data["player"]["handle"] == "TestPro"
        assert data["player"]["role"] == "AWPer"
        assert data["player"]["team"] == "Test Vikings"

        # Check DB persistence
        db = seeded_db
        player_in_db = db.query(Player).filter(Player.external_id == "pandascore_99991").first()
        assert player_in_db is not None
        assert player_in_db.handle == "TestPro"
        assert player_in_db.source == "pandascore"

        # Check baseline match stats are generated
        stats = db.query(PlayerMatchStat).filter(PlayerMatchStat.player_id == player_in_db.id).all()
        assert len(stats) >= 1
        assert stats[0].match.source == "pandascore"


def test_search_and_import_not_found(seeded_db):
    client = TestClient(app)
    token = create_access_token(data={"sub": "1"})
    headers = {"Authorization": f"Bearer {token}"}

    with patch("app.services.pandascore_adapter.PandaScoreAdapter.search_player", new=AsyncMock(return_value=None)):
        resp = client.post("/api/ingestion/search-and-import", json={"query": "CompletelyUnknownPlayer404"}, headers=headers)
        assert resp.status_code == 404
        assert "No pro player found" in resp.json()["detail"]
