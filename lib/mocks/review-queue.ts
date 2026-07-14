import type {ReviewQueueItem} from '@/lib/api';

export const mockReviewQueueOpen: ReviewQueueItem[] = [
  {
    id: 'flag_mock_1',
    agent_run_id: 'run_mock_1',
    agent_type: 'nutrition_medical',
    agent_run_status: 'needs_human_review',
    athlete_user_id: 'athlete_mock_2',
    reason: 'Recommendation touches a logged diabetes condition (high-glycaemic meal flagged).',
    severity: 'high',
    assigned_to_user_id: null,
    resolved: false,
    resolution_notes: null,
    created_at: '2026-07-13T09:15:00Z',
    resolved_at: null,
    nutrition_recommendation_id: 'nutrition_mock_pending'
  },
  {
    id: 'flag_mock_2',
    agent_run_id: 'run_mock_2',
    agent_type: 'nutrition_medical',
    agent_run_status: 'needs_human_review',
    athlete_user_id: 'athlete_mock_3',
    reason: 'Cardiac condition on file; carb-loading advice needs clinical sign-off.',
    severity: 'critical',
    assigned_to_user_id: null,
    resolved: false,
    resolution_notes: null,
    created_at: '2026-07-12T14:40:00Z',
    resolved_at: null,
    nutrition_recommendation_id: 'nutrition_mock_pending_2'
  },
  {
    id: 'flag_mock_3',
    agent_run_id: 'run_mock_3',
    agent_type: 'nutrition_medical',
    agent_run_status: 'needs_human_review',
    athlete_user_id: 'athlete_mock_4',
    reason: 'Asthma noted; exertion-linked macro adjustment held for review.',
    severity: 'moderate',
    assigned_to_user_id: null,
    resolved: false,
    resolution_notes: null,
    created_at: '2026-07-11T11:05:00Z',
    resolved_at: null,
    nutrition_recommendation_id: 'nutrition_mock_pending_3'
  }
];

export const mockReviewQueueResolved: ReviewQueueItem[] = [
  {
    id: 'flag_mock_0',
    agent_run_id: 'run_mock_0',
    agent_type: 'nutrition_medical',
    agent_run_status: 'succeeded',
    athlete_user_id: 'athlete_mock_1',
    reason: 'Hypertension on file; sodium guidance required a clinical check.',
    severity: 'low',
    assigned_to_user_id: 'admin_mock_1',
    resolved: true,
    resolution_notes: 'Reviewed against current guidelines, approved as written.',
    created_at: '2026-07-09T08:00:00Z',
    resolved_at: '2026-07-09T10:30:00Z',
    nutrition_recommendation_id: 'nutrition_mock_resolved'
  }
];
