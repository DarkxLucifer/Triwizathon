from typing import Optional, List, Dict
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_user, require_organiser
from app.models.user import User
from app.models.esports import Player, Role, Team, PlayerMatchStat, Match, FormulaVersion
from app.models.portal import (
    ContactAccessGrant,
    Application,
    RosterOpening,
    ActivityEvent,
    Notification,
    PlayerWatchlist,
)
from app.schemas.player import PlayerSummary, PlayerListResponse, PlayerProfileResponse, MatchStatItem
from app.schemas.portal import ContactAccessGrantOut
from app.services.scoring import (
    calculate_confidence,
    calculate_role_performance,
    classify_evaluation_label,
    compute_percentile_rank,
    apply_context_adjustment,
)
from app.config.formulas import CURRENT_FORMULA_VERSION

router = APIRouter(prefix="/players", tags=["Players"])


def check_and_mask_contact(player: Player, current_user: User, db: Session):
    """Enforces contact privacy rules: masks email/phone unless caller has permission."""
    # Player viewing themselves
    if current_user.player_id == player.id or current_user.id == player.user_id:
        return player.contact_email, player.contact_phone, True

    # Admin access
    if current_user.role == "admin":
        return player.contact_email, player.contact_phone, True

    # Organiser check
    if current_user.org_id:
        # 1. Approved contact request
        grant = db.query(ContactAccessGrant).filter(
            ContactAccessGrant.player_id == player.id,
            ContactAccessGrant.org_id == current_user.org_id,
            ContactAccessGrant.status == "approved"
        ).first()
        if grant:
            return player.contact_email, player.contact_phone, True

        # 2. Player has active application to any opening in this org
        app = db.query(Application).join(RosterOpening).filter(
            Application.player_id == player.id,
            RosterOpening.org_id == current_user.org_id
        ).first()
        if app:
            return player.contact_email, player.contact_phone, True

    # Mask contact info
    masked_email = None
    if player.contact_email:
        parts = player.contact_email.split("@")
        if len(parts) == 2:
            u, d = parts
            masked_email = f"{u[:2]}***@{d[:1]}***.{d.split('.')[-1]}"
        else:
            masked_email = "c***@***.com"

    masked_phone = None
    if player.contact_phone:
        p = player.contact_phone
        masked_phone = f"{p[:3]} ***** ***{p[-2:]}" if len(p) > 5 else "*****"

    return masked_email, masked_phone, False


@router.get("", response_model=PlayerListResponse)
def list_players(
    role: Optional[str] = Query(None, description="Role filter: IGL, Entry, Support, Lurker, AWPer"),
    tier: Optional[str] = Query(None, description="Tier filter: Tier 1, Tier 2, Tier 3"),
    region: Optional[str] = Query(None, description="Region filter: NA, EU, APAC"),
    source: Optional[str] = Query(None, description="Source filter: real, leetify, pandascore, simulated"),
    available_only: bool = Query(False, description="Filter for free agents / available"),
    search: Optional[str] = Query(None, description="Search handle or name"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Player).join(Player.role).outerjoin(Player.team)

    if role:
        query = query.filter(Role.name == role)
    if tier:
        query = query.filter(Player.tier == tier)
    if region:
        query = query.filter(Player.region == region)
    if source:
        if source == "real":
            query = query.filter(Player.source.in_(["leetify", "pandascore"]))
        else:
            query = query.filter(Player.source == source)
    if available_only:
        query = query.filter(Player.is_available.is_(True))
    if search:
        search_fmt = f"%{search}%"
        query = query.filter((Player.handle.ilike(search_fmt)) | (Player.name.ilike(search_fmt)))

    from sqlalchemy import case
    query = query.order_by(
        case(
            (Player.source == "leetify", 1),
            (Player.source == "pandascore", 2),
            else_=3
        ),
        Player.name.asc()
    )

    total = query.count()
    players = query.offset(offset).limit(limit).all()

    items = []
    for p in players:
        stats = db.query(
            func.count(PlayerMatchStat.id).label("matches"),
            func.sum(PlayerMatchStat.kills).label("kills"),
            func.sum(PlayerMatchStat.deaths).label("deaths"),
            func.sum(PlayerMatchStat.rounds).label("rounds"),
            func.avg(PlayerMatchStat.adr).label("adr"),
        ).filter(PlayerMatchStat.player_id == p.id).first()

        match_count = stats.matches if stats and stats.matches else 0
        total_kills = stats.kills if stats and stats.kills else 0
        total_deaths = stats.deaths if stats and stats.deaths else 0
        total_rounds = stats.rounds if stats and stats.rounds else 0
        avg_adr = stats.adr if stats and stats.adr else 0.0

        kd = round(total_kills / max(1, total_deaths), 2)
        kpr = round(total_kills / max(1, total_rounds), 2)
        conf, _ = calculate_confidence(data_coverage=1.0, match_count=match_count)

        items.append(PlayerSummary(
            id=p.id,
            name=p.name,
            handle=p.handle,
            role=p.role.name if p.role else "Flex",
            team_name=p.team.name if p.team else None,
            region=p.region,
            tier=p.tier,
            is_available=p.is_available,
            source=p.source,
            matches_count=match_count,
            kd=kd,
            adr=round(avg_adr, 1),
            kpr=kpr,
            confidence=conf,
            playstyle=p.playstyle,
        ))

    return PlayerListResponse(total=total, items=items)


@router.get("/{player_id}", response_model=PlayerProfileResponse)
def get_player(
    player_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player with ID {player_id} not found."
        )

    # Activity Event logging: organiser viewed player profile
    if current_user.org_id and current_user.player_id != player.id:
        db.add(ActivityEvent(
            actor_user_id=current_user.id,
            org_id=current_user.org_id,
            subject_player_id=player.id,
            type="profile_viewed",
            entity_type="player",
            entity_id=str(player.id),
            payload_json={"org_name": current_user.organization.name if current_user.organization else "Pro Team"},
            visible_to_player=True,
        ))
        db.commit()

    # Query all matches and aggregate metrics
    stats = db.query(PlayerMatchStat).filter(PlayerMatchStat.player_id == player.id).all()
    match_count = len(stats)

    total_kills = 0
    total_deaths = 0
    total_rounds = 0
    total_adr = 0.0
    total_opening_k = 0
    total_opening_d = 0
    total_trades = 0
    total_util_dmg = 0.0
    total_clutches = 0
    total_calls = 0
    total_calls_conv = 0
    total_adaptation = 0.0

    recent_matches_out = []

    for stat in stats:
        match = stat.match
        opp_team = None
        if match:
            if match.team_a_id and match.team_a_id != player.team_id:
                opp_team = match.team_a
            elif match.team_b_id and match.team_b_id != player.team_id:
                opp_team = match.team_b

        total_kills += stat.kills
        total_deaths += stat.deaths
        total_rounds += stat.rounds
        total_adr += stat.adr
        total_opening_k += stat.opening_kills
        total_opening_d += stat.opening_deaths
        total_trades += stat.trades
        total_util_dmg += stat.utility_damage
        total_clutches += stat.clutches_won
        total_calls += stat.calls_count
        total_calls_conv += stat.calls_converted
        total_adaptation += stat.halftime_rating_diff

        if len(recent_matches_out) < 15 and match:
            recent_matches_out.append(MatchStatItem(
                match_id=stat.match_id,
                match_date=match.match_date,
                kills=stat.kills,
                deaths=stat.deaths,
                adr=round(stat.adr, 1),
                kpr=round(stat.kpr, 2),
                opening_kills=stat.opening_kills,
                opening_deaths=stat.opening_deaths,
                trades=stat.trades,
                utility_damage=round(stat.utility_damage, 1),
                clutches_won=stat.clutches_won,
                rounds=stat.rounds,
                opponent_name=opp_team.name if opp_team else "Opponent",
                opponent_tier=opp_team.tier if opp_team else "Tier 1",
            ))

    n = max(1, match_count)
    kd = round(total_kills / max(1, total_deaths), 2)
    kpr = round(total_kills / max(1, total_rounds), 2)
    avg_adr = round(total_adr / n, 1)
    opening_impact = round(total_opening_k / max(1, total_opening_k + total_opening_d), 2)
    tradeability = round(total_trades / max(1, total_rounds), 2)
    utility_val = round(total_util_dmg / n, 1)
    clutch_val = round(total_clutches / max(1, total_rounds), 3)
    calls_per_round = round(total_calls / max(1, total_rounds), 2)
    win_after_call = round(total_calls_conv / max(1, total_calls), 2)
    adaptation = round(0.50 + (total_adaptation / n), 2)

    metrics = {
        "kd": kd,
        "adr": avg_adr,
        "kpr": kpr,
        "opening_impact": opening_impact,
        "tradeability": tradeability,
        "utility_damage": utility_val,
        "clutches_won": total_clutches,
        "calls_per_round": calls_per_round,
        "win_after_call": win_after_call,
        "adaptation": adaptation,
    }

    norm_metrics = {
        "kd": min(1.0, max(0.0, (kd - 0.5) / 1.0)),
        "adr": min(1.0, max(0.0, (avg_adr - 40.0) / 60.0)),
        "kpr": min(1.0, max(0.0, (kpr - 0.4) / 0.6)),
        "opening_impact": opening_impact,
        "tradeability": min(1.0, tradeability * 3.0),
        "utility_value": min(1.0, utility_val / 35.0),
        "trade_structure": min(1.0, total_trades / max(1, total_deaths)),
        "late_round_impact": min(1.0, clutch_val * 15.0),
        "survival_value": min(1.0, max(0.0, 1.0 - (total_deaths / max(1, total_rounds)))),
        "opening_duel_winrate": opening_impact,
        "clutch_value": min(1.0, clutch_val * 15.0),
        "calls_per_round": min(1.0, calls_per_round / 1.5),
        "win_after_call": win_after_call,
        "adaptation": min(1.0, max(0.0, adaptation)),
    }

    role_scores = {}
    for r in ["IGL", "Entry", "Support", "Lurker", "AWPer"]:
        r_score, _, _ = calculate_role_performance(r, norm_metrics, has_valid_audio=False)
        role_scores[r] = r_score

    conf, warning = calculate_confidence(data_coverage=1.0, match_count=match_count)
    label = classify_evaluation_label(role_scores.get(player.role.name if player.role else "Entry", 70.0), conf)

    # Privacy and contact masking check
    contact_email, contact_phone, contact_unlocked = check_and_mask_contact(player, current_user, db)

    return PlayerProfileResponse(
        id=player.id,
        name=player.name,
        handle=player.handle,
        role=player.role.name if player.role else "Flex",
        team_name=player.team.name if player.team else None,
        region=player.region,
        tier=player.tier,
        source=player.source,
        is_available=player.is_available,
        avatar_url=player.avatar_url,
        playstyle=player.playstyle,
        matches_count=match_count,
        confidence=conf,
        confidence_label=label,
        confidence_warning=warning,
        formula_version=CURRENT_FORMULA_VERSION,
        data_coverage=1.0,
        metrics=metrics,
        role_scores=role_scores,
        recent_matches=recent_matches_out,
        # Dossier fields
        contact_email=contact_email,
        contact_phone=contact_phone,
        contact_unlocked=contact_unlocked,
        hours_per_week=player.hours_per_week,
        scrim_window_start=player.scrim_window_start,
        scrim_window_end=player.scrim_window_end,
        scrim_timezone=player.scrim_timezone,
        playstyle_description=player.playstyle_description,
        primary_game=player.primary_game,
        availability_status=player.availability_status,
        hardware_specs_json=player.hardware_specs_json,
        map_pool_json=player.map_pool_json,
        past_experience_json=player.past_experience_json,
        expected_compensation=player.expected_compensation,
        verification_status="linked" if player.source in ["leetify", "pandascore"] else "self_reported",
    )


@router.post("/{player_id}/request-contact", response_model=ContactAccessGrantOut)
def request_contact(
    player_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organiser),
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player with ID {player_id} not found."
        )

    # Check if a grant already exists
    existing = db.query(ContactAccessGrant).filter(
        ContactAccessGrant.player_id == player.id,
        ContactAccessGrant.org_id == current_user.org_id,
    ).first()

    if existing:
        return existing

    grant = ContactAccessGrant(
        player_id=player.id,
        org_id=current_user.org_id,
        status="pending",
        granted_via="request",
    )
    db.add(grant)

    # Log activity event visible to player
    org_name = current_user.organization.name if current_user.organization else "An Organisation"
    db.add(ActivityEvent(
        actor_user_id=current_user.id,
        org_id=current_user.org_id,
        subject_player_id=player.id,
        type="contact_requested",
        entity_type="contact_grant",
        entity_id=str(grant.id),
        payload_json={"org_name": org_name},
        visible_to_player=True,
    ))

    # Send notification if player has an associated user account
    if player.user_id:
        db.add(Notification(
            user_id=player.user_id,
            type="contact_request",
            title="Contact Details Requested",
            message=f"{org_name} has requested access to your contact information.",
            payload_json={"org_id": current_user.org_id, "grant_id": grant.id},
        ))

    db.commit()
    db.refresh(grant)
    grant.org_name = org_name
    return grant


@router.post("/{player_id}/watchlist")
def toggle_watchlist(
    player_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organiser),
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player with ID {player_id} not found."
        )

    existing = db.query(PlayerWatchlist).filter(
        PlayerWatchlist.player_id == player.id,
        PlayerWatchlist.org_id == current_user.org_id,
    ).first()

    org_name = current_user.organization.name if current_user.organization else "An Organisation"

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "removed", "player_id": player.id}

    watchlist_item = PlayerWatchlist(
        player_id=player.id,
        org_id=current_user.org_id,
    )
    db.add(watchlist_item)

    # Write activity event to timeline
    db.add(ActivityEvent(
        actor_user_id=current_user.id,
        org_id=current_user.org_id,
        subject_player_id=player.id,
        type="shortlisted",
        entity_type="watchlist",
        entity_id=str(player.id),
        payload_json={"org_name": org_name},
        visible_to_player=True,
    ))
    db.commit()
    return {"status": "added", "player_id": player.id}
