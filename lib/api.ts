const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

interface ApiError {
  detail: string;
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
    const err: ApiError = await res.json().catch(() => ({detail: 'Request failed'}));
    throw new Error(err.detail ?? 'Request failed');
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
