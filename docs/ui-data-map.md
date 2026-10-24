# ScoutForge Frontend & Backend UI Data Map (Phase A Audit)

**Date**: October 25, 2026  
**Auditor**: Antigravity Agentic Verification Engine  
**Project Root**: `D:\project\aiml prime\project\Triwizathon`  
**Status**: Phase A Complete — Change Nothing — Awaiting User Approval  

---

## 1. Executive Summary

A comprehensive code-level audit was conducted across all **23 frontend component views** and the **FastAPI backend**. 

### Critical Reality Check
1. **Frontend API Wiring**: **0.0%**. Across the entire frontend (`frontend/src`), there are **zero** `fetch()` or `axios` API calls. Every view currently renders from in-memory mocks ([`initialData.ts`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/lib/mock/initialData.ts)), client-side state ([`store.ts`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/lib/storage/store.ts)), or hardcoded `useState` literals.
2. **Data Reality**: The only genuine external telemetry sources connected in the backend are:
   - **Leetify CS2 API**: Granular combat stats ($K/D$, $\text{ADR}$, trades, utility damage, clutches, rounds).
   - **PandaScore CS:GO/CS2 API**: Pro identities, teams, regions, tournaments.
   - **Audio Processing**: Whisper transcription engine + Groq/Gemini tactical judge.
   - **Fictional Simulated Players**: 100 simulated CS2 players seeded in SQLite (`scoutforge.db`).
   - **Non-CS2 Titles (BGMI, Free Fire, Mobile Legends, Valorant)**: **Zero backend data source exists**. All data shown in the UI for these titles is hardcoded mock data.
3. **Player & Organiser Portals**: Currently disconnected. There is no shared session context, no role-switching API, no job application pipeline, and no activity event stream connecting actions in the Organiser portal to the Player's dossier or timeline.

---

## 2. Complete UI Data Map

Every displayed metric, name, chart point, badge, date, and status across both portals has been inventoried below:

### A. Player Portal

| Component / Tab | Displayed Metric / Field | Current Source | Exact File & Line | Backend Endpoint (Existing or Missing) | Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Overview Tab** | Fit Score (88/100) & Formula tag | `MOCK FILE` / `useState` | `PlayerDashboardView.tsx:513` | Missing: `GET /api/player/me/fit-score` | Compute from player primary role & formula version; remove standalone fit score without brief context |
| **Overview Tab** | 6-Week Trajectory Chart (W1–W6) | `HARDCODED` literal | `PlayerDashboardView.tsx:574-580` | Missing: `GET /api/player/me/trajectory` | Back with real `activity_events` / score history table |
| **Overview Tab** | Top Strength (Close-Range 91%) | `MOCK FILE` | `PlayerDashboardView.tsx:520` | Missing: `GET /api/player/me/benchmarks` | Derive from statistical percentile benchmarks |
| **Overview Tab** | Priority Improvement (Phase 5 45%) | `MOCK FILE` | `PlayerDashboardView.tsx:522` | Missing: `GET /api/player/me/benchmarks` | Derive from statistical percentile benchmarks |
| **Overview Tab** | Inquiries Count (30d: 5) | `MOCK FILE` | `PlayerDashboardView.tsx:448` | Missing: `GET /api/player/me/inquiries/count` | Aggregate from `activity_events` where `type='profile_viewed'` |
| **Roster Openings** | Openings List (Velocity, GodLike, etc.) | `HARDCODED` array | `PlayerDashboardView.tsx:230-357` | Missing: `GET /api/openings` | Replace with real openings posted by organisers in DB |
| **Roster Openings** | Compensation & Stipend values | `HARDCODED` literal | `PlayerDashboardView.tsx:243,264,285` | Missing: `roster_openings.compensation` | Display organiser-entered contract text |
| **Roster Openings** | Role Application Submission | `setTimeout` fake loading | `RosterOpeningsTab.tsx:370,539` | Missing: `POST /api/openings/{id}/apply` | Wire to real DB table `applications` |
| **My Applications** | Application Status & Coach Notes | `HARDCODED` array | `PlayerDashboardView.tsx:450-499` | Missing: `GET /api/player/me/applications` | Read real applicant rows from DB |
| **Role Benchmark** | 5-Metric Radar & Cohort Benchmark | `HARDCODED` array | `RoleBenchmarkTab.tsx:30-80` | Existing: `GET /api/players/{id}` (partial) | Wire to real player match percentile stats |
| **Role Benchmark** | Claim: "Tier 2 Semi-Pro averages" | `HARDCODED` text | `RoleBenchmarkTab.tsx:130` | Existing: `backend/app/services/scoring.py` | Compute from actual cohort averages in DB |
| **Comms & Evidence** | Upload Dropzone (Audio/Video/JSON) | `setTimeout` fake loading | `EvidenceAudioTab.tsx:141` | Existing: `POST /api/audio/upload` | Wire to real FastAPI upload endpoint with consent validation |
| **Comms & Evidence** | Evidence Ledger Table | `HARDCODED` initial array | `EvidenceAudioTab.tsx:34-60` | Existing: `GET /api/audio/jobs` | Replace with DB `audio_jobs` filtered by player ownership |
| **Comms & Evidence** | Whisper Transcription View | `HARDCODED` snippets | `TranscriptModal.tsx:30-70` | Existing: `GET /api/audio/jobs/{id}` | Read real Whisper segment transcripts from SQLite |
| **Scouting Timeline** | Timeline Feed (Views, Shortlists) | `HARDCODED` array | `ScoutingFeedTab.tsx:30-90` | Missing: `GET /api/player/me/timeline` | Query real `activity_events` where `visible_to_player=True` |
| **Scouting Timeline** | Claim: "verified anti-cheat demo" | `HARDCODED` text | `ScoutingFeedTab.tsx:53` | **NONE (Unbacked)** | **REMOVE**: No anti-cheat system exists |
| **My Dossier** | Contact (Email, Phone) | `useState` literal | `PlayerProfileTab.tsx:158-223` | Missing: `GET/PUT /api/player/me` | Mask until consent/approval granted to organiser |
| **My Dossier** | In-Game UID & Hardware Setup | `useState` literal | `PlayerProfileTab.tsx:282, 700` | Missing: `player_profiles` schema | Store in DB as player self-reported data |
| **My Dossier** | Gameplay VODs (Clips list) | `HARDCODED` array | `PlayerProfileTab.tsx:57-89` | Missing: `GET/POST /api/player/me/clips` | Store video clip metadata & audio extraction in DB |
| **My Dossier** | Video AI Score (`AI 28.5/30`) | `HARDCODED` literal | `PlayerProfileTab.tsx:122` | Existing: `llm_decision_evaluator.py` | Run LLM judge on extracted audio, do not hardcode |
| **My Dossier** | Game Profiles (BGMI, CS2, VAL, FF) | `HARDCODED` array | `PlayerDashboardView.tsx:136-220` | **Only CS2 exists in backend** | Hide or label non-CS2 as "Self-Reported" |
| **Leaderboards** | 5-Game Leaderboard Tables | `HARDCODED` (600 lines) | `LeaderboardsView.tsx:45-660` | Missing: `GET /api/leaderboards` | Query real SQLite match telemetry for CS2; mark others |

---

### B. Organiser Portal

| Component / Tab | Displayed Metric / Field | Current Source | Exact File & Line | Backend Endpoint (Existing or Missing) | Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | Active candidates (128, +12%) | `HARDCODED` literal | `DashboardView.tsx:94-97` | Missing: `GET /api/org/dashboard/kpis` | SQL `COUNT(Player.id) WHERE is_available=1` |
| **Dashboard** | Scouting briefs (4, +1 pending) | `HARDCODED` literal | `DashboardView.tsx:102-105` | Missing: `GET /api/org/dashboard/kpis` | SQL `COUNT(Brief.id) WHERE org_id=:org_id` |
| **Dashboard** | Active rosters (3) | `HARDCODED` literal | `DashboardView.tsx:110` | Missing: `GET /api/org/dashboard/kpis` | SQL `COUNT(Roster.id) WHERE org_id=:org_id` |
| **Dashboard** | Evaluations logged (18, +4) | `HARDCODED` literal | `DashboardView.tsx:118` | Missing: `GET /api/org/dashboard/kpis` | SQL `COUNT(Decision.id) WHERE org_id=:org_id` |
| **Dashboard** | Profiles reviewed (30d) Chart | `HARDCODED` literal | `DashboardView.tsx:64-70` | Missing: `GET /api/org/dashboard/chart` | Aggregate real review events; stop at current date |
| **Dashboard** | Roster Status Cards (CS2, VAL, BGMI) | `HARDCODED` array | `DashboardView.tsx:72-76` | Existing: `GET /api/rosters` | Read real rosters for active organization |
| **Discover / Players** | Player Directory Table & Filters | `MOCK FILE` | `PlayerDirectoryView.tsx:30` | Existing: `GET /api/players` | Wire directly to backend `/api/players` with pagination |
| **Discover / Players** | Buyout USD column | `MOCK FILE` | `initialData.ts` | **NONE (Unbacked)** | **REMOVE**: Buyout estimates have no data source |
| **Discover / Players** | Source Badge (Leetify / PandaScore) | `MOCK FILE` | `PlayerDirectoryView.tsx:210` | Existing: `Player.source` | Display real source tag (`simulated`, `pandascore`, `leetify`) |
| **Rosters** | Roster Slots & Starter Grid | `MOCK FILE` | `RosterView.tsx:40` | Existing: `GET /api/rosters/{id}` | Read real `roster_slots` from SQLite |
| **Rosters** | Weakest Gap Detection (IGL) | `client-side` calculation | `RosterView.tsx:85` | Existing: `GET /api/rosters/{id}/health` | Use backend `/health` endpoint for gap detection |
| **Recruitment** | Brief Configuration Form | `useState` in `store.ts` | `ScoutingBriefView.tsx:50` | Existing: `POST /api/briefs` | Submit real brief payload to FastAPI `/api/briefs` |
| **Recruitment** | Candidate Recommendations | `client-side` formula | `store.ts:94` | Existing: `POST /api/briefs` | Display server-computed recommendations & 70/30 scores |
| **Recruitment** | Drivers & Risks bullets | `client-side` template | `RecommendationsView.tsx:140` | Existing: `recommendations.drivers_json` | Read server-generated explanations from explanation service |
| **Recruitment** | Save Decision (Advance/Trial/Reject) | `useState` in `store.ts` | `RecommendationsView.tsx:90` | Existing: `POST /api/decisions` | Persist decisions to backend `decisions` table |
| **Comparison** | Side-by-Side Radar & Table | `client-side` mock stats | `ComparisonView.tsx:51-120` | Existing: `GET /api/compare` | Wire to `/api/compare?player_ids=...` |
| **Comparison** | Metrics: Clarity, Command Ratio | `client-side` engine | `engine.ts:244-258` | Existing: `backend/app/services/scoring.py` | Replace with LLM judge dimensions (decision_quality, proactiveness) |
| **Analytics** | Hidden Gems Discovery | `MOCK FILE` filter | `HiddenGemsView.tsx:35` | Existing: `GET /api/hidden-gems` | Wire to `/api/hidden-gems` algorithmic gem detector |
| **Ingestion** | Ingestion Status & Sync PandaScore | `setTimeout` fake loading | `IngestionView.tsx:108` | Existing: `POST /api/ingestion/sync-pandascore` | Trigger real PandaScore sync; show live acceptance report |
| **Export PDF** | Dossier Export Modal | `setTimeout` fake loading | `ExportPdfModal.tsx:27` | Missing: Client-side PDF generation | Use genuine browser print / `@react-pdf` without fake delay |
| **Auth / Login** | Role-Based Portal Switch | `localStorage` + `setTimeout` | `RoleLoginView.tsx:58,66` | Missing: `POST /api/auth/switch-context` | Real JWT authentication with backend-enforced org & role scope |

---

## 3. Evidence on User Suspicions (Detailed Code Findings)

Each suspicion flagged from user screenshots was verified against the codebase:

### 1. Same Person Appears Under Different Handles Across Pages
- **Verdict**: **CONFIRMED (YES)**.
- **Evidence**:
  - **`vortex` vs `Riven`**: In [`initialData.ts:353-357`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/lib/mock/initialData.ts#L353-L357), player `p-gem-vortex` has `handle: 'vortex'`. But in [`DashboardView.tsx:30-32`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/dashboard/DashboardView.tsx#L30-L32), the identical ID `p-gem-vortex` is hardcoded as `handle: 'Riven'` with `realName: 'Dmitry Morozov'`. In [`Navbar.tsx:48`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/components/layout/Navbar.tsx#L48), `Riven` is given `realName: 'Elena Rostova'`.
  - **`broky` vs `Kairo`**: In [`initialData.ts:47-48`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/lib/mock/initialData.ts#L47-L48), `p-broky` is `handle: 'broky'`. In [`DashboardView.tsx:41-43`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/dashboard/DashboardView.tsx#L41-L43), `p-broky` is labeled `handle: 'Kairo'` with pro name `realName: 'Helvijs Saukants'`. In [`Navbar.tsx:49`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/components/layout/Navbar.tsx#L49), `Kairo` is assigned `realName: 'Kai Vance'`.
  - **`rookie_k` vs `Nexon`**: In [`initialData.ts:432`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/lib/mock/initialData.ts#L432), the player is `handle: 'rookie_k'`. In [`DashboardView.tsx:52-54`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/dashboard/DashboardView.tsx#L52-L54), the same player is `handle: 'Nexon'` with `realName: 'Kevin Zhang'`. In [`Navbar.tsx:50`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/components/layout/Navbar.tsx#L50), `Nexon` is assigned `realName: 'Marcus Chen'`.

### 2. "Profiles Reviewed" Chart Extends Past Today
- **Verdict**: **CONFIRMED (YES)**.
- **Evidence**: [`DashboardView.tsx:64-70`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/dashboard/DashboardView.tsx#L64-L70):
  ```typescript
  const activityData = [
    { date: 'Oct 1', profiles: 58 },
    { date: 'Oct 7', profiles: 72 },
    { date: 'Oct 14', profiles: 68 },
    { date: 'Oct 21', profiles: 96 },
    { date: 'Oct 28', profiles: 118 }, // Future date past current date (Oct 25, 2026)
  ];
  ```

### 3. Both IGL Candidates Show Identical Roster-Need and Synergy Values
- **Verdict**: **CONFIRMED (YES)**.
- **Evidence**: [`engine.ts:300-316`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/lib/scoring/engine.ts#L300-L316):
  ```typescript
  export function computeRosterNeedMatch(player: Player, targetRole: Role): number {
    if (player.primaryRole === targetRole) return 95; // Any primary IGL gets exactly 95
    ...
  }
  export function computeSynergyContribution(player: Player, targetRole: Role): number {
    let synergy = 80;
    if (player.stats.tradeStructure > 0.75) synergy += 8;
    if (player.stats.utilityValue > 0.70) synergy += 6;
    if (player.primaryLanguage === 'English') synergy += 5;
    return Math.min(98, Math.max(50, synergy)); // Any high-stat English player hits 98 cap
  }
  ```
  Both `siuhy` and `aleksib` have primary role IGL, English language, trade structure > 0.75, and utility > 0.70. Consequently, both candidates evaluate to identical `needMatch: 95` and `synergy: 98`.

### 4. Comparison Page Still Shows Clarity, Command Ratio, and Calls Per Round
- **Verdict**: **CONFIRMED (YES)**.
- **Evidence**: In [`ComparisonView.tsx:51-59`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/comparison/ComparisonView.tsx#L51-L59), the table dynamically renders `Object.keys(e.eval.individualMetrics)`. In [`engine.ts:244,257,258`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/lib/scoring/engine.ts#L244-L258), `individualMetrics` explicitly assigns:
  - `individualMetrics['Clarity']`
  - `individualMetrics['Command Ratio']`
  - `individualMetrics['Calls Per Round']`
  These legacy dimensions are displayed rather than the LLM judge dimensions.

### 5. Metrics Displayed with No Source Backing
- **Verdict**: **CONFIRMED (YES)**.
- **Evidence**:
  - **Estimated Buyout**: [`DashboardView.tsx:38,49,60`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/dashboard/DashboardView.tsx#L38-L60) and [`initialData.ts`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/lib/mock/initialData.ts) display arbitrary financial numbers ($30,000 to $500,000). Neither Leetify nor PandaScore provides buyout data.
  - **Aim & Rotation**: [`LeaderboardsView.tsx:36-660`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/leaderboards/LeaderboardsView.tsx#L36-L660) displays hardcoded `skills: { aim: 98, rotation: 86, survival: 78 }` across dozens of mock entries with no underlying telemetry.
  - **Survival Value**: [`engine.ts:275`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/lib/scoring/engine.ts#L275) displays a synthetic `Survival Value` metric computed from unverified mock fields.

### 6. Contact Info Shown Without Consent
- **Verdict**: **CONFIRMED (YES)**.
- **Evidence**: In [`PlayerProfileTab.tsx:158-223`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/player_dashboard/tabs/PlayerProfileTab.tsx#L158-L223), phone (`+91 98765 43210`) and email (`sam.vortex.esports@gmail.com`) are rendered unmasked with copy buttons. There is no approval check against the requesting viewer or organization.

### 7. "Verified" or Anti-Cheat Claims Have No Backing
- **Verdict**: **CONFIRMED (YES)**.
- **Evidence**:
  - [`ScoutingFeedTab.tsx:53,58`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/player_dashboard/tabs/ScoutingFeedTab.tsx#L53-L58): Claims "verified anti-cheat demo telemetry" and "Clean check verified. No anomalous inputs or packet injection detected."
  - [`ExportPdfModal.tsx:98`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/player_dashboard/components/ExportPdfModal.tsx#L98): Claims "verified anti-cheat integrity".
  - [`VideoPlayerModal.tsx:195`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/player_dashboard/components/VideoPlayerModal.tsx#L195): Claims "Whisper Audio & Frame Anti-Cheat Synchronized".
  - [`PlayerProfileTab.tsx:197,827`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/player_dashboard/tabs/PlayerProfileTab.tsx#L197): Claims "Verified Player" and "ScoutForge Contract Verified".
  **Fact**: No anti-cheat or contract verification service exists in the backend or any connected API.

### 8. Video "AI x/30" Scores Have No Backing
- **Verdict**: **CONFIRMED (YES)**.
- **Evidence**: In [`PlayerProfileTab.tsx:57-89, 122`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/player_dashboard/tabs/PlayerProfileTab.tsx#L57-L122) and [`VideoPlayerModal.tsx:160`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/player_dashboard/components/VideoPlayerModal.tsx#L160), scores `28.8`, `27.4`, `28.0`, and `28.5` are hardcoded literals in client-side state. Uploaded videos are never sent to a backend model.

### 9. BGMI, Free Fire, Mobile Legends, and Valorant Stats Have No Source
- **Verdict**: **CONFIRMED (YES)**.
- **Evidence**:
  - Backend adapter [`pandascore_adapter.py`](file:///D:/project/aiml%20prime/project/Triwizathon/backend/app/services/pandascore_adapter.py) only connects to CS:GO/CS2 endpoints.
  - Backend adapter [`leetify_adapter.py`](file:///D:/project/aiml%20prime/project/Triwizathon/backend/app/services/leetify_adapter.py) only connects to Leetify CS2 endpoints.
  - SQLite database `scoutforge.db` contains only Title ID 1 ("Counter-Strike 2").
  - All stats for BGMI, Valorant, Free Fire, and Mobile Legends in [`LeaderboardsView.tsx:45-450`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/leaderboards/LeaderboardsView.tsx#L45-L450) and [`PlayerDashboardView.tsx:136-220`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/player_dashboard/PlayerDashboardView.tsx#L136-L220) are entirely invented mock arrays.

---

## 4. Real Professional Players in Code & Database

Per Rule 3, a complete scan for real professional player identities was executed:

| Location | Real Pro Names Identified | Current State | Requirement |
| :--- | :--- | :--- | :--- |
| **Backend Seed / Ingestion** (`ingestion.py:20-30`) | `s1mple`, `NiKo`, `device`, `karrigan`, `Magisk`, `Senzu`, `mzinho`, `Sinnopsyy`, `CacaNito` | Real Steam IDs linked for Leetify ingestion | Keep as real sourced telemetry labeled `source='leetify'` |
| **Frontend Mock Data** (`initialData.ts`) | `siuhy`, `aleksib`, `cadian`, `broky`, `karrigan`, `niko`, `ropz` | Mixed with invented buyouts ($450,000) and mock stats | **VIOLATION OF RULE 3**: Remove invented buyouts and mock stats for real pros |
| **Frontend Dashboard** (`DashboardView.tsx:41-43`) | `Helvijs Saukants` (pro player **broky**) masked as `handle: 'Kairo'` | Assigned fake buyout ($500,000) | **VIOLATION OF RULE 3**: Remove |
| **Frontend Leaderboards** (`LeaderboardsView.tsx`) | `siuhy`, `aleksib`, `broky`, `frozen`, `karrigan`, `niko`, `perfecto`, `ropz`, `zywoo`, `b1t` | Hardcoded mock stats (`skills: { aim: 98, rotation: 86 }`) | **VIOLATION OF RULE 3**: Remove or populate exclusively from real API data |

---

## 5. Mismatches & Code Smells

1. **`Math.random()`**:
   - [`PlayerDashboardView.tsx:606`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/player_dashboard/PlayerDashboardView.tsx#L606): Used to generate application IDs (`Math.random().toString(36).substring(2, 9)`). Must be generated by backend database IDs.
2. **`setTimeout` Fake Loading**:
   - [`RoleLoginView.tsx:58, 66`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/auth/RoleLoginView.tsx#L58-L66): 400ms fake login delay.
   - [`AvailabilityModal.tsx:74`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/player_dashboard/components/AvailabilityModal.tsx#L74): 400ms fake save delay.
   - [`ExportPdfModal.tsx:27`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/player_dashboard/components/ExportPdfModal.tsx#L27): 800ms fake download delay.
   - [`IngestionView.tsx:108`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/ingestion/IngestionView.tsx#L108): 1200ms fake sync delay.
   - [`EvidenceAudioTab.tsx:141`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/player_dashboard/tabs/EvidenceAudioTab.tsx#L141): 2800ms fake processing delay.
   - [`RosterOpeningsTab.tsx:370, 405, 539`](file:///D:/project/aiml%20prime/project/Triwizathon/frontend/src/features/player_dashboard/tabs/RosterOpeningsTab.tsx#L370-L539): Fake delays simulating application submission and post creation.
3. **Missing Backend Models & Tables**:
   - `roster_openings`: Role openings posted by teams.
   - `applications`: Applications submitted by players to openings.
   - `activity_events`: Scouting timeline events (views, shortlists, trials, formula updates).
   - `notifications`: Notifications for players and organizers.
   - `player_profiles`: Player-editable dossier fields (grind, scrim window, hardware, privacy settings).
   - `player_scores`: Score history per title and role.
