import sys; sys.path.insert(0, "D:/project/aiml prime/project/Triwizathon/backend")
from app.core.config import settings
import httpx, json

groq_key = settings.GROQ_API_KEY

# 1. Test 30-Point Audio Prompt
audio_prompt = """You are an elite Counter-Strike 2 Tactical Esports Coach.
Analyze the following in-game voice communications transcript at once:

[0.0s - 3.2s]: "Default spread. Strat and R00K take mid, Viper hold palace, Nyx watch B apartments."
[5.1s - 7.4s]: "Smoke window! Catwalk flash out in 3, 2, 1."
[15.0s - 18.2s]: "They rotated 3 to B on audio. Cancel mid-to-B, rotate fast A. Group palace and ramp."
[24.1s - 26.5s]: "Execute A now! Clear firebox, clear under palace!"
[32.1s - 34.8s]: "Bomb is down! 4v2 numbers. Play post-plant crossfire, DO NOT PEEK."

Evaluate whether the decisions made were tactically right or wrong.
Calculate an objective Tactical Voice Decision Score strictly out of 30.0 points (maximum 30.0, minimum 0.0).

Return ONLY a valid JSON object:
{
  "audio_score": <float between 0.0 and 30.0>,
  "summary": "<1-sentence tactical evaluation>"
}"""

# 2. Test 70-Point Telemetry Prompt (PandaScore & Leetify data)
telemetry_prompt = """You are an elite Counter-Strike 2 Esports Data Analyst.
Analyze the following verified competitor telemetry from official PandaScore and Leetify APIs:

Player: Strat (Silas Chen)
Role: IGL | Team: Sentinels | Tier: Tier 1 | Region: EU
Telemetry from PandaScore & Leetify:
- Total Matches: 38
- K/D Ratio: 1.26 (Kills: 680, Deaths: 540)
- ADR (Damage Per Round): 87.6
- KPR (Kills Per Round): 0.81
- Opening Duel Win Rate: 58.0%
- Trade Kill Success Rate: 74.0%
- Utility Damage per Round: 18.5
- 1vX Clutches Won: 12
- CS2 Premier Rating: 23,500 | FACEIT Level: 10

Evaluate the competitor's statistical combat impact and consistency across Tier 1 matches.
Calculate an objective Match Telemetry Score strictly out of 70.0 points (maximum 70.0, minimum 0.0).

Return ONLY a valid JSON object:
{
  "telemetry_score": <float between 0.0 and 70.0>,
  "summary": "<1-sentence combat telemetry evaluation>"
}"""

with httpx.Client() as client:
    headers = {"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"}
    
    # 1. Call Audio
    r_audio = client.post("https://api.groq.com/openai/v1/chat/completions",
        headers=headers,
        json={"model": "openai/gpt-oss-120b", "messages": [{"role": "user", "content": audio_prompt}], "response_format": {"type": "json_object"}, "temperature": 0.1},
        timeout=15.0
    )
    data_audio = r_audio.json()["choices"][0]["message"]["content"]
    parsed_audio = json.loads(data_audio)
    score_audio = float(parsed_audio.get("audio_score", 0.0))
    print(f"1. Audio Decision Score (out of 30.0): {score_audio:.1f} / 30.0")
    print("   Summary:", parsed_audio.get("summary", "").encode("ascii", "ignore").decode())

    # 2. Call Telemetry
    r_telem = client.post("https://api.groq.com/openai/v1/chat/completions",
        headers=headers,
        json={"model": "openai/gpt-oss-120b", "messages": [{"role": "user", "content": telemetry_prompt}], "response_format": {"type": "json_object"}, "temperature": 0.1},
        timeout=15.0
    )
    data_telem = r_telem.json()["choices"][0]["message"]["content"]
    parsed_telem = json.loads(data_telem)
    score_telem = float(parsed_telem.get("telemetry_score", 0.0))
    print(f"\n2. API Telemetry Score (out of 70.0): {score_telem:.1f} / 70.0")
    print("   Summary:", parsed_telem.get("summary", "").encode("ascii", "ignore").decode())

    # 3. Sum of Both (out of 100.0)
    total_score = round(score_audio + score_telem, 1)
    print(f"\n3. TOTAL UNIFIED SCORE: {total_score} / 100.0")
    print(f"   ({score_telem:.1f} Telemetry + {score_audio:.1f} Audio = {total_score} Total)")
