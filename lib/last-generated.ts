/** localStorage keys for "my most recent X" ids.
 *
 * There is no "list my training plans" / "list my nutrition
 * recommendations" endpoint on the backend (only generate-by-sport and
 * get-by-id), so the frontend is the only place that can remember which
 * one is "current" across a page reload. Shared here so the training-plan
 * page, nutrition page, and dashboard overview all agree on the same key.
 */
export const LAST_TRAINING_PLAN_ID_KEY = 'ada2y-training-plan-id';
export const LAST_NUTRITION_ID_KEY = 'ada2y-nutrition-id';
