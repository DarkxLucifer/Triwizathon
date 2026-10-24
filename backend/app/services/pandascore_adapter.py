"""PandaScore Official API Adapter.

Strict adherence to verified PandaScore schema fields from live endpoint inspection:
Endpoints:
  GET https://api.pandascore.co/csgo/players
  GET https://api.pandascore.co/csgo/matches
"""

import logging
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

PANDASCORE_BASE_URL = "https://api.pandascore.co"


class PandaScoreAdapter:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.PANDASCORE_API_KEY
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
        }

    async def fetch_csgo_players(self, page_size: int = 25, page_number: int = 1) -> List[Dict[str, Any]]:
        """Fetches real CS:GO players from official PandaScore endpoint."""
        url = f"{PANDASCORE_BASE_URL}/csgo/players"
        params = {
            "page[size]": page_size,
            "page[number]": page_number,
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, headers=self.headers, params=params)
                if resp.status_code == 200:
                    return resp.json()
                else:
                    logger.warning(f"PandaScore players returned status {resp.status_code}: {resp.text}")
                    return []
        except Exception as e:
            logger.error(f"Failed to communicate with PandaScore API: {e}")
            return []

    async def fetch_csgo_matches(self, page_size: int = 10, page_number: int = 1) -> List[Dict[str, Any]]:
        """Fetches real CS:GO matches from official PandaScore endpoint."""
        url = f"{PANDASCORE_BASE_URL}/csgo/matches"
        params = {
            "page[size]": page_size,
            "page[number]": page_number,
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, headers=self.headers, params=params)
                if resp.status_code == 200:
                    return resp.json()
                else:
                    logger.warning(f"PandaScore matches returned status {resp.status_code}: {resp.text}")
                    return []
        except Exception as e:
            logger.error(f"Failed to communicate with PandaScore matches API: {e}")
            return []

    async def fetch_csgo_teams(self, page_size: int = 15, page_number: int = 1) -> List[Dict[str, Any]]:
        """Fetches real CS:GO teams from official PandaScore endpoint."""
        url = f"{PANDASCORE_BASE_URL}/csgo/teams"
        params = {
            "page[size]": page_size,
            "page[number]": page_number,
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, headers=self.headers, params=params)
                if resp.status_code == 200:
                    return resp.json()
                logger.warning(f"PandaScore teams returned status {resp.status_code}: {resp.text}")
                return []
        except Exception as e:
            logger.error(f"Failed to communicate with PandaScore teams API: {e}")
            return []

    async def search_player(self, query: str) -> Optional[Dict[str, Any]]:
        """Searches for a pro player by handle/name with exact filter or fuzzy search."""
        url = f"{PANDASCORE_BASE_URL}/csgo/players"
        q_clean = query.strip()
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # 1. Exact filter by name
                resp = await client.get(url, headers=self.headers, params={"filter[name]": q_clean})
                if resp.status_code == 200 and resp.json():
                    return resp.json()[0]

                # 2. Fuzzy search by name
                resp = await client.get(url, headers=self.headers, params={"search[name]": q_clean})
                if resp.status_code == 200:
                    results = resp.json()
                    if results:
                        # Find exact case-insensitive match first
                        for p in results:
                            if p.get("name", "").lower() == q_clean.lower():
                                return p
                        return results[0]

                # 3. Filter by slug
                resp = await client.get(url, headers=self.headers, params={"filter[slug]": q_clean.lower()})
                if resp.status_code == 200 and resp.json():
                    return resp.json()[0]

                return None
        except Exception as e:
            logger.error(f"Error searching PandaScore player for '{query}': {e}")
            return None

    @staticmethod
    def map_pandascore_role_to_standard(ps_role: Optional[str]) -> str:
        """Maps PandaScore role strings to standard tactical roles."""
        if not ps_role:
            return "Entry"
        ps_lower = ps_role.lower()
        if "lead" in ps_lower or "igl" in ps_lower or "captain" in ps_lower:
            return "IGL"
        if "sniper" in ps_lower or "awp" in ps_lower:
            return "AWPer"
        if "support" in ps_lower:
            return "Support"
        if "lurk" in ps_lower:
            return "Lurker"
        return "Entry"
