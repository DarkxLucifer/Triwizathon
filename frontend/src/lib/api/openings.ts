// Roster Openings & Applications API Client

import { apiFetch } from './client';
import { ApplicationItem } from './player';

export interface RosterOpeningItem {
  id: number;
  org_id: number;
  org_name?: string | null;
  roster_id?: number | null;
  roster_name?: string | null;
  title_id?: number | null;
  title_name?: string | null;
  role_id?: number | null;
  role_name: string;
  title: string;
  description: string;
  min_rank_text: string;
  scrim_window: string;
  package_text: string;
  urgency: string;
  status: string;
  applicants_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOpeningPayload {
  title: string;
  role_name: string;
  game_name?: string;
  description: string;
  min_rank_text: string;
  scrim_window: string;
  package_text: string;
  urgency?: 'Immediate' | 'High' | 'Medium' | 'Low';
  status?: 'open' | 'closed' | 'paused';
  roster_id?: number | null;
  title_id?: number | null;
  role_id?: number | null;
}

export const openingsApi = {
  async createOpening(
    payload: CreateOpeningPayload,
    token?: string
  ): Promise<RosterOpeningItem> {
    return apiFetch<RosterOpeningItem>('/openings', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
  },

  async getOrgApplications(
    options: {
      status?: string;
      openingId?: number;
      token?: string;
    } = {}
  ): Promise<ApplicationItem[]> {
    const params = new URLSearchParams();
    if (options.status) params.set('status', options.status);
    if (options.openingId) params.set('opening_id', String(options.openingId));

    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<ApplicationItem[]>(`/openings/org/applications${qs}`, {
      method: 'GET',
      token: options.token,
    });
  },

  async getOpenings(
    options: {
      role?: string;
      status?: string;
      orgId?: number;
      token?: string;
    } = {}
  ): Promise<RosterOpeningItem[]> {
    const params = new URLSearchParams();
    if (options.role) params.set('role', options.role);
    if (options.status) params.set('status', options.status);
    if (options.orgId) params.set('org_id', String(options.orgId));

    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<RosterOpeningItem[]>(`/openings${qs}`, {
      method: 'GET',
      token: options.token,
    });
  },

  async getOpeningById(id: number, token?: string): Promise<RosterOpeningItem> {
    return apiFetch<RosterOpeningItem>(`/openings/${id}`, {
      method: 'GET',
      token,
    });
  },

  async applyToOpening(
    openingId: number,
    coverNote?: string,
    token?: string
  ): Promise<ApplicationItem> {
    return apiFetch<ApplicationItem>(`/openings/${openingId}/apply`, {
      method: 'POST',
      token,
      body: JSON.stringify({ cover_note: coverNote || '' }),
    });
  },

  async getOpeningApplications(openingId: number, token?: string): Promise<ApplicationItem[]> {
    return apiFetch<ApplicationItem[]>(`/openings/${openingId}/applications`, {
      method: 'GET',
      token,
    });
  },

  async updateApplicationStatus(
    applicationId: number,
    status: string,
    reviewerNotes?: string,
    token?: string
  ): Promise<ApplicationItem> {
    return apiFetch<ApplicationItem>(`/openings/applications/${applicationId}/status`, {
      method: 'PUT',
      token,
      body: JSON.stringify({
        status,
        reviewer_notes: reviewerNotes || '',
      }),
    });
  },
};
