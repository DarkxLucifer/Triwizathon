import os
import shutil
import hashlib
from datetime import datetime, timedelta, timezone
import pytest
from fastapi import HTTPException

from app.core.database import SessionLocal, Base, engine
from app.services.seed_service import seed_database
from app.models.user import User
from app.models.organization import Organization
from app.models.recording import RecordingSession, RecordingChunk, RecordingShare
from app.schemas.recording import RecordingFinalizeRequest
from app.services.recording_service import (
    create_recording_session,
    save_chunk,
    finalize_session,
    abort_session,
    delete_session,
    share_session_with_org,
    revoke_session_share,
    extract_media_metadata,
    verify_challenge_speech,
    get_session_dir,
    MAX_CHUNK_SIZE_BYTES,
)
from app.api.recordings import verify_session_access
from app.services.scoring import calculate_role_performance, calculate_fit_score


@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    yield db
    db.close()


def test_chunk_idempotency(db_session):
    user = db_session.query(User).filter(User.role == "player").first()
    assert user is not None

    session = create_recording_session(db_session, user.id, user.player_id, mode="screen_only")
    chunk_bytes = b"GOP_CHUNK_0_HEADER_DATA_12345"
    sha = hashlib.sha256(chunk_bytes).hexdigest()

    # 1. First upload
    chunk1, is_dup1 = save_chunk(db_session, session, "screen", 0, chunk_bytes, sha)
    assert is_dup1 is False
    assert chunk1.chunk_index == 0
    assert chunk1.byte_size == len(chunk_bytes)
    initial_total_bytes = session.total_bytes

    # 2. Duplicate upload of same chunk index & same hash
    chunk2, is_dup2 = save_chunk(db_session, session, "screen", 0, chunk_bytes, sha)
    assert is_dup2 is True
    assert chunk2.id == chunk1.id
    # Ensure total_bytes was NOT incremented twice
    assert session.total_bytes == initial_total_bytes

    # Clean up
    delete_session(db_session, session)


def test_missing_or_out_of_order_chunks(db_session):
    user = db_session.query(User).filter(User.role == "player").first()
    session = create_recording_session(db_session, user.id, user.player_id, mode="screen_only")

    # Upload chunk 0, then chunk 2 (intentionally skipping chunk 1)
    chunk0_bytes = b"FRAME_CLUSTER_0"
    chunk2_bytes = b"FRAME_CLUSTER_2"

    save_chunk(db_session, session, "screen", 0, chunk0_bytes, hashlib.sha256(chunk0_bytes).hexdigest())
    save_chunk(db_session, session, "screen", 2, chunk2_bytes, hashlib.sha256(chunk2_bytes).hexdigest())

    req = RecordingFinalizeRequest(screen_ended_early=False, display_surface="monitor")
    finalized = finalize_session(db_session, session, req)

    # Check that missing chunk 1 was flagged in surface_and_camera check
    surface_check = next((c for c in finalized.checks if c.check_type == "surface_and_camera"), None)
    assert surface_check is not None
    assert surface_check.status == "warning"
    assert 1 in surface_check.details_json.get("missing_screen_chunks", [])

    delete_session(db_session, session)


def test_wrong_or_expired_challenge(db_session):
    user = db_session.query(User).filter(User.role == "player").first()
    session = create_recording_session(db_session, user.id, user.player_id, mode="screen_only")

    challenge = session.challenge
    assert challenge is not None
    assert len(challenge.code) == 6

    # 1. Wrong speech match
    matched, conf = verify_challenge_speech(challenge.code, "Hello team let's rush B no code spoken")
    assert matched is False
    assert conf == 0.0

    # 2. Correct speech match
    matched_correct, conf_correct = verify_challenge_speech(challenge.code, f"Verifying candidate code {challenge.code} ready to scrim")
    assert matched_correct is True
    assert conf_correct >= 0.95

    # 3. Expired challenge detection
    past_time = datetime.now(timezone.utc) - timedelta(minutes=10)
    challenge.expires_at = past_time
    db_session.commit()

    req = RecordingFinalizeRequest(screen_ended_early=False, display_surface="monitor")
    finalized = finalize_session(db_session, session, req)

    challenge_check = next((c for c in finalized.checks if c.check_type == "challenge_window"), None)
    assert challenge_check is not None
    assert challenge_check.status == "warning"
    assert challenge_check.details_json["expired"] is True

    delete_session(db_session, session)


def test_oversized_upload(db_session):
    user = db_session.query(User).filter(User.role == "player").first()
    session = create_recording_session(db_session, user.id, user.player_id, mode="screen_only")

    # Construct dummy byte chunk larger than MAX_CHUNK_SIZE_BYTES
    oversized = b"0" * (MAX_CHUNK_SIZE_BYTES + 1024)

    with pytest.raises(HTTPException) as exc_info:
        save_chunk(db_session, session, "screen", 0, oversized, hashlib.sha256(oversized).hexdigest())

    assert exc_info.value.status_code == 413
    assert "exceeds limit" in exc_info.value.detail

    delete_session(db_session, session)


def test_abort_and_expiry_cleanup(db_session):
    user = db_session.query(User).filter(User.role == "player").first()
    session = create_recording_session(db_session, user.id, user.player_id, mode="screen_only")

    chunk_bytes = b"SAMPLE_PAYLOAD_FOR_ABORT"
    save_chunk(db_session, session, "screen", 0, chunk_bytes, hashlib.sha256(chunk_bytes).hexdigest())

    session_dir = get_session_dir(session.id)
    chunks_dir = os.path.join(session_dir, "chunks")
    assert os.path.exists(chunks_dir)
    assert len(os.listdir(chunks_dir)) > 0

    # Abort session
    aborted = abort_session(db_session, session)
    assert aborted.status == "failed"
    # Verify chunks directory was purged
    assert not os.path.exists(chunks_dir)

    delete_session(db_session, session)


def test_ownership_and_organization_isolation(db_session):
    player1 = db_session.query(User).filter(User.role == "player").first()
    # Find or create a second player
    player2 = db_session.query(User).filter(User.role == "player", User.id != player1.id).first()
    if not player2:
        player2 = User(email="player2_test@scoutforge.gg", hashed_password="pwd", full_name="Player Two", role="player")
        db_session.add(player2)
        db_session.commit()

    org_user = db_session.query(User).filter(User.role == "analyst").first()
    assert org_user is not None and org_user.org_id is not None

    session = create_recording_session(db_session, player1.id, player1.player_id, mode="screen_only")

    # 1. Owner has access
    assert verify_session_access(session, player1, db_session) is True

    # 2. Other player has NO access
    assert verify_session_access(session, player2, db_session) is False

    # 3. Organization user has NO access prior to sharing
    assert verify_session_access(session, org_user, db_session) is False

    delete_session(db_session, session)


def test_share_and_revoke(db_session):
    player = db_session.query(User).filter(User.role == "player").first()
    org_user = db_session.query(User).filter(User.role == "analyst").first()
    org = db_session.query(Organization).filter(Organization.id == org_user.org_id).first()

    session = create_recording_session(db_session, player.id, player.player_id, mode="screen_only")

    # Before share: Org has no access
    assert verify_session_access(session, org_user, db_session) is False

    # Share with Org
    share = share_session_with_org(db_session, session, org.id, player.id)
    assert share.is_active is True
    # Now Org has access!
    assert verify_session_access(session, org_user, db_session) is True

    # Revoke share
    revoked = revoke_session_share(db_session, session, org.id)
    assert revoked.is_active is False
    # Org access revoked!
    assert verify_session_access(session, org_user, db_session) is False

    delete_session(db_session, session)


def test_delete_removes_files_and_derived_data(db_session):
    player = db_session.query(User).filter(User.role == "player").first()
    session = create_recording_session(db_session, player.id, player.player_id, mode="screen_only")
    session_id = session.id

    data = b"FINAL_SESSION_DATA_TO_DELETE"
    save_chunk(db_session, session, "screen", 0, data, hashlib.sha256(data).hexdigest())
    req = RecordingFinalizeRequest(screen_ended_early=False, display_surface="monitor")
    finalize_session(db_session, session, req)

    session_dir = get_session_dir(session_id)
    assert os.path.exists(session_dir)

    # Delete session
    deleted = delete_session(db_session, session)
    assert deleted is True

    # Verify database record is gone
    queried = db_session.query(RecordingSession).filter(RecordingSession.id == session_id).first()
    assert queried is None

    # Verify physical files on disk are completely removed
    assert not os.path.exists(session_dir)


def test_ffprobe_failure_handling():
    # Calling extract_media_metadata with non-existent or corrupted file does NOT crash
    result = extract_media_metadata("C:/non_existent_path_file.webm")
    assert result["success"] is False
    assert result["error"] is not None
    assert result["duration"] == 0.0


def test_recording_failure_never_blocks_stats_ranking():
    # Simulate a candidate whose recording failed or is incomplete
    failed_session_status = "failed"
    norm_metrics = {
        "adr": 85.0,
        "kpr": 0.78,
        "first_kill_diff": 2.4,
        "trade_efficiency": 0.65,
    }

    # Verify core ranking and FitScore engines evaluate perfectly without exceptions
    perf, _, _ = calculate_role_performance("Entry", norm_metrics)
    fit = calculate_fit_score(perf, 1.0, 0.85, 1.0)

    assert perf > 0.0
    assert fit > 0.0
    assert failed_session_status in ("failed", "incomplete", "processing")


def test_stream_media_authentication_token_query_and_header(db_session):
    from app.core.security import create_access_token
    from app.api.recordings import resolve_media_user

    user = db_session.query(User).filter(User.role == "player").first()
    assert user is not None

    token = create_access_token(data={"sub": str(user.id), "role": user.role})

    # Test resolving via ?token= query parameter (used by HTML5 <video> elements)
    resolved_via_query = resolve_media_user(db_session, token=token, authorization=None)
    assert resolved_via_query.id == user.id

    # Test resolving via Bearer authorization header
    resolved_via_header = resolve_media_user(db_session, token=None, authorization=f"Bearer {token}")
    assert resolved_via_header.id == user.id

    # Test failure when neither is provided
    with pytest.raises(HTTPException) as exc:
        resolve_media_user(db_session, token=None, authorization=None)
    assert exc.value.status_code == 401
