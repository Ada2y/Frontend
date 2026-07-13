'use client';

import {useRef, useState, useSyncExternalStore} from 'react';
import Link from 'next/link';
import {CheckCircle} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent, CardFooter} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {MOCK_SPORTS, MOCK_FITNESS_LEVELS, MOCK_MEDICAL_CONDITIONS} from '@/lib/mocks/athlete';

interface MedicalEntry {
  conditionId: number;
  diagnosedAt: string;
  notes: string;
}

interface OnboardingForm {
  dob: string;
  gender: string;
  height: string;
  weight: string;
  fitnessLevel: string;
  sport: string;
  medicalConditions: MedicalEntry[];
}

const STORAGE_KEY = 'athlete-onboarding';

const INITIAL_FORM: OnboardingForm = {
  dob: '',
  gender: '',
  height: '',
  weight: '',
  fitnessLevel: '',
  sport: '',
  medicalConditions: []
};

const TOTAL_STEPS = 4;

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function saveForm(form: OnboardingForm) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
}

export default function OnboardingPage() {
  const storedJson = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(STORAGE_KEY),
    () => null
  );

  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const synced = useRef(false);

  let initialForm = INITIAL_FORM;
  if (!synced.current) {
    synced.current = true;
    if (storedJson) {
      try {
        initialForm = {...INITIAL_FORM, ...JSON.parse(storedJson)};
      } catch {}
    }
  }

  const [form, setForm] = useState<OnboardingForm>(initialForm);

  function update<K extends keyof OnboardingForm>(key: K, value: OnboardingForm[K]) {
    setForm((prev) => {
      const next = {...prev, [key]: value};
      saveForm(next);
      return next;
    });
  }

  function toggleCondition(conditionId: number) {
    setForm((prev) => {
      const exists = prev.medicalConditions.find((c) => c.conditionId === conditionId);
      const next = exists
        ? {
            ...prev,
            medicalConditions: prev.medicalConditions.filter((c) => c.conditionId !== conditionId)
          }
        : {
            ...prev,
            medicalConditions: [
              ...prev.medicalConditions,
              {conditionId, diagnosedAt: '', notes: ''}
            ]
          };
      saveForm(next);
      return next;
    });
  }

  function updateCondition(conditionId: number, field: keyof MedicalEntry, value: string) {
    setForm((prev) => {
      const next = {
        ...prev,
        medicalConditions: prev.medicalConditions.map((c) =>
          c.conditionId === conditionId ? {...c, [field]: value} : c
        )
      };
      saveForm(next);
      return next;
    });
  }

  function handleNoneToggle() {
    setForm((prev) => {
      const next = {...prev, medicalConditions: []};
      saveForm(next);
      return next;
    });
  }

  function handleSubmit() {
    saveForm(form);
    setCompleted(true);
  }

  if (completed) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Onboarding</h1>
          <p className="text-sm text-muted-foreground">Complete your athlete profile.</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-card px-8 py-16 text-center ring-1 ring-foreground/10">
          <div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="size-5 text-green-600" />
          </div>
          <h2 className="text-base font-medium text-foreground">Profile saved!</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Your athlete profile has been saved successfully.
          </p>
          <Link href="/dashboard">
            <Button>Back to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const selectedConditionIds = form.medicalConditions.map((c) => c.conditionId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Onboarding</h1>
        <p className="text-sm text-muted-foreground">Complete your athlete profile.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Step {step} of {TOTAL_STEPS}
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {step === 1 && 'Personal'}
              {step === 2 && 'Physical'}
              {step === 3 && 'Sport'}
              {step === 4 && 'Medical'}
            </span>
          </div>
          <div className="mt-2 flex gap-1.5">
            {Array.from({length: TOTAL_STEPS}, (_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i < step ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {step === 1 && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Date of birth</span>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => update('dob', e.target.value)}
                  className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50"
                />
              </label>

              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-medium text-foreground">Gender</legend>
                {['Male', 'Female', 'Unspecified'].map((g) => (
                  <label key={g} className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="radio"
                      name="gender"
                      value={g.toLowerCase()}
                      checked={form.gender === g.toLowerCase()}
                      onChange={(e) => update('gender', e.target.value)}
                      className="accent-primary"
                    />
                    {g}
                  </label>
                ))}
              </fieldset>
            </>
          )}

          {step === 2 && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Height (cm)</span>
                <input
                  type="number"
                  placeholder="e.g. 175"
                  value={form.height}
                  onChange={(e) => update('height', e.target.value)}
                  className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/50"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Weight (kg)</span>
                <input
                  type="number"
                  placeholder="e.g. 70"
                  value={form.weight}
                  onChange={(e) => update('weight', e.target.value)}
                  className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/50"
                />
              </label>

              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-medium text-foreground">Fitness level</legend>
                {MOCK_FITNESS_LEVELS.map((level) => (
                  <label key={level} className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="radio"
                      name="fitnessLevel"
                      value={level}
                      checked={form.fitnessLevel === level}
                      onChange={(e) => update('fitnessLevel', e.target.value)}
                      className="accent-primary"
                    />
                    {level}
                  </label>
                ))}
              </fieldset>
            </>
          )}

          {step === 3 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium text-foreground">Dominant sport</legend>
              {MOCK_SPORTS.map((sport) => (
                <label key={sport} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name="sport"
                    value={sport}
                    checked={form.sport === sport}
                    onChange={(e) => update('sport', e.target.value)}
                    className="accent-primary"
                  />
                  {sport}
                </label>
              ))}
            </fieldset>
          )}

          {step === 4 && (
            <>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={selectedConditionIds.length === 0}
                  onChange={handleNoneToggle}
                  className="accent-primary"
                />
                None
              </label>

              {MOCK_MEDICAL_CONDITIONS.map((condition) => {
                const isSelected = selectedConditionIds.includes(condition.id);
                return (
                  <div key={condition.id} className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCondition(condition.id)}
                        className="accent-primary"
                      />
                      {condition.name}
                    </label>
                    {isSelected && (
                      <div className="ml-6 flex flex-col gap-2 rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground">{condition.riskNotes}</p>
                        <label className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            Diagnosed date
                          </span>
                          <input
                            type="date"
                            value={
                              form.medicalConditions.find((c) => c.conditionId === condition.id)
                                ?.diagnosedAt ?? ''
                            }
                            onChange={(e) =>
                              updateCondition(condition.id, 'diagnosedAt', e.target.value)
                            }
                            className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring/50"
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-muted-foreground">Notes</span>
                          <textarea
                            rows={2}
                            value={
                              form.medicalConditions.find((c) => c.conditionId === condition.id)
                                ?.notes ?? ''
                            }
                            onChange={(e) => updateCondition(condition.id, 'notes', e.target.value)}
                            className="rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/50 resize-none"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < TOTAL_STEPS ? (
            <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
          ) : (
            <Button onClick={handleSubmit}>Save</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
