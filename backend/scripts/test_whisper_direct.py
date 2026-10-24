import time
import math
import os
from faster_whisper import WhisperModel

def main():
    wav_path = "D:/project/aiml prime/project/Triwizathon/backend/sample_tactical_comms.wav"
    print(f"Audio file: {wav_path}, exists: {os.path.exists(wav_path)}")
    
    t0 = time.time()
    print("Initializing WhisperModel('small', device='cpu', compute_type='int8')...")
    model = WhisperModel("small", device="cpu", compute_type="int8")
    t_load = time.time() - t0
    print(f"Model load/download time: {t_load:.2f} seconds")

    t1 = time.time()
    segments, info = model.transcribe(wav_path, beam_size=5, language="en")
    seg_list = list(segments)
    t_transcribe = time.time() - t1
    print(f"Transcription processing time: {t_transcribe:.2f} seconds")
    print(f"Audio duration: {info.duration:.2f} seconds (RTF: {t_transcribe / max(0.1, info.duration):.2f}x)")

    COMMAND_KEYWORDS = [
        "smoke", "flash", "go", "rush", "rotate", "push", "fall back", "save",
        "execute", "hold", "plant", "defuse", "cat", "window", "mid", "long",
        "short", "site", "drop", "cross", "boost", "clear", "molly"
    ]

    for idx, s in enumerate(seg_list, 1):
        conf = min(1.0, max(0.0, math.exp(s.avg_logprob))) if s.avg_logprob is not None else 0.85
        needs_review = conf < 0.70
        is_cmd = any(kw in s.text.lower() for kw in COMMAND_KEYWORDS)
        print(f"Segment #{idx}: [{s.start:.2f}s - {s.end:.2f}s] text='{s.text.strip()}' confidence={conf:.3f} is_command={is_cmd} needs_review={needs_review}")

if __name__ == "__main__":
    main()
