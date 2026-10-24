# ScoutForge 🎯
### AI-Powered Esports Scouting & Multi-Roster Intelligence Platform

ScoutForge is an enterprise esports intelligence platform designed for Coaches, Analysts, and General Managers to identify, evaluate, and benchmark competitive talent across tactical shooter titles (Counter-Strike 2).

Built with strict mathematical transparency, Bayesian credibility shrinkage, auditable decision logging, multi-tenant organization isolation, and consented voice communications intelligence.

---

## 🏛️ System Architecture

```
Triwizathon/
├── frontend/                # Next.js 16 (App Router) + TypeScript + Tailwind + shadcn/ui + Recharts
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Landing page (Celebration reference template)
│   │   │   ├── login/page.tsx         # Org authentication (login & sign up)
│   │   │   └── dashboard/
│   │   │       ├── page.tsx           # Roster KPIs & deficit alerts
│   │   │       ├── players/page.tsx   # Filterable player pool
│   │   │       ├── players/[id]/page.tsx # Competency radar, role scores & match trend
│   │   │       ├── rosters/page.tsx   # Multi-roster list
│   │   │       ├── rosters/[id]/page.tsx # 5-slot squad lineup & weakest slot detection
│   │   │       ├── scouting/page.tsx  # Brief creation & ranked shortlist
│   │   │       ├── scouting/compare/page.tsx # Side-by-side radar & delta table
│   │   │       ├── hidden-gems/page.tsx # Undervalued talent discovery
│   │   │       ├── audio/page.tsx     # Consented speech-to-text comms pipeline
│   │   │       └── decisions/page.tsx # Immutable decision history & audit trail
│   │   └── lib/api.ts                 # Typed central API client
├── backend/                 # FastAPI + SQLAlchemy 2.x + Pydantic v2 + SQLite/PostgreSQL
│   ├── app/
│   │   ├── api/             # REST endpoints (auth, players, rosters, briefs, compare, gems, audio, decisions)
│   │   ├── core/            # Config, database engine, bcrypt & JWT security
│   │   ├── models/          # 15 relational tables with Alembic migrations
│   │   ├── schemas/         # Pydantic v2 schemas
│   │   ├── services/        # Pure scoring, explanation checker, audio worker, PandaScore adapter
│   │   ├── config/formulas.py # Canonical mathematical weights & shrinkage definitions
│   │   └── tests/           # 14 acceptance test suites (all 7 criteria passing)
│   ├── data/                # Seeded benchmark dataset (seed=42)
│   └── scripts/             # generate_matches.py synthetic data engine
├── docs/
│   ├── formulas.md          # Complete mathematical specifications & formulas
│   ├── api.md               # OpenAPI REST endpoint specifications
│   └── assumptions.md       # Documented system assumptions & proxies
└── README.md
```

---

## 🚀 Quickstart & Run Instructions

### 1. Prerequisites
- **Python**: 3.12+ (managed with `uv`)
- **Node.js**: v24+ & `npm` v11+
- Virtual environment at `D:\project\aiml prime\.venv`

### 2. Backend Setup & Startup
Open a terminal in `Triwizathon/backend`:
```powershell
# 1. Environment file is pre-configured in .env
# 2. Run database migrations
& "D:\project\aiml prime\.venv\Scripts\python.exe" -m alembic upgrade head

# 3. Start the FastAPI development server
& "D:\project\aiml prime\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API docs available at: `http://127.0.0.1:8000/docs`

### 3. Run Backend Acceptance Tests
```powershell
$env:PYTHONPATH = "D:\project\aiml prime\project\Triwizathon\backend"
& "D:\project\aiml prime\.venv\Scripts\python.exe" -m pytest "D:\project\aiml prime\project\Triwizathon\backend\app\tests" -v
```
*(All 14 unit and integration tests covering the 7 acceptance checks pass cleanly).*

### 4. Frontend Setup & Startup
Open a terminal in `Triwizathon/frontend`:
```powershell
# 1. Install dependencies (already installed)
npm install

# 2. Run Next.js production build check
npm run build

# 3. Start the development server
npm run dev
```
Open your browser at: `http://localhost:3000`

---

## 🎮 End-to-End Walkthrough Flow

1. **Landing Page (`/`)**:
   - Recreates the provided reference layout with solid warm cream `#FCF8F1` background, responsive navigation, headline, and tactical card graphic.
2. **Authentication (`/login`)**:
   - Pre-populated demo account: `analyst@sentinels.gg` / `Password123!` (or create a new organization account).
3. **Scouting Overview (`/dashboard`)**:
   - Displays organization KPIs and identifies that **Sentinels Main CS2** has a critical performance deficit in **Slot 1 (IGL)** with player `R00K` (score trails cohort benchmark).
4. **Roster Health (`/dashboard/rosters/1`)**:
   - Inspects the five slots. Confirms Slot 1 (`R00K`) is highlighted in red as the weakest role gap and alerts to passive tempo drag.
5. **Generate Brief (`/dashboard/scouting?roster_id=1&role=IGL`)**:
   - Computes algorithmic candidate rankings based on active formula weights (`v1.0.0`).
   - Planted hidden gem candidate **`Strat` (Silas Chen)** is ranked **#1** with an 88.4 FitScore.
   - Verified drivers are checked: unverified numbers are rejected by the explanation checker.
6. **Side-by-Side Comparison (`/dashboard/scouting/compare?player_ids=5,14`)**:
   - Compares candidate `Strat` against current roster player `R00K` across Firepower, Damage, Entry Aggression, Trade Efficiency, and Tactical Calling.
7. **Record Decision (`/dashboard/decisions`)**:
   - Trial or Advance candidate `Strat` with analyst rationale. Stored permanently in the organization decision log with formula version `v1.0.0`.
8. **Audio Intelligence (`/dashboard/audio`)**:
   - Consented speech-to-text comms pipeline powered by `faster-whisper` (Whisper-small model). Non-blocking background worker extracts timestamped tactical commands and flags low-confidence comms for human review.

---

## ⚖️ Scoring Engine Summary
$$\text{FitScore} = 100 \times \left( 0.55 \cdot \text{Role} + 0.20 \cdot \text{Need} + 0.15 \cdot \text{Synergy} + 0.10 \cdot \text{Constraints} \right)$$
$$\text{Confidence} = 0.50 \cdot \text{Coverage} + 0.30 \cdot \text{SampleReliability} + 0.20 \cdot \text{Recency}$$
$$\text{Shrinkage} = \alpha \cdot \bar{x}_p + (1 - \alpha) \cdot \mu_c \quad \left(\alpha = \frac{n}{n + 10}\right)$$

Detailed derivations and assumption documentations are available in [`docs/formulas.md`](docs/formulas.md) and [`docs/assumptions.md`](docs/assumptions.md).
