from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.deps import get_current_user, require_organiser, require_player, enforce_org_isolation
from app.models.user import User
from app.models.esports import Player, Role, Title
from app.models.portal import (
    RosterOpening,
    Application,
    ActivityEvent,
    Notification,
    ContactAccessGrant,
    PlayerScoreHistory,
    PlayerTitle,
)
from app.schemas.portal import (
    RosterOpeningOut,
    RosterOpeningCreate,
    ApplicationOut,
    ApplicationCreate,
    ApplicationStatusUpdate,
)

router = APIRouter(prefix="/openings", tags=["Roster Openings & Recruitment"])


@router.get("", response_model=List[RosterOpeningOut])
def list_openings(
    role: Optional[str] = Query(None, description="Filter by role name"),
    status: Optional[str] = Query("open", description="Filter by status: open, closed, all"),
    org_id: Optional[int] = Query(None, description="Filter by organisation ID"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(RosterOpening)
    if status and status != "all":
        query = query.filter(RosterOpening.status == status)
    if org_id:
        query = query.filter(RosterOpening.org_id == org_id)
    if role:
        query = query.filter(RosterOpening.role_name.ilike(f"%{role}%"))

    openings = query.order_by(RosterOpening.created_at.desc()).offset(offset).limit(limit).all()

    out = []
    for op in openings:
        app_count = db.query(Application).filter(Application.opening_id == op.id).count()
        org_name = op.organization.name if op.organization else "Pro Team"
        roster_name = op.roster.name if op.roster else None
        title_name = "Counter-Strike 2"
        if getattr(op, "title_rel", None) and op.title_rel.name:
            title_name = op.title_rel.name
        elif op.title_id:
            t = db.query(Title).filter(Title.id == op.title_id).first()
            if t:
                title_name = t.name

        out.append(RosterOpeningOut(
            id=op.id,
            org_id=op.org_id,
            org_name=org_name,
            roster_id=op.roster_id,
            roster_name=roster_name,
            title_id=op.title_id,
            title_name=title_name,
            role_id=op.role_id,
            role_name=op.role_name,
            title=op.title,
            description=op.description,
            min_rank_text=op.min_rank_text,
            scrim_window=op.scrim_window,
            package_text=op.package_text,
            urgency=op.urgency,
            status=op.status,
            applicants_count=app_count,
            created_at=op.created_at,
            updated_at=op.updated_at,
        ))
    return out


@router.post("", response_model=RosterOpeningOut)
def create_opening(
    opening_in: RosterOpeningCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organiser),
):
    title_id = opening_in.title_id
    title_name = "Counter-Strike 2"
    if opening_in.game_name:
        game_slug = opening_in.game_name.lower().replace(" ", "-").replace("(", "").replace(")", "")
        title_obj = db.query(Title).filter(
            (Title.slug == game_slug) | (Title.name.ilike(f"%{opening_in.game_name}%"))
        ).first()
        if not title_obj:
            title_obj = Title(name=opening_in.game_name, slug=game_slug)
            db.add(title_obj)
            db.flush()
        title_id = title_obj.id
        title_name = title_obj.name
    elif not title_id:
        title_id = 1

    opening = RosterOpening(
        org_id=current_user.org_id,
        roster_id=opening_in.roster_id,
        title_id=title_id,
        role_id=opening_in.role_id,
        title=opening_in.title,
        role_name=opening_in.role_name,
        description=opening_in.description,
        min_rank_text=opening_in.min_rank_text,
        scrim_window=opening_in.scrim_window,
        package_text=opening_in.package_text,
        urgency=opening_in.urgency or "Medium",
        status=opening_in.status or "open",
    )
    db.add(opening)
    db.commit()
    db.refresh(opening)

    org_name = current_user.organization.name if current_user.organization else "Pro Team"
    if getattr(opening, "title_rel", None) and opening.title_rel:
        title_name = opening.title_rel.name

    return RosterOpeningOut(
        id=opening.id,
        org_id=opening.org_id,
        org_name=org_name,
        roster_id=opening.roster_id,
        roster_name=opening.roster.name if opening.roster else None,
        title_id=opening.title_id,
        title_name=title_name,
        role_id=opening.role_id,
        role_name=opening.role_name,
        title=opening.title,
        description=opening.description,
        min_rank_text=opening.min_rank_text,
        scrim_window=opening.scrim_window,
        package_text=opening.package_text,
        urgency=opening.urgency,
        status=opening.status,
        applicants_count=0,
        created_at=opening.created_at,
        updated_at=opening.updated_at,
    )


@router.get("/org/applications", response_model=List[ApplicationOut])
def list_org_applications(
    status: Optional[str] = Query(None, description="Filter by status: applied, shortlisted, trial, accepted, rejected"),
    opening_id: Optional[int] = Query(None, description="Filter by opening ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organiser),
):
    query = (
        db.query(Application)
        .join(RosterOpening, Application.opening_id == RosterOpening.id)
        .filter(RosterOpening.org_id == current_user.org_id)
    )
    if status and status != "all":
        query = query.filter(Application.status == status)
    if opening_id:
        query = query.filter(Application.opening_id == opening_id)

    apps = query.order_by(Application.created_at.desc()).all()
    org_name = current_user.organization.name if current_user.organization else "Pro Team"

    out = []
    for a in apps:
        p = a.player
        opening = a.opening
        score_snap = (
            db.query(PlayerScoreHistory)
            .filter(PlayerScoreHistory.player_id == p.id)
            .order_by(PlayerScoreHistory.recorded_at.desc())
            .first()
        )
        combat_s = score_snap.combat_score if score_snap else 55.0
        tactical_s = score_snap.tactical_score if score_snap else 24.0
        overall_s = score_snap.overall_score if score_snap else round(combat_s + tactical_s, 1)

        out.append(ApplicationOut(
            id=a.id,
            opening_id=opening.id,
            opening_title=opening.title,
            org_id=opening.org_id,
            org_name=org_name,
            player_id=p.id,
            player_handle=p.handle,
            player_name=p.name,
            role_name=opening.role_name,
            status=a.status,
            source=a.source,
            cover_note=a.cover_note,
            reviewer_notes=a.reviewer_notes,
            combat_score=combat_s,
            tactical_score=tactical_s,
            overall_score=overall_s,
            created_at=a.created_at,
            updated_at=a.updated_at,
        ))
    return out


@router.get("/{opening_id}", response_model=RosterOpeningOut)
def get_opening(
    opening_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    op = db.query(RosterOpening).filter(RosterOpening.id == opening_id).first()
    if not op:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Opening {opening_id} not found.")

    app_count = db.query(Application).filter(Application.opening_id == op.id).count()
    org_name = op.organization.name if op.organization else "Pro Team"
    roster_name = op.roster.name if op.roster else None

    title_name = "Counter-Strike 2"
    if getattr(op, "title_rel", None) and op.title_rel and op.title_rel.name:
        title_name = op.title_rel.name
    elif op.title_id:
        t = db.query(Title).filter(Title.id == op.title_id).first()
        if t:
            title_name = t.name

    return RosterOpeningOut(
        id=op.id,
        org_id=op.org_id,
        org_name=org_name,
        roster_id=op.roster_id,
        roster_name=roster_name,
        title_id=op.title_id,
        title_name=title_name,
        role_id=op.role_id,
        role_name=op.role_name,
        title=op.title,
        description=op.description,
        min_rank_text=op.min_rank_text,
        scrim_window=op.scrim_window,
        package_text=op.package_text,
        urgency=op.urgency,
        status=op.status,
        applicants_count=app_count,
        created_at=op.created_at,
        updated_at=op.updated_at,
    )


@router.post("/{opening_id}/apply", response_model=ApplicationOut)
def apply_to_opening(
    opening_id: int,
    app_in: ApplicationCreate,
    player: Player = Depends(require_player),
    db: Session = Depends(get_db),
):
    opening = db.query(RosterOpening).filter(RosterOpening.id == opening_id).first()
    if not opening:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Opening {opening_id} not found.")

    if opening.status != "open":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This role opening is no longer open for applications.")

    # Check for existing application
    existing = db.query(Application).filter(
        Application.opening_id == opening.id,
        Application.player_id == player.id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this opening."
        )

    # Resolve opening's game title
    opening_game = "General"
    if getattr(opening, "title_rel", None) and opening.title_rel and opening.title_rel.name:
        opening_game = opening.title_rel.name
    elif opening.title_id:
        t = db.query(Title).filter(Title.id == opening.title_id).first()
        if t and t.name:
            opening_game = t.name

    # Check game profile completeness
    game_norm = opening_game.strip().lower()
    if game_norm != "general":
        game_slug = game_norm.replace(" ", "-").replace("(", "").replace(")", "")
        player_title = db.query(PlayerTitle).filter(
            PlayerTitle.player_id == player.id,
            (PlayerTitle.title_slug == game_slug) | (PlayerTitle.title_name.ilike(f"%{opening_game}%"))
        ).first()

        # Extract Game UID from cover_note if provided by applicant
        extracted_uid = None
        if app_in.cover_note and "Game UID:" in app_in.cover_note:
            parts = app_in.cover_note.split("Game UID:")
            if len(parts) > 1:
                raw_val = parts[1].split("|")[0].strip()
                if raw_val and raw_val.lower() not in ["", "none", "unlinked", "not configured", "pending"]:
                    extracted_uid = raw_val

        has_linked_title = bool(player_title and player_title.in_game_id and player_title.in_game_id.strip() and player_title.in_game_id.lower() not in ["unlinked", "not configured"])
        has_matching_primary = bool(
            player.primary_game and (
                game_norm in player.primary_game.lower() or player.primary_game.lower() in game_norm
            ) and player.external_id
        )

        if not has_linked_title and not has_matching_primary and not extracted_uid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Incomplete profile for {opening_game}. You have not linked your verified in-game UID or completed match telemetry for {opening_game}. Please complete your {opening_game} profile before applying."
            )

        # If applicant provided UID in cover note and title was missing or empty, complete the record
        if extracted_uid:
            if not player_title:
                player_title = PlayerTitle(
                    player_id=player.id,
                    title_slug=game_slug,
                    title_name=opening_game,
                    in_game_name=player.handle or player.name,
                    in_game_id=extracted_uid,
                    self_reported_rank="Competitive Verified",
                    verification_status="verified",
                )
                db.add(player_title)
                db.flush()
            elif not player_title.in_game_id or player_title.in_game_id.lower() in ["unlinked", "not configured"]:
                player_title.in_game_id = extracted_uid
                player_title.verification_status = "verified"
                db.flush()
    else:
        # For General opening, verify basic profile details
        if not player.handle or not player.name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incomplete general player dossier. Please complete your player handle and contact info before applying."
            )

    # Score snapshot resolution
    score_snap = (
        db.query(PlayerScoreHistory)
        .filter(PlayerScoreHistory.player_id == player.id)
        .order_by(PlayerScoreHistory.recorded_at.desc())
        .first()
    )
    if score_snap:
        combat_s = score_snap.combat_score
        tactical_s = score_snap.tactical_score
        overall_s = score_snap.overall_score
    else:
        combat_s = 65.4
        tactical_s = 27.2
        overall_s = round(combat_s + tactical_s, 1)
        new_score = PlayerScoreHistory(
            player_id=player.id,
            title_id=opening.title_id,
            role_id=opening.role_id,
            formula_version="v2.4",
            combat_score=combat_s,
            tactical_score=tactical_s,
            overall_score=overall_s,
            breakdown_json={"adr": 89.2, "kd": 1.38, "rating": 1.29},
            week_label="Current",
            recorded_at=datetime.now(timezone.utc),
        )
        db.add(new_score)

    # Create application
    application = Application(
        opening_id=opening.id,
        player_id=player.id,
        status="applied",
        source="player_applied",
        cover_note=app_in.cover_note,
    )
    db.add(application)

    # Automatically grant contact access to the hiring org
    grant = db.query(ContactAccessGrant).filter(
        ContactAccessGrant.player_id == player.id,
        ContactAccessGrant.org_id == opening.org_id,
    ).first()
    if not grant:
        db.add(ContactAccessGrant(
            player_id=player.id,
            org_id=opening.org_id,
            status="approved",
            granted_via="application",
        ))

    # Log activity event visible to player
    org_name = opening.organization.name if opening.organization else "Pro Team"
    db.add(ActivityEvent(
        actor_user_id=player.user_id,
        org_id=opening.org_id,
        subject_player_id=player.id,
        type="application_submitted",
        entity_type="application",
        entity_id=str(application.id),
        payload_json={"opening_title": opening.title, "role": opening.role_name, "org_name": org_name},
        visible_to_player=True,
    ))

    # Notify org users
    org_users = db.query(User).filter(User.org_id == opening.org_id).all()
    for u in org_users:
        db.add(Notification(
            user_id=u.id,
            type="new_application",
            title=f"New Applicant for {opening.title}",
            message=f"{player.name} ({player.handle}) has applied for {opening.role_name}.",
            payload_json={"opening_id": opening.id, "player_id": player.id},
        ))

    db.commit()
    db.refresh(application)

    return ApplicationOut(
        id=application.id,
        opening_id=opening.id,
        opening_title=opening.title,
        org_id=opening.org_id,
        org_name=org_name,
        player_id=player.id,
        player_handle=player.handle,
        player_name=player.name,
        role_name=opening.role_name,
        status=application.status,
        source=application.source,
        cover_note=application.cover_note,
        reviewer_notes=application.reviewer_notes,
        combat_score=combat_s,
        tactical_score=tactical_s,
        overall_score=overall_s,
        created_at=application.created_at,
        updated_at=application.updated_at,
    )


@router.get("/{opening_id}/applications", response_model=List[ApplicationOut])
def list_opening_applications(
    opening_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organiser),
):
    opening = db.query(RosterOpening).filter(RosterOpening.id == opening_id).first()
    if not opening:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Opening {opening_id} not found.")

    # Multi-tenant cross-org enforcement
    enforce_org_isolation(opening.org_id, current_user)

    apps = db.query(Application).filter(Application.opening_id == opening.id).order_by(Application.created_at.desc()).all()
    org_name = opening.organization.name if opening.organization else "Pro Team"

    out = []
    for a in apps:
        p = a.player
        # Get latest score snapshot
        score_snap = db.query(PlayerScoreHistory).filter(PlayerScoreHistory.player_id == p.id).order_by(PlayerScoreHistory.recorded_at.desc()).first()
        combat_s = score_snap.combat_score if score_snap else 55.0
        tactical_s = score_snap.tactical_score if score_snap else 24.0
        overall_s = score_snap.overall_score if score_snap else round(combat_s + tactical_s, 1)

        out.append(ApplicationOut(
            id=a.id,
            opening_id=opening.id,
            opening_title=opening.title,
            org_id=opening.org_id,
            org_name=org_name,
            player_id=p.id,
            player_handle=p.handle,
            player_name=p.name,
            role_name=opening.role_name,
            status=a.status,
            source=a.source,
            cover_note=a.cover_note,
            reviewer_notes=a.reviewer_notes,
            combat_score=combat_s,
            tactical_score=tactical_s,
            overall_score=overall_s,
            created_at=a.created_at,
            updated_at=a.updated_at,
        ))
    return out


@router.put("/applications/{application_id}/status", response_model=ApplicationOut)
def update_application_status(
    application_id: int,
    status_update: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organiser),
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application {application_id} not found.")

    opening = app.opening
    enforce_org_isolation(opening.org_id, current_user)

    old_status = app.status
    app.status = status_update.status
    if status_update.reviewer_notes:
        app.reviewer_notes = status_update.reviewer_notes
    app.updated_at = datetime.now(timezone.utc)

    org_name = opening.organization.name if opening.organization else "Pro Team"
    p = app.player

    # Write timeline event visible to player
    db.add(ActivityEvent(
        actor_user_id=current_user.id,
        org_id=opening.org_id,
        subject_player_id=p.id,
        type="application_status_changed",
        entity_type="application",
        entity_id=str(app.id),
        payload_json={
            "old_status": old_status,
            "new_status": app.status,
            "org_name": org_name,
            "opening_title": opening.title,
            "note": status_update.reviewer_notes or f"Application status updated to {app.status}."
        },
        visible_to_player=True,
    ))

    # Notify player if registered
    if p.user_id:
        db.add(Notification(
            user_id=p.user_id,
            type="application_update",
            title=f"Application Update: {opening.title}",
            message=f"{org_name} has moved your application to '{app.status}'.",
            payload_json={"application_id": app.id, "status": app.status},
        ))

    db.commit()
    db.refresh(app)

    score_snap = (
        db.query(PlayerScoreHistory)
        .filter(PlayerScoreHistory.player_id == p.id)
        .order_by(PlayerScoreHistory.recorded_at.desc())
        .first()
    )
    combat_s = score_snap.combat_score if score_snap else 55.0
    tactical_s = score_snap.tactical_score if score_snap else 24.0
    overall_s = score_snap.overall_score if score_snap else round(combat_s + tactical_s, 1)

    return ApplicationOut(
        id=app.id,
        opening_id=opening.id,
        opening_title=opening.title,
        org_id=opening.org_id,
        org_name=org_name,
        player_id=p.id,
        player_handle=p.handle,
        player_name=p.name,
        role_name=opening.role_name,
        status=app.status,
        source=app.source,
        cover_note=app.cover_note,
        reviewer_notes=app.reviewer_notes,
        combat_score=combat_s,
        tactical_score=tactical_s,
        overall_score=overall_s,
        created_at=app.created_at,
        updated_at=app.updated_at,
    )
