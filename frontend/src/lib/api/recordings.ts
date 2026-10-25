import { apiFetch, getStoredToken } from './client';

export interface RecordingChallenge {
  code: string;
  expires_at: string;
  verified: boolean;
  spoken_at_sec?: number | null;
  match_confidence?: number | null;
}

export interface RecordingTrack {
  id: number;
  track_kind: 'screen' | 'camera';
  mime_type: string;
  width?: number | null;
  height?: number | null;
  fps?: number | null;
  display_surface?: string | null;
  ended_early: boolean;
}

export interface RecordingCheck {
  id: number;
  check_type: string;
  status: 'passed' | 'warning' | 'failed';
  summary: string;
  details_json?: any;
  created_at: string;
}

export interface RecordingShare {
  id: number;
  org_id: number;
  org_name?: string | null;
  shared_at: string;
  revoked_at?: string | null;
  is_active: boolean;
}

export interface RecordingSession {
  id: number;
  user_id: number;
  player_id?: number | null;
  session_token: string;
  mode: 'dual' | 'screen_only';
  status: 'recording' | 'processing' | 'completed' | 'failed' | 'incomplete';
  label: 'live_recorded' | 'uploaded_unverified';
  started_at: string;
  stopped_at?: string | null;
  duration_sec: number;
  total_bytes: number;
  final_screen_path?: string | null;
  final_camera_path?: string | null;
  audio_path?: string | null;
  consent_recorded: boolean;
  retention_until?: string | null;
  created_at: string;
  challenge?: RecordingChallenge | null;
  tracks: RecordingTrack[];
  checks: RecordingCheck[];
  shares: RecordingShare[];
}

export interface ChunkUploadResponse {
  status: string;
  session_id: number;
  track_kind: string;
  chunk_index: number;
  byte_size: number;
  sha256: string;
  is_duplicate: boolean;
}

export interface RecordingFinalizePayload {
  screen_ended_early?: boolean;
  display_surface?: string;
  screen_width?: number;
  screen_height?: number;
  screen_fps?: number;
  camera_width?: number;
  camera_height?: number;
  camera_fps?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const recordingsApi = {
  createSession: (mode: 'dual' | 'screen_only' = 'dual', consentGiven: boolean = true) =>
    apiFetch<RecordingSession>('/recordings/sessions', {
      method: 'POST',
      body: JSON.stringify({ mode, consent_given: consentGiven }),
    }),

  listSessions: () => apiFetch<RecordingSession[]>('/recordings/sessions'),

  getSession: (id: number) => apiFetch<RecordingSession>(`/recordings/sessions/${id}`),

  uploadChunk: async (
    sessionId: number,
    trackKind: 'screen' | 'camera',
    chunkIndex: number,
    sha256: string,
    chunkBlob: Blob
  ) => {
    const formData = new FormData();
    formData.append('track_kind', trackKind);
    formData.append('chunk_index', chunkIndex.toString());
    formData.append('sha256', sha256);
    formData.append('file', chunkBlob, `${trackKind}_${chunkIndex}.chunk`);

    return apiFetch<ChunkUploadResponse>(`/recordings/sessions/${sessionId}/chunks`, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  finalizeSession: (sessionId: number, payload: RecordingFinalizePayload) =>
    apiFetch<RecordingSession>(`/recordings/sessions/${sessionId}/finalize`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  abortSession: (sessionId: number) =>
    apiFetch<RecordingSession>(`/recordings/sessions/${sessionId}/abort`, {
      method: 'POST',
    }),

  deleteSession: (sessionId: number) =>
    apiFetch<void>(`/recordings/sessions/${sessionId}`, {
      method: 'DELETE',
    }),

  shareSession: (sessionId: number, orgId: number) =>
    apiFetch<{ status: string; session_id: number; org_id: number; is_active: boolean; message: string }>(
      `/recordings/sessions/${sessionId}/share`,
      {
        method: 'POST',
        body: JSON.stringify({ org_id: orgId }),
      }
    ),

  revokeSession: (sessionId: number, orgId: number) =>
    apiFetch<{ status: string; session_id: number; org_id: number; is_active: boolean; message: string }>(
      `/recordings/sessions/${sessionId}/revoke`,
      {
        method: 'POST',
        body: JSON.stringify({ org_id: orgId }),
      }
    ),

  getStreamUrl: (sessionId: number, trackKind: 'screen' | 'camera') => {
    const token = getStoredToken();
    return `${API_BASE_URL}/recordings/sessions/${sessionId}/stream/${trackKind}${token ? `?token=${token}` : ''}`;
  },
};
