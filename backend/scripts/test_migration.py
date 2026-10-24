import os
import sys
from alembic.config import Config
from alembic import command
import sqlite3

def run_test_migration():
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    test_db_path = os.path.join(backend_dir, "scoutforge_migration_test.db")
    
    print(f"Testing migration on: {test_db_path}")

    # Set DATABASE_URL env var so alembic env.py picks it up directly
    os.environ["DATABASE_URL"] = f"sqlite:///{test_db_path}"

    # Verify initial player count and alembic table
    conn = sqlite3.connect(test_db_path)
    cur = conn.cursor()
    tables = [row[0] for row in cur.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()]
    initial_players = cur.execute("SELECT COUNT(*) FROM players;").fetchone()[0]
    initial_stats = cur.execute("SELECT COUNT(*) FROM player_match_stats;").fetchone()[0]
    print(f"Pre-migration: {initial_players} players, {initial_stats} player match stats.")
    print("Initial tables:", tables)

    has_alembic = "alembic_version" in tables
    conn.close()

    alembic_ini = os.path.join(backend_dir, "alembic.ini")
    alembic_cfg = Config(alembic_ini)
    alembic_cfg.set_main_option("script_location", os.path.join(backend_dir, "alembic"))
    alembic_cfg.set_main_option("sqlalchemy.url", f"sqlite:///{test_db_path}")

    if not has_alembic:
        print("Database not yet stamped with initial schema revision. Stamping d9f2591aed97...")
        command.stamp(alembic_cfg, "d9f2591aed97")
        print("Stamped d9f2591aed97 successfully.")

    # Run upgrade to head
    print("Running alembic upgrade head...")
    command.upgrade(alembic_cfg, "head")
    print("Alembic upgrade succeeded!")

    # Verify tables and columns post-migration
    conn = sqlite3.connect(test_db_path)
    cur = conn.cursor()
    post_tables = [row[0] for row in cur.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()]
    print("Post-migration tables:", post_tables)

    expected_new_tables = [
        "player_titles",
        "player_score_history",
        "player_clips",
        "contact_access_grants",
        "roster_openings",
        "applications",
        "player_watchlists",
        "activity_events",
        "notifications"
    ]
    for table in expected_new_tables:
        assert table in post_tables, f"Expected table '{table}' missing post-migration!"
        print(f"  Verified table: {table}")

    # Verify players count preserved
    post_players = cur.execute("SELECT COUNT(*) FROM players;").fetchone()[0]
    post_stats = cur.execute("SELECT COUNT(*) FROM player_match_stats;").fetchone()[0]
    assert post_players == initial_players, f"Player count mismatch! {post_players} vs {initial_players}"
    assert post_stats == initial_stats, f"Stats count mismatch! {post_stats} vs {initial_stats}"
    print(f"Data preservation confirmed: {post_players} players, {post_stats} stats intact.")

    # Check new columns in players
    player_cols = [col[1] for col in cur.execute("PRAGMA table_info(players);").fetchall()]
    assert "contact_email" in player_cols, "contact_email missing from players table!"
    assert "hours_per_week" in player_cols, "hours_per_week missing from players table!"
    assert "scrim_window_start" in player_cols, "scrim_window_start missing from players table!"
    print("Verified new columns in players table.")

    conn.close()
    print("\n>>> MIGRATION TEST PASSED CLEANLY WITH ZERO DATA LOSS! <<<")

if __name__ == "__main__":
    run_test_migration()
