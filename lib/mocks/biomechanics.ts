import type {InjurySeverity} from '@/lib/api';

export interface FlaggedIssue {
  joint: string;
  issue: string;
  severity: InjurySeverity;
  frameRange: string;
}

export interface JointAngle {
  joint: string;
  angle: number;
  normalRange: [number, number];
  status: 'normal' | 'warning' | 'abnormal';
}

export interface MockBiomechanicsAnalysis {
  id: string;
  videoSessionId: string;
  videoFileName: string;
  athleteName: string;
  sport: string;
  summaryEn: string;
  summaryAr: string;
  techniqueScore: number;
  injuryRiskLevel: InjurySeverity;
  flaggedIssues: FlaggedIssue[];
  jointAngles: JointAngle[];
  createdAt: string;
}

const RISK_SEVERITY_MAP: Record<InjurySeverity, {bg: string; text: string; label: string}> = {
  none: {bg: 'bg-muted', text: 'text-muted-foreground', label: 'None'},
  low: {bg: 'bg-green-500/10', text: 'text-green-600', label: 'Low'},
  moderate: {bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Moderate'},
  high: {bg: 'bg-red-500/10', text: 'text-red-600', label: 'High'},
  critical: {bg: 'bg-red-600/10', text: 'text-red-700', label: 'Critical'}
};

export const RISK_STYLES = RISK_SEVERITY_MAP;

export const MOCK_JOINT_ANGLES: JointAngle[] = [
  {joint: 'Left Knee', angle: 168, normalRange: [160, 180], status: 'normal'},
  {joint: 'Right Knee', angle: 142, normalRange: [160, 180], status: 'abnormal'},
  {joint: 'Left Hip', angle: 175, normalRange: [165, 185], status: 'normal'},
  {joint: 'Right Hip', angle: 170, normalRange: [165, 185], status: 'normal'},
  {joint: 'Left Ankle', angle: 95, normalRange: [85, 105], status: 'normal'},
  {joint: 'Right Ankle', angle: 78, normalRange: [85, 105], status: 'warning'},
  {joint: 'Left Shoulder', angle: 155, normalRange: [140, 180], status: 'normal'},
  {joint: 'Right Shoulder', angle: 160, normalRange: [140, 180], status: 'normal'}
];

export const MOCK_FLAGGED_ISSUES: FlaggedIssue[] = [
  {
    joint: 'Right Knee',
    issue: 'Valgus collapse during single-leg squat — increased ACL injury risk',
    severity: 'high',
    frameRange: 'Frame 142–168'
  },
  {
    joint: 'Right Ankle',
    issue: 'Reduced dorsiflexion range — may indicate calf tightness or prior ankle sprain',
    severity: 'moderate',
    frameRange: 'Frame 201–224'
  },
  {
    joint: 'Left Hip',
    issue: 'Slight asymmetry in hip flexion compared to right side',
    severity: 'low',
    frameRange: 'Frame 88–105'
  }
];

export const MOCK_ANALYSES: MockBiomechanicsAnalysis[] = [
  {
    id: 'analysis_mock_1',
    videoSessionId: 'vid_mock_1',
    videoFileName: 'match_highlights_q1.mp4',
    athleteName: 'Ahmed Hassan',
    sport: 'FOOTBALL',
    summaryEn:
      'Analysis reveals a significant valgus collapse at the right knee during single-leg squat movements, which is a known risk factor for ACL injuries. Right ankle dorsiflexion is also reduced, possibly indicating prior injury or calf tightness. Left hip shows mild asymmetry. Recommend targeted strengthening of hip abductors and ankle mobility work before next match.',
    summaryAr:
      'تكشف التحليل عن انحراف واضح للركبة اليمنى أثناء القرفصاء على ساق واحدة، وهو عامل خطر معروف لإصابات الرباط الصليبي. تقلص أيضًا نطاق الثني للankle الأيمن.',
    techniqueScore: 68,
    injuryRiskLevel: 'high',
    flaggedIssues: MOCK_FLAGGED_ISSUES,
    jointAngles: MOCK_JOINT_ANGLES,
    createdAt: '2026-07-10T17:30:00Z'
  },
  {
    id: 'analysis_mock_2',
    videoSessionId: 'vid_mock_4',
    videoFileName: 'sprint_drill_analysis.mp4',
    athleteName: 'Omar Khaled',
    sport: 'ATHLETICS',
    summaryEn:
      'Good overall technique with symmetrical joint angles. Minor forward trunk lean during acceleration phase. No injury risk concerns identified. Recommend maintaining current training load.',
    summaryAr: 'تقنية جيدة بشكل عام مع زوايا مفاصل متناظرة. ميلان خفيف للجذع أثناء مرحلة التسارع.',
    techniqueScore: 91,
    injuryRiskLevel: 'none',
    flaggedIssues: [],
    jointAngles: [
      {joint: 'Left Knee', angle: 172, normalRange: [160, 180], status: 'normal'},
      {joint: 'Right Knee', angle: 170, normalRange: [160, 180], status: 'normal'},
      {joint: 'Left Hip', angle: 178, normalRange: [165, 185], status: 'normal'},
      {joint: 'Right Hip', angle: 176, normalRange: [165, 185], status: 'normal'},
      {joint: 'Left Ankle', angle: 92, normalRange: [85, 105], status: 'normal'},
      {joint: 'Right Ankle', angle: 90, normalRange: [85, 105], status: 'normal'},
      {joint: 'Left Shoulder', angle: 162, normalRange: [140, 180], status: 'normal'},
      {joint: 'Right Shoulder', angle: 158, normalRange: [140, 180], status: 'normal'}
    ],
    createdAt: '2026-07-12T10:45:00Z'
  }
];
