const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

interface ValidationError {
  msg: string;
}

interface ApiErrorResponse {
  detail: string | ValidationError[];
}

function extractErrorMessage(err: ApiErrorResponse): string {
  if (typeof err.detail === 'string') return err.detail;
  if (Array.isArray(err.detail)) {
    return err.detail
      .map((e) => e.msg.replace(/^Value error,?\s*/i, ''))
      .filter(Boolean)
      .join('. ');
  }
  return 'Request failed';
}

export type NutritionStatus = 'auto_approved' | 'pending_review';

export interface Team {
  id: string;
  name: string;
  sport: string;
  player_count: number;
}

export interface TrainingPlan {
  id: string;
  athlete_id: string;
  week_start: string;
  days: {
    day: string;
    exercises: {name: string; sets: number; reps: number; load: string}[];
    is_rest_day: boolean;
  }[];
}

export interface NutritionRecommendation {
  id: string;
  athlete_id: string;
  status: NutritionStatus;
  summary: string;
  macros: {protein: number; carbs: number; fats: number; calories: number};
}

export interface ReviewQueueItem {
  id: string;
  athlete_name: string;
  flag_reason: string;
  flagged_by_agent: string;
  created_at: string;
  resolved: boolean;
}

export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const isFormBody = init?.body instanceof URLSearchParams;
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(isFormBody ? {} : {'Content-Type': 'application/json'}),
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
      ...init?.headers
    }
  });
  if (!res.ok) {
    const err: ApiErrorResponse = await res.json().catch(() => ({detail: 'Request failed'}));
    throw new Error(extractErrorMessage(err));
  }
  return res.json() as Promise<T>;
}

export class ApiClient {
  static register(data: RegisterPayload) {
    return request<{id: string}>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static login(email: string, password: string) {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    return request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: form
    });
  }

  static googleLogin(idToken: string) {
    return request<AuthTokens>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({id_token: idToken})
    });
  }

  static verifyEmail(token: string) {
    return request<{detail: string}>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({token})
    });
  }

  static resendVerification(email: string) {
    return request<{detail: string}>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({email})
    });
  }

  static forgotPassword(email: string) {
    return request<{detail: string}>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({email})
    });
  }

  static resetPassword(email: string, code: string, newPassword: string) {
    return request<{detail: string}>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({email, code, new_password: newPassword})
    });
  }

  static me() {
    return request<UserProfile>('/auth/me');
  }

  static logout() {
    const refreshToken =
      typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    if (refreshToken) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({refresh_token: refreshToken})
      }).catch(() => {});
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  // --- FE-B owned endpoints ---

  static listTeams() {
    return request<Team[]>('/teams');
  }

  static createTeam(data: {name: string; sport: string}) {
    return request<Team>('/teams', {method: 'POST', body: JSON.stringify(data)});
  }

  static getTrainingPlan(id: string) {
    return request<TrainingPlan>(`/training-plans/${id}`);
  }

  static logTrainingSession(planId: string, data: {day: string; completed: boolean}) {
    return request<{status: string}>(`/training-plans/${planId}/logs`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static getNutrition(id: string) {
    return request<NutritionRecommendation>(`/nutrition/${id}`);
  }

  static getReviewQueue() {
    return request<ReviewQueueItem[]>('/admin/review-queue');
  }

  static updateReviewQueueItem(id: string, data: {resolved: boolean; note?: string}) {
    return request<ReviewQueueItem>(`/admin/review-queue/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
}
