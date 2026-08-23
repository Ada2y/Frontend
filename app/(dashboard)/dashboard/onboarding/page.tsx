'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {AlertCircle, CheckCircle, Loader2} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent, CardFooter} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {
  ApiClient,
  type AthleteGender,
  type MedicalConditionCatalogItem,
  type VideoSport
} from '@/lib/api';

const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite'] as const;

// Scope for now: gym + football only (matches the video-upload pipeline).
const SPORTS: {value: VideoSport; label: string}[] = [
  {value: 'gym', label: 'Gym'},
  {value: 'football', label: 'Football'}
];

interface MedicalEntry {
  code: string;
  diagnosedAt: string;
  notes: string;
}

interface OnboardingForm {
  dob: string;
  gender: AthleteGender | '';
  height: string;
  weight: string;
  fitnessLevel: string;
  sport: VideoSport | '';
  medicalConditions: MedicalEntry[];
}

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

const inputClassName =
  'h-8 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50';

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [existingConditionCodes, setExistingConditionCodes] = useState<Set<string>>(new Set());
  const [catalog, setCatalog] = useState<MedicalConditionCatalogItem[]>([]);
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<OnboardingForm>(INITIAL_FORM);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [conditionsCatalog, profileResult, myConditionsResult] = await Promise.allSettled([
          ApiClient.listMedicalConditionsCatalog(),
          ApiClient.getMyProfile(),
          ApiClient.listMyMedicalConditions()
        ]);
        if (cancelled) return;

        if (conditionsCatalog.status === 'fulfilled') setCatalog(conditionsCatalog.value);

        if (profileResult.status === 'fulfilled') {
          const p = profileResult.value;
          setHasExistingProfile(true);
          setForm((prev) => ({
            ...prev,
            dob: p.date_of_birth ?? '',
            gender: p.gender,
            height: p.height_cm != null ? String(p.height_cm) : '',
            weight: p.weight_kg != null ? String(p.weight_kg) : '',
            fitnessLevel: p.fitness_level ?? '',
            sport: (p.dominant_sport as VideoSport) ?? ''
          }));
        }

        if (myConditionsResult.status === 'fulfilled') {
          const codes = new Set(myConditionsResult.value.map((c) => c.condition.code));
          setExistingConditionCodes(codes);
          setForm((prev) => ({
            ...prev,
            medicalConditions: myConditionsResult.value.map((c) => ({
              code: c.condition.code,
              diagnosedAt: c.diagnosed_at ?? '',
              notes: c.notes ?? ''
            }))
          }));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof OnboardingForm>(key: K, value: OnboardingForm[K]) {
    setForm((prev) => ({...prev, [key]: value}));
  }

  function toggleCondition(code: string) {
    setForm((prev) => {
      const exists = prev.medicalConditions.find((c) => c.code === code);
      return {
        ...prev,
        medicalConditions: exists
          ? prev.medicalConditions.filter((c) => c.code !== code)
          : [...prev.medicalConditions, {code, diagnosedAt: '', notes: ''}]
      };
    });
  }

  function updateCondition(code: string, field: 'diagnosedAt' | 'notes', value: string) {
    setForm((prev) => ({
      ...prev,
      medicalConditions: prev.medicalConditions.map((c) =>
        c.code === code ? {...c, [field]: value} : c
      )
    }));
  }

  function handleNoneToggle() {
    setForm((prev) => ({...prev, medicalConditions: []}));
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      const profileInput = {
        date_of_birth: form.dob || null,
        gender: form.gender || undefined,
        height_cm: form.height ? Number(form.height) : null,
        weight_kg: form.weight ? Number(form.weight) : null,
        dominant_sport: form.sport || null,
        fitness_level: form.fitnessLevel || null
      };
      if (hasExistingProfile) {
        await ApiClient.updateMyProfile(profileInput);
      } else {
        await ApiClient.createMyProfile(profileInput);
      }

      const selectedCodes = new Set(form.medicalConditions.map((c) => c.code));

      const newlySelected = form.medicalConditions.filter(
        (c) => !existingConditionCodes.has(c.code)
      );
      for (const c of newlySelected) {
        await ApiClient.addMyMedicalCondition({
          medical_condition_code: c.code,
          diagnosed_at: c.diagnosedAt || null,
          notes: c.notes || null
        });
      }

      const deselected = [...existingConditionCodes].filter((code) => !selectedCodes.has(code));
      for (const code of deselected) {
        const conditionId = catalog.find((c) => c.code === code)?.id;
        if (conditionId != null) await ApiClient.removeMyMedicalCondition(conditionId);
      }

      setCompleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save your profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Onboarding</h1>
          <p className="text-sm text-muted-foreground">Complete your athlete profile.</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-card px-8 py-16 text-center ring-1 ring-foreground/10">
          <div className="flex size-10 items-center justify-center rounded-full bg-success-bg">
            <CheckCircle className="size-5 text-success" />
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

  const selectedCodes = form.medicalConditions.map((c) => c.code);

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
                  className={inputClassName}
                />
              </label>

              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-medium text-foreground">Gender</legend>
                {(['male', 'female'] as const).map((g) => (
                  <label
                    key={g}
                    className="flex items-center gap-2 text-sm text-foreground capitalize"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={form.gender === g}
                      onChange={(e) => update('gender', e.target.value as AthleteGender)}
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
                  className={`${inputClassName} placeholder:text-muted-foreground`}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Weight (kg)</span>
                <input
                  type="number"
                  placeholder="e.g. 70"
                  value={form.weight}
                  onChange={(e) => update('weight', e.target.value)}
                  className={`${inputClassName} placeholder:text-muted-foreground`}
                />
              </label>

              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-medium text-foreground">Fitness level</legend>
                {FITNESS_LEVELS.map((level) => (
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
              {SPORTS.map((sport) => (
                <label
                  key={sport.value}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <input
                    type="radio"
                    name="sport"
                    value={sport.value}
                    checked={form.sport === sport.value}
                    onChange={(e) => update('sport', e.target.value as VideoSport)}
                    className="accent-primary"
                  />
                  {sport.label}
                </label>
              ))}
            </fieldset>
          )}

          {step === 4 && (
            <>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={selectedCodes.length === 0}
                  onChange={handleNoneToggle}
                  className="accent-primary"
                />
                None
              </label>

              {catalog.map((condition) => {
                const isSelected = selectedCodes.includes(condition.code);
                return (
                  <div key={condition.code} className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCondition(condition.code)}
                        className="accent-primary"
                      />
                      {condition.name_en}
                    </label>
                    {isSelected && (
                      <div className="ml-6 flex flex-col gap-2 rounded-lg border border-border p-3">
                        {condition.risk_notes && (
                          <p className="text-xs text-muted-foreground">{condition.risk_notes}</p>
                        )}
                        <label className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            Diagnosed date
                          </span>
                          <input
                            type="date"
                            value={
                              form.medicalConditions.find((c) => c.code === condition.code)
                                ?.diagnosedAt ?? ''
                            }
                            onChange={(e) =>
                              updateCondition(condition.code, 'diagnosedAt', e.target.value)
                            }
                            className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring/50"
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-muted-foreground">Notes</span>
                          <textarea
                            rows={2}
                            value={
                              form.medicalConditions.find((c) => c.code === condition.code)
                                ?.notes ?? ''
                            }
                            onChange={(e) =>
                              updateCondition(condition.code, 'notes', e.target.value)
                            }
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

          {error && (
            <div className="flex items-center gap-2 text-sm text-danger">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={saving}>
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < TOTAL_STEPS ? (
            <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              Save
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
