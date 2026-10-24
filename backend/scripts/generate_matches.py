"""ScoutForge Seeded Synthetic Benchmark Data Generator.

Fixed random seed = 42 for complete reproducibility.
CS2 Tactical Shooter benchmark with ~100 players, 20 teams, 5 roles, 30+ matches per player.
Plants:
  - 3 Known Hidden Gems (Strat, Nyx, Viper)
  - 1 Roster with an obvious weak IGL slot (Sentinels Elite: R00K)
"""

import json
import random
import os
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Tuple, Optional

RANDOM_SEED = 42
TOTAL_TEAMS = 20
PLAYERS_PER_TEAM = 5
ROLES = ["IGL", "Entry", "Support", "Lurker", "AWPer"]
REGIONS = ["NA", "EU", "APAC"]

TIER_DISTRIBUTION = [
    ("Tier 1", 4, (1.15, 1.30)),
    ("Tier 2", 8, (0.95, 1.14)),
    ("Tier 3", 8, (0.80, 0.94)),
]

TEAM_NAMES = [
    # Tier 1
    ("Sentinels Elite", "NA", "Tier 1", 1.25),
    ("Cloud9 Apex", "NA", "Tier 1", 1.22),
    ("Fnatic Prime", "EU", "Tier 1", 1.28),
    ("Natus Vincere", "EU", "Tier 1", 1.26),
    # Tier 2
    ("Phoenix Challengers", "NA", "Tier 2", 1.08),  # Home of Planted Gem 1: Strat
    ("Mirage Gaming", "EU", "Tier 2", 1.05),        # Home of Planted Gem 3: Viper
    ("Cyber Wolves", "EU", "Tier 2", 1.02),
    ("Pacific Wave", "APAC", "Tier 2", 1.00),
    ("Titan Vanguard", "NA", "Tier 2", 1.06),
    ("Redline Esports", "EU", "Tier 2", 1.04),
    ("Seoul Dynamos", "APAC", "Tier 2", 1.07),
    ("Nordic Storm", "EU", "Tier 2", 1.03),
    # Tier 3
    ("Ironclad Academy", "NA", "Tier 3", 0.88),     # Home of Planted Gem 2: Nyx
    ("Delta Recruits", "EU", "Tier 3", 0.85),
    ("Rising Sun Org", "APAC", "Tier 3", 0.86),
    ("Nova Sparks", "NA", "Tier 3", 0.87),
    ("Apex Cadets", "EU", "Tier 3", 0.84),
    ("Glacier Clan", "NA", "Tier 3", 0.89),
    ("Echo Velocity", "APAC", "Tier 3", 0.82),
    ("Shadow Syndicate", "EU", "Tier 3", 0.83),
]


def generate_benchmark_dataset() -> Dict[str, Any]:
    """Generates the full benchmark dataset deterministically."""
    random.seed(RANDOM_SEED)

    # 1. Teams
    teams: List[Dict[str, Any]] = []
    for idx, (name, region, tier, rating) in enumerate(TEAM_NAMES, start=1):
        slug = name.lower().replace(" ", "-")
        teams.append({
            "id": idx,
            "name": name,
            "slug": slug,
            "region": region,
            "tier": tier,
            "strength_rating": rating,
        })

    # 2. Players (5 per team = 100 players)
    players: List[Dict[str, Any]] = []
    player_id_counter = 1

    first_names = ["Marcus", "Elias", "Alex", "Lucas", "David", "Tariq", "Elena", "Silas", "Kane", "Cole",
                   "Liam", "Noah", "Oliver", "James", "Benjamin", "Lucas", "Henry", "Alexander", "Sebastian", "Jack"]
    last_names = ["Vance", "Mercer", "Chen", "Ward", "Kim", "Al-Mansoor", "Rostova", "Thorne", "Hayes", "Palmer",
                  "Cross", "Sterling", "Kovacs", "Drake", "Hawthorne", "Miller", "Novak", "Sato", "Fischer", "Dubois"]
    handles_pool = [
        "V4NCE", "STRAT", "BLITZ", "AEGIS", "SH4DOW", "K4N3", "NYX", "VIPER", "R00K", "GHOST",
        "TITAN", "FROST", "CIPHER", "RAZOR", "WRAITH", "NEXUS", "STRIKE", "HAWK", "PULSE", "ZENITH",
        "ECHO", "BLAZE", "COBRA", "VALK", "ORION", "PHANTOM", "SURGE", "IRON", "SENTRY", "RAVEN"
    ]

    for team in teams:
        team_id = team["id"]
        for role_idx, role in enumerate(ROLES):
            # Check for planted players
            is_planted = False
            handle = None
            name = None
            playstyle = "Balanced"

            # Planted Weak IGL: Team 1 (Sentinels Elite), Role IGL
            if team_id == 1 and role == "IGL":
                handle = "R00K"
                name = "Rook Palmer"
                playstyle = "Passive"
                is_planted = True
            # Planted Hidden Gem 1: Team 5 (Phoenix Challengers), Role IGL
            elif team_id == 5 and role == "IGL":
                handle = "Strat"
                name = "Silas Chen"
                playstyle = "Tactical"
                is_planted = True
            # Planted Hidden Gem 2: Team 13 (Ironclad Academy), Role Lurker
            elif team_id == 13 and role == "Lurker":
                handle = "Nyx"
                name = "Elena Rostova"
                playstyle = "Clutch-Oriented"
                is_planted = True
            # Planted Hidden Gem 3: Team 6 (Mirage Gaming), Role Entry
            elif team_id == 6 and role == "Entry":
                handle = "Viper"
                name = "Tariq Al-Mansoor"
                playstyle = "Aggressive"
                is_planted = True
            else:
                fn = random.choice(first_names)
                ln = random.choice(last_names)
                name = f"{fn} {ln}"
                if handles_pool:
                    handle = handles_pool.pop(0) if handles_pool else f"Player_{player_id_counter}"
                else:
                    handle = f"{fn[:3].upper()}_{player_id_counter}"
                
                playstyle_choices = ["Aggressive", "Methodical", "Supportive", "Clutch-Oriented", "Tactical"]
                playstyle = playstyle_choices[role_idx % len(playstyle_choices)]

            players.append({
                "id": player_id_counter,
                "external_id": f"sim_player_{player_id_counter}",
                "name": name,
                "handle": handle,
                "role": role,
                "team_id": team_id,
                "team_name": team["name"],
                "region": team["region"],
                "tier": team["tier"],
                "source": "simulated",
                "is_available": True,
                "playstyle": playstyle,
                "is_planted": is_planted,
            })
            player_id_counter += 1

    # 3. Matches and PlayerMatchStats (35 matches per team -> each player has 35 matches)
    matches: List[Dict[str, Any]] = []
    match_stats: List[Dict[str, Any]] = []
    match_id_counter = 1
    stat_id_counter = 1

    start_date = datetime.now(timezone.utc) - timedelta(days=90)

    # Pre-group players by team
    team_players = {}
    for p in players:
        team_players.setdefault(p["team_id"], []).append(p)

    # Generate 140 matches across the 20 teams (each team plays ~35 matches)
    for m_idx in range(1, 351):
        m_date = start_date + timedelta(hours=m_idx * 6)
        team_a_id = random.randint(1, TOTAL_TEAMS)
        team_b_id = random.randint(1, TOTAL_TEAMS)
        while team_b_id == team_a_id:
            team_b_id = random.randint(1, TOTAL_TEAMS)

        team_a = teams[team_a_id - 1]
        team_b = teams[team_b_id - 1]

        # Winner probability based on strength rating
        prob_a = team_a["strength_rating"] / (team_a["strength_rating"] + team_b["strength_rating"])
        winner_id = team_a_id if random.random() < prob_a else team_b_id

        total_rounds = random.randint(20, 28)

        match_record = {
            "id": match_id_counter,
            "title_id": 1,
            "team_a_id": team_a_id,
            "team_b_id": team_b_id,
            "winner_team_id": winner_id,
            "match_date": m_date.isoformat(),
            "source": "simulated",
            "metadata_json": {
                "score": f"{13 if winner_id == team_a_id else random.randint(7, 11)}-{13 if winner_id == team_b_id else random.randint(7, 11)}",
                "map": random.choice(["Mirage", "Inferno", "Nuke", "Ancient", "Anubis", "Dust II"]),
                "rounds": total_rounds,
            }
        }
        matches.append(match_record)

        # Generate player stats for both rosters
        for t_id, opp_team in [(team_a_id, team_b), (team_b_id, team_a)]:
            is_team_winner = (t_id == winner_id)
            for p in team_players[t_id]:
                # Realistic base stats by role and plant profile
                role = p["role"]
                handle = p["handle"]

                # Default distributions
                base_kd = random.uniform(0.90, 1.15)
                base_adr = random.uniform(68.0, 84.0)
                base_kpr = random.uniform(0.65, 0.78)
                opening_k = random.randint(1, 3)
                opening_d = random.randint(1, 3)
                trades = random.randint(2, 5)
                utility_dmg = random.uniform(8.0, 24.0)
                clutches = random.randint(0, 1)
                calls_cnt = random.randint(10, 22)
                calls_conv = random.randint(5, 14)
                halftime_diff = random.uniform(-0.15, 0.15)

                # Special calibration for planted players
                if handle == "R00K":  # Planted WEAK IGL
                    base_kd = random.uniform(0.55, 0.72)
                    base_adr = random.uniform(46.0, 56.0)
                    base_kpr = random.uniform(0.42, 0.54)
                    calls_cnt = random.randint(6, 12)
                    calls_conv = random.randint(2, 5)
                    halftime_diff = random.uniform(-0.35, -0.10)
                elif handle == "Strat":  # Planted HIDDEN GEM 1 (IGL)
                    base_kd = random.uniform(1.15, 1.30)
                    base_adr = random.uniform(82.0, 92.0)
                    base_kpr = random.uniform(0.78, 0.88)
                    calls_cnt = random.randint(18, 26)
                    calls_conv = int(calls_cnt * random.uniform(0.68, 0.82))
                    halftime_diff = random.uniform(0.12, 0.28)
                elif handle == "Nyx":  # Planted HIDDEN GEM 2 (Lurker)
                    base_kd = random.uniform(1.28, 1.44)
                    base_adr = random.uniform(86.0, 96.0)
                    base_kpr = random.uniform(0.82, 0.92)
                    clutches = random.randint(1, 3)
                    trades = random.randint(4, 7)
                elif handle == "Viper":  # Planted HIDDEN GEM 3 (Entry)
                    base_kd = random.uniform(1.20, 1.36)
                    base_adr = random.uniform(88.0, 98.0)
                    base_kpr = random.uniform(0.84, 0.94)
                    opening_k = random.randint(4, 7)
                    opening_d = random.randint(1, 2)
                elif role == "Entry":
                    opening_k = random.randint(3, 5)
                    opening_d = random.randint(2, 4)
                    base_adr += 6.0
                elif role == "AWPer":
                    base_kd += 0.15
                    opening_k = random.randint(2, 4)
                    opening_d = random.randint(1, 2)
                elif role == "Support":
                    utility_dmg = random.uniform(22.0, 38.0)
                    trades += 2
                elif role == "Lurker":
                    clutches = random.randint(0, 2)

                kills = max(4, int(base_kpr * total_rounds + random.randint(-3, 3)))
                deaths = max(5, int(kills / max(0.4, base_kd) + random.randint(-2, 2)))
                adr = round(max(30.0, base_adr + random.uniform(-8.0, 8.0)), 1)
                kpr = round(kills / total_rounds, 2)

                match_stats.append({
                    "id": stat_id_counter,
                    "match_id": match_id_counter,
                    "player_id": p["id"],
                    "kills": kills,
                    "deaths": deaths,
                    "adr": adr,
                    "kpr": kpr,
                    "opening_kills": opening_k,
                    "opening_deaths": opening_d,
                    "trades": trades,
                    "utility_damage": round(utility_dmg, 1),
                    "clutches_won": clutches,
                    "rounds": total_rounds,
                    "calls_count": calls_cnt,
                    "calls_converted": calls_conv,
                    "halftime_rating_diff": round(halftime_diff, 2),
                })
                stat_id_counter += 1

        match_id_counter += 1

    return {
        "teams": teams,
        "players": players,
        "matches": matches,
        "match_stats": match_stats,
    }


def validate_match_data_record(record: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """Validates CSV/JSON import record against required schema and ranges."""
    required_keys = ["match_id", "player_id", "kills", "deaths", "adr", "rounds"]
    for k in required_keys:
        if k not in record or record[k] is None:
            return False, f"Missing required key '{k}'"

    if record["kills"] < 0 or record["kills"] > 80:
        return False, f"Kills {record['kills']} out of realistic range [0, 80]"
    if record["deaths"] < 0 or record["deaths"] > 80:
        return False, f"Deaths {record['deaths']} out of realistic range [0, 80]"
    if record["adr"] < 0.0 or record["adr"] > 300.0:
        return False, f"ADR {record['adr']} out of realistic range [0.0, 300.0]"
    if record["rounds"] < 10 or record["rounds"] > 60:
        return False, f"Rounds {record['rounds']} out of realistic range [10, 60]"

    return True, None


if __name__ == "__main__":
    data = generate_benchmark_dataset()
    out_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "benchmark_data.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"Generated benchmark data: {len(data['teams'])} teams, {len(data['players'])} players, {len(data['matches'])} matches, {len(data['match_stats'])} stats.")
