from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.esports import Player, PlayerMatchStat, Role
from app.services.scoring import (
    calculate_hidden_gem_score,
    calculate_confidence,
    calculate_role_performance,
)
from app.config.formulas import CURRENT_FORMULA_VERSION, TIER_VISIBILITY_GAP

router = APIRouter(prefix="/hidden-gems", tags=["Hidden Gems"])


@router.get("")
def list_hidden_gems(
    role: Optional[str] = Query(None, description="Role filter"),
    min_score: float = Query(50.0, description="Minimum hidden gem score filter"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of candidates to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Player).join(Player.role).outerjoin(Player.team)
    if role:
        query = query.filter(Role.name == role)

    all_players = query.all()
    gem_results = []

    for p in all_players:
        stats = db.query(
            func.count(PlayerMatchStat.id).label("matches"),
            func.sum(PlayerMatchStat.kills).label("kills"),
            func.sum(PlayerMatchStat.deaths).label("deaths"),
            func.sum(PlayerMatchStat.rounds).label("rounds"),
            func.avg(PlayerMatchStat.adr).label("adr"),
            func.sum(PlayerMatchStat.opening_kills).label("op_k"),
            func.sum(PlayerMatchStat.opening_deaths).label("op_d"),
            func.sum(PlayerMatchStat.trades).label("trades"),
            func.avg(PlayerMatchStat.utility_damage).label("util"),
            func.sum(PlayerMatchStat.clutches_won).label("clutches"),
            func.avg(PlayerMatchStat.halftime_rating_diff).label("diff"),
        ).filter(PlayerMatchStat.player_id == p.id).first()

        matches = stats.matches or 0
        kills = stats.kills or 0
        deaths = stats.deaths or 1
        rounds = stats.rounds or 1
        adr = float(stats.adr or 0.0)
        kd = round(kills / max(1, deaths), 2)
        kpr = round(kills / max(1, rounds), 2)
        op_k = stats.op_k or 0
        op_d = stats.op_d or 1

        conf, _ = calculate_confidence(data_coverage=1.0, match_count=matches)

        # Baseline performance percentile approximation
        norm_kd = min(1.0, max(0.0, (kd - 0.6) / 0.8))
        norm_adr = min(1.0, max(0.0, (adr - 50.0) / 45.0))
        adjusted_perf_percentile = round(0.55 * norm_kd + 0.45 * norm_adr, 3)

        # Improvement trend
        diff = float(stats.diff or 0.0)
        improvement_trend = min(1.0, max(0.0, 0.50 + diff))

        gem_score, suppression_reason = calculate_hidden_gem_score(
            adjusted_performance_percentile=adjusted_perf_percentile,
            tier=p.tier,
            confidence=conf,
            improvement_trend=improvement_trend,
            match_count=matches,
        )

        label = "Hidden Gem Candidate"
        if gem_score and gem_score >= 80.0:
            label = "Prime Hidden Gem"
        elif gem_score and gem_score >= 70.0:
            label = "High Upside Prospect"

        gem_results.append({
            "player_id": p.id,
            "name": p.name,
            "handle": p.handle,
            "role": p.role.name if p.role else "Flex",
            "team_name": p.team.name if p.team else None,
            "tier": p.tier,
            "region": p.region,
            "kd": kd,
            "adr": round(adr, 1),
            "kpr": kpr,
            "hidden_gem_score": gem_score if gem_score is not None else 0.0,
            "confidence": conf,
            "visibility_gap": TIER_VISIBILITY_GAP.get(p.tier, 0.65),
            "improvement_trend": f"{'+' if diff >= 0 else ''}{diff*100:.1f}% late round trajectory",
            "label": label,
            "is_suppressed": suppression_reason is not None,
            "suppression_reason": suppression_reason,
            "source": p.source,
            "matches_count": matches,
        })

    # Sort descending by hidden gem score
    gem_results.sort(key=lambda x: x["hidden_gem_score"], reverse=True)

    filtered = [g for g in gem_results if g["hidden_gem_score"] >= min_score or g["is_suppressed"]]
    return {
        "formula_version": CURRENT_FORMULA_VERSION,
        "total": len(filtered),
        "items": filtered[:limit],
    }
