"""ScoutForge Unified Dual-AI Scoring Engine.

70/30 Unified Scoring Architecture:
1. Audio Tactical Decision Score (Max 30.0 Points):
   - Evaluates the ENTIRE voice communications transcript in one single AI call.
   - Assesses whether in-game calls were tactically right or wrong.
   - Produces an objective score strictly out of 30.0 points.

2. Match Telemetry Score (Max 70.0 Points):
   - Evaluates all competitor telemetry from PandaScore & Leetify in another single AI call.
   - Assesses K/D, ADR, KPR, trades, utility damage, clutches, and tier consistency.
   - Produces an objective score strictly out of 70.0 points.

3. Unified Composite Rank:
   - Total Score = Telemetry Score (out of 70.0) + Audio Score (out of 30.0) = Total out of 100.0 points.
   - Ranks all competitors according to the sum of both.
"""

import json
import logging
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

GROQ_MODELS = [
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
]

GEMINI_MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-flash-lite-latest",
]

# Master Prompt 1: Voice Communications Decision Evaluation (Max 30.0 Points)
AUDIO_MASTER_PROMPT = """You are an elite Counter-Strike 2 Tactical Esports Coach and Head Analyst.
Your task is to evaluate the ENTIRE in-game voice communications transcript of a player at once.

Evaluate whether the decisions and calls made by the player were tactically right or wrong based on:
1. Decision Correctness & Timing: Did they call the right executes, rotations, or saves at the right moments?
2. Tactical Fundamentals: Utility coordination, spacing, and avoiding blunders/reckless dry peeks.
3. Situational Awareness: Man-advantage discipline (e.g. 4v2 post-plant crossfires vs hunting).

Calculate a final objective Tactical Voice Decision Score strictly between 0.0 and 30.0 (maximum 30.0 points, minimum 0.0).

Return ONLY a valid JSON object:
{
  "audio_score": <float between 0.0 and 30.0>,
  "summary": "<1-sentence executive assessment of whether decisions made were right or wrong>"
}"""

# Master Prompt 2: PandaScore & Leetify Telemetry Evaluation (Max 70.0 Points)
TELEMETRY_MASTER_PROMPT = """You are an elite Counter-Strike 2 Esports Data Analyst.
Your task is to evaluate all available competitor telemetry gathered from official PandaScore and Leetify APIs in a single evaluation.

Analyze the player's competitive impact based on:
1. Firepower & Output: ADR (Damage Per Round), K/D ratio, and KPR across competitive matches.
2. Tactical Role Execution: Opening duel win rate, trade kill success rate, and utility damage efficiency.
3. High-Leverage Consistency: 1vX clutches won, round survivability, and competitive tier (Tier 1 vs Tier 2).

Calculate a final objective Match Telemetry Score strictly between 0.0 and 70.0 (maximum 70.0 points, minimum 0.0).

Return ONLY a valid JSON object:
{
  "telemetry_score": <float between 0.0 and 70.0>,
  "summary": "<1-sentence assessment of combat telemetry and match impact>"
}"""


async def evaluate_tactical_decisions(
    transcript_segments: List[Dict[str, Any]],
    player_handle: str = "Player",
    player_role: str = "IGL",
    map_name: str = "de_mirage",
) -> Dict[str, Any]:
    """Single AI call evaluating ALL transcript segments at once for a score out of 30.0 points."""
    if not transcript_segments:
        return {
            "audio_score": 0.0,
            "tactical_decision_score": 0.0,
            "summary": "No comms segments available for tactical evaluation.",
            "provider": "default",
        }

    formatted_lines = [
        f"[{s.get('start_sec', 0.0):.1f}s - {s.get('end_sec', 0.0):.1f}s]: \"{s.get('transcript', '').strip()}\""
        for s in transcript_segments
        if s.get("transcript", "").strip()
    ]

    transcript_block = "\n".join(formatted_lines)
    user_prompt = f"""Player Handle: {player_handle}
Tactical Role: {player_role}
Map: {map_name}

Entire Match Comms Transcript ({len(formatted_lines)} calls):
{transcript_block}

Evaluate all decisions at once. Output JSON with score out of 30.0."""

    # 1. Try Groq Primary
    if settings.GROQ_API_KEY:
        res = await _call_groq(AUDIO_MASTER_PROMPT, user_prompt)
        if res and "audio_score" in res:
            score_30 = round(min(30.0, max(0.0, float(res["audio_score"]))), 1)
            return {
                "audio_score": score_30,
                "tactical_decision_score": round(score_30 * (100.0 / 30.0), 1),
                "summary": res.get("summary", "Tactical voice evaluation complete."),
                "provider": "groq",
                "model_used": res.get("model_used"),
            }

    # 2. Try Gemini Fallback
    if settings.GEMINI_API_KEY:
        res = await _call_gemini(AUDIO_MASTER_PROMPT, user_prompt)
        if res and "audio_score" in res:
            score_30 = round(min(30.0, max(0.0, float(res["audio_score"]))), 1)
            return {
                "audio_score": score_30,
                "tactical_decision_score": round(score_30 * (100.0 / 30.0), 1),
                "summary": res.get("summary", "Tactical voice evaluation complete."),
                "provider": "gemini",
                "model_used": res.get("model_used"),
            }

    # 3. Rule-based fallback
    cmd_count = sum(1 for s in transcript_segments if s.get("is_command"))
    total = max(1, len(transcript_segments))
    ratio = cmd_count / total
    fallback_30 = round(min(30.0, max(12.0, 15.0 + (ratio * 14.0))), 1)
    return {
        "audio_score": fallback_30,
        "tactical_decision_score": round(fallback_30 * (100.0 / 30.0), 1),
        "summary": f"Evaluated {total} comms segments. Consistent voice presence with {cmd_count} tactical instructions.",
        "provider": "rule_based_engine",
        "model_used": "scoutforge-v1",
    }


async def evaluate_api_telemetry(
    player_data: Dict[str, Any],
    stats_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Single AI call evaluating ALL PandaScore & Leetify match telemetry for a score out of 70.0 points."""
    handle = player_data.get("handle", "Competitor")
    name = player_data.get("name", handle)
    role = player_data.get("role", "Flex")
    team = player_data.get("team") or player_data.get("team_name") or "Free Agent"
    tier = player_data.get("tier", "Tier 1")
    region = player_data.get("region", "EU")

    matches = stats_data.get("matches", stats_data.get("matches_count", 0))
    kd = stats_data.get("kd", 1.0)
    adr = stats_data.get("adr", 75.0)
    kpr = stats_data.get("kpr", 0.70)
    clutches = stats_data.get("clutches", stats_data.get("clutches_won", 0))
    trades = stats_data.get("trades", 0)
    util = stats_data.get("util", stats_data.get("utility_damage", 0.0))

    user_prompt = f"""Player: {handle} ({name})
Role: {role} | Team: {team} | Tier: {tier} | Region: {region}

Official Telemetry from PandaScore & Leetify APIs:
- Total Analyzed Matches: {matches}
- K/D Ratio: {kd:.2f}
- ADR (Damage Per Round): {adr:.1f}
- KPR (Kills Per Round): {kpr:.2f}
- Total Trade Frags: {trades}
- Total Utility Damage: {util:.1f}
- Clutches Won: {clutches}

Evaluate all telemetry at once. Output JSON with score out of 70.0."""

    # 1. Try Groq Primary
    if settings.GROQ_API_KEY:
        res = await _call_groq(TELEMETRY_MASTER_PROMPT, user_prompt)
        if res and "telemetry_score" in res:
            score_70 = round(min(70.0, max(0.0, float(res["telemetry_score"]))), 1)
            return {
                "telemetry_score": score_70,
                "summary": res.get("summary", "Match telemetry evaluation complete."),
                "provider": "groq",
                "model_used": res.get("model_used"),
            }

    # 2. Try Gemini Fallback
    if settings.GEMINI_API_KEY:
        res = await _call_gemini(TELEMETRY_MASTER_PROMPT, user_prompt)
        if res and "telemetry_score" in res:
            score_70 = round(min(70.0, max(0.0, float(res["telemetry_score"]))), 1)
            return {
                "telemetry_score": score_70,
                "summary": res.get("summary", "Match telemetry evaluation complete."),
                "provider": "gemini",
                "model_used": res.get("model_used"),
            }

    # 3. Rule-based fallback
    kd_factor = min(1.0, max(0.0, (kd - 0.6) / 0.8))
    adr_factor = min(1.0, max(0.0, (adr - 50.0) / 45.0))
    kpr_factor = min(1.0, max(0.0, (kpr - 0.5) / 0.4))
    perf_ratio = (kd_factor * 0.4) + (adr_factor * 0.35) + (kpr_factor * 0.25)
    fallback_70 = round(min(70.0, max(25.0, 30.0 + (perf_ratio * 38.0))), 1)

    return {
        "telemetry_score": fallback_70,
        "summary": f"Strong statistical base with {adr:.1f} ADR and {kd:.2f} K/D across {matches} matches.",
        "provider": "rule_based_engine",
        "model_used": "scoutforge-v1",
    }


def compute_unified_composite_score(
    telemetry_score_70: float,
    audio_score_30: Optional[float] = None,
) -> Dict[str, Any]:
    """Computes the final unified rank score according to the sum of both (Max 100.0)."""
    t_score = round(min(70.0, max(0.0, telemetry_score_70)), 1)
    a_score = round(min(30.0, max(0.0, audio_score_30)), 1) if audio_score_30 is not None else 0.0
    total = round(min(100.0, t_score + a_score), 1)

    return {
        "telemetry_score_70": t_score,
        "audio_score_30": a_score,
        "total_score_100": total,
        "has_audio": audio_score_30 is not None,
    }


async def _call_groq(system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
    """Helper to query Groq models with auto-fallback."""
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=25.0) as client:
        for model in GROQ_MODELS:
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.1,
            }
            try:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = json.loads(content)
                    parsed["model_used"] = model
                    return parsed
            except Exception as e:
                logger.warning(f"Groq model {model} failed: {e}")
                continue
    return None


async def _call_gemini(system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
    """Helper to query Gemini models."""
    async with httpx.AsyncClient(timeout=25.0) as client:
        for model in GEMINI_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.GEMINI_API_KEY}"
            full_content = f"{system_prompt}\n\n{user_prompt}"
            payload = {
                "contents": [{"parts": [{"text": full_content}]}],
                "generationConfig": {"responseMimeType": "application/json"}
            }
            try:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    text_content = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(text_content)
                    parsed["model_used"] = model
                    return parsed
            except Exception as e:
                logger.warning(f"Gemini model {model} failed: {e}")
                continue
    return None
