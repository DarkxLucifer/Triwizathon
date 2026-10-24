# ScoutForge Part 1: Backend Verification Report

**Generated:** 2026-10-24T16:49:02.713338+00:00

## 1. Results Table

| ID | Feature | Status | Evidence |
|---|---|---|---|
| API-01 | GET /health check | **PASS** | Status: 200, payload: {'status': 'healthy', 'service': 'ScoutForge', 'database': 'connected', 'version': '1.0.0'} |
| API-02a | POST /api/auth/login (Success) | **PASS** | Status: 200, token issued for analyst@sentinels.gg |
| API-02b | POST /api/auth/login (Wrong Password) | **PASS** | Status: 401, detail: Invalid email or password |
| API-02c | POST /api/auth/register (Duplicate Email) | **PASS** | Status: 400, detail: A user with this email address already exists. |
| API-02d | POST /api/auth/register (Missing Fields) | **PASS** | Status: 422 Unprocessable Entity, validation caught missing fields |
| API-02e | POST /api/auth/login (Org B: Cloud9) | **PASS** | Status: 200, Org B user authenticated |
| API-03 | Protected Endpoint Token Validation | **PASS** | No token -> 401, Bad token -> 401, Valid token -> 200 |
| API-04 | GET /api/players & /players/{id} | **PASS** | Total: 154 (100 benchmark + real pro players), Filter status: 200, P1: R00K, Invalid ID: 404 |
| API-05 | GET /api/rosters/{id}/health (Weak IGL detection) | **PASS** | Roster: Sentinels Main CS2, Weakest Role: IGL, Slot 1 Player: R00K |
| API-06 | POST /api/briefs & /recommendations (Planted Gem Top 3) | **PASS** | Top 3: ['Strat', 'GHOST', 'SH4DOW']. Strat is #1 with Fit: 81.63 |
| API-07 | GET /api/compare (2, 3 candidates & error validation) | **PASS** | 2-cand: 200, 3-cand: 200, bad-input: 400, single-cand: 400 |
| API-08 | GET /api/hidden-gems (Planted Gems & Suppression) | **PASS** | Planted gems found: Strat (#3), Nyx (#1), Viper (#2) |
| API-09 | POST & GET /api/decisions (All 4 actions) | **PASS** | Successfully recorded and fetched all 4 actions: ['advance', 'trial', 'watch', 'reject'] |
| API-10 | GET /api/ingestion/report | **PASS** | Accepted: 3610, Sources: {'simulated': 350, 'pandascore': 20, 'leetify': 9} |
| API-11 | Org Isolation Enforcement | **PASS** | Org B access to Org A roster: 403 (Forbidden), brief: 403 (Forbidden), leaked decisions: 0 |
| AI-01 | Audio Consent & File Validation | **PASS** | No consent -> 400 (Mandatory consent verification failed: audio cannot be ingested without explicit player/team consent.), Bad type -> 400 (Unsupported file type '.txt'. Allowed extensions: .wav, .mp3, .ogg, .m4a, .flac.) |
| AI-02 | Whisper-Small Real Transcription | **PASS** | Model: whisper-small-stock, Time: 6.11s, Seg: [0.0s-3.44s] 'Smoke window, flash cat, rush A site now.', Conf: 0.665, Cmd: True, NeedsReview: True |
| AI-03 | Audio Score Isolation (No Direct Score Manipulation) | **PASS** | IGL Score remains strictly statistical: 52.54. Comms serve as contextual evidence. |
| AI-04 | Whisper Failure Path Resilience | **PASS** | Failed job status: failed, Error: [Errno 1094995529] Invalid data found when processing input: './uploads\\audio_org1_p21_corrupted_audio.wav', Ranking status: 200 (Unblocked) |
| AI-05 | IGL Audio Weight Redistribution | **PASS** | Audio active: 0.3 cmd ratio; No-audio: redistributed=True, calls_per_round boosted from 0.2 to 0.3636 |
| AN-01 | Independent Recomputation of Metrics & Confidence | **PASS** | Tested 5 players across K/D, ADR, KPR, Confidence with tolerance <= 0.01. 100% matched. |
| AN-02 | Hidden Gem Score Recomputation (3 gems + 2 non-gems) | **PASS** | All 5 recomputed hidden gem scores matched API values within tolerance. |
| AN-03 | Behavioral Determinism & Metric Cap | **PASS** | Missing critical metric capped at 0.6 <= 0.60. Double-query ranking equality: True |
| AN-04 | Formula Versioning & Invariant Audit | **PASS** | New recommendation stored v1.0.1-audit-test, historical decisions preserved v1.0.0, cleanly rolled back. |
| AN-05 | Explanation Verification & Invented Number Rejection | **PASS** | Real number 88.4 verified; Invented number 97.8 strictly rejected by checker. |

## 2. Bugs Found

none


## 3. Analytics Comparison Table

| Player | Metric | API Value | Recomputed Value | Match? |
|---|---|---|---|---|
| AEGIS | K/D | 1.18 | 1.18 | YES |
| AEGIS | ADR | 77.3 | 77.3 | YES |
| AEGIS | KPR | 0.69 | 0.69 | YES |
| AEGIS | Confidence | 1.0 | 1.0 | YES |
| CIPHER | K/D | 1.07 | 1.07 | YES |
| CIPHER | ADR | 74.6 | 74.6 | YES |
| CIPHER | KPR | 0.68 | 0.68 | YES |
| CIPHER | Confidence | 1.0 | 1.0 | YES |
| ZENITH | K/D | 1.1 | 1.1 | YES |
| ZENITH | ADR | 82.7 | 82.7 | YES |
| ZENITH | KPR | 0.69 | 0.69 | YES |
| ZENITH | Confidence | 1.0 | 1.0 | YES |
| IRON | K/D | 1.04 | 1.04 | YES |
| IRON | ADR | 76.3 | 76.3 | YES |
| IRON | KPR | 0.69 | 0.69 | YES |
| IRON | Confidence | 1.0 | 1.0 | YES |
| LIA_45 | K/D | 1.27 | 1.27 | YES |
| LIA_45 | ADR | 76.2 | 76.2 | YES |
| LIA_45 | KPR | 0.69 | 0.69 | YES |
| LIA_45 | Confidence | 1.0 | 1.0 | YES |
| Strat | HiddenGemScore | 80.58 | 80.58 | YES |
| Viper | HiddenGemScore | 83.92 | 83.92 | YES |
| Nyx | HiddenGemScore | 90.13 | 90.13 | YES |
| R00K | HiddenGemScore | 30.29 | 30.29 | YES |
| V4NCE | HiddenGemScore | 59.27 | 59.27 | YES |

## 4. Whisper AI Pipeline Benchmark Results

- **Model Version**: `whisper-small-stock`
- **First-Run Download Size**: `486,213,279 bytes (~486 MB)` (MIT License, cached at `.cache/huggingface/hub/models--Systran--faster-whisper-small`)
- **Audio Duration Tested**: `4.19s` tactical call clip (*'Smoke window, flash cat, rush A site now.'*)
- **Transcription Processing Time**: `6.11s` (Real-Time Factor: 0.82x)
- **Failure-Path Resilience**: `Job #31 correctly caught exception and marked failed: '[Errno 1094995529] Invalid data found when processing input: './uploads\\audio_org1_p21_corrupted_audio.wav''; scouting brief completely unblocked (HTTP 200).`

## 5. What Could Not Be Verified & Exact Questions

none
