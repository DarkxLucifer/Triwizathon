import sys
sys.path.insert(0, "D:/project/aiml prime/project/Triwizathon/backend")
import httpx
from app.core.config import settings

headers = {"Authorization": f"Bearer {settings.PANDASCORE_API_KEY}", "Accept": "application/json"}

for q in ["ropz", "apEX", "b1t", "flameZ"]:
    r = httpx.get(f"https://api.pandascore.co/csgo/players?filter[name]={q}", headers=headers)
    for p in r.json():
        tname = p["current_team"]["name"] if p.get("current_team") else "Free Agent"
        print(f"{q} -> ID: {p['id']}, Name: {p['name']}, Real: {p.get('first_name')} {p.get('last_name')}, Team: {tname}")
