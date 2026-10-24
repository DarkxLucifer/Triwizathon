import asyncio
import sys
sys.path.insert(0, "D:/project/aiml prime/project/Triwizathon/backend")

from app.services.leetify_adapter import LeetifyAdapter

async def run_leetify_check():
    adapter = LeetifyAdapter()
    valid = await adapter.validate_api_key()
    print("API Key Valid:", valid)

    prof = await adapter.fetch_profile("76561198034202275")
    if not prof:
        print("Failed to fetch s1mple profile")
        return

    print("Fetched profile:", prof.get("name"), "Total matches:", prof.get("total_matches"))
    recent = prof.get("recent_matches", [])[:2]
    print(f"Inspecting {len(recent)} recent matches:")

    for m in recent:
        gid = m.get("id")
        details = await adapter.fetch_match_details(gid)
        if details:
            print(f"Match {gid} map: {details.get('map_name')}, stats count: {len(details.get('stats', []))}")
            s1mple_stat = next((s for s in details.get("stats", []) if s.get("name") == "s1mple"), None)
            if s1mple_stat:
                print("   s1mple:", s1mple_stat.get("total_kills"), "kills,", s1mple_stat.get("total_deaths"), "deaths, ADR:", s1mple_stat.get("dpr"))

if __name__ == "__main__":
    asyncio.run(run_leetify_check())
