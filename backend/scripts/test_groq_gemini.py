import sys; sys.path.insert(0, "D:/project/aiml prime/project/Triwizathon/backend")
from app.core.config import settings
import httpx

groq_key = settings.GROQ_API_KEY
gemini_key = settings.GEMINI_API_KEY

with httpx.Client() as client:
    print("--- TESTING GROQ MODELS ---")
    for m in ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "allam-2-7b"]:
        try:
            resp = client.post("https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {groq_key}"},
                json={"model": m, "messages": [{"role": "user", "content": "Say hello in 3 words"}]},
                timeout=10.0
            )
            if resp.status_code == 200:
                print(f"Groq {m} SUCCESS: {resp.json()['choices'][0]['message']['content']}")
            else:
                print(f"Groq {m} FAIL {resp.status_code}: {resp.text[:120]}")
        except Exception as e:
            print(f"Groq {m} EXCEPTION: {e}")

    print("\n--- TESTING GEMINI MODELS ---")
    for gm in ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash-lite", "gemini-pro-latest"]:
        try:
            resp = client.post(f"https://generativelanguage.googleapis.com/v1beta/models/{gm}:generateContent?key={gemini_key}",
                json={"contents": [{"parts": [{"text": "Say hello in 3 words"}]}]},
                timeout=10.0
            )
            if resp.status_code == 200:
                print(f"Gemini {gm} SUCCESS: {resp.json()['candidates'][0]['content']['parts'][0]['text']}")
            else:
                print(f"Gemini {gm} FAIL {resp.status_code}: {resp.text[:120]}")
        except Exception as e:
            print(f"Gemini {gm} EXCEPTION: {e}")
