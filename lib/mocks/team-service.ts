/**
 * Remaining mock data for the Coach/Team dashboard.
 *
 * Teams, roster, alerts, risk stats and report comparison are now served by
 * the real backend (`/coach/*` - see ApiClient). What is left here is the set
 * of coach features that have no endpoint at all:
 *
 *   - invites by link or phone      (no invite flow; roster adds are by user id)
 *   - private per-athlete notes     (no notes table)
 *   - the 7-day team-plan builder   (/training-plans is athlete-scoped)
 *   - body-part risk + 30-day trend (RiskService scores athletes, not joints)
 *
 * Every screen that renders one of these marks it with <MockBadge /> so it
 * cannot be mistaken for live data sitting next to the real panels. Keyed by
 * athlete *user id* now, to match the ids the real endpoints return.
 */
function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// --- Types (provisional - no backend contract yet) ---

export type TeamPlanIntensity = 'light' | 'moderate' | 'peak';

export interface CoachAnnotation {
  id: string;
  player_id: string;
  note: string;
  created_at: string;
}

export interface TeamInvite {
  id: string;
  method: 'link' | 'phone';
  value: string;
  created_at: string;
}

export interface SquadBodyPartRisk {
  body_part: string;
  risk_score: number;
  affected_player_ids: string[];
}

export interface SquadTrendPoint {
  date: string;
  avg_risk_score: number;
}

export interface SquadStats {
  body_part_risk: SquadBodyPartRisk[];
  trend: SquadTrendPoint[];
}

export interface TeamPlanDay {
  day_of_week: number;
  focus: string;
  intensity: TeamPlanIntensity;
  overridden: boolean;
}

export interface TeamPlanDraft {
  team_id: string;
  match_date: string;
  target_intensity: TeamPlanIntensity;
  per_player: Record<string, TeamPlanDay[]>;
  published: boolean;
}

// --- In-memory store ---

// Seeded empty: notes are keyed by real athlete user ids now, so any canned
// entry would hang off an id that no roster actually contains.
const annotations: Record<string, CoachAnnotation[]> = {};

const squadStats: SquadStats = {
  body_part_risk: [
    {body_part: 'Knee', risk_score: 72, affected_player_ids: ['athlete_mock_2', 'athlete_mock_3']},
    {body_part: 'Hip', risk_score: 44, affected_player_ids: ['athlete_mock_3']},
    {body_part: 'Lumbar Spine', risk_score: 21, affected_player_ids: ['athlete_mock_1']},
    {body_part: 'Ankle', risk_score: 12, affected_player_ids: []}
  ],
  trend: [
    {date: '2026-07-15', avg_risk_score: 38},
    {date: '2026-07-22', avg_risk_score: 41},
    {date: '2026-07-29', avg_risk_score: 45},
    {date: '2026-08-05', avg_risk_score: 49},
    {date: '2026-08-12', avg_risk_score: 47}
  ]
};

const plans: Record<string, TeamPlanDraft> = {};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function buildPlayerWeek(intensity: TeamPlanIntensity): TeamPlanDay[] {
  const focusByDay = [
    'Technical drills',
    'Strength & conditioning',
    'Recovery / mobility',
    'Tactical shape',
    'Speed & agility',
    intensity === 'peak' ? 'Match' : 'Small-sided games',
    'Rest'
  ];
  return DAY_NAMES.map((_, i) => ({
    day_of_week: i,
    focus: focusByDay[i],
    intensity: i === 6 ? 'light' : intensity,
    overridden: false
  }));
}

// --- Service functions ---

const invites: Record<string, TeamInvite[]> = {};

export const TeamService = {
  inviteToTeam(
    teamId: string,
    data: {method: 'link' | 'phone'; value: string}
  ): Promise<TeamInvite> {
    const invite: TeamInvite = {
      id: `invite_${Date.now()}`,
      ...data,
      created_at: new Date().toISOString()
    };
    invites[teamId] = [...(invites[teamId] ?? []), invite];
    return delay(invite);
  },

  listInvites(teamId: string): Promise<TeamInvite[]> {
    return delay(invites[teamId] ?? []);
  },

  listAnnotations(athleteUserId: string): Promise<CoachAnnotation[]> {
    return delay(annotations[athleteUserId] ?? []);
  },

  addAnnotation(athleteUserId: string, note: string): Promise<CoachAnnotation> {
    const annotation: CoachAnnotation = {
      id: `note_${Date.now()}`,
      player_id: athleteUserId,
      note,
      created_at: new Date().toISOString()
    };
    annotations[athleteUserId] = [...(annotations[athleteUserId] ?? []), annotation];
    return delay(annotation);
  },

  getSquadStats(): Promise<SquadStats> {
    return delay(squadStats);
  },

  /** Takes athlete user ids - the roster the real API returns has no other
   * identifier to key a plan by. */
  generateTeamPlan(
    teamId: string,
    matchDate: string,
    intensity: TeamPlanIntensity,
    athleteUserIds: string[]
  ): Promise<TeamPlanDraft> {
    const draft: TeamPlanDraft = {
      team_id: teamId,
      match_date: matchDate,
      target_intensity: intensity,
      per_player: Object.fromEntries(athleteUserIds.map((id) => [id, buildPlayerWeek(intensity)])),
      published: false
    };
    plans[teamId] = draft;
    return delay(draft, 400);
  },

  overrideDay(
    teamId: string,
    athleteUserId: string,
    dayOfWeek: number,
    intensity: TeamPlanIntensity
  ): Promise<TeamPlanDraft> {
    const draft = plans[teamId];
    if (draft) {
      draft.per_player[athleteUserId] = draft.per_player[athleteUserId].map((d) =>
        d.day_of_week === dayOfWeek ? {...d, intensity, overridden: true} : d
      );
    }
    return delay(draft as TeamPlanDraft);
  },

  publishTeamPlan(teamId: string): Promise<TeamPlanDraft> {
    const draft = plans[teamId];
    if (draft) draft.published = true;
    return delay(draft as TeamPlanDraft, 400);
  }
};
