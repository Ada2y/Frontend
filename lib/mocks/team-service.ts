/**
 * Mock data layer for the Coach/Team dashboard (US-C01–C05).
 *
 * There is no backend for teams yet (see Ada2y_Backend_AI_TODO.md #6) -
 * `Organization`/`Team`/`TeamMember` models exist but no service/repo/endpoint.
 * `ApiClient.listTeams`/`createTeam` in lib/api.ts already match the intended
 * `GET/POST /teams` contract, so once that ships, swap the calls in
 * app/(dashboard)/dashboard/team/**\/page.tsx from `TeamService.*` to
 * `ApiClient.*` - the async shapes here are deliberately kept close to what
 * a real API client would return (Promises, no synchronous mutation) so that
 * swap doesn't touch component logic.
 *
 * Compare/plan/alerts/stats have no documented backend contract yet (they're
 * not in the API table in Ada2y_Sync_Plan(1).md), so their shapes below are
 * provisional - flag them to backend when teams work starts.
 */
import type {Team, TeamPlayer, InjuryRiskLevel} from '@/lib/api';

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// --- Types (provisional - no backend contract yet) ---

export type TeamPlanIntensity = 'light' | 'moderate' | 'peak';

export interface JointAnglePoint {
  session_date: string;
  angle_deg: number;
}

export interface PlayerJointSeries {
  joint: string;
  points: JointAnglePoint[];
}

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

export interface InjuryAlert {
  id: string;
  team_id: string;
  player_id: string;
  player_name: string;
  joint: string;
  severity: InjuryRiskLevel;
  session_date: string;
  video_id: string;
  video_timestamp_seconds: number;
  acknowledged: boolean;
  follow_up_note: string | null;
  occurrences: number;
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

const players: TeamPlayer[] = [
  {
    id: 'athlete_mock_1',
    full_name: 'Youssef Adel',
    injury_risk: 'low',
    last_session_at: '2026-08-12T18:30:00Z'
  },
  {
    id: 'athlete_mock_2',
    full_name: 'Karim Fathy',
    injury_risk: 'high',
    last_session_at: '2026-08-11T16:00:00Z'
  },
  {
    id: 'athlete_mock_3',
    full_name: 'Mostafa Hany',
    injury_risk: 'medium',
    last_session_at: '2026-08-10T17:15:00Z'
  },
  {
    id: 'athlete_mock_4',
    full_name: 'Ziad Osama',
    injury_risk: 'low',
    last_session_at: null
  }
];

let teams: Team[] = [
  {
    id: 'team_mock_1',
    name: 'Ada2y U18 Football',
    sport: 'football',
    players
  }
];

const invites: Record<string, TeamInvite[]> = {team_mock_1: []};

const jointSeries: Record<string, PlayerJointSeries[]> = {
  athlete_mock_1: [
    {
      joint: 'Knee Valgus',
      points: [
        {session_date: '2026-07-15', angle_deg: 9},
        {session_date: '2026-07-22', angle_deg: 8},
        {session_date: '2026-07-29', angle_deg: 7},
        {session_date: '2026-08-05', angle_deg: 6},
        {session_date: '2026-08-12', angle_deg: 5}
      ]
    }
  ],
  athlete_mock_2: [
    {
      joint: 'Knee Valgus',
      points: [
        {session_date: '2026-07-14', angle_deg: 14},
        {session_date: '2026-07-21', angle_deg: 16},
        {session_date: '2026-07-28', angle_deg: 17},
        {session_date: '2026-08-04', angle_deg: 19},
        {session_date: '2026-08-11', angle_deg: 21}
      ]
    }
  ],
  athlete_mock_3: [
    {
      joint: 'Knee Valgus',
      points: [
        {session_date: '2026-07-13', angle_deg: 11},
        {session_date: '2026-07-20', angle_deg: 12},
        {session_date: '2026-07-27', angle_deg: 11},
        {session_date: '2026-08-03', angle_deg: 13},
        {session_date: '2026-08-10', angle_deg: 12}
      ]
    }
  ],
  athlete_mock_4: [
    {
      joint: 'Knee Valgus',
      points: [
        {session_date: '2026-07-16', angle_deg: 7},
        {session_date: '2026-07-23', angle_deg: 6},
        {session_date: '2026-07-30', angle_deg: 6},
        {session_date: '2026-08-06', angle_deg: 5}
      ]
    }
  ]
};

const annotations: Record<string, CoachAnnotation[]> = {
  athlete_mock_2: [
    {
      id: 'note_1',
      player_id: 'athlete_mock_2',
      note: 'Valgus angle trending up three sessions in a row - pull him for a mobility check before the next match.',
      created_at: '2026-08-11T16:30:00Z'
    }
  ]
};

let alerts: InjuryAlert[] = [
  {
    id: 'alert_1',
    team_id: 'team_mock_1',
    player_id: 'athlete_mock_2',
    player_name: 'Karim Fathy',
    joint: 'Left Knee',
    severity: 'high',
    session_date: '2026-08-11T16:00:00Z',
    video_id: 'video_mock_karim_1',
    video_timestamp_seconds: 42,
    acknowledged: false,
    follow_up_note: null,
    occurrences: 3
  },
  {
    id: 'alert_2',
    team_id: 'team_mock_1',
    player_id: 'athlete_mock_3',
    player_name: 'Mostafa Hany',
    joint: 'Right Hip',
    severity: 'medium',
    session_date: '2026-08-10T17:15:00Z',
    video_id: 'video_mock_mostafa_1',
    video_timestamp_seconds: 18,
    acknowledged: false,
    follow_up_note: null,
    occurrences: 1
  },
  {
    id: 'alert_3',
    team_id: 'team_mock_1',
    player_id: 'athlete_mock_1',
    player_name: 'Youssef Adel',
    joint: 'Lumbar Spine',
    severity: 'low',
    session_date: '2026-08-12T18:30:00Z',
    video_id: 'video_mock_youssef_1',
    video_timestamp_seconds: 9,
    acknowledged: true,
    follow_up_note: 'Cleared after a follow-up session - form corrected.',
    occurrences: 1
  }
];

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

export const TeamService = {
  listTeams(): Promise<Team[]> {
    return delay(teams);
  },

  createTeam(data: {name: string; sport: string}): Promise<Team> {
    const team: Team = {
      id: `team_mock_${teams.length + 1}`,
      name: data.name,
      sport: data.sport,
      players: []
    };
    teams = [...teams, team];
    invites[team.id] = [];
    return delay(team);
  },

  getTeam(teamId: string): Promise<Team | undefined> {
    return delay(teams.find((t) => t.id === teamId));
  },

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

  getPlayerJointSeries(playerId: string): Promise<PlayerJointSeries[]> {
    return delay(jointSeries[playerId] ?? []);
  },

  listAnnotations(playerId: string): Promise<CoachAnnotation[]> {
    return delay(annotations[playerId] ?? []);
  },

  addAnnotation(playerId: string, note: string): Promise<CoachAnnotation> {
    const annotation: CoachAnnotation = {
      id: `note_${Date.now()}`,
      player_id: playerId,
      note,
      created_at: new Date().toISOString()
    };
    annotations[playerId] = [...(annotations[playerId] ?? []), annotation];
    return delay(annotation);
  },

  listInjuryAlerts(teamId: string): Promise<InjuryAlert[]> {
    return delay(
      [...alerts]
        .filter((a) => a.team_id === teamId)
        .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
    );
  },

  acknowledgeAlert(alertId: string, note: string): Promise<InjuryAlert> {
    alerts = alerts.map((a) =>
      a.id === alertId ? {...a, acknowledged: true, follow_up_note: note} : a
    );
    const updated = alerts.find((a) => a.id === alertId);
    return delay(updated as InjuryAlert);
  },

  getSquadStats(): Promise<SquadStats> {
    return delay(squadStats);
  },

  generateTeamPlan(
    teamId: string,
    matchDate: string,
    intensity: TeamPlanIntensity,
    teamPlayers: TeamPlayer[]
  ): Promise<TeamPlanDraft> {
    const draft: TeamPlanDraft = {
      team_id: teamId,
      match_date: matchDate,
      target_intensity: intensity,
      per_player: Object.fromEntries(teamPlayers.map((p) => [p.id, buildPlayerWeek(intensity)])),
      published: false
    };
    plans[teamId] = draft;
    return delay(draft, 400);
  },

  overrideDay(
    teamId: string,
    playerId: string,
    dayOfWeek: number,
    intensity: TeamPlanIntensity
  ): Promise<TeamPlanDraft> {
    const draft = plans[teamId];
    if (draft) {
      draft.per_player[playerId] = draft.per_player[playerId].map((d) =>
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

function severityRank(level: InjuryRiskLevel): number {
  return {high: 2, medium: 1, low: 0}[level];
}
