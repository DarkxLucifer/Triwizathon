from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.players import router as players_router
from app.api.rosters import router as rosters_router
from app.api.briefs import router as briefs_router
from app.api.compare import router as compare_router
from app.api.hidden_gems import router as hidden_gems_router
from app.api.audio import router as audio_router
from app.api.decisions import router as decisions_router
from app.api.ingestion import router as ingestion_router
from app.api.player_portal import router as player_portal_router
from app.api.openings import router as openings_router
from app.api.dashboard import router as dashboard_router
from app.api.leaderboards import router as leaderboards_router
from app.api.recordings import router as recordings_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(players_router)
api_router.include_router(rosters_router)
api_router.include_router(briefs_router)
api_router.include_router(compare_router)
api_router.include_router(hidden_gems_router)
api_router.include_router(audio_router)
api_router.include_router(decisions_router)
api_router.include_router(ingestion_router)
api_router.include_router(player_portal_router)
api_router.include_router(openings_router)
api_router.include_router(dashboard_router)
api_router.include_router(leaderboards_router)
api_router.include_router(recordings_router)
