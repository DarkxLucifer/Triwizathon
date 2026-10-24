# ScoutForge API Specification

Base URL: `http://localhost:8000/api`

All endpoints except `/auth/login` and `/auth/register` require a Bearer JWT Token in the `Authorization` header:
`Authorization: Bearer <jwt_token>`

Multi-tenancy isolation is enforced on every request: records are scoped to the caller's `org_id`.

---

## Authentication

### `POST /auth/register`
Create a new user account and organization.
- **Request Body**:
  ```json
  {
    "email": "analyst@sentinels.gg",
    "password": "Password123!",
    "full_name": "Alex Mercer",
    "org_name": "Sentinels Esports",
    "role": "analyst"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "access_token": "eyJhbG...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "analyst@sentinels.gg",
      "full_name": "Alex Mercer",
      "role": "analyst",
      "org_id": 1,
      "org_name": "Sentinels Esports"
    }
  }
  ```

### `POST /auth/login`
Authenticate with email and password.
- **Request Body**:
  ```json
  {
    "email": "analyst@sentinels.gg",
    "password": "Password123!"
  }
  ```
- **Response**: `200 OK` (Same payload as register)

---

## Players & Cohorts

### `GET /players`
Query the scouting player pool with optional filters.
- **Query Params**:
  - `title_id` (int, optional)
  - `role` (string, optional: `IGL`, `Entry`, `Support`, `Lurker`, `AWPer`)
  - `tier` (string, optional: `Tier 1`, `Tier 2`, `Tier 3`)
  - `region` (string, optional: `NA`, `EU`, `APAC`)
  - `available_only` (bool, optional, default: false)
  - `search` (string, optional)
  - `limit` (int, default: 50), `offset` (int, default: 0)
- **Response**: `200 OK`
  ```json
  {
    "total": 105,
    "items": [
      {
        "id": 1,
        "name": "Elias Vance",
        "handle": "V4NCE",
        "role": "IGL",
        "team_name": "Apex Vanguard",
        "region": "NA",
        "tier": "Tier 1",
        "is_available": true,
        "source": "simulated",
        "matches_count": 35,
        "kd": 1.12,
        "adr": 78.4,
        "kpr": 0.72,
        "confidence": 0.88
      }
    ]
  }
  ```

### `GET /players/{id}`
Retrieve in-depth profile, role performance breakdown, trend radar, evidence, and confidence rating.
- **Response**: `200 OK`
  ```json
  {
    "id": 1,
    "handle": "V4NCE",
    "name": "Elias Vance",
    "role": "IGL",
    "team_name": "Apex Vanguard",
    "region": "NA",
    "tier": "Tier 1",
    "source": "simulated",
    "is_available": true,
    "matches_count": 35,
    "confidence": 0.88,
    "formula_version": "v1.0.0",
    "data_coverage": 1.0,
    "metrics": {
      "kd": 1.12,
      "adr": 78.4,
      "kpr": 0.72,
      "opening_impact": 0.65,
      "tradeability": 0.68,
      "utility_damage": 18.2,
      "clutches_won": 12,
      "calls_per_round": 1.8,
      "win_after_call": 0.61,
      "adaptation": 0.74
    },
    "role_scores": {
      "IGL": 82.4,
      "Support": 74.1,
      "Entry": 68.0
    },
    "recent_matches": [ ... ]
  }
  ```

---

## Rosters & Health Diagnostics

### `GET /rosters`
List all team rosters for the caller's organization.
- **Response**: `200 OK`

### `GET /rosters/{id}`
Retrieve a specific 5-slot roster with slot details.
- **Response**: `200 OK`

### `GET /rosters/{id}/health`
Analyze roster synergy, slot performance, identify the weakest role gap, and flag low-sample risks.
- **Response**: `200 OK`
  ```json
  {
    "roster_id": 1,
    "roster_name": "Sentinels Main CS2",
    "title": "Counter-Strike 2",
    "slots": [
      { "slot": 1, "role": "IGL", "player": { "id": 14, "handle": "R00K", "role_score": 51.2, "kd": 0.68 }, "status": "weakest" },
      { "slot": 2, "role": "Entry", "player": { "id": 22, "handle": "BLITZ", "role_score": 86.4 }, "status": "optimal" },
      { "slot": 3, "role": "Support", "player": { "id": 31, "handle": "AEGIS", "role_score": 79.8 }, "status": "optimal" },
      { "slot": 4, "role": "Lurker", "player": { "id": 45, "handle": "SH4DOW", "role_score": 82.1 }, "status": "optimal" },
      { "slot": 5, "role": "AWPer", "player": { "id": 58, "handle": "K4N3", "role_score": 88.5 }, "status": "optimal" }
    ],
    "weakest_role": "IGL",
    "weakest_slot_index": 1,
    "overlap_analysis": "Excessive entry pace without disciplined tactical calling anchor.",
    "alerts": [
      { "severity": "high", "message": "IGL slot underperforming cohort mean by -28.4%." }
    ]
  }
  ```

---

## Scouting Briefs & Recommendations

### `POST /briefs`
Create a scouting brief to search candidates for a roster gap.
- **Request Body**:
  ```json
  {
    "title_id": 1,
    "roster_id": 1,
    "target_role": "IGL",
    "constraints": {
      "region": "NA",
      "min_tier": "Tier 2",
      "available_only": true
    }
  }
  ```
- **Response**: `201 Created` with brief ID and auto-computed shortlist.

### `GET /briefs/{id}/recommendations`
Get ranked candidates for the brief.
- **Response**: `200 OK`
  ```json
  {
    "brief_id": 1,
    "target_role": "IGL",
    "formula_version": "v1.0.0",
    "recommendations": [
      {
        "rank": 1,
        "player_id": 92,
        "player_name": "Silas 'Strat' Chen",
        "handle": "Strat",
        "current_team": "Phoenix Challengers",
        "tier": "Tier 2",
        "fit_score": 88.4,
        "confidence": 0.84,
        "evaluation_label": "High Fit Candidate",
        "audio_status": "unavailable",
        "breakdown": {
          "role_performance": 89.2,
          "roster_need_match": 100.0,
          "synergy_contribution": 85.0,
          "constraint_match": 100.0
        },
        "drivers": [
          "Ranked 94th percentile in tactical adaptation over 34 matches.",
          "89.2 adjusted IGL score matches target roster's primary gap.",
          "WinAfterCall of 68.2% (statistical correlation with execute success)."
        ],
        "risks": [
          "Tier 2 opposition requires validation against Tier 1 tempo.",
          "Audio comms unverified; weights redistributed to in-game metrics."
        ],
        "alternatives": [ ... ]
      }
    ]
  }
  ```

---

## Candidate Comparison

### `GET /compare`
Side-by-side comparison for 2 or 3 candidate players.
- **Query Params**: `player_ids=1,2,3`
- **Response**: `200 OK` with normalized radar metrics, head-to-head delta, and confidence comparison.

---

## Hidden Gems

### `GET /hidden-gems`
Identify high-impact under-scouted players across Tier 2 and Tier 3.
- **Query Params**: `role` (optional), `min_score` (default: 60)
- **Response**: `200 OK`
  ```json
  {
    "items": [
      {
        "player_id": 92,
        "handle": "Strat",
        "role": "IGL",
        "tier": "Tier 2",
        "hidden_gem_score": 87.5,
        "confidence": 0.82,
        "label": "Prime Hidden Gem",
        "visibility_gap": 0.65,
        "improvement_trend": "+14.2% over last 15 matches",
        "suppression_reason": null
      }
    ]
  }
  ```

---

## Audio Intelligence (Non-blocking)

### `POST /audio`
Submit in-game tactical comms for automated speech-to-text processing.
- **Form Data**:
  - `file`: Audio file (wav, mp3, ogg, m4a)
  - `player_id`: int
  - `consent_given`: bool (MUST be true, or 400 Bad Request)
- **Response**: `202 Accepted`
  ```json
  {
    "job_id": "aud-12345",
    "status": "pending",
    "model_version": "whisper-small-stock",
    "message": "Audio processing initiated in background."
  }
  ```

### `GET /audio/{job_id}`
Poll transcription job status and evidence.
- **Response**: `200 OK`
  ```json
  {
    "job_id": "aud-12345",
    "status": "completed",
    "segments": [
      {
        "start_sec": 4.2,
        "end_sec": 7.8,
        "transcript": "Smoke window, flash cat, go A now!",
        "confidence": 0.94,
        "is_command": true,
        "needs_review": false
      }
    ]
  }
  ```

---

## Decision Log

### `POST /decisions`
Record a GM / Analyst roster decision.
- **Request Body**:
  ```json
  {
    "brief_id": 1,
    "player_id": 92,
    "roster_id": 1,
    "action": "trial",
    "rationale": "Outstanding IGL tactical adaptation and high synergy with current roster fraggers."
  }
  ```
- **Response**: `201 Created`

### `GET /decisions`
List decision history for the organization with audit metadata and formula versions.
- **Response**: `200 OK`

---

## Data Ingestion & Audit

### `GET /ingestion/report`
Retrieve data ingestion audit report showing accepted/rejected match counts, validation reasons, and source breakdown (`simulated` vs `pandascore`).
- **Response**: `200 OK`
