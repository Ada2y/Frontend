import type {TrainingPlan} from '@/lib/api';

export const mockTrainingPlan: TrainingPlan = {
  id: 'plan_mock_1',
  athlete_id: 'athlete_mock_1',
  week_start: '2026-07-13',
  days: [
    {
      day: 'Monday',
      is_rest_day: false,
      status: 'completed',
      exercises: [
        {name: 'Dynamic warm-up', sets: 1, reps: 10, load: 'Bodyweight', rest_seconds: 0},
        {name: 'Single-leg squat', sets: 3, reps: 8, load: 'Bodyweight', rest_seconds: 60},
        {name: 'Nordic hamstring curl', sets: 3, reps: 6, load: 'Bodyweight', rest_seconds: 90}
      ]
    },
    {
      day: 'Tuesday',
      is_rest_day: true,
      status: 'pending',
      exercises: []
    },
    {
      day: 'Wednesday',
      is_rest_day: false,
      status: 'skipped',
      exercises: [
        {name: 'Sprint intervals', sets: 6, reps: 1, load: '30m @ 90%', rest_seconds: 120},
        {name: 'Copenhagen plank', sets: 3, reps: 8, load: 'Bodyweight', rest_seconds: 45}
      ]
    },
    {
      day: 'Thursday',
      is_rest_day: true,
      status: 'pending',
      exercises: []
    },
    {
      day: 'Friday',
      is_rest_day: false,
      status: 'pending',
      exercises: [
        {name: 'Box jump', sets: 4, reps: 5, load: 'Bodyweight', rest_seconds: 90},
        {name: 'Goblet squat', sets: 4, reps: 10, load: '20kg', rest_seconds: 75},
        {name: 'Ankle mobility drill', sets: 2, reps: 12, load: 'Bodyweight', rest_seconds: 30}
      ]
    },
    {
      day: 'Saturday',
      is_rest_day: false,
      status: 'pending',
      exercises: [{name: 'Match / scrimmage', sets: 1, reps: 1, load: '90 min', rest_seconds: 0}]
    },
    {
      day: 'Sunday',
      is_rest_day: true,
      status: 'pending',
      exercises: []
    }
  ]
};
