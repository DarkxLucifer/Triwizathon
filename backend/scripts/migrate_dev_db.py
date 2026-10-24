import os
import sqlite3
from alembic.config import Config
from alembic import command

def migrate_dev():
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    db_path = os.path.join(backend_dir, "scoutforge.db")
    print(f"Migrating dev DB: {db_path}")

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()]
    initial_players = cur.execute("SELECT COUNT(*) FROM players;").fetchone()[0]
    initial_stats = cur.execute("SELECT COUNT(*) FROM player_match_stats;").fetchone()[0]
    has_alembic = "alembic_version" in tables
    conn.close()

    alembic_ini = os.path.join(backend_dir, "alembic.ini")
    alembic_cfg = Config(alembic_ini)
    alembic_cfg.set_main_option("script_location", os.path.join(backend_dir, "alembic"))
    os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"

    if not has_alembic:
        print("Stamping initial revision d9f2591aed97...")
        command.stamp(alembic_cfg, "d9f2591aed97")

    print("Upgrading dev DB to head...")
    command.upgrade(alembic_cfg, "head")
    print("Dev DB upgrade complete!")

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    post_players = cur.execute("SELECT COUNT(*) FROM players;").fetchone()[0]
    post_stats = cur.execute("SELECT COUNT(*) FROM player_match_stats;").fetchone()[0]
    assert post_players == initial_players, f"Data loss in players! {post_players} vs {initial_players}"
    assert post_stats == initial_stats, f"Data loss in stats! {post_stats} vs {initial_stats}"
    conn.close()
    print(f"Dev DB verified intact: {post_players} players, {post_stats} stats.")

if __name__ == "__main__":
    migrate_dev()
