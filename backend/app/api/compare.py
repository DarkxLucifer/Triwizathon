from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.esports import Player, PlayerMatchStat
from app.services.scoring import calculate_confidence, calculate_role_performance
from app.config.formulas import CURRENT_FORMULA_VERSION

router = APIRouter(prefix="/compare", tags=["Comparison"])


@router.get("")
def compare_candidates(
    player_ids: str = Query(..., description="Comma-separated player IDs (2 to 3 players, e.g. 1,5,8)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        p_ids = [int(x.strip()) for x in player_ids.split(",") if x.strip()]
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid player_ids format.")

    if len(p_ids) < 2 or len(p_ids) > 4:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please select between 2 and 4 players to compare.")

    players = db.query(Player).filter(Player.id.in_(p_ids)).all()
    if len(players) != len(p_ids):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or more specified players were not found.")

    candidates_out = []
    for p in players:
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
        opening_winrate = round(op_k / max(1, op_k + op_d), 2)
        trades = stats.trades or 0
        trade_rate = round(trades / max(1, rounds), 2)

        conf, _ = calculate_confidence(data_coverage=1.0, match_count=matches)

        role_name = p.role.name if p.role else "Flex"
        norm_metrics = {
            "kd": min(1.0, max(0.0, (kd - 0.5) / 1.0)),
            "adr": min(1.0, max(0.0, (adr - 40.0) / 60.0)),
            "kpr": min(1.0, max(0.0, (kpr - 0.4) / 0.6)),
            "opening_impact": opening_winrate,
            "tradeability": min(1.0, trade_rate * 3.0),
            "utility_value": min(1.0, float(stats.util or 0.0) / 35.0),
            "trade_structure": min(1.0, trades / max(1, deaths)),
            "late_round_impact": min(1.0, (float(stats.clutches or 0) / max(1, rounds)) * 15.0),
            "survival_value": min(1.0, max(0.0, 1.0 - (deaths / max(1, rounds)))),
            "opening_duel_winrate": opening_winrate,
            "clutch_value": min(1.0, (float(stats.clutches or 0) / max(1, rounds)) * 15.0),
        }

        role_score, _, _ = calculate_role_performance(role_name, norm_metrics)

        candidates_out.append({
            "player_id": p.id,
            "name": p.name,
            "handle": p.handle,
            "role": role_name,
            "team": p.team.name if p.team else None,
            "tier": p.tier,
            "region": p.region,
            "playstyle": p.playstyle,
            "kd": kd,
            "adr": round(adr, 1),
            "kpr": kpr,
            "opening_winrate": opening_winrate,
            "trade_rate": trade_rate,
            "role_score": role_score,
            "confidence": conf,
            "matches_count": matches,
            "radar_metrics": {
                "Firepower": min(100, int(kd * 70)),
                "Damage": min(100, int((adr / 100.0) * 100)),
                "Entry Aggression": min(100, int(opening_winrate * 100)),
                "Trade Efficiency": min(100, int(trade_rate * 300)),
                "Utility / Support": min(100, int((float(stats.util or 0) / 30.0) * 100)),
            }
        })

    return {
        "formula_version": CURRENT_FORMULA_VERSION,
        "candidates": candidates_out,
    }
