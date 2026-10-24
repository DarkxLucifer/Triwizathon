from typing import Optional, List, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.esports import Player, Role, Team, PlayerMatchStat, Match, FormulaVersion
from app.schemas.player import PlayerSummary, PlayerListResponse, PlayerProfileResponse, MatchStatItem
from app.services.scoring import (
    calculate_confidence,
    calculate_role_performance,
    classify_evaluation_label,
    compute_percentile_rank,
    apply_context_adjustment,
)
from app.config.formulas import CURRENT_FORMULA_VERSION

router = APIRouter(prefix="/players", tags=["Players"])


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
        Player.id.asc()
    )

    total = query.count()
    players = query.offset(offset).limit(limit).all()

    items = []
    for p in players:
        # Aggregate match statistics for summary
        stats = db.query(
            func.count(PlayerMatchStat.id).label("matches"),
            func.sum(PlayerMatchStat.kills).label("kills"),
            func.sum(PlayerMatchStat.deaths).label("deaths"),
            func.sum(PlayerMatchStat.rounds).label("rounds"),
            func.avg(PlayerMatchStat.adr).label("adr"),
        ).filter(PlayerMatchStat.player_id == p.id).first()

        match_count = stats.matches or 0
        total_kills = stats.kills or 0
        total_deaths = stats.deaths or 1
        total_rounds = stats.rounds or 1
        avg_adr = float(stats.adr or 0.0)
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
def get_player_profile(
    player_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found.")

    # Fetch all match stats with joined match info
    match_rows = (
        db.query(PlayerMatchStat, Match, Team)
        .join(Match, PlayerMatchStat.match_id == Match.id)
        .outerjoin(Team, Match.team_b_id == Team.id)
        .filter(PlayerMatchStat.player_id == player_id)
        .order_by(Match.match_date.desc())
        .all()
    )

    match_count = len(match_rows)
    recent_matches_out: List[MatchStatItem] = []

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

    for stat, match, opp_team in match_rows:
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

        if len(recent_matches_out) < 15:
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

    # Normalized metrics for role scoring (mapped 0.0 to 1.0)
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
    )
