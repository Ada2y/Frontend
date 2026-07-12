import type {TrainingPlan} from '@/lib/api';

export const mockTrainingPlan: TrainingPlan = {
  id: 'plan_mock_1',
  athlete_id: 'athlete_mock_1',
  week_start: '2026-07-13',
  days: [
    {
      day: 'Monday',
      is_rest_day: false,
      exercises: [
        {name: 'Dynamic warm-up', sets: 1, reps: 10, load: 'Bodyweight'},
        {name: 'Single-leg squat', sets: 3, reps: 8, load: 'Bodyweight'},
        {name: 'Nordic hamstring curl', sets: 3, reps: 6, load: 'Bodyweight'}
      ]
    },
    {
      day: 'Tuesday',
      is_rest_day: true,
      exercises: []
    },
    {
      day: 'Wednesday',
      is_rest_day: false,
      exercises: [
        {name: 'Sprint intervals', sets: 6, reps: 1, load: '30m @ 90%'},
        {name: 'Copenhagen plank', sets: 3, reps: 8, load: 'Bodyweight'}
      ]
    },
    {
      day: 'Thursday',
      is_rest_day: true,
      exercises: []
    },
    {
      day: 'Friday',
      is_rest_day: false,
      exercises: [
        {name: 'Box jump', sets: 4, reps: 5, load: 'Bodyweight'},
        {name: 'Goblet squat', sets: 4, reps: 10, load: '20kg'},
        {name: 'Ankle mobility drill', sets: 2, reps: 12, load: 'Bodyweight'}
      ]
    },
    {
      day: 'Saturday',
      is_rest_day: false,
      exercises: [{name: 'Match / scrimmage', sets: 1, reps: 1, load: '90 min'}]
    },
    {
      day: 'Sunday',
      is_rest_day: true,
      exercises: []
    }
  ]
};
