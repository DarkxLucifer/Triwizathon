# ScoutForge Scoring & Recommendation Formulas

All mathematical scoring, normalization, confidence calculations, and weights are governed by this specification and mirrored in `backend/app/config/formulas.py`.

---

## 1. Metric Normalization & Cohort Percentiles
To compare players objectively across different roles, cohorts, and competitive tiers:
- **Cohort Grouping**: Each player is evaluated within `(title, role_cohort, tier, time_window)`.
- **Percentile Calculation**: For a metric $x_i$ among cohort metrics $X = [x_1, x_2, \dots, x_N]$:
  $$\text{Percentile}(x_i) = \frac{\sum_{j=1}^N \mathbb{I}(x_j \le x_i)}{N}$$
  Where $\mathbb{I}$ is the indicator function. The resulting percentile is strictly bounded in $[0.0, 1.0]$.

---

## 2. Context Adjustment (Opponent Strength Weighting)
Raw performance against weak teams can inflate statistics. Matches are adjusted based on opponent strength:
$$\text{Adjusted\_Stat}_m = \text{Raw\_Stat}_m \times \left( \frac{\text{Opponent\_Strength}_m}{\overline{\text{Cohort\_Opponent\_Strength}}} \right)$$
- Baseline team strength is centered at $1.0$ (ranging from $0.80$ for low tier to $1.30$ for top tier).
- Matches against higher-tier opponents yield higher adjusted stat credit.

---

## 3. Role Performance Scores

Each role evaluates specific tactical competencies:

### Entry Fragger
$$\text{Score}_{\text{Entry}} = 0.25 \cdot \text{KD} + 0.20 \cdot \text{ADR} + 0.15 \cdot \text{KPR} + 0.20 \cdot \text{OpeningImpact} + 0.20 \cdot \text{Tradeability}$$
- **OpeningImpact**: $\frac{\text{opening\_kills}}{\text{opening\_kills} + \text{opening\_deaths} + \epsilon}$
- **Tradeability**: $\frac{\text{trades}}{\text{rounds}}$

### Support
$$\text{Score}_{\text{Support}} = 0.15 \cdot \text{KD} + 0.15 \cdot \text{ADR} + 0.20 \cdot \text{KPR} + 0.25 \cdot \text{UtilityValue} + 0.25 \cdot \text{TradeStructure}$$
- **UtilityValue**: Normalized utility damage per round ($\frac{\text{utility\_damage}}{\text{rounds}}$)
- **TradeStructure**: Proportion of deaths resulting in an effective trade ($\frac{\text{trades}}{\text{deaths} + \epsilon}$)

### Lurker
$$\text{Score}_{\text{Lurker}} = 0.20 \cdot \text{KD} + 0.15 \cdot \text{ADR} + 0.15 \cdot \text{KPR} + 0.25 \cdot \text{LateRoundImpact} + 0.25 \cdot \text{SurvivalValue}$$
- **LateRoundImpact**: Normalized clutches won per round ($\frac{\text{clutches\_won}}{\text{rounds}}$)
- **SurvivalValue**: $1 - \frac{\text{deaths}}{\text{rounds}}$

### AWPer (Sniper)
$$\text{Score}_{\text{AWPer}} = 0.25 \cdot \text{KD} + 0.20 \cdot \text{ADR} + 0.20 \cdot \text{KPR} + 0.20 \cdot \text{OpeningDuelWinRate} + 0.15 \cdot \text{ClutchValue}$$
- **OpeningDuelWinRate**: First duel success rate
- **ClutchValue**: Normalized clutches won per round

### In-Game Leader (IGL)
$$\text{Score}_{\text{IGL}} = 0.30 \cdot \text{CommandRatio} + 0.20 \cdot \text{CallsPerRound} + 0.15 \cdot \text{Clarity} + 0.20 \cdot \text{WinAfterCall} + 0.15 \cdot \text{Adaptation}$$
- **Audio Redistribution Rule**:
  Audio-derived metrics (`CommandRatio` and `Clarity`) require verified audio consent, valid timestamps, and speaker verification.
  If audio metrics are absent or unverified:
  - Audio weights ($0.30 + 0.15 = 0.45$) are **proportionally redistributed** across the remaining available metrics (`CallsPerRound`, `WinAfterCall`, `Adaptation`).
  - An explicit flag `audio_weights_redistributed = true` is attached to the score breakdown.
- **Causality Disclaimer**:
  `WinAfterCall` measures an empirical statistical association between a recorded strategic call and subsequent round success. It is **never** presented as deterministic or causal.

---

## 4. Confidence & Sample Shrinkage
$$\text{Confidence} = 0.50 \cdot \text{DataCoverage} + 0.30 \cdot \text{SampleReliability} + 0.20 \cdot \text{Recency}$$

- **DataCoverage**: Ratio of available required metrics present in the sample.
  *Rule*: If any critical role metric is missing, confidence is **capped at 0.60** and a warning is raised.
- **SampleReliability**: $\min\left(1.0, \frac{N_{\text{matches}}}{30}\right)$
- **Bayesian Shrinkage**:
  To prevent small-sample distortion, raw player performance $\bar{x}_p$ is shrunk toward cohort mean $\mu_c$:
  $$\hat{\mu}_p = \alpha \cdot \bar{x}_p + (1 - \alpha) \cdot \mu_c \quad \text{where} \quad \alpha = \frac{n}{n + k} \; (k = 10)$$
- **Recency**: Match weights decay exponentially with age ($w = e^{-\lambda \cdot \Delta t}$, $\lambda = 0.01\text{ day}^{-1}$).
- **Evaluation Label**:
  When $\text{FitScore} \ge 75$ but $\text{Confidence} < 0.65$, candidate is classified as:
  **"promising but under-observed"**.

---

## 5. FitScore (0 to 100)
$$\text{FitScore} = 100 \times \left( 0.55 \cdot \text{RolePerformance} + 0.20 \cdot \text{RosterNeedMatch} + 0.15 \cdot \text{SynergyContribution} + 0.10 \cdot \text{ConstraintMatch} \right)$$

- **RosterNeedMatch**:
  - $1.0$ if player's primary role matches the roster's identified weakest slot.
  - $0.5$ if player's secondary role matches.
  - $0.0$ if no role alignment.
- **SynergyContribution**: Evaluates playstyle balance (e.g., passive anchor vs explosive entry pairing).
- **ConstraintMatch**: $1.0$ if player satisfies regional, tier, and availability criteria; $0.5$ for soft mismatch; $0.0$ for hard mismatch.

---

## 6. HiddenGemScore (0 to 100)
$$\text{HiddenGemScore} = 100 \times \left( 0.45 \cdot \text{AdjustedPerformancePercentile} + 0.25 \cdot \text{VisibilityGap} + 0.20 \cdot \text{Confidence} + 0.10 \cdot \text{ImprovementTrend} \right)$$

- **Minimum Sample**: Minimum $10$ matches required.
- **Suppression Rule**: Suppressed if $\text{Confidence} < 0.40$ or $N_{\text{matches}} < 10$.
- **VisibilityGap**: Tier 1 = $0.20$, Tier 2 = $0.65$, Tier 3 = $0.90$.
- **ImprovementTrend**: Relative trajectory over the last 15 matches vs historical baseline.
