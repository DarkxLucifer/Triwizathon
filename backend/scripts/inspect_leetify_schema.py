import httpx
import json

r = httpx.get("https://api-public-docs.cs-prod.leetify.com/swagger-ui-init.js")
text = r.text

marker = '"swaggerDoc": '
idx = text.find(marker)
start = idx + len(marker)

# Find the end of the swaggerDoc object
depth = 0
end = start
for i, c in enumerate(text[start:], start=start):
    if c == '{':
        depth += 1
    elif c == '}':
        depth -= 1
        if depth == 0:
            end = i + 1
            break

doc = json.loads(text[start:end])

print("API Title:", doc["info"]["title"])
print("Version:", doc["info"].get("version", "N/A"))
print("\nEndpoints:")
for path, methods in doc["paths"].items():
    for m, details in methods.items():
        summary = details.get("summary") or details.get("description", "")[:60]
        print(f"  {m.upper()} {path} -> {summary}")
        if "parameters" in details:
            for p in details["parameters"]:
                print(f"     Param: {p.get('name')} in {p.get('in')}, required={p.get('required')}")

print("\nComponents Schemas:")
for sname in ["Stats", "PlayerStats", "Rating", "ProfileResponse"]:
    props = doc.get("components", {}).get("schemas", {}).get(sname, {}).get("properties", {})
    print(f"\n=== Schema {sname} ({len(props)} properties) ===")
    for p, v in props.items():
        print(f"  {p}: {v.get('type')}")

