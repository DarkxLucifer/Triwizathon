import os
import sys
import time
import math
import httpx

# Ensure torch/lib is in Windows DLL directory
try:
    import torch
    torch_lib = os.path.join(os.path.dirname(torch.__file__), "lib")
    if os.path.exists(torch_lib) and hasattr(os, "add_dll_directory"):
        os.add_dll_directory(torch_lib)
        os.environ["PATH"] = torch_lib + os.pathsep + os.environ.get("PATH", "")
except Exception:
    pass

from faster_whisper import WhisperModel
import ctranslate2

AUDIO_PATH = r"C:\Users\yashr\Downloads\A-one-minute-SnapYT.App.mp3"

def main():
    print("=" * 60)
    print("SCOUTFORGE GPU AUDIO PROCESSING PIPELINE")
    print("=" * 60)

    # 1. Audio file inspection
    if not os.path.exists(AUDIO_PATH):
        print(f"Error: Audio file not found at {AUDIO_PATH}")
        sys.exit(1)

    file_size_bytes = os.path.getsize(AUDIO_PATH)
    file_size_mb = round(file_size_bytes / (1024 * 1024), 2)
    print(f"\n[Step 1: Audio Input]")
    print(f"  File: {AUDIO_PATH}")
    print(f"  Size: {file_size_mb} MB ({file_size_bytes} bytes)")

    # 2. Hardware / GPU detection
    print(f"\n[Step 2: Hardware Acceleration]")
    cuda_count = ctranslate2.get_cuda_device_count()
    print(f"  CUDA Device Count: {cuda_count}")
    if cuda_count > 0 and torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        vram_gb = round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 2)
        print(f"  GPU Active: {gpu_name} ({vram_gb} GB VRAM)")
        device = "cuda"
        compute_type = "float16"
    else:
        print("  CUDA not available, falling back to CPU")
        device = "cpu"
        compute_type = "int8"

    # 3. Model Loading
    print(f"\n[Step 3: Whisper Model Load]")
    t_load_start = time.time()
    model = WhisperModel("small", device=device, compute_type=compute_type)
    t_load_end = time.time()
    print(f"  Model: faster-whisper (small) on {device}/{compute_type}")
    print(f"  Load Time: {t_load_end - t_load_start:.2f}s")

    # 4. Transcription
    print(f"\n[Step 4: Transcribing Audio with GPU Acceleration...]")
    t_transcribe_start = time.time()
    segments_gen, info = model.transcribe(
        AUDIO_PATH,
        beam_size=5,
        word_timestamps=False,
    )

    audio_duration = round(info.duration, 2)
    print(f"  Detected Language: {info.language} (Probability: {info.language_probability:.2%})")
    print(f"  Audio Duration: {audio_duration} seconds ({audio_duration/60:.2f} minutes)")

    COMMAND_KEYWORDS = [
        "smoke", "flash", "go", "rush", "rotate", "push", "fall back", "save",
        "execute", "hold", "plant", "defuse", "cat", "window", "mid", "long",
        "short", "site", "drop", "cross", "boost", "clear", "molly", "a site", "b site"
    ]

    segments = []
    print("\n[Step 5: Transcription Output & Segment Intelligence]:")
    print("-" * 60)
    for seg in segments_gen:
        conf = min(1.0, max(0.0, math.exp(seg.avg_logprob))) if seg.avg_logprob is not None else 0.85
        conf = round(conf, 3)
        needs_review = conf < 0.70
        is_cmd = any(kw in seg.text.lower() for kw in COMMAND_KEYWORDS)

        seg_data = {
            "start": round(seg.start, 2),
            "end": round(seg.end, 2),
            "text": seg.text.strip(),
            "confidence": conf,
            "is_command": is_cmd,
            "needs_review": needs_review,
        }
        segments.append(seg_data)

        cmd_badge = " [TACTICAL CALL]" if is_cmd else ""
        review_badge = " [FLAGGED: LOW CONF]" if needs_review else ""
        print(f"  [{seg_data['start']:05.2f}s - {seg_data['end']:05.2f}s] (Conf: {conf:.2f}){cmd_badge}{review_badge}")
        print(f"    \"{seg_data['text']}\"")

    t_transcribe_end = time.time()
    proc_time = round(t_transcribe_end - t_transcribe_start, 2)
    rtf = round(proc_time / max(0.1, audio_duration), 3)

    print("-" * 60)
    print(f"\n[Performance Summary]")
    print(f"  Total Audio Duration: {audio_duration}s")
    print(f"  GPU Transcription Time: {proc_time}s")
    print(f"  Real-Time Factor (RTF): {rtf}x ({round(audio_duration/proc_time, 1)}x faster than real-time)")
    print(f"  Total Segments Extracted: {len(segments)}")

    # Full Transcript string
    full_text = " ".join(s["text"] for s in segments)
    print(f"\n[Full Combined Transcript]:\n\"{full_text}\"")

    # 6. Submit to live API as well to verify end-to-end backend ingestion
    print(f"\n[Step 6: Ingesting into Live ScoutForge Audio Evidence API...]")
    try:
        client = httpx.Client(base_url="http://127.0.0.1:8000", timeout=30.0)
        r_login = client.post("/api/auth/login", json={"email": "analyst@sentinels.gg", "password": "Password123!"})
        token = r_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        with open(AUDIO_PATH, "rb") as f:
            r_upload = client.post(
                "/api/audio",
                headers=headers,
                data={"player_id": 116, "consent_given": "true"},  # s1mple (ID 116)
                files={"file": ("A-one-minute-SnapYT.App.mp3", f, "audio/mp3")}
            )
        job_id = r_upload.json().get("job_id")
        print(f"  Live Audio Job Created: ID #{job_id}")

        # Poll until complete
        for _ in range(15):
            time.sleep(1.0)
            r_job = client.get(f"/api/audio/{job_id}", headers=headers)
            status = r_job.json().get("status")
            if status in ["completed", "failed"]:
                print(f"  Live Background Job Status: {status.upper()}")
                break
    except Exception as api_err:
        print(f"  Live API error: {api_err}")

if __name__ == "__main__":
    main()
