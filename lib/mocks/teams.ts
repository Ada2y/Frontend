import type {Team} from '@/lib/api';

export const mockTeams: Team[] = [
  {
    id: 'team_mock_1',
    name: 'Ada2y U18 Football',
    sport: 'football',
    players: [
      {
        id: 'athlete_mock_1',
        full_name: 'Youssef Adel',
        injury_risk: 'low',
        last_session_at: '2026-07-12T18:30:00Z'
      },
      {
        id: 'athlete_mock_2',
        full_name: 'Karim Fathy',
        injury_risk: 'high',
        last_session_at: '2026-07-11T16:00:00Z'
      },
      {
        id: 'athlete_mock_3',
        full_name: 'Mostafa Hany',
        injury_risk: 'medium',
        last_session_at: '2026-07-10T17:15:00Z'
      },
      {
        id: 'athlete_mock_4',
        full_name: 'Ziad Osama',
        injury_risk: 'low',
        last_session_at: null
      }
    ]
  }
];
