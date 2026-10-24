import sys; sys.path.insert(0, "D:/project/aiml prime/project/Triwizathon/backend")
from app.core.config import settings
import httpx, json

groq_key = settings.GROQ_API_KEY
gemini_key = settings.GEMINI_API_KEY

sample_full_transcript = """
[0.0s - 3.2s]: "Default spread. Strat and R00K take mid, Viper hold palace, Nyx watch B apartments."
[5.1s - 7.4s]: "Smoke window! Catwalk flash out in 3, 2, 1."
[8.0s - 9.8s]: "Window smoked. Mid is clear, short player fell back to B."
[11.2s - 13.9s]: "Wait out the connector molly, don't dry peek into sniper."
[15.0s - 18.2s]: "They rotated 3 to B on audio. Cancel mid-to-B, rotate fast A. Group palace and ramp."
[20.5s - 23.0s]: "Palace smoke stairs now, jungle smoke going down, flash site!"
[24.1s - 26.5s]: "Execute A now! Clear firebox, clear under palace!"
[28.0s - 30.2s]: "Site is clear! Plant default for palace. Nyx hold CT ticket."
[32.1s - 34.8s]: "Bomb is down! 4v2 numbers. Play post-plant crossfire, DO NOT PEEK."
[36.0s - 38.5s]: "They are saving! Don't hunt! Hold site and take their rifles if they push."
"""

MASTER_SYSTEM_PROMPT = """You are a Tier-1 Counter-Strike 2 Head Coach, Tactical Analyst, and Lead Esports Scout.
You are conducting a definitive Tactical Voice Communications Audit for competitive player evaluation.

Your objective is to evaluate the ENTIRE audio transcription of the player's in-game communications at once.
You must analyze the entire chronological chain of tactical instructions, evaluating:
1. DECISION CORRECTNESS: Was each call objectively correct, optimal, risky, or a blunder based on competitive CS2 fundamentals?
2. UTILITY & TIMING: Did the player coordinate utility (smokes, flashes, mollies) before executing, or call reckless dry pushes?
3. MID-ROUND ADAPTABILITY: How quickly did the player pivot when enemy rotations or defensive setups were detected?
4. POST-PLANT & ECONOMY DISCIPLINE: Did they enforce crossfires, trade spacing, and save calls, or allow undisciplined hunting?
5. VOCAL AUTHORITY & DISCIPLINE: Was communication brief, decisive, calm, and free of tilt/clutter?

You must evaluate EVERY distinct tactical call in the transcript and return a comprehensive JSON response adhering STRICTLY to this schema:
{
  "tactical_decision_score": <float between 0.0 and 100.0>,
  "decision_accuracy_pct": <float between 0.0 and 100.0>,
  "command_authority_score": <float between 0.0 and 100.0>,
  "comms_discipline_score": <float between 0.0 and 100.0>,
  "clutch_decision_rating": <float between 0.0 and 100.0>,
  "executive_scouting_report": "<3-4 sentence comprehensive tactical scout summary of this player's in-game calling>",
  "strengths": ["<detailed tactical strength 1>", "<detailed tactical strength 2>", "<detailed tactical strength 3>"],
  "critical_mistakes_and_blunders": ["<tactical weakness or missed read 1>", "<tactical weakness 2>"],
  "decision_log": [
    {
      "timestamp": "<start_sec - end_sec>",
      "call": "<exact call text from transcript>",
      "verdict": "<Optimal | Correct | Risky | Blunder | Info>",
      "soundness_reasoning": "<concise tactical analysis of why this call was right or wrong>",
      "situational_context": "<e.g. Default / Mid-Round Pivot / Site Execute / Post-Plant / Economy Save>",
      "alternative_recommendation": "<what should have been called if risky/blunder, or null if optimal>"
    }
  ]
}"""

user_message = f"""Player Handle: Strat
Primary Role: In-Game Leader (IGL)
Map: de_mirage

Full Match Comms Transcript:
{sample_full_transcript}

Evaluate all transcription segments at once according to the master audit protocol. Output JSON only."""

with httpx.Client() as client:
    print("Testing Master Prompt on Groq...")
    resp = client.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
        json={
            "model": "openai/gpt-oss-120b",
            "messages": [
                {"role": "system", "content": MASTER_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        },
        timeout=25.0
    )
    print("Groq HTTP Status:", resp.status_code)
    if resp.status_code == 200:
        raw_res = resp.json()["choices"][0]["message"]["content"]
        data = json.loads(raw_res)
        print("Tactical Decision Score:", data.get("tactical_decision_score"))
        print("Decision Accuracy:", data.get("decision_accuracy_pct"), "%")
        print("Authority Score:", data.get("command_authority_score"))
        print("Comms Discipline:", data.get("comms_discipline_score"))
        print("Decisions evaluated in log:", len(data.get("decision_log", [])))
        print("\nScouting Report Sample:")
        print(data.get("executive_scouting_report", "")[:180] + "...")
        print("\nDecision Log Samples (First 2):")
        for d in data.get("decision_log", [])[:2]:
            print(f"[{d.get('timestamp')}] {d.get('call')} -> {d.get('verdict')} ({d.get('situational_context')})")
            print(f"   Reasoning: {d.get('soundness_reasoning')}")
    else:
        print("Groq Error:", resp.status_code, resp.text[:200])
