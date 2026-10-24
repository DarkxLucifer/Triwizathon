from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, enforce_org_isolation
from app.models.user import User
from app.models.scouting import Decision, Brief
from app.models.roster import Roster
from app.models.esports import Player, FormulaVersion
from app.models.audit import AuditLog
from app.schemas.decision import DecisionCreate, DecisionOut
from app.config.formulas import CURRENT_FORMULA_VERSION

router = APIRouter(prefix="/decisions", tags=["Decisions"])


@router.post("", response_model=DecisionOut, status_code=status.HTTP_201_CREATED)
def record_decision(
    decision_in: DecisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    player = db.query(Player).filter(Player.id == decision_in.player_id).first()
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found.")

    if decision_in.brief_id:
        brief = db.query(Brief).filter(Brief.id == decision_in.brief_id).first()
        if brief:
            enforce_org_isolation(brief.org_id, current_user)

    if decision_in.roster_id:
        roster = db.query(Roster).filter(Roster.id == decision_in.roster_id).first()
        if roster:
            enforce_org_isolation(roster.org_id, current_user)

    formula_ver = (
        db.query(FormulaVersion)
        .filter(FormulaVersion.is_active.is_(True))
        .order_by(FormulaVersion.id.desc())
        .first()
    )

    decision = Decision(
        org_id=current_user.org_id,
        brief_id=decision_in.brief_id,
        player_id=decision_in.player_id,
        roster_id=decision_in.roster_id,
        user_id=current_user.id,
        formula_version_id=formula_ver.id if formula_ver else None,
        action=decision_in.action,
        rationale=decision_in.rationale,
        outcome_label=decision_in.outcome_label,
    )
    db.add(decision)
    db.flush()

    # Create Audit Log entry
    audit = AuditLog(
        org_id=current_user.org_id,
        user_id=current_user.id,
        action=f"decision_{decision.action}",
        resource_type="decision",
        resource_id=str(decision.id),
        details_json={
            "player_id": player.id,
            "player_handle": player.handle,
            "action": decision.action,
            "formula_version": formula_ver.version_tag if formula_ver else CURRENT_FORMULA_VERSION,
        }
    )
    db.add(audit)
    db.commit()
    db.refresh(decision)

    return DecisionOut(
        id=decision.id,
        org_id=decision.org_id,
        brief_id=decision.brief_id,
        player_id=decision.player_id,
        player_name=player.name,
        player_handle=player.handle,
        roster_id=decision.roster_id,
        roster_name=decision.roster.name if decision.roster else None,
        user_name=current_user.full_name,
        action=decision.action,
        rationale=decision.rationale,
        outcome_label=decision.outcome_label,
        formula_version=formula_ver.version_tag if formula_ver else CURRENT_FORMULA_VERSION,
        created_at=decision.created_at,
    )


@router.get("", response_model=List[DecisionOut])
def list_decisions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Strict multi-tenancy filter
    decisions = (
        db.query(Decision)
        .filter(Decision.org_id == current_user.org_id)
        .order_by(Decision.created_at.desc())
        .all()
    )

    results = []
    for d in decisions:
        fv_tag = d.formula_version.version_tag if d.formula_version else CURRENT_FORMULA_VERSION
        results.append(DecisionOut(
            id=d.id,
            org_id=d.org_id,
            brief_id=d.brief_id,
            player_id=d.player_id,
            player_name=d.player.name if d.player else "Unknown",
            player_handle=d.player.handle if d.player else "Unknown",
            roster_id=d.roster_id,
            roster_name=d.roster.name if d.roster else None,
            user_name=d.user.full_name if d.user else "System",
            action=d.action,
            rationale=d.rationale,
            outcome_label=d.outcome_label,
            formula_version=fv_tag,
            created_at=d.created_at,
        ))

    return results
