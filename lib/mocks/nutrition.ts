import type {NutritionRecommendation} from '@/lib/api';

export const mockNutritionAutoApproved: NutritionRecommendation = {
  id: 'nutrition_mock_auto',
  athlete_id: 'athlete_mock_1',
  status: 'auto_approved',
  summary:
    'Your carb intake is running low relative to Wednesday and Saturday’s training load. Add a slow-release carb source at breakfast on high-intensity days.',
  macros: {protein: 145, carbs: 310, fats: 80, calories: 2540}
};

export const mockNutritionPendingReview: NutritionRecommendation = {
  id: 'nutrition_mock_pending',
  athlete_id: 'athlete_mock_2',
  status: 'pending_review',
  summary:
    'Given your logged blood-sugar condition, we’re holding this recommendation for a clinical review before it reaches your plan.',
  macros: {protein: 130, carbs: 220, fats: 75, calories: 2180}
};

export const mockNutrition = mockNutritionAutoApproved;
