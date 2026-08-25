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

export type NutritionStatus =
  'pending_review' | 'approved' | 'flagged' | 'rejected' | 'auto_approved';

export type InjuryRiskLevel = 'low' | 'medium' | 'high';

export interface TeamPlayer {
  id: string;
  full_name: string;
  injury_risk: InjuryRiskLevel;
  last_session_at: string | null;
}

export interface Team {
  id: string;
  name: string;
  sport: string;
  players: TeamPlayer[];
}

// SessionStatus intentionally removed - the backend has no per-day
// complete/skipped/pending state (see TrainingSessionLog below).

export type PlanStatus = 'draft' | 'active' | 'completed' | 'archived' | 'paused';

export interface ExerciseRef {
  id: string;
  name_en: string;
  name_ar: string;
  difficulty: string | null;
  demo_video_url: string | null;
}

/** Matches TrainingPlanExerciseOut exactly - one row per assigned exercise,
 * grouped client-side by day_of_week (0 = Monday .. 6 = Sunday). There is no
 * per-day completion status on the backend; progress is tracked separately
 * via TrainingSessionLog (see logTrainingSession). */
export interface TrainingPlanExercise {
  id: string;
  day_of_week: number;
  sets: number | null;
  reps: number | null;
  load_kg: number | null;
  rest_seconds: number | null;
  sequence_order: number;
  exercise: ExerciseRef;
}

export interface TrainingPlan {
  id: string;
  athlete_user_id: string;
  title: string;
  status: PlanStatus;
  start_date: string | null;
  end_date: string | null;
  weekly_structure: Record<string, unknown> | null;
  exercises: TrainingPlanExercise[];
}

export interface TrainingSessionLog {
  id: string;
  training_plan_id: string;
  athlete_user_id: string;
  completed_at: string;
  day_of_week: number | null;
  perceived_exertion: number | null;
  notes: string | null;
}

/** Matches NutritionRecommendationOut exactly - the agent returns free-text
 * guidance (Arabic + optional English), not a macro breakdown. */
export interface NutritionRecommendation {
  id: string;
  athlete_user_id: string;
  recommendation_ar: string;
  recommendation_en: string | null;
  considers_conditions: number[] | null;
  status: NutritionStatus;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export type AgentType =
  'supervisor' | 'biomechanics' | 'programming' | 'nutrition_medical' | 'biometric_profiling';

export type AgentRunStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'needs_human_review';

export type InjurySeverity = 'none' | 'low' | 'moderate' | 'high' | 'critical';

export interface ReviewQueueItem {
  id: string;
  agent_run_id: string;
  agent_type: AgentType;
  agent_run_status: AgentRunStatus;
  athlete_user_id: string;
  reason: string;
  severity: InjurySeverity;
  assigned_to_user_id: string | null;
  resolved: boolean;
  resolution_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  nutrition_recommendation_id: string | null;
}

export interface ReviewQueuePatchResult {
  id: string;
  resolved: boolean;
  resolution_notes: string | null;
  resolved_at: string | null;
  assigned_to_user_id: string | null;
  nutrition_recommendation_id: string | null;
  nutrition_recommendation_status: string | null;
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

// --- Athlete profile / onboarding ---

export type AthleteGender = 'male' | 'female' | 'unspecified';

export interface AthleteProfile {
  user_id: string;
  date_of_birth: string | null;
  gender: AthleteGender;
  height_cm: number | null;
  weight_kg: number | null;
  dominant_sport: VideoSport | null;
  fitness_level: string | null;
  updated_at: string;
}

export interface AthleteProfileInput {
  date_of_birth?: string | null;
  gender?: AthleteGender;
  height_cm?: number | null;
  weight_kg?: number | null;
  dominant_sport?: VideoSport | null;
  fitness_level?: string | null;
}

export interface MedicalConditionCatalogItem {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
  risk_notes: string | null;
}

export interface AthleteMedicalCondition {
  medical_condition_id: number;
  diagnosed_at: string | null;
  notes: string | null;
  verified_by_professional: boolean;
  condition: MedicalConditionCatalogItem;
}

export interface BodyMetricEntry {
  id: string;
  recorded_at: string;
  height_cm: number | null;
  weight_kg: number | null;
  bmi: number | null;
  notes: string | null;
}

export interface Injury {
  id: string;
  body_part: string;
  description: string | null;
  severity: InjurySeverity;
  occurred_at: string | null;
  recovered_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface BiometricProfile {
  id: string;
  measured_at: string;
  recommended_sport: VideoSport | null;
  confidence_score: number | null;
  notes: string | null;
}

// --- Video upload & biomechanics pipeline (AI integration M1/M4) ---

// Scope for now: gym + football only (M4). The backend's SportCategory enum
// has more values (basketball, athletics, other) for other parts of the
// product, but the analysis pipeline only covers these two.
export type VideoSport = 'gym' | 'football';

export type GymExercise =
  'squat' | 'deadlift' | 'bench_press' | 'push_up' | 'shoulder_press' | 'lat_pulldown';

export type FootballExercise = 'landing';

export type VideoExercise = GymExercise | FootballExercise;

/** `view` mirrors the backend's VIEW_GUIDANCE (app/ai/cv_pipeline/constants.py)
 * word-for-word - shown to the athlete before they film, since a wrong-angle
 * video completes with the analysis skipped rather than failing outright. */
export const GYM_EXERCISES: {value: GymExercise; label: string; view: string}[] = [
  {value: 'squat', label: 'Squat', view: 'Film from the side, with your whole body in frame.'},
  {
    value: 'deadlift',
    label: 'Deadlift',
    view: 'Film from the side, with your whole body in frame.'
  },
  {
    value: 'bench_press',
    label: 'Bench Press',
    view: 'Film from the side, with your whole body in frame.'
  },
  {value: 'push_up', label: 'Push-up', view: 'Film from the side, with your whole body in frame.'},
  {
    value: 'shoulder_press',
    label: 'Shoulder Press',
    view: 'Film from a diagonal angle (roughly 45 degrees), with your whole body in frame.'
  },
  {
    value: 'lat_pulldown',
    label: 'Lat Pulldown',
    view: 'Film from a diagonal angle (roughly 45 degrees), with your whole body in frame.'
  }
];

export const FOOTBALL_EXERCISES: {value: FootballExercise; label: string; view: string}[] = [
  {
    value: 'landing',
    label: 'Jump Landing',
    view: 'Film from the side, with the full jump-landing motion in frame.'
  }
];

/** Self-hosted correct-form GIFs under /public/exercise-gifs, one per gym exercise. */
export function exerciseGifUrl(exercise: VideoExercise | null | undefined): string | null {
  if (!exercise) return null;
  return GYM_EXERCISES.some((e) => e.value === exercise) ? `/exercise-gifs/${exercise}.gif` : null;
}

// Backend serializes Python str-enums by VALUE (lowercase), not member name.
export type VideoStatus = 'uploaded' | 'queued' | 'processing' | 'completed' | 'failed';

export interface VideoUploadResult {
  analysis_id: string;
  status: VideoStatus;
  message: string;
}

export interface VideoListItem {
  id: string;
  original_filename: string | null;
  sport: VideoSport;
  exercise: VideoExercise | null;
  status: VideoStatus;
  duration_seconds: number | null;
  failure_reason: string | null;
  created_at: string;
  headline: string | null;
  rep_count: number | null;
  passed: number | null;
  failed: number | null;
  flags: string[] | null;
  /** False when a completed video measured nothing (0 reps / wrong view).
   * null while processing or on outright failure. */
  assessable: boolean | null;
}

export interface VideoStatusOut {
  analysis_id: string;
  status: VideoStatus;
  failure_reason: string | null;
  has_report: boolean;
}

export type CheckOutcome = 'pass' | 'fail' | 'not_assessable';
export type CheckSeverity = 'info' | 'warn' | 'risk';

export interface EvidenceClaim {
  direction: 'supports' | 'contradicts';
  finding: string;
}

/** What a check set is allowed to claim, and the state of the literature
 * behind it. Served from the rules YAML, where it used to be a comment
 * nobody outside the repo could see. */
export interface Evidence {
  claim_level: string;
  headline: string;
  detail: string;
  calibration: string | null;
  literature: EvidenceClaim[];
  limitations: string[];
}

export interface TrackingQuality {
  reliable: boolean;
  bone_length_cv: number | null;
  shape_ratio: number | null;
  discontinuity_rate: number | null;
  reasons: string[];
}

export interface CheckResult {
  check_id: string;
  /** Human-readable check name, e.g. "excessive torso lean". */
  label: string;
  feature: string;
  outcome: CheckOutcome;
  severity: CheckSeverity;
  value: number | null;
  threshold: number | null;
  op: '<=' | '>=';
  unit: string | null;
  message: string | null;
  /** One sentence for PASS as well as fail - `message` is null on a pass. */
  plain: string;
  evidence_image: string | null;
  /** Corrected-pose overlay. Only present for failed checks whose geometry
   * could be solved honestly (never for range_-based checks). */
  correction_image: string | null;
  /** The same correction as coordinates. Present whenever correction_image is.
   * Preferred over the baked JPEG: drawing both skeletons on a neutral canvas
   * stays readable on busy footage, where the overlay does not. */
  correction_pose: CorrectionPose | null;
}

export interface PosePoint {
  name: string;
  x: number;
  y: number;
}

export interface CorrectionPose {
  frame_index: number;
  /** Names of the joints this check judged - draw these emphasised. */
  highlight: string[];
  summary: string | null;
  /** Indexed by COCO-17 keypoint order. null = never detected, so skip any
   * bone touching it rather than drawing to the origin. */
  actual: (PosePoint | null)[];
  target: (PosePoint | null)[];
}

export interface PoseKeypoint {
  name: string;
  x: number;
  y: number;
  confidence: number;
}

export interface PoseFrame {
  frame_index: number;
  timestamp_ms: number;
  keypoints: PoseKeypoint[];
  joint_angles: Record<string, number> | null;
}

export interface RepWindow {
  index: number;
  window_start_frame: number;
  window_end_frame: number;
  failed_checks: string[];
}

export interface PoseSequence {
  video_session_id: string;
  fps: number;
  width: number | null;
  height: number | null;
  /** Bone list as index pairs into keypoint_names. */
  skeleton: [number, number][];
  keypoint_names: string[];
  frames: PoseFrame[];
  reps: RepWindow[];
}

export interface LabelledMetric {
  key: string;
  label: string;
  unit: string | null;
  value: number;
}

export interface FocusItem {
  check_id: string;
  label: string;
  severity: CheckSeverity;
  reps_affected: number;
  of_reps: number;
  message: string | null;
}

export interface Coaching {
  what_went_well: string[];
  focus_on: FocusItem[];
  next_session_cue: string;
}

export interface RepBlock {
  index: number;
  /** Frame bounds of the corrected rep window, on the pose-sequence timeline. */
  window_start_frame: number | null;
  window_end_frame: number | null;
  checks: CheckResult[];
  metrics: Record<string, number>;
  /** Same numbers carrying their own display names, so the UI never has to
   * guess what "range_angle_torso_incline" means. */
  labelled_metrics: LabelledMetric[];
}

export interface AnalysisReport {
  report_schema_version: number;
  job_id: string;
  created_at: string;
  video_session_id: string;
  exercise: VideoExercise | null;
  input: {
    domain: string;
    category: string;
    view: {expected: string | null; measured: string | null; ratio: number | null};
    flags: string[];
    /** Why nothing was measured, when nothing was measured. "wrong_view" and
     * "unreliable_tracking" call for different re-record advice. */
    skip_reason: string | null;
    tracking: TrackingQuality | null;
    evidence: Evidence | null;
  };
  segmentation: {mode: string; count: number};
  summary: {
    /** False when nothing was measured (0 reps, wrong view, all checks NaN).
     * Branch on this, never on "0 failures". */
    assessable: boolean;
    total_checks: number;
    passed: number;
    failed: number;
    not_assessable: number;
    severity_counts: Record<string, number>;
    headline: string;
  };
  coaching: Coaching;
  /** Folded in from the stored analysis so one call renders the page. */
  coach_message_en: string | null;
  coach_message_ar: string | null;
  technique_score: number | null;
  reps: RepBlock[];
}

// --- Injury-risk screening -------------------------------------------------

export interface RiskFactor {
  key: string;
  label: string;
  points: number;
  detail: string;
  evidence: Record<string, unknown>;
}

export interface RiskAssessment {
  available: boolean;
  score: number | null;
  band: 'low' | 'moderate' | 'elevated' | null;
  factors: RiskFactor[];
  note: string;
  disclaimer: string;
}

export interface Milestone {
  key: string;
  label: string;
  description: string;
  achieved_on: string;
}

export interface WeeklyActivity {
  week_start: string;
  active_days: number;
  in_progress: boolean;
}

export interface Streaks {
  current_streak: number;
  longest_streak: number;
  active_days_last_7: number;
  active_days_last_30: number;
  total_active_days: number;
  weekly: WeeklyActivity[];
  milestones: Milestone[];
  /** Echoed back so a surprising streak is explainable. */
  timezone: string;
  /** False means the streak is still alive but today hasn't counted yet. */
  trained_today: boolean;
}

export interface ComparisonSession {
  analysis_session_id: string;
  video_session_id: string;
  date: string;
  rep_count: number;
  passed: number;
  failed: number;
  pass_rate: number | null;
  headline: string | null;
  metrics: Record<string, number>;
}

export interface ComparisonDelta {
  key: string;
  label: string;
  unit: string | null;
  current: number;
  previous: number;
  best: number | null;
  change: number;
  direction: TrendDirection;
  /** False when no rule governs this metric. Never colour those green - it
   * would be asserting a direction nobody has defined. */
  has_polarity: boolean;
}

export interface SessionComparison {
  available: boolean;
  exercise: string;
  note: string | null;
  /** Oldest first, ready to plot. */
  sessions: ComparisonSession[];
  current?: ComparisonSession | null;
  previous?: ComparisonSession | null;
  best?: ComparisonSession | null;
  is_personal_best?: boolean;
  deltas: ComparisonDelta[];
}

export type ReadinessVerdict = 'train' | 'modify' | 'rest';

export interface ReadinessReason {
  key: string;
  verdict: ReadinessVerdict;
  text: string;
  evidence: Record<string, unknown>;
}

export interface Readiness {
  available: boolean;
  verdict: ReadinessVerdict | null;
  headline: string;
  /** Worst-first: reasons[0] is the one that decided the verdict. */
  reasons: ReadinessReason[];
  /** Signals the verdict actually read. */
  inputs_used: string[];
  /** Signals it could not read. Shown so "unknown" never reads as "fine". */
  inputs_missing: string[];
  risk_score: number | null;
  disclaimer: string;
}

export interface CoachMessage {
  message_en: string | null;
  message_ar: string | null;
  in_scope: boolean;
}

export type TrendDirection = 'improving' | 'regressing' | 'stable' | 'neutral';

export interface MetricTrend {
  sessions: number;
  first: number;
  latest: number;
  slope_per_week: number;
  direction: TrendDirection;
}

/** {available: false, note} before a 2nd session exists for this exercise,
 * otherwise a flat {metric_name: MetricTrend} map - matches the backend's
 * TrendService output shape exactly (no wrapper object). */
export type TrendsResult = {available: false; note: string} | Record<string, MetricTrend>;

export type AppNotificationChannel = 'push' | 'email' | 'sms' | 'in_app';

export interface NotificationItem {
  id: string;
  channel: AppNotificationChannel;
  title: string;
  body: string | null;
  is_read: boolean;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string;
}

// Refresh tokens rotate server-side on every use, so concurrent 401s must
// share one in-flight refresh instead of each spending the same refresh_token.
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({refresh_token: refreshToken})
    });
    if (!res.ok) return false;
    const tokens: AuthTokens = await res.json();
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
  isRetry = false,
  skipAuthRedirect = false
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const isFormBody = init?.body instanceof URLSearchParams || init?.body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(isFormBody ? {} : {'Content-Type': 'application/json'}),
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
      ...init?.headers
    }
  });
  if (res.status === 401 && !isRetry && path !== '/auth/refresh' && path !== '/auth/login') {
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
    if (await refreshPromise) {
      return request<T>(path, init, true, skipAuthRedirect);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // /auth/me is polled from every page (including public marketing pages)
      // just to probe whether someone is logged in - a 401 there simply means
      // "anonymous visitor", not "your session died", so it must never force
      // a redirect away from whatever public page they're looking at.
      if (!skipAuthRedirect && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }
  if (!res.ok) {
    const err: ApiErrorResponse = await res.json().catch(() => ({detail: 'Request failed'}));
    throw new Error(extractErrorMessage(err));
  }
  // 204 No Content (e.g. DELETE endpoints) has no body - res.json() throws
  // "Unexpected end of JSON input" if called on it.
  if (res.status === 204) return undefined as T;
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
    return request<UserProfile>('/auth/me', undefined, false, true);
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

  // --- Athlete profile / onboarding ---

  static getMyProfile() {
    return request<AthleteProfile>('/athletes/me/profile');
  }

  static createMyProfile(data: AthleteProfileInput) {
    return request<AthleteProfile>('/athletes/me/profile', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static updateMyProfile(data: AthleteProfileInput) {
    return request<AthleteProfile>('/athletes/me/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  static listMedicalConditionsCatalog() {
    return request<MedicalConditionCatalogItem[]>('/athletes/medical-conditions');
  }

  static listMyMedicalConditions() {
    return request<AthleteMedicalCondition[]>('/athletes/me/medical-conditions');
  }

  static addMyMedicalCondition(data: {
    medical_condition_code: string;
    diagnosed_at?: string | null;
    notes?: string | null;
  }) {
    return request<AthleteMedicalCondition>('/athletes/me/medical-conditions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static removeMyMedicalCondition(conditionId: number) {
    return request<void>(`/athletes/me/medical-conditions/${conditionId}`, {method: 'DELETE'});
  }

  static recordMyBodyMetrics(data: {height_cm?: number; weight_kg?: number; notes?: string}) {
    return request<BodyMetricEntry>('/athletes/me/body-metrics', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static listMyBodyMetrics() {
    return request<BodyMetricEntry[]>('/athletes/me/body-metrics');
  }

  static addMyInjury(data: {
    body_part: string;
    description?: string;
    severity?: InjurySeverity;
    occurred_at?: string;
    recovered_at?: string;
    notes?: string;
  }) {
    return request<Injury>('/athletes/me/injuries', {method: 'POST', body: JSON.stringify(data)});
  }

  static listMyInjuries() {
    return request<Injury[]>('/athletes/me/injuries');
  }

  static updateMyInjury(
    injuryId: string,
    data: {
      description?: string;
      severity?: InjurySeverity;
      recovered_at?: string | null;
      notes?: string;
    }
  ) {
    return request<Injury>(`/athletes/me/injuries/${injuryId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  static getInjuryRisk() {
    return request<RiskAssessment>('/athletes/me/injury-risk');
  }

  /** "Should I train today?" - works with no wearable connected. */
  static getReadiness() {
    return request<Readiness>('/athletes/me/readiness');
  }

  /** This session vs previous vs personal best, for one exercise. */
  static getSessionComparison(exercise: string) {
    return request<SessionComparison>(`/athletes/me/comparison/${exercise}`);
  }

  /** Exercises this athlete actually has sessions for. */
  static listMyExercises() {
    return request<string[]>('/athletes/me/exercises');
  }

  /** Streaks are a question about the athlete's local calendar day, so the
   * browser's timezone is passed rather than assuming UTC. */
  static getStreaks() {
    const tz =
      typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined;
    return request<Streaks>(`/athletes/me/streaks${tz ? `?tz=${encodeURIComponent(tz)}` : ''}`);
  }

  static generateSportSuggestion() {
    return request<BiometricProfile>('/athletes/me/sport-suggestion', {method: 'POST'});
  }

  static listSportSuggestions() {
    return request<BiometricProfile[]>('/athletes/me/sport-suggestion');
  }

  // --- FE-B owned endpoints ---

  static listTeams() {
    return request<Team[]>('/teams');
  }

  static createTeam(data: {name: string; sport: string}) {
    return request<Team>('/teams', {method: 'POST', body: JSON.stringify(data)});
  }

  /** Real LLM call under the hood - can take several seconds. Always
   * returns a DRAFT plan; there's no activation step yet. */
  static generateTrainingPlan(sport: VideoSport) {
    return request<TrainingPlan>('/training-plans/generate', {
      method: 'POST',
      body: JSON.stringify({sport})
    });
  }

  static listTrainingPlans() {
    return request<TrainingPlan[]>('/training-plans');
  }

  /** Server-side source of truth for "my plan" - replaces remembering an id
   * in localStorage, which lost the plan on logout or in another browser. */
  static getCurrentTrainingPlan() {
    return request<TrainingPlan | null>('/training-plans/current');
  }

  static getTrainingPlan(id: string) {
    return request<TrainingPlan>(`/training-plans/${id}`);
  }

  /** athlete_user_id is derived server-side from the auth token, not sent
   * here - the backend rejects (and would previously have trusted) a
   * client-supplied id. */
  static logTrainingSession(
    planId: string,
    data: {day_of_week?: number; perceived_exertion?: number; notes?: string}
  ) {
    return request<TrainingSessionLog>(`/training-plans/${planId}/logs`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static listTrainingSessionLogs(planId: string) {
    return request<TrainingSessionLog[]>(`/training-plans/${planId}/logs`);
  }

  /** Real LLM call under the hood. sport only narrows the RAG literature
   * search - omit it to let the agent use the athlete's own history. */
  static generateNutrition(sport?: VideoSport) {
    return request<NutritionRecommendation>('/nutrition/generate', {
      method: 'POST',
      body: JSON.stringify(sport ? {sport} : {})
    });
  }

  static listNutrition() {
    return request<NutritionRecommendation[]>('/nutrition');
  }

  static getCurrentNutrition() {
    return request<NutritionRecommendation | null>('/nutrition/current');
  }

  static getNutrition(id: string) {
    return request<NutritionRecommendation>(`/nutrition/${id}`);
  }

  static getReviewQueue(resolved: boolean) {
    return request<ReviewQueueItem[]>(`/admin/review-queue?resolved=${resolved}`);
  }

  static resolveReviewQueueItem(id: string, data: {approve: boolean; resolution_notes?: string}) {
    return request<ReviewQueuePatchResult>(`/admin/review-queue/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // --- Video upload & biomechanics pipeline ---

  static uploadVideo(sport: VideoSport, file: File, exercise?: VideoExercise) {
    const form = new FormData();
    form.append('sport', sport);
    if (exercise) form.append('exercise', exercise);
    form.append('file', file);
    return request<VideoUploadResult>('/videos/upload', {method: 'POST', body: form});
  }

  /** fetch() can't report upload progress, so real progress bars go through
   * XMLHttpRequest instead. */
  static uploadVideoWithProgress(
    sport: VideoSport,
    file: File,
    exercise: VideoExercise | undefined,
    onProgress: (percent: number) => void
  ): Promise<VideoUploadResult> {
    return new Promise((resolve, reject) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const form = new FormData();
      form.append('sport', sport);
      if (exercise) form.append('exercise', exercise);
      form.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/videos/upload`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText) as VideoUploadResult);
          return;
        }
        let message = 'Upload failed';
        try {
          message = extractErrorMessage(JSON.parse(xhr.responseText) as ApiErrorResponse);
        } catch {
          // response wasn't JSON - fall back to the generic message
        }
        reject(new Error(message));
      };
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(form);
    });
  }

  static listVideos() {
    return request<VideoListItem[]>('/videos');
  }

  static getVideoStatus(id: string) {
    return request<VideoStatusOut>(`/videos/${id}/status`);
  }

  static getReport(id: string) {
    return request<AnalysisReport>(`/videos/${id}/report`);
  }

  /** Per-frame skeleton for replay. 404s when the video has no pose frames
   * (older analyses, or a run that never got that far). */
  static getPoseSequence(id: string) {
    return request<PoseSequence>(`/videos/${id}/pose-sequence`);
  }

  /** Downloads the shareable PDF. `<a download>` can't send an Authorization
   * header, so this fetches the bytes and hands the browser a blob URL. */
  static async downloadReportPdf(id: string): Promise<void> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const res = await fetch(`${API_BASE}/videos/${id}/report.pdf`, {
      headers: token ? {Authorization: `Bearer ${token}`} : {}
    });
    if (!res.ok) throw new Error('Failed to generate the PDF report');

    const disposition = res.headers.get('content-disposition') ?? '';
    const match = /filename="([^"]+)"/.exec(disposition);
    const url = URL.createObjectURL(await res.blob());
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = match?.[1] ?? `ada2y-report-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  static getEvidenceUrl(id: string, filename: string) {
    return `${API_BASE}/videos/${id}/evidence/${filename}`;
  }

  /** <img> can't send an Authorization header, so evidence images are
   * fetched as an authenticated blob and turned into an object URL. Callers
   * must revoke the returned URL (URL.revokeObjectURL) when done with it. */
  static async fetchEvidenceBlob(id: string, filename: string): Promise<string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const res = await fetch(ApiClient.getEvidenceUrl(id, filename), {
      headers: token ? {Authorization: `Bearer ${token}`} : {}
    });
    if (!res.ok) throw new Error('Failed to load evidence image');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  // --- Form coach (M2) ---

  static getCoachMessage(videoId: string) {
    return request<CoachMessage>(`/videos/${videoId}/coach-message`);
  }

  /** Real LLM call under the hood - can take 10-25s. Asking a question
   * never overwrites the auto-generated summary GET returns. */
  static askCoach(videoId: string, question?: string) {
    return request<CoachMessage>(`/videos/${videoId}/coach-message`, {
      method: 'POST',
      body: JSON.stringify({question})
    });
  }

  static getTrends(videoId: string) {
    return request<TrendsResult>(`/videos/${videoId}/trends`);
  }

  // --- Notifications ---

  static listNotifications(unreadOnly = false) {
    return request<NotificationItem[]>(`/notifications?unread_only=${unreadOnly}`);
  }

  static markNotificationRead(id: string) {
    return request<NotificationItem>(`/notifications/${id}/read`, {method: 'PATCH'});
  }
}
