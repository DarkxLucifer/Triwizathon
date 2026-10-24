# ScoutForge Documented Assumptions

This document lists all default choices, heuristic values, and mathematical proxies adopted across ScoutForge. All assumptions are centralized here in accordance with Non-Negotiable Rule 5.

---

### ASSUMPTION-01: RosterNeedMatch Default Scoring
- **Context**: The scouting brief identifies a primary role gap (e.g. weakest slot in the target roster).
- **Rule**:
  - `1.0`: Player's primary role strictly equals the target roster's identified gap.
  - `0.5`: Player's designated secondary role or flex capability matches the gap.
  - `0.0`: Player does not play the needed role.

### ASSUMPTION-02: Synergy Contribution Scoring
- **Context**: Roster balance requires complementary tactical playstyles (e.g., high opening aggression paired with disciplined passive anchor and supportive utility).
- **Rule**:
  - Candidate playstyle tag (`Aggressive`, `Methodical`, `Supportive`, `Clutch-Oriented`, `Tactical`).
  - If the existing 4 roster members have excess aggressive weight ($> 50\%$), an aggressive candidate receives $0.50$, while a disciplined/supportive candidate receives $0.90$.
  - When balanced, synergy defaults to $0.80$.

### ASSUMPTION-03: VisibilityGap Quantification
- **Context**: Hidden gems are high-performing players with low scout attention due to tier, regional isolation, or team obscurity.
- **Rule**:
  - `Tier 1`: VisibilityGap = $0.20$ (extensively broadcasted and scouted).
  - `Tier 2`: VisibilityGap = $0.65$ (regional challengers, moderate coverage).
  - `Tier 3`: VisibilityGap = $0.90$ (grassroots / academy / amateur leagues, high obscurity).

### ASSUMPTION-04: Non-Audio Proxy for IGL Metrics
- **Context**: When team voice communications are not consented or unavailable, IGL scoring must redistribute weights without fabricating audio data.
- **Rule**:
  - `CallsPerRound`: In-game tactical coordination proxy (trade assist engagement rate).
  - `WinAfterCall`: Round conversion percentage in late-round executes.
  - `Adaptation`: Halftime adjustment factor (2nd half rating differential).
  - `CommandRatio` and `Clarity` are marked unavailable, and their $45\%$ weight is proportionally redistributed to the three in-game metrics above.

### ASSUMPTION-05: Sample Shrinkage Parameter ($k = 10$)
- **Context**: Low match counts skew raw averages.
- **Rule**:
  - Credibility weight $\alpha = \frac{n}{n + 10}$.
  - A player with 10 matches receives $50\%$ weight on their own mean and $50\%$ weight on the cohort mean.
  - A player with 30 matches receives $75\%$ weight on their own mean.

### ASSUMPTION-06: Opponent Strength Scaling
- **Context**: Normalizing player statistics by opponent strength.
- **Rule**:
  - Baseline opponent strength is normalized to mean $1.00$.
  - Teams in Tier 1 have strength ratings between $1.15$ and $1.30$.
  - Teams in Tier 2 have strength ratings between $0.95$ and $1.14$.
  - Teams in Tier 3 have strength ratings between $0.80$ and $0.94$.
