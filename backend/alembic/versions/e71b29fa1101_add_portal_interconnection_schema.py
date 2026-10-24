"""add_portal_interconnection_schema

Revision ID: e71b29fa1101
Revises: d9f2591aed97
Create Date: 2026-10-25 01:58:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e71b29fa1101'
down_revision: Union[str, Sequence[str], None] = 'd9f2591aed97'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Alter users table
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('player_id', sa.Integer(), nullable=True))
        batch_op.alter_column('org_id', existing_type=sa.Integer(), nullable=True)
        batch_op.create_foreign_key('fk_users_player_id', 'players', ['player_id'], ['id'], ondelete='SET NULL')
        batch_op.create_index(batch_op.f('ix_users_player_id'), ['player_id'], unique=False)

    # 2. Alter players table
    with op.batch_alter_table('players', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('contact_email', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('contact_phone', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('hours_per_week', sa.Integer(), server_default='30', nullable=False))
        batch_op.add_column(sa.Column('scrim_window_start', sa.String(length=20), server_default='18:00', nullable=False))
        batch_op.add_column(sa.Column('scrim_window_end', sa.String(length=20), server_default='23:30', nullable=False))
        batch_op.add_column(sa.Column('scrim_timezone', sa.String(length=20), server_default='UTC', nullable=False))
        batch_op.add_column(sa.Column('playstyle_description', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('primary_game', sa.String(length=50), server_default='Counter-Strike 2', nullable=False))
        batch_op.add_column(sa.Column('availability_status', sa.String(length=50), server_default='Open to Offers', nullable=False))
        batch_op.add_column(sa.Column('hardware_specs_json', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('map_pool_json', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('past_experience_json', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('expected_compensation', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('visibility_settings_json', sa.JSON(), nullable=True))
        batch_op.create_foreign_key('fk_players_user_id', 'users', ['user_id'], ['id'], ondelete='SET NULL')

    # 3. Create player_titles
    op.create_table('player_titles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('player_id', sa.Integer(), nullable=False),
        sa.Column('title_slug', sa.String(length=50), nullable=False),
        sa.Column('title_name', sa.String(length=100), nullable=False),
        sa.Column('in_game_name', sa.String(length=100), nullable=False),
        sa.Column('in_game_id', sa.String(length=100), nullable=True),
        sa.Column('self_reported_rank', sa.String(length=50), nullable=True),
        sa.Column('verification_status', sa.String(length=30), server_default='self_reported', nullable=False),
        sa.Column('stats_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['player_id'], ['players.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_player_titles_id'), 'player_titles', ['id'], unique=False)
    op.create_index(op.f('ix_player_titles_player_id'), 'player_titles', ['player_id'], unique=False)

    # 4. Create player_score_history
    op.create_table('player_score_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('player_id', sa.Integer(), nullable=False),
        sa.Column('title_id', sa.Integer(), nullable=True),
        sa.Column('role_id', sa.Integer(), nullable=True),
        sa.Column('formula_version', sa.String(length=50), server_default='Formula v2.4', nullable=False),
        sa.Column('combat_score', sa.Float(), nullable=False),
        sa.Column('tactical_score', sa.Float(), nullable=False),
        sa.Column('overall_score', sa.Float(), nullable=False),
        sa.Column('breakdown_json', sa.JSON(), nullable=True),
        sa.Column('week_label', sa.String(length=20), nullable=False),
        sa.Column('recorded_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['player_id'], ['players.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['title_id'], ['titles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_player_score_history_id'), 'player_score_history', ['id'], unique=False)
    op.create_index(op.f('ix_player_score_history_player_id'), 'player_score_history', ['player_id'], unique=False)

    # 5. Create player_clips
    op.create_table('player_clips',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('player_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('map_name', sa.String(length=100), nullable=False),
        sa.Column('file_path', sa.String(length=255), nullable=False),
        sa.Column('duration_seconds', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('audio_job_id', sa.Integer(), nullable=True),
        sa.Column('tactical_score', sa.Float(), nullable=True),
        sa.Column('verdict', sa.String(length=50), nullable=True),
        sa.Column('soundness_reasoning', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['audio_job_id'], ['audio_jobs.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['player_id'], ['players.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_player_clips_id'), 'player_clips', ['id'], unique=False)
    op.create_index(op.f('ix_player_clips_player_id'), 'player_clips', ['player_id'], unique=False)

    # 6. Create contact_access_grants
    op.create_table('contact_access_grants',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('player_id', sa.Integer(), nullable=False),
        sa.Column('org_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=30), server_default='pending', nullable=False),
        sa.Column('granted_via', sa.String(length=30), server_default='request', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['player_id'], ['players.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_contact_access_grants_id'), 'contact_access_grants', ['id'], unique=False)
    op.create_index(op.f('ix_contact_access_grants_org_id'), 'contact_access_grants', ['org_id'], unique=False)
    op.create_index(op.f('ix_contact_access_grants_player_id'), 'contact_access_grants', ['player_id'], unique=False)

    # 7. Create roster_openings
    op.create_table('roster_openings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('org_id', sa.Integer(), nullable=False),
        sa.Column('roster_id', sa.Integer(), nullable=True),
        sa.Column('title_id', sa.Integer(), nullable=True),
        sa.Column('role_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('role_name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('min_rank_text', sa.String(length=100), nullable=False),
        sa.Column('scrim_window', sa.String(length=100), nullable=False),
        sa.Column('package_text', sa.String(length=100), nullable=False),
        sa.Column('urgency', sa.String(length=20), server_default='Medium', nullable=False),
        sa.Column('status', sa.String(length=20), server_default='open', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['roster_id'], ['rosters.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['title_id'], ['titles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_roster_openings_id'), 'roster_openings', ['id'], unique=False)
    op.create_index(op.f('ix_roster_openings_org_id'), 'roster_openings', ['org_id'], unique=False)

    # 8. Create applications
    op.create_table('applications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('opening_id', sa.Integer(), nullable=False),
        sa.Column('player_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=30), server_default='applied', nullable=False),
        sa.Column('source', sa.String(length=30), server_default='player_applied', nullable=False),
        sa.Column('cover_note', sa.Text(), nullable=True),
        sa.Column('reviewer_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['opening_id'], ['roster_openings.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['player_id'], ['players.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_applications_id'), 'applications', ['id'], unique=False)
    op.create_index(op.f('ix_applications_opening_id'), 'applications', ['opening_id'], unique=False)
    op.create_index(op.f('ix_applications_player_id'), 'applications', ['player_id'], unique=False)

    # 9. Create player_watchlists
    op.create_table('player_watchlists',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('org_id', sa.Integer(), nullable=False),
        sa.Column('player_id', sa.Integer(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['player_id'], ['players.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_player_watchlists_id'), 'player_watchlists', ['id'], unique=False)
    op.create_index(op.f('ix_player_watchlists_org_id'), 'player_watchlists', ['org_id'], unique=False)
    op.create_index(op.f('ix_player_watchlists_player_id'), 'player_watchlists', ['player_id'], unique=False)

    # 10. Create activity_events
    op.create_table('activity_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('actor_user_id', sa.Integer(), nullable=True),
        sa.Column('org_id', sa.Integer(), nullable=True),
        sa.Column('subject_player_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=True),
        sa.Column('entity_id', sa.String(length=50), nullable=True),
        sa.Column('payload_json', sa.JSON(), nullable=True),
        sa.Column('visible_to_player', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['actor_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['subject_player_id'], ['players.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_activity_events_id'), 'activity_events', ['id'], unique=False)
    op.create_index(op.f('ix_activity_events_subject_player_id'), 'activity_events', ['subject_player_id'], unique=False)

    # 11. Create notifications
    op.create_table('notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('payload_json', sa.JSON(), nullable=True),
        sa.Column('read_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'], unique=False)
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_table('notifications')
    op.drop_table('activity_events')
    op.drop_table('player_watchlists')
    op.drop_table('applications')
    op.drop_table('roster_openings')
    op.drop_table('contact_access_grants')
    op.drop_table('player_clips')
    op.drop_table('player_score_history')
    op.drop_table('player_titles')
    
    with op.batch_alter_table('players', schema=None) as batch_op:
        batch_op.drop_column('visibility_settings_json')
        batch_op.drop_column('expected_compensation')
        batch_op.drop_column('past_experience_json')
        batch_op.drop_column('map_pool_json')
        batch_op.drop_column('hardware_specs_json')
        batch_op.drop_column('availability_status')
        batch_op.drop_column('primary_game')
        batch_op.drop_column('playstyle_description')
        batch_op.drop_column('scrim_timezone')
        batch_op.drop_column('scrim_window_end')
        batch_op.drop_column('scrim_window_start')
        batch_op.drop_column('hours_per_week')
        batch_op.drop_column('contact_phone')
        batch_op.drop_column('contact_email')
        batch_op.drop_column('user_id')

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('player_id')
