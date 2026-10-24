"""Leetify Official Public CS API Adapter.

Strictly mapped to Leetify OpenAPI 3.1.0 specifications:
Base URL: https://api-public.cs-prod.leetify.com
Authentication: Header _leetify_key or Authorization: Bearer <key>

Endpoints:
  GET /api-key/validate -> Validate developer key
  GET /v3/profile?steam64_id={id} -> Full pro profile, ratings (aim, positioning, utility, clutch, opening), and recent match IDs
  GET /v3/profile/matches?steam64_id={id} -> Historical match records
  GET /v2/matches/{gameId} -> Round-by-round and per-player combat stats (K/D, ADR/DPR, Trades, Utility)
"""

import logging
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

LEETIFY_BASE_URL = "https://api-public.cs-prod.leetify.com"


class LeetifyAdapter:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.LEETIFY_API_KEY
        self.headers = {
            "_leetify_key": self.api_key or "",
            "Authorization": f"Bearer {self.api_key or ''}",
            "Accept": "application/json",
        }

    async def validate_api_key(self) -> bool:
        """Validates that the Leetify developer API key is active."""
        if not self.api_key:
            return False
        url = f"{LEETIFY_BASE_URL}/api-key/validate"
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.get(url, headers=self.headers)
                return resp.status_code == 200
        except Exception as e:
            logger.error(f"Leetify key validation failed: {e}")
            return False

    async def fetch_profile(self, steam64_id: str) -> Optional[Dict[str, Any]]:
        """Fetches pro player profile, rating aggregates, and match list from Leetify."""
        url = f"{LEETIFY_BASE_URL}/v3/profile"
        params = {"steam64_id": steam64_id}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, headers=self.headers, params=params)
                if resp.status_code == 200:
                    return resp.json()
                logger.warning(f"Leetify profile for {steam64_id} returned HTTP {resp.status_code}")
                return None
        except Exception as e:
            logger.error(f"Error fetching Leetify profile {steam64_id}: {e}")
            return None

    async def fetch_match_details(self, game_id: str) -> Optional[Dict[str, Any]]:
        """Fetches granular match statistics, rounds, and player combat stats."""
        url = f"{LEETIFY_BASE_URL}/v2/matches/{game_id}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, headers=self.headers)
                if resp.status_code == 200:
                    return resp.json()
                logger.warning(f"Leetify match {game_id} returned HTTP {resp.status_code}")
                return None
        except Exception as e:
            logger.error(f"Error fetching Leetify match {game_id}: {e}")
            return None
