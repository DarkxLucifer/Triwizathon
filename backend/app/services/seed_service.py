"""ScoutForge Database Seeder Service.

Populates default organizations, users, titles, roles, formulas, teams, players,
and the benchmark roster with the planted weak IGL slot for testing and verification.
Includes realistic multi-tenant data connecting Player Portal and Organiser Portal.
"""

import json
import os
from datetime import datetime, timezone, timedelta
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
    PlayerTitle,
    PlayerScoreHistory,
    PlayerClip,
    ContactAccessGrant,
    RosterOpening,
    Application,
    PlayerWatchlist,
    ActivityEvent,
    Notification,
)


def seed_database(db: Session, force: bool = False):
    """Seeds the database with benchmark entities and portal interconnection data."""
    # Check if organizations exist
    c9_org = db.query(Organization).filter(Organization.slug == "cloud9").first()
    fnatic_org = db.query(Organization).filter(Organization.slug == "fnatic").first()
    navi_org = db.query(Organization).filter(Organization.slug == "navi").first()

    if not c9_org:
        c9_org = Organization(name="Cloud9 Esports", slug="cloud9")
        db.add(c9_org)
    if not fnatic_org:
        fnatic_org = Organization(name="Fnatic", slug="fnatic")
        db.add(fnatic_org)
    if not navi_org:
        navi_org = Organization(name="Natus Vincere", slug="navi")
        db.add(navi_org)
    db.flush()

    # Organiser users
    scout_pwd = get_password_hash("scoutforge123")
    org_analysts = [
        ("analyst@cloud9.gg", "Jack Etienne", c9_org.id),
        ("analyst@fnatic.com", "Sam Mathews", fnatic_org.id),
        ("analyst@navi.gg", "Yevhen Zolotarov", navi_org.id),
    ]
    for email, name, org_id in org_analysts:
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            existing_user.hashed_password = scout_pwd
            existing_user.org_id = org_id
        else:
            db.add(User(
                org_id=org_id,
                email=email,
                hashed_password=scout_pwd,
                full_name=name,
                role="analyst",
            ))
    db.flush()

    # Find or create CS2 Title & Roles
    title = db.query(Title).filter(Title.slug == "cs2").first()
    if not title:
        title = Title(name="Counter-Strike 2", slug="cs2")
        db.add(title)
        db.flush()

    role_names = ["IGL", "Entry", "Support", "Lurker", "AWPer"]
    roles_map = {}
    for r_name in role_names:
        r = db.query(Role).filter(Role.title_id == title.id, Role.name == r_name).first()
        if not r:
            r = Role(title_id=title.id, name=r_name, slug=r_name.lower())
            db.add(r)
            db.flush()
        roles_map[r_name] = r

    # Find or create Team Cloud9
    team_c9 = db.query(Team).filter(Team.slug == "c9-main").first()
    if not team_c9:
        team_c9 = Team(name="Cloud9 Main", slug="c9-main", region="NA", tier="Tier 1", strength_rating=1.2)
        db.add(team_c9)
        db.flush()

    # Find or create Team Fnatic
    team_fnc = db.query(Team).filter(Team.slug == "fnc-main").first()
    if not team_fnc:
        team_fnc = Team(name="Fnatic Main", slug="fnc-main", region="EU", tier="Tier 1", strength_rating=1.1)
        db.add(team_fnc)
        db.flush()

    # Seed Player Demo User & Player Entity: Sam "Vortex" Sharma
    player_user = db.query(User).filter(User.email == "player@scoutforge.gg").first()
    vortex_player = db.query(Player).filter(Player.handle == "Vortex").first()

    if not vortex_player:
        vortex_player = Player(
            external_id="p-vortex-sim-01",
            name="Sam Sharma",
            handle="Vortex",
            role_id=roles_map["IGL"].id,
            team_id=None,
            region="APAC",
            tier="Tier 1",
            source="simulated",
            is_available=True,
            playstyle="Aggressive Entry & Tactical Zone Calling",
            contact_email="sam.vortex.esports@gmail.com",
            contact_phone="+91 98765 43210",
            hours_per_week=38,
            scrim_window_start="18:00",
            scrim_window_end="23:30",
            scrim_timezone="IST",
            playstyle_description="M416 + DBS Frontline Assault & Zone Calling",
            primary_game="Battlegrounds Mobile India",
            availability_status="Open to Offers / Free Agent",
            hardware_specs_json={
                "device": "iPhone 15 Pro Max",
                "headset": "HyperX Cloud II",
                "controls": "4-Finger Claw + Gyroscope Always On",
                "framerate": "90 FPS Ultra Extreme"
            },
            map_pool_json=["Erangel", "Miramar", "Sanhok", "Vikendi"],
            past_experience_json=[
                {"team": "Team SouL Academy", "role": "IGL / Assaulter", "period": "2024 - 2025"},
                {"team": "Reckoning Esports", "role": "Entry Fragger", "period": "2023 - 2024"}
            ],
            expected_compensation="₹80,000 - ₹1,20,000 / month + Prize Pool Share",
            visibility_settings_json={"contact_consent_required": True, "public_profile": True},
        )
        db.add(vortex_player)
        db.flush()

    if not player_user:
        player_pwd = get_password_hash("player123")
        player_user = User(
            org_id=None,
            player_id=vortex_player.id,
            email="player@scoutforge.gg",
            hashed_password=player_pwd,
            full_name='Sam "Vortex" Sharma',
            role="player",
        )
        db.add(player_user)
        db.flush()

    vortex_player.user_id = player_user.id
    player_user.player_id = vortex_player.id

    # Seed Game Titles for Vortex
    existing_titles = {t.title_slug: t for t in db.query(PlayerTitle).filter(PlayerTitle.player_id == vortex_player.id).all()}
    if "cs2" not in existing_titles:
        db.add(PlayerTitle(
            player_id=vortex_player.id,
            title_slug="cs2",
            title_name="Counter-Strike 2",
            in_game_name="Vortex_CS",
            in_game_id="76561198012345678",
            self_reported_rank="Faceit Level 10",
            verification_status="linked",
            stats_json={"kd": 1.28, "adr": 84.5, "hs_rate": "54%"}
        ))
    if "bgmi" not in existing_titles:
        db.add(PlayerTitle(
            player_id=vortex_player.id,
            title_slug="bgmi",
            title_name="Battlegrounds Mobile India",
            in_game_name="TXxVORTEX",
            in_game_id="5123984710",
            self_reported_rank="Conqueror (6,850 Pts)",
            verification_status="self_reported",
            stats_json={"kd": 5.82, "avg_damage": 940, "win_ratio": "38%"}
        ))
    if "valorant" not in existing_titles:
        db.add(PlayerTitle(
            player_id=vortex_player.id,
            title_slug="valorant",
            title_name="Valorant",
            in_game_name="Vortex#APAC",
            in_game_id="Vortex#APAC",
            self_reported_rank="Immortal 3",
            verification_status="self_reported",
            stats_json={"kd": 1.18, "acs": 242, "headshot_pct": "28%"}
        ))

    # Seed 6-Week Trajectory for Vortex
    if db.query(PlayerScoreHistory).filter(PlayerScoreHistory.player_id == vortex_player.id).count() == 0:
        base_time = datetime.now(timezone.utc) - timedelta(weeks=6)
        trajectory_data = [
            ("Week 1", 52.0, 22.0, 74.0, base_time + timedelta(weeks=1)),
            ("Week 2", 53.5, 23.0, 76.5, base_time + timedelta(weeks=2)),
            ("Week 3", 55.0, 24.5, 79.5, base_time + timedelta(weeks=3)),
            ("Week 4", 57.0, 25.0, 82.0, base_time + timedelta(weeks=4)),
            ("Week 5", 59.5, 26.5, 86.0, base_time + timedelta(weeks=5)),
            ("Week 6", 61.0, 27.0, 88.0, base_time + timedelta(weeks=6)),
        ]
        for w_label, c_score, t_score, o_score, rec_dt in trajectory_data:
            db.add(PlayerScoreHistory(
                player_id=vortex_player.id,
                title_id=title.id,
                role_id=roles_map["IGL"].id,
                formula_version="Formula v2.4",
                combat_score=c_score,
                tactical_score=t_score,
                overall_score=o_score,
                week_label=w_label,
                recorded_at=rec_dt,
            ))

    # Seed Gameplay Clip for Vortex
    if db.query(PlayerClip).filter(PlayerClip.player_id == vortex_player.id).count() == 0:
        db.add(PlayerClip(
            player_id=vortex_player.id,
            title="Mirage 4v2 A-Site Execute & Crossfire Call",
            map_name="Mirage",
            file_path="/uploads/sample_mirage_4v2.mp4",
            duration_seconds=38.5,
            tactical_score=28.5,
            verdict="Optimal",
            soundness_reasoning="Flawless man-advantage discipline; called off hunting exit kills and enforced site crossfires.",
        ))

    # Seed Roster Openings for Cloud9, Fnatic, NAVI
    c9_opening = db.query(RosterOpening).filter(RosterOpening.org_id == c9_org.id).first()
    if not c9_opening:
        c9_opening = RosterOpening(
            org_id=c9_org.id,
            title_id=title.id,
            role_id=roles_map["IGL"].id,
            title="Starting IGL - S-Tier International Circuit",
            role_name="In-Game Leader",
            description="Leading Tier 1 international LAN campaigns. Requires high tactical maturity, excellent vocal clarity, and structured mid-round adaptation.",
            min_rank_text="Faceit Level 10 / 2500+ ELO",
            scrim_window="18:00 - 23:30 CET",
            package_text="$4,500/mo + Prize Share + Bootcamp",
            urgency="High",
            status="open",
        )
        db.add(c9_opening)

    fnatic_opening = db.query(RosterOpening).filter(RosterOpening.org_id == fnatic_org.id).first()
    if not fnatic_opening:
        fnatic_opening = RosterOpening(
            org_id=fnatic_org.id,
            title_id=title.id,
            role_id=roles_map["Entry"].id,
            title="Primary Entry Fragger - European Masters",
            role_name="Entry Fragger",
            description="Aggressive site take specialist with exceptional crosshair placement and high opening duel conversion.",
            min_rank_text="Faceit Level 10 / 2300+ ELO",
            scrim_window="17:00 - 22:30 CET",
            package_text="€3,800/mo + Housing Stipend",
            urgency="Medium",
            status="open",
        )
        db.add(fnatic_opening)

    navi_opening = db.query(RosterOpening).filter(RosterOpening.org_id == navi_org.id).first()
    if not navi_opening:
        navi_opening = RosterOpening(
            org_id=navi_org.id,
            title_id=title.id,
            role_id=roles_map["Support"].id,
            title="Support Anchor & Secondary Caller",
            role_name="Support",
            description="Utility mastery, trade setups, and late-round clutch composure for major cycle qualifiers.",
            min_rank_text="Faceit Level 10 / 2200+ ELO",
            scrim_window="18:00 - 23:00 EEST",
            package_text="$3,200/mo + Health Benefits",
            urgency="Low",
            status="open",
        )
        db.add(navi_opening)
    db.flush()

    # Seed Applications at different stages
    if c9_opening:
        app_c9 = db.query(Application).filter(Application.opening_id == c9_opening.id, Application.player_id == vortex_player.id).first()
        if not app_c9:
            db.add(Application(
                opening_id=c9_opening.id,
                player_id=vortex_player.id,
                status="trial",
                source="player_applied",
                cover_note="High-tempo tactical caller with extensive zone and mid-round adaptation experience.",
                reviewer_notes="Analyzed tactical comms; exceptional 28.5/30 audio judge score. Invited to closed scrim trials.",
            ))

    if fnatic_opening:
        app_fnc = db.query(Application).filter(Application.opening_id == fnatic_opening.id, Application.player_id == vortex_player.id).first()
        if not app_fnc:
            db.add(Application(
                opening_id=fnatic_opening.id,
                player_id=vortex_player.id,
                status="shortlisted",
                source="player_applied",
                cover_note="Open to playing aggressive second entry or flex role.",
                reviewer_notes="Matches statistical benchmark; pending VOD review with head coach.",
            ))

    # Seed Contact Grant for Cloud9
    if not db.query(ContactAccessGrant).filter(ContactAccessGrant.player_id == vortex_player.id, ContactAccessGrant.org_id == c9_org.id).first():
        db.add(ContactAccessGrant(
            player_id=vortex_player.id,
            org_id=c9_org.id,
            status="approved",
            granted_via="application",
        ))

    # Seed Activity Events for Vortex's Scouting Timeline
    if db.query(ActivityEvent).filter(ActivityEvent.subject_player_id == vortex_player.id).count() == 0:
        now = datetime.now(timezone.utc)
        timeline_events = [
            ("profile_viewed", "Cloud9 Esports viewed your dossier.", {"org_name": "Cloud9 Esports"}, now - timedelta(days=6)),
            ("shortlisted", "Cloud9 Esports shortlisted you for Starting IGL.", {"org_name": "Cloud9 Esports", "role": "IGL"}, now - timedelta(days=4)),
            ("contact_requested", "Fnatic requested your verified contact information.", {"org_name": "Fnatic"}, now - timedelta(days=3)),
            ("application_status_changed", "Cloud9 Esports advanced your application to 'trial'!", {"org_name": "Cloud9 Esports", "new_status": "trial", "note": "Invited to closed scrim trials on Oct 28."}, now - timedelta(days=1)),
            ("formula_audit", "Formula v2.4 Audit: Combat Telemetry re-evaluated at 61.0/70.", {"version": "v2.4", "delta": "+1.5"}, now - timedelta(hours=4)),
        ]
        for ev_type, msg, payload, ev_dt in timeline_events:
            db.add(ActivityEvent(
                actor_user_id=None,
                org_id=c9_org.id if "Cloud9" in msg else fnatic_org.id,
                subject_player_id=vortex_player.id,
                type=ev_type,
                entity_type="dossier",
                entity_id=str(vortex_player.id),
                payload_json=payload,
                visible_to_player=True,
                created_at=ev_dt,
            ))

    # Seed Notifications for Vortex
    if db.query(Notification).filter(Notification.user_id == player_user.id).count() == 0:
        db.add(Notification(
            user_id=player_user.id,
            type="application_update",
            title="Trial Invitation from Cloud9",
            message="Cloud9 has advanced your application for Starting IGL to 'trial'. Check your timeline for details.",
            payload_json={"org_id": c9_org.id, "status": "trial"},
        ))
        db.add(Notification(
            user_id=player_user.id,
            type="contact_request",
            title="Contact Request from Fnatic",
            message="Fnatic has requested access to your phone and email contact info.",
            payload_json={"org_id": fnatic_org.id},
        ))

    db.commit()
    print("Successfully seeded unified ScoutForge portal data!")
