// Authentication API Client

import { apiFetch } from './client';

export interface UserSummary {
  id: number;
  email: string;
  full_name: string;
  role: string;
  org_id?: number | null;
  org_name?: string | null;
  player_id?: number | null;
  active_context: string;
  available_contexts: string[];
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserSummary;
}

export interface UserMeResponse {
  user: UserSummary;
  player_summary?: {
    id: number;
    handle: string;
    name: string;
    role: string;
    primary_game: string;
    avatar_url?: string | null;
  } | null;
  organization_summary?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  unread_notifications_count: number;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role: 'player' | 'organiser';
  org_name?: string;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getMe(token?: string): Promise<UserMeResponse> {
    return apiFetch<UserMeResponse>('/auth/me', {
      method: 'GET',
      token,
    });
  },

  async switchContext(
    targetContext: string,
    targetOrgId?: number,
    token?: string
  ): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/switch-context', {
      method: 'POST',
      token,
      body: JSON.stringify({
        target_context: targetContext,
        target_org_id: targetOrgId,
      }),
    });
  },
};
