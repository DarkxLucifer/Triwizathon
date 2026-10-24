from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.esports import Player, Role, Team, PlayerMatchStat
from app.models.portal import PlayerTitle, PlayerScoreHistory
from app.schemas.portal import LeaderboardItem, LeaderboardResponse

router = APIRouter(prefix="/leaderboards", tags=["Leaderboards"])


@router.get("", response_model=LeaderboardResponse)
def get_leaderboards(
    title: str = Query("cs2", description="Game slug: cs2, bgmi, valorant, free-fire, mlbb"),
    role: Optional[str] = Query(None, description="Role filter: IGL, Entry, Support, Lurker, AWPer"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    title_slug = title.lower().strip()

    if title_slug == "cs2":
        # Query real CS2 players from database
        query = db.query(Player).join(Player.role).outerjoin(Player.team)
        if role:
            query = query.filter(Role.name.ilike(f"%{role}%"))

        total = query.count()
        players = query.offset(offset).limit(limit).all()

        items = []
        for rank_idx, p in enumerate(players, start=offset + 1):
            # Check for score history
            score_snap = db.query(PlayerScoreHistory).filter(PlayerScoreHistory.player_id == p.id).order_by(PlayerScoreHistory.recorded_at.desc()).first()
            if score_snap:
                combat = score_snap.combat_score
                tactical = score_snap.tactical_score
                overall = score_snap.overall_score
            else:
                # Calculate from stats
                stats = db.query(
                    func.count(PlayerMatchStat.id).label("matches"),
                    func.sum(PlayerMatchStat.kills).label("kills"),
                    func.sum(PlayerMatchStat.deaths).label("deaths"),
                    func.avg(PlayerMatchStat.adr).label("adr"),
                ).filter(PlayerMatchStat.player_id == p.id).first()

                matches_c = stats.matches if stats and stats.matches else 0
                kills = stats.kills if stats and stats.kills else 0
                deaths = stats.deaths if stats and stats.deaths else 1
                adr = stats.adr if stats and stats.adr else 0.0

                kd = kills / max(1, deaths)
                combat = round(min(70.0, max(25.0, (kd * 22.0) + (adr * 0.25))), 1)
                tactical = 24.0  # benchmark default
                overall = round(combat + tactical, 1)

            matches_count = db.query(PlayerMatchStat).filter(PlayerMatchStat.player_id == p.id).count()
            v_status = "linked" if p.source in ["leetify", "pandascore"] else "simulated"

            items.append(LeaderboardItem(
                rank=rank_idx,
                player_id=p.id,
                handle=p.handle,
                name=p.name,
                role=p.role.name if p.role else "Flex",
                region=p.region,
                team_name=p.team.name if p.team else None,
                combat_score=combat,
                tactical_score=tactical,
                overall_score=overall,
                source=p.source,
                verification_status=v_status,
                matches_count=matches_count,
            ))

        items.sort(key=lambda x: x.overall_score, reverse=True)
        # Re-assign rank numbers after sorting
        for idx, item in enumerate(items, start=1):
            item.rank = idx

        return LeaderboardResponse(
            title_slug="cs2",
            role=role,
            total=total,
            items=items,
        )

    # Non-CS2 titles (BGMI, Valorant, Free Fire, MLBB)
    query = db.query(PlayerTitle).join(PlayerTitle.player).filter(
        PlayerTitle.title_slug == title_slug
    )
    total = query.count()
    title_entries = query.offset(offset).limit(limit).all()

    items = []
    for rank_idx, te in enumerate(title_entries, start=offset + 1):
        p = te.player
        items.append(LeaderboardItem(
            rank=rank_idx,
            player_id=p.id,
            handle=te.in_game_name or p.handle,
            name=p.name,
            role=p.role.name if p.role else "Flex",
            region=p.region,
            team_name=None,
            combat_score=48.0,
            tactical_score=22.0,
            overall_score=70.0,
            source="community",
            verification_status=te.verification_status,
            matches_count=0,
        ))

    return LeaderboardResponse(
        title_slug=title_slug,
        role=role,
        total=total,
        items=items,
    )
