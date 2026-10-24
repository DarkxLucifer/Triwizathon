import os, sys, time
sys.path.insert(0, "D:/project/aiml prime/project/Triwizathon/backend")
import httpx

def run():
    client = httpx.Client(base_url="http://127.0.0.1:8000")

    # 1. Login
    login_resp = client.post("/api/auth/login", json={"email": "analyst@sentinels.gg", "password": "Password123!"})
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("1. Logged in successfully.")

    # 2. Check sample audio file
    audio_path = "D:/project/aiml prime/project/Triwizathon/backend/sample_tactical_comms.wav"
    if not os.path.exists(audio_path):
        import glob
        wavs = glob.glob("D:/project/aiml prime/project/Triwizathon/backend/*.wav")
        if wavs:
            audio_path = wavs[0]
            print(f"Using {audio_path}")

    # 3. Upload consented audio for Strat (id=21)
    with open(audio_path, "rb") as f:
        files = {"file": ("test_comms.wav", f, "audio/wav")}
        data = {"player_id": 21, "consent_given": "true"}
        up_resp = client.post("/api/audio", files=files, data=data, headers=headers)

    print("2. Upload status:", up_resp.status_code, up_resp.json())
    assert up_resp.status_code == 202
    job_id = up_resp.json()["job_id"]

    # 4. Poll job status
    print(f"3. Polling audio job #{job_id}...")
    for _ in range(15):
        time.sleep(2)
        job_resp = client.get(f"/api/audio/{job_id}", headers=headers)
        job = job_resp.json()
        print(f"   Status: {job.get('status')}")
        if job.get("status") in ["completed", "failed"]:
            break

    print("\n=== FINAL AUDIO JOB RESULTS ===")
    print("Status:", job.get("status"))
    print("Segments count:", len(job.get("segments", [])))
    print("AI Decision Score:", job.get("decision_score"))
    print("LLM Provider:", job.get("llm_provider"))

    dec_data = job.get("decision_data_json")
    if dec_data:
        print("Decision Accuracy:", dec_data.get("decision_accuracy_pct"), "%")
        print("Strategic Summary:", dec_data.get("strategic_summary"))
        print("Decision Log items:", len(dec_data.get("decision_log", [])))
        for item in dec_data.get("decision_log", [])[:3]:
            print(f"   - [{item.get('timestamp')}] '{item.get('call')}' -> {item.get('verdict')}: {item.get('rationale')}")

if __name__ == "__main__":
    run()
