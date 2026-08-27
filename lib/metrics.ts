/** Frontend mirror of the backend's describe_metric()
 * (app/ai/cv_pipeline/constants.py).
 *
 * The report endpoint already returns `labelled_metrics`, so the report page
 * doesn't need this. Trends come from a different endpoint that returns bare
 * metric keys, and rendering "range_angle_torso_incline" to an athlete is
 * geometry, not coaching.
 */
const PREFIX_LABELS: Record<string, string> = {
  min_: 'Smallest',
  max_: 'Largest',
  range_: 'Total movement in',
  initial_: 'At contact'
};

const BASE_LABELS: Record<string, {label: string; unit: string | null}> = {
  angle_knee: {label: 'knee bend', unit: '°'},
  angle_hip: {label: 'hip bend', unit: '°'},
  angle_elbow: {label: 'elbow bend', unit: '°'},
  angle_shoulder: {label: 'shoulder angle', unit: '°'},
  angle_torso_incline: {label: 'torso lean', unit: '°'},
  hip_height: {label: 'hip height', unit: null},
  wrist_height: {label: 'wrist height', unit: null},
  feet_width: {label: 'foot spacing', unit: null},
  knee_width: {label: 'knee spacing', unit: null},
  duration_s: {label: 'duration', unit: 's'}
};

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function describeMetric(key: string): {label: string; unit: string | null} {
  const direct = BASE_LABELS[key];
  if (direct) return {label: capitalise(direct.label), unit: direct.unit};

  for (const [prefix, prefixLabel] of Object.entries(PREFIX_LABELS)) {
    if (!key.startsWith(prefix)) continue;
    const base = BASE_LABELS[key.slice(prefix.length)];
    if (!base) break;
    return {label: `${prefixLabel} ${base.label}`, unit: base.unit};
  }

  // Unknown metric degrades to something readable rather than a raw key.
  return {label: capitalise(key.replace(/_/g, ' ')), unit: null};
}
