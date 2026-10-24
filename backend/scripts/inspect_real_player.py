import httpx

client = httpx.Client(base_url="http://127.0.0.1:8000")
r_login = client.post("/api/auth/login", json={"email": "analyst@sentinels.gg", "password": "Password123!"})
token = r_login.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

r = client.get("/api/players?limit=100&offset=100", headers=headers)
items = r.json().get("items", [])
leetify_items = [p for p in items if p["source"] == "leetify"]
print(f"Found {len(leetify_items)} Leetify pro players:")
for p in leetify_items:
    print(f"ID: {p['id']} | Handle: {p['handle']} | Role: {p['role']} | K/D: {p['kd']} | ADR: {p['adr']} | KPR: {p['kpr']} | Matches: {p['matches_count']}")
