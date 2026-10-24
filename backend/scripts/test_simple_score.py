import sys; sys.path.insert(0, "D:/project/aiml prime/project/Triwizathon/backend")
from app.core.config import settings
import httpx, json

groq_key = settings.GROQ_API_KEY

prompt = """You are an elite Counter-Strike 2 tactical esports analyst.
Analyze the following entire in-game voice communications transcript at once:

[0.0s - 3.2s]: "Default spread. Strat and R00K take mid, Viper hold palace, Nyx watch B apartments."
[5.1s - 7.4s]: "Smoke window! Catwalk flash out in 3, 2, 1."
[15.0s - 18.2s]: "They rotated 3 to B on audio. Cancel mid-to-B, rotate fast A."
[24.1s - 26.5s]: "Execute A now! Clear firebox, clear under palace!"
[32.1s - 34.8s]: "Bomb is down! 4v2 numbers. Play post-plant crossfire, DO NOT PEEK."

Evaluate whether the decisions made were right or wrong based on CS2 tactical fundamentals.
Return ONLY a valid JSON object with the final score (0.0 to 100.0) and a brief 1-sentence summary:
{
  "tactical_decision_score": 90.0,
  "summary": "Brief tactical evaluation."
}"""

with httpx.Client() as client:
    resp = client.post("https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
        json={
            "model": "openai/gpt-oss-120b",
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
            "temperature": 0.1
        },
        timeout=15.0
    )
    print("Groq status:", resp.status_code)
    if resp.status_code == 200:
        content = resp.json()["choices"][0]["message"]["content"]
        print("Groq output:", content.encode("ascii", "ignore").decode())
