from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_user, enforce_org_isolation
from app.models.user import User
from app.models.roster import Roster, RosterSlot
from app.models.esports import Player, Role, PlayerMatchStat
from app.schemas.roster import (
    RosterSummary,
    RosterSlotOut,
    RosterSlotPlayer,
    RosterHealthResponse,
    RosterAlert,
)
from app.services.scoring import calculate_role_performance, calculate_confidence

router = APIRouter(prefix="/rosters", tags=["Rosters"])


@router.get("", response_model=List[RosterSummary])
def list_rosters(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Strict org isolation
    rosters = db.query(Roster).filter(Roster.org_id == current_user.org_id).all()
    results = []
    for r in rosters:
        filled = sum(1 for s in r.slots if s.player_id is not None)
        results.append(RosterSummary(
            id=r.id,
            name=r.name,
            title_name=r.title.name if r.title else "Counter-Strike 2",
            team_name=r.team.name if r.team else None,
            filled_slots=filled,
            total_slots=len(r.slots),
            created_at=r.created_at,
        ))
    return results


@router.get("/{roster_id}/health", response_model=RosterHealthResponse)
def get_roster_health(
    roster_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    roster = db.query(Roster).filter(Roster.id == roster_id).first()
    if not roster:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Roster not found.")

    # Multi-tenant isolation check
    enforce_org_isolation(roster.org_id, current_user)

    slots_out: List[RosterSlotOut] = []
    min_score = 999.0
    weakest_role_name = None
    weakest_slot_index = None

    player_scores = []
    alerts = []
    styles = []

    for slot in roster.slots:
        role_name = slot.role.name if slot.role else "Flex"
        if not slot.player:
            slots_out.append(RosterSlotOut(
                slot_number=slot.slot_number,
                role=role_name,
                player=None,
                status="empty",
            ))
            alerts.append(RosterAlert(severity="high", message=f"Slot {slot.slot_number} ({role_name}) is currently unoccupied."))
            continue

        p = slot.player
        styles.append(p.playstyle)

        # Aggregate player stats
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
            func.sum(PlayerMatchStat.calls_count).label("calls"),
            func.sum(PlayerMatchStat.calls_converted).label("calls_conv"),
            func.avg(PlayerMatchStat.halftime_rating_diff).label("diff"),
        ).filter(PlayerMatchStat.player_id == p.id).first()

        matches = stats.matches or 0
        kills = stats.kills or 0
        deaths = stats.deaths or 1
        rounds = stats.rounds or 1
        adr = float(stats.adr or 0.0)
        kd = round(kills / max(1, deaths), 2)

        op_k = stats.op_k or 0
        op_d = stats.op_d or 1
        trades = stats.trades or 0
        clutches = stats.clutches or 0
        calls = stats.calls or 0
        calls_conv = stats.calls_conv or 0
        diff = float(stats.diff or 0.0)

        norm_m = {
            "kd": min(1.0, max(0.0, (kd - 0.5) / 1.0)),
            "adr": min(1.0, max(0.0, (adr - 40.0) / 60.0)),
            "kpr": min(1.0, max(0.0, ((kills / max(1, rounds)) - 0.4) / 0.6)),
            "opening_impact": round(op_k / max(1, op_k + op_d), 2),
            "tradeability": min(1.0, (trades / max(1, rounds)) * 3.0),
            "utility_value": min(1.0, float(stats.util or 0.0) / 35.0),
            "trade_structure": min(1.0, trades / max(1, deaths)),
            "late_round_impact": min(1.0, (clutches / max(1, rounds)) * 15.0),
            "survival_value": min(1.0, max(0.0, 1.0 - (deaths / max(1, rounds)))),
            "opening_duel_winrate": round(op_k / max(1, op_k + op_d), 2),
            "clutch_value": min(1.0, (clutches / max(1, rounds)) * 15.0),
            "command_ratio": 0.0,
            "calls_per_round": min(1.0, (calls / max(1, rounds)) / 1.5),
            "clarity": 0.0,
            "win_after_call": round(calls_conv / max(1, calls), 2) if calls > 0 else 0.5,
            "adaptation": min(1.0, max(0.0, 0.5 + diff)),
        }

        role_score, _, _ = calculate_role_performance(role_name, norm_m, has_valid_audio=False)
        conf, _ = calculate_confidence(data_coverage=1.0, match_count=matches)

        if role_score < min_score:
            min_score = role_score
            weakest_role_name = role_name
            weakest_slot_index = slot.slot_number

        player_scores.append((slot.slot_number, role_score))

        slot_player = RosterSlotPlayer(
            id=p.id,
            name=p.name,
            handle=p.handle,
            role=role_name,
            tier=p.tier,
            kd=kd,
            adr=round(adr, 1),
            role_score=role_score,
            confidence=conf,
            playstyle=p.playstyle,
        )

        slots_out.append(RosterSlotOut(
            slot_number=slot.slot_number,
            role=role_name,
            player=slot_player,
            status="optimal",  # will update after loop
        ))

    # Mark the weakest slot status
    for s in slots_out:
        if s.slot_number == weakest_slot_index:
            s.status = "weakest"

    if weakest_role_name and min_score < 65.0:
        alerts.append(RosterAlert(
            severity="high",
            message=f"Critical performance deficit in slot {weakest_slot_index} ({weakest_role_name}): rating {min_score:.1f} trails cohort benchmark.",
        ))

    # Overlap analysis
    agg_count = styles.count("Aggressive")
    if agg_count >= 3:
        overlap = "Heavy aggression bias detected (3+ explosive playstyles). Roster lacks disciplined late-round anchors."
    elif styles.count("Passive") >= 2:
        overlap = "Passive tempo drag: multiple slow-paced anchors leading to late round clock expiration."
    else:
        overlap = "Balanced tactical composition with complementary entry-support spacing."

    return RosterHealthResponse(
        roster_id=roster.id,
        roster_name=roster.name,
        title=roster.title.name if roster.title else "Counter-Strike 2",
        slots=slots_out,
        weakest_role=weakest_role_name,
        weakest_slot_index=weakest_slot_index,
        overlap_analysis=overlap,
        alerts=alerts,
    )
