export const MOCK_SPORTS = ['FOOTBALL', 'BASKETBALL', 'ATHLETICS', 'OTHER'] as const;

export type Sport = (typeof MOCK_SPORTS)[number];

export const MOCK_FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite'] as const;

export type FitnessLevel = (typeof MOCK_FITNESS_LEVELS)[number];

export interface MockMedicalCondition {
  id: number;
  name: string;
  riskNotes: string;
}

export const MOCK_MEDICAL_CONDITIONS: MockMedicalCondition[] = [
  {id: 1, name: 'Asthma', riskNotes: 'May require inhaler during intense exercise'},
  {id: 2, name: 'Type 1 Diabetes', riskNotes: 'Blood sugar monitoring needed during training'},
  {id: 3, name: 'Type 2 Diabetes', riskNotes: 'Diet and exercise management required'},
  {id: 4, name: 'ACL Injury History', riskNotes: 'Higher re-injury risk, avoid sudden pivots'},
  {id: 5, name: 'Concussion History', riskNotes: 'Limit heading and contact drills'},
  {id: 6, name: 'Lower Back Pain', riskNotes: 'Avoid heavy deadlifts and overhead presses'},
  {id: 7, name: 'Shoulder Impingement', riskNotes: 'Limit overhead throwing and pressing'},
  {id: 8, name: 'Plantar Fasciitis', riskNotes: 'Reduce running volume, use orthotics'},
  {id: 9, name: 'Knee Tendinitis', riskNotes: 'Avoid deep squats and high-impact jumps'},
  {
    id: 10,
    name: 'Iron Deficiency Anaemia',
    riskNotes: 'Monitor energy levels, supplement as needed'
  }
];
