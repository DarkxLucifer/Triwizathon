"""ScoutForge Database Seeder Service.

Populates default organizations, users, titles, roles, formulas, teams, players,
and the benchmark roster with the planted weak IGL slot for testing and verification.
"""

import json
import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.config.formulas import get_default_formula_config, CURRENT_FORMULA_VERSION
from app.models import (
    Organization,
    User,
    Title,
    Role,
    FormulaVersion,
    Team,
    Player,
    Match,
    PlayerMatchStat,
    Roster,
    RosterSlot,
)


def seed_database(db: Session, force: bool = False):
    """Seeds the database with benchmark entities if empty or if force=True."""
    if not force and db.query(Organization).first():
        return  # Already seeded

    # 1. Organizations
    sentinels_org = Organization(name="Sentinels Esports", slug="sentinels")
    cloud9_org = Organization(name="Cloud9 Esports", slug="cloud9")
    db.add_all([sentinels_org, cloud9_org])
    db.flush()

    # 2. Users (Analyst for Sentinels, Analyst for Cloud9 for multi-tenant isolation testing)
    hashed_pwd = get_password_hash("Password123!")
    user_sentinels = User(
        org_id=sentinels_org.id,
        email="analyst@sentinels.gg",
        hashed_password=hashed_pwd,
        full_name="Alex Mercer",
        role="analyst",
    )
    user_c9 = User(
        org_id=cloud9_org.id,
        email="analyst@cloud9.gg",
        hashed_password=hashed_pwd,
        full_name="Jack Etienne",
        role="analyst",
    )
    db.add_all([user_sentinels, user_c9])
    db.flush()

    # 3. Title & Roles
    title = Title(name="Counter-Strike 2", slug="cs2")
    db.add(title)
    db.flush()

    role_names = ["IGL", "Entry", "Support", "Lurker", "AWPer"]
    roles_map = {}
    for r_name in role_names:
        r = Role(title_id=title.id, name=r_name, slug=r_name.lower())
        db.add(r)
        db.flush()
        roles_map[r_name] = r

    # 4. Formula Version
    formula_config = get_default_formula_config()
    fv = FormulaVersion(
        title_id=title.id,
        version_tag=CURRENT_FORMULA_VERSION,
        weights_json=formula_config,
        is_active=True,
        notes="Standard tactical shooter formula baseline.",
    )
    db.add(fv)
    db.flush()

    # 5. Load Generated Benchmark Data
    data_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "benchmark_data.json")
    if not os.path.exists(data_path):
        from scripts.generate_matches import generate_benchmark_dataset
        benchmark = generate_benchmark_dataset()
    else:
        with open(data_path, "r", encoding="utf-8") as f:
            benchmark = json.load(f)

    # Insert Teams
    team_entity_map = {}
    for t_data in benchmark["teams"]:
        team = Team(
            name=t_data["name"],
            slug=t_data["slug"],
            region=t_data["region"],
            tier=t_data["tier"],
            strength_rating=t_data["strength_rating"],
        )
        db.add(team)
        db.flush()
        team_entity_map[t_data["id"]] = team

    # Insert Players
    player_entity_map = {}
    handle_player_map = {}
    for p_data in benchmark["players"]:
        r_obj = roles_map[p_data["role"]]
        t_obj = team_entity_map[p_data["team_id"]]
        player = Player(
            external_id=p_data["external_id"],
            name=p_data["name"],
            handle=p_data["handle"],
            role_id=r_obj.id,
            team_id=t_obj.id,
            region=p_data["region"],
            tier=p_data["tier"],
            source=p_data["source"],
            is_available=p_data["is_available"],
            playstyle=p_data.get("playstyle", "Balanced"),
        )
        db.add(player)
        db.flush()
        player_entity_map[p_data["id"]] = player
        handle_player_map[p_data["handle"]] = player

    # Insert Matches
    match_entity_map = {}
    for m_data in benchmark["matches"]:
        match = Match(
            title_id=title.id,
            team_a_id=team_entity_map[m_data["team_a_id"]].id,
            team_b_id=team_entity_map[m_data["team_b_id"]].id,
            winner_team_id=team_entity_map[m_data["winner_team_id"]].id,
            match_date=datetime.fromisoformat(m_data["match_date"]),
            source=m_data["source"],
            metadata_json=m_data["metadata_json"],
        )
        db.add(match)
        db.flush()
        match_entity_map[m_data["id"]] = match

    # Insert Match Stats
    for s_data in benchmark["match_stats"]:
        stat = PlayerMatchStat(
            match_id=match_entity_map[s_data["match_id"]].id,
            player_id=player_entity_map[s_data["player_id"]].id,
            kills=s_data["kills"],
            deaths=s_data["deaths"],
            adr=s_data["adr"],
            kpr=s_data["kpr"],
            opening_kills=s_data["opening_kills"],
            opening_deaths=s_data["opening_deaths"],
            trades=s_data["trades"],
            utility_damage=s_data["utility_damage"],
            clutches_won=s_data["clutches_won"],
            rounds=s_data["rounds"],
            calls_count=s_data.get("calls_count", 0),
            calls_converted=s_data.get("calls_converted", 0),
            halftime_rating_diff=s_data.get("halftime_rating_diff", 0.0),
        )
        db.add(stat)

    # 6. Create Benchmark 5-Slot Roster for Sentinels (Org A)
    # Slot 1: IGL -> R00K (planted weak slot)
    # Slot 2: Entry -> BLITZ
    # Slot 3: Support -> AEGIS
    # Slot 4: Lurker -> SH4DOW
    # Slot 5: AWPer -> K4N3
    roster = Roster(
        org_id=sentinels_org.id,
        title_id=title.id,
        team_id=team_entity_map[1].id,
        name="Sentinels Main CS2",
    )
    db.add(roster)
    db.flush()

    roster_players = [
        (1, "IGL", handle_player_map.get("R00K")),
        (2, "Entry", handle_player_map.get("BLITZ", player_entity_map[2])),
        (3, "Support", handle_player_map.get("AEGIS", player_entity_map[3])),
        (4, "Lurker", handle_player_map.get("SH4DOW", player_entity_map[4])),
        (5, "AWPer", handle_player_map.get("K4N3", player_entity_map[5])),
    ]

    for slot_num, role_str, p_obj in roster_players:
        slot = RosterSlot(
            roster_id=roster.id,
            role_id=roles_map[role_str].id,
            player_id=p_obj.id if p_obj else None,
            slot_number=slot_num,
        )
        db.add(slot)

    # 7. Create a private Roster for Cloud9 (Org B) to test Org Isolation
    c9_roster = Roster(
        org_id=cloud9_org.id,
        title_id=title.id,
        team_id=team_entity_map[2].id,
        name="Cloud9 Prime Roster",
    )
    db.add(c9_roster)
    db.flush()

    for slot_num, role_str in enumerate(role_names, start=1):
        slot = RosterSlot(
            roster_id=c9_roster.id,
            role_id=roles_map[role_str].id,
            player_id=player_entity_map[5 + slot_num].id,
            slot_number=slot_num,
        )
        db.add(slot)

    db.commit()
    print("Database successfully seeded with benchmark organizations, users, and players.")
