// Player Portal API Client

import { apiFetch } from './client';

export interface PlayerTitle {
  id: number;
  title_slug: string;
  title_name: string;
  in_game_name: string;
  in_game_id?: string | null;
  self_reported_rank?: string | null;
  verification_status: string;
  stats_json?: Record<string, any> | null;
  created_at: string;
}

export interface PlayerTitleInput {
  title_slug: string;
  title_name: string;
  in_game_name: string;
  in_game_id?: string | null;
  self_reported_rank?: string | null;
  verification_status?: string;
  stats_json?: Record<string, any> | null;
}

export interface TrajectoryPoint {
  id: number;
  week_label: string;
  combat_score: number;
  tactical_score: number;
  overall_score: number;
  recorded_at: string;
}

export interface PlayerClip {
  id: number;
  player_id: number;
  title: string;
  map_name: string;
  file_path: string;
  duration_seconds: number;
  audio_job_id?: number | null;
  tactical_score?: number | null;
  verdict?: string | null;
  soundness_reasoning?: string | null;
  created_at: string;
}

export interface ApplicationItem {
  id: number;
  opening_id: number;
  opening_title?: string | null;
  org_id?: number | null;
  org_name?: string | null;
  player_id: number;
  player_handle?: string | null;
  player_name?: string | null;
  role_name?: string | null;
  status: string;
  source: string;
  cover_note?: string | null;
  reviewer_notes?: string | null;
  combat_score?: number | null;
  tactical_score?: number | null;
  overall_score?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityEventItem {
  id: number;
  type: string;
  entity_type?: string | null;
  entity_id?: string | null;
  payload_json?: Record<string, any> | null;
  visible_to_player: boolean;
  created_at: string;
}

export interface PlayerDossier {
  id: number;
  user_id?: number | null;
  name: string;
  handle: string;
  role: string;
  team_name?: string | null;
  region: string;
  tier: string;
  source: string;
  is_available: boolean;
  avatar_url?: string | null;
  playstyle: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_unlocked: boolean;
  hours_per_week: number;
  scrim_window_start: string;
  scrim_window_end: string;
  scrim_timezone: string;
  playstyle_description?: string | null;
  primary_game: string;
  availability_status: string;
  hardware_specs_json?: Record<string, any> | null;
  map_pool_json?: string[] | null;
  past_experience_json?: any[] | null;
  expected_compensation?: string | null;
  visibility_settings_json?: Record<string, any> | null;
  titles: PlayerTitle[];
  trajectory: TrajectoryPoint[];
  clips: PlayerClip[];
  latest_combat_score: number;
  latest_tactical_score: number;
  latest_overall_score: number;
  inquiries_count: number;
  active_applications_count: number;
}

export interface PlayerDossierUpdateInput {
  name?: string;
  handle?: string;
  region?: string;
  contact_email?: string;
  contact_phone?: string;
  hours_per_week?: number;
  scrim_window_start?: string;
  scrim_window_end?: string;
  scrim_timezone?: string;
  playstyle_description?: string;
  primary_game?: string;
  availability_status?: string;
  hardware_specs_json?: Record<string, any>;
  map_pool_json?: string[];
  past_experience_json?: any[];
  expected_compensation?: string;
  visibility_settings_json?: Record<string, any>;
}

export const playerApi = {
  async getMyDossier(token?: string): Promise<PlayerDossier> {
    return apiFetch<PlayerDossier>('/player/me', {
      method: 'GET',
      token,
    });
  },

  async updateMyDossier(
    updateData: PlayerDossierUpdateInput,
    token?: string
  ): Promise<PlayerDossier> {
    return apiFetch<PlayerDossier>('/player/me', {
      method: 'PUT',
      token,
      body: JSON.stringify(updateData),
    });
  },

  async registerGameTitle(
    titleData: PlayerTitleInput,
    token?: string
  ): Promise<PlayerTitle> {
    return apiFetch<PlayerTitle>('/player/me/titles', {
      method: 'POST',
      token,
      body: JSON.stringify(titleData),
    });
  },

  async getMyClips(token?: string): Promise<PlayerClip[]> {
    return apiFetch<PlayerClip[]>('/player/me/clips', {
      method: 'GET',
      token,
    });
  },

  async uploadClip(
    file: File,
    title: string,
    mapName: string = 'Mirage',
    token?: string
  ): Promise<PlayerClip> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('map_name', mapName);

    return apiFetch<PlayerClip>('/player/me/clips', {
      method: 'POST',
      token,
      isFormData: true,
      body: formData,
    });
  },

  async getMyApplications(token?: string): Promise<ApplicationItem[]> {
    return apiFetch<ApplicationItem[]>('/player/me/applications', {
      method: 'GET',
      token,
    });
  },

  async getMyTrajectory(token?: string): Promise<TrajectoryPoint[]> {
    return apiFetch<TrajectoryPoint[]>('/player/me/trajectory', {
      method: 'GET',
      token,
    });
  },

  async getMyTimeline(token?: string): Promise<ActivityEventItem[]> {
    return apiFetch<ActivityEventItem[]>('/player/me/timeline', {
      method: 'GET',
      token,
    });
  },
};
