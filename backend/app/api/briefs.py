from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_user, enforce_org_isolation
from app.models.user import User
from app.models.esports import Player, Role, Team, PlayerMatchStat, FormulaVersion, Title
from app.models.roster import Roster
from app.models.scouting import Brief, Recommendation
from app.models.audio import AudioJob
from app.schemas.brief import (
    BriefCreate,
    BriefRecommendationsResponse,
    RecommendationItem,
    RecommendationBreakdown,
)
from app.services.scoring import (
    calculate_role_performance,
    calculate_confidence,
    calculate_fit_score,
    classify_evaluation_label,
)
from app.services.explanations import generate_candidate_explanation
from app.config.formulas import CURRENT_FORMULA_VERSION

router = APIRouter(prefix="/briefs", tags=["Scouting Briefs"])


@router.post("", response_model=BriefRecommendationsResponse, status_code=status.HTTP_201_CREATED)
def create_brief_and_generate_recommendations(
    brief_in: BriefCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify title
    title = db.query(Title).filter(Title.id == brief_in.title_id).first()
    if not title:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Title not found.")

    target_role = db.query(Role).filter(Role.name == brief_in.target_role).first()
    if not target_role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Role '{brief_in.target_role}' not found.")

    # If roster provided, check org isolation and find weakest slot
    roster = None
    is_roster_weakest = True
    if brief_in.roster_id:
        roster = db.query(Roster).filter(Roster.id == brief_in.roster_id).first()
        if roster:
            enforce_org_isolation(roster.org_id, current_user)

    # Active formula version
    formula_ver = (
        db.query(FormulaVersion)
        .filter(FormulaVersion.is_active.is_(True))
        .order_by(FormulaVersion.id.desc())
        .first()
    )

    # Create Brief entity
    brief = Brief(
        org_id=current_user.org_id,
        title_id=title.id,
        roster_id=roster.id if roster else None,
        target_role_id=target_role.id,
        constraints_json=brief_in.constraints.model_dump() if brief_in.constraints else {},
        status="active",
    )
    db.add(brief)
    db.flush()

    # Query Candidate Players
    players_query = db.query(Player).join(Player.role)
    if brief_in.constraints and brief_in.constraints.available_only:
        players_query = players_query.filter(Player.is_available.is_(True))
    if brief_in.constraints and brief_in.constraints.region:
        players_query = players_query.filter(Player.region == brief_in.constraints.region)

    candidate_players = players_query.all()

    # Score each candidate
    scored_candidates = []
    for player in candidate_players:
        # Aggregated stats
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
        ).filter(PlayerMatchStat.player_id == player.id).first()

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

        # Check for consented audio intelligence for this candidate & org
        audio_job = (
            db.query(AudioJob)
            .filter(
                AudioJob.player_id == player.id,
                AudioJob.org_id == current_user.org_id,
            )
            .order_by(AudioJob.id.desc())
            .first()
        )

        has_valid_audio = False
        cand_audio_status = "unavailable"
        if audio_job:
            cand_audio_status = audio_job.status
            if audio_job.status == "completed" and audio_job.consent_given:
                segments = audio_job.segments
                if segments:
                    has_valid_audio = True
                    cmd_count = sum(1 for s in segments if s.is_command)
                    norm_m["command_ratio"] = round(cmd_count / max(1, len(segments)), 3)
                    norm_m["clarity"] = round(sum(s.confidence for s in segments) / max(1, len(segments)), 3)

        role_perf, active_w, redist = calculate_role_performance(
            brief_in.target_role, norm_m, has_valid_audio=has_valid_audio
        )

        # Roster Need Match: 1.0 if player primary role equals target role, 0.5 secondary, 0 otherwise
        p_role = player.role.name if player.role else "Flex"
        if p_role == brief_in.target_role:
            roster_need = 1.0
        elif p_role in ["Flex", "Support"]:
            roster_need = 0.5
        else:
            roster_need = 0.2

        # Synergy: Aggression complement vs duplicate
        synergy = 0.85
        if player.playstyle in ["Tactical", "Methodical"] and brief_in.target_role == "IGL":
            synergy = 0.95
        elif player.playstyle == "Passive" and brief_in.target_role == "Entry":
            synergy = 0.40

        # Constraint match
        constraint_match = 1.0
        if brief_in.constraints:
            if brief_in.constraints.min_tier and player.tier < brief_in.constraints.min_tier:
                constraint_match = 0.5

        fit_score = calculate_fit_score(
            role_performance_100=role_perf,
            roster_need_match=roster_need,
            synergy_contribution=synergy,
            constraint_match=constraint_match,
        )

        conf, warning = calculate_confidence(data_coverage=1.0, match_count=matches)
        eval_label = classify_evaluation_label(fit_score, conf)

        audio_score_30 = 0.0
        if has_valid_audio and audio_job:
            if audio_job.decision_score is not None:
                audio_score_30 = round(min(30.0, max(0.0, audio_job.decision_score)), 1)
            else:
                audio_score_30 = round((norm_m.get("command_ratio", 0.0) * 15.0) + (norm_m.get("clarity", 0.0) * 15.0), 1)

        telemetry_score_70 = round((role_perf / 100.0) * 70.0, 1)
        unified_total_100 = round(telemetry_score_70 + audio_score_30, 1)

        breakdown_dict = {
            "role_performance": role_perf,
            "roster_need_match": round(roster_need * 100.0, 1),
            "synergy_contribution": round(synergy * 100.0, 1),
            "constraint_match": round(constraint_match * 100.0, 1),
            "telemetry_score_70": telemetry_score_70,
            "audio_score_30": audio_score_30,
            "unified_total_100": unified_total_100,
            "raw_metrics": {
                "kd": kd,
                "adr": round(adr, 1),
                "kpr": round(kills / max(1, rounds), 2),
                "matches": matches,
            },
            "redistributed_weights": active_w if redist else None,
        }

        # Template Explanation generation + strictly verified number checks
        drivers, risks = generate_candidate_explanation(
            player_handle=player.handle,
            role=brief_in.target_role,
            fit_score=fit_score,
            confidence=conf,
            role_performance=role_perf,
            roster_need_match=roster_need,
            breakdown_data=breakdown_dict,
            has_audio=has_valid_audio,
            is_weakest_gap=is_roster_weakest,
        )

        scored_candidates.append({
            "player": player,
            "fit_score": fit_score,
            "confidence": conf,
            "evaluation_label": eval_label,
            "breakdown": breakdown_dict,
            "drivers": drivers,
            "risks": risks,
            "audio_status": cand_audio_status,
        })

    # Sort descending by FitScore
    scored_candidates.sort(key=lambda x: x["fit_score"], reverse=True)

    recommendations_out = []
    top_candidates = scored_candidates[:15]

    for rank_idx, item in enumerate(top_candidates, start=1):
        p = item["player"]
        rec = Recommendation(
            brief_id=brief.id,
            player_id=p.id,
            formula_version_id=formula_ver.id if formula_ver else None,
            rank=rank_idx,
            fit_score=item["fit_score"],
            confidence=item["confidence"],
            breakdown_json=item["breakdown"],
            drivers_json=item["drivers"],
            risks_json=item["risks"],
            audio_status=item["audio_status"],
        )
        db.add(rec)

        recommendations_out.append(RecommendationItem(
            rank=rank_idx,
            player_id=p.id,
            name=p.name,
            handle=p.handle,
            current_team=p.team.name if p.team else None,
            tier=p.tier,
            region=p.region,
            role=p.role.name if p.role else "Flex",
            fit_score=item["fit_score"],
            confidence=item["confidence"],
            evaluation_label=item["evaluation_label"],
            audio_status=item["audio_status"],
            formula_version=formula_ver.version_tag if formula_ver else CURRENT_FORMULA_VERSION,
            breakdown=RecommendationBreakdown(
                role_performance=item["breakdown"]["role_performance"],
                roster_need_match=item["breakdown"]["roster_need_match"],
                synergy_contribution=item["breakdown"]["synergy_contribution"],
                constraint_match=item["breakdown"]["constraint_match"],
                telemetry_score_70=item["breakdown"].get("telemetry_score_70"),
                audio_score_30=item["breakdown"].get("audio_score_30"),
                unified_total_100=item["breakdown"].get("unified_total_100"),
                raw_metrics=item["breakdown"]["raw_metrics"],
                redistributed_weights=item["breakdown"].get("redistributed_weights"),
            ),
            drivers=item["drivers"],
            risks=item["risks"],
            alternatives=[],
            source=p.source,
        ))

    db.commit()

    return BriefRecommendationsResponse(
        brief_id=brief.id,
        target_role=brief_in.target_role,
        formula_version=formula_ver.version_tag if formula_ver else CURRENT_FORMULA_VERSION,
        roster_name=roster.name if roster else None,
        recommendations=recommendations_out,
    )


@router.get("/{brief_id}/recommendations", response_model=BriefRecommendationsResponse)
def get_brief_recommendations(
    brief_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    brief = db.query(Brief).filter(Brief.id == brief_id).first()
    if not brief:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brief not found.")

    # Strict org isolation
    enforce_org_isolation(brief.org_id, current_user)

    recs = (
        db.query(Recommendation)
        .filter(Recommendation.brief_id == brief_id)
        .order_by(Recommendation.rank.asc())
        .all()
    )

    items = []
    for r in recs:
        p = r.player
        fv_tag = r.formula_version.version_tag if r.formula_version else CURRENT_FORMULA_VERSION
        items.append(RecommendationItem(
            rank=r.rank,
            player_id=p.id,
            name=p.name,
            handle=p.handle,
            current_team=p.team.name if p.team else None,
            tier=p.tier,
            region=p.region,
            role=p.role.name if p.role else "Flex",
            fit_score=r.fit_score,
            confidence=r.confidence,
            evaluation_label=classify_evaluation_label(r.fit_score, r.confidence),
            audio_status=r.audio_status,
            formula_version=fv_tag,
            breakdown=RecommendationBreakdown(**r.breakdown_json),
            drivers=r.drivers_json,
            risks=r.risks_json,
            alternatives=[],
            source=p.source,
        ))

    return BriefRecommendationsResponse(
        brief_id=brief.id,
        target_role=brief.target_role.name if brief.target_role else "Target Role",
        formula_version=CURRENT_FORMULA_VERSION,
        roster_name=brief.roster.name if brief.roster else None,
        recommendations=items,
    )
