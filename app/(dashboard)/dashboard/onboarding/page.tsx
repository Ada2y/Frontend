'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ClipboardList,
  Dumbbell,
  Heart,
  Loader2,
  User
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
  ApiClient,
  type AthleteGender,
  type MedicalConditionCatalogItem,
  type VideoSport
} from '@/lib/api';

const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite'] as const;

const SPORTS: {value: VideoSport; label: string}[] = [
  {value: 'gym', label: 'Gym'},
  {value: 'football', label: 'Football'}
];

const STEP_META = [
  {label: 'Personal', icon: User, color: '#3b82f6'},
  {label: 'Physical', icon: Dumbbell, color: '#5e6ad2'},
  {label: 'Sport', icon: ClipboardList, color: '#22c55e'},
  {label: 'Medical', icon: Heart, color: '#f59e0b'}
] as const;

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
  'h-11 rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none focus:ring-2 focus:ring-ring/50';

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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="h-8 w-28 animate-pulse rounded bg-muted" />
          <div className="h-5 w-48 animate-pulse rounded bg-muted [animation-delay:100ms]" />
        </div>
        <div className="relative overflow-hidden rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-muted" />
          <div className="flex flex-col gap-4">
            <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            <div className="h-2 w-full animate-pulse rounded bg-muted" />
            <div className="h-32 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Onboarding</h1>
          <p className="text-base text-muted-foreground">Complete your athlete profile.</p>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: '#22c55e'}} />
          <div className="flex flex-col items-center justify-center gap-3 px-8 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-success-bg">
              <CheckCircle className="size-8 text-success" />
            </div>
            <p className="text-xl font-semibold text-foreground">Profile saved!</p>
            <p className="max-w-sm text-base text-muted-foreground">
              Your athlete profile has been saved successfully.
            </p>
            <Link href="/dashboard" className="mt-2">
              <Button size="lg">Back to dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedCodes = form.medicalConditions.map((c) => c.code);
  const meta = STEP_META[step - 1];
  const StepIcon = meta.icon;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Onboarding</h1>
        <p className="text-base text-muted-foreground">Complete your athlete profile.</p>
      </div>

      {/* Step indicator */}
      <div className="grid grid-cols-4 gap-3">
        {STEP_META.map((s, i) => {
          const Icon = s.icon;
          const isActive = i + 1 === step;
          const isDone = i + 1 < step;
          return (
            <div
              key={s.label}
              className={`flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-center ring-1 transition-all ${
                isActive
                  ? 'bg-card ring-foreground/20 shadow-md'
                  : isDone
                    ? 'bg-card ring-foreground/10'
                    : 'bg-muted/30 ring-foreground/5'
              }`}
            >
              <div
                className={`flex size-10 items-center justify-center rounded-xl transition-colors ${
                  isActive
                    ? 'text-white'
                    : isDone
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-muted text-muted-foreground'
                }`}
                style={isActive ? {background: s.color} : undefined}
              >
                {isDone ? <CheckCircle className="size-5" /> : <Icon className="size-5" />}
              </div>
              <span
                className={`text-sm font-medium ${
                  isActive
                    ? 'text-foreground'
                    : isDone
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5">
        {Array.from({length: TOTAL_STEPS}, (_, i) => (
          <div key={i} className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
            {i < step && (
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                style={{
                  background: STEP_META[i].color,
                  width: i + 1 <= step ? '100%' : '50%'
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current step card */}
      <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: meta.color}} />
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-xl text-white"
              style={{background: meta.color}}
            >
              <StepIcon className="size-6" />
            </div>
            <div>
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Step {step} of {TOTAL_STEPS}
              </span>
              <p className="text-lg font-semibold text-foreground">{meta.label}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-5">
            {step === 1 && (
              <>
                <label className="flex flex-col gap-2">
                  <span className="text-base font-medium text-foreground">Date of birth</span>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => update('dob', e.target.value)}
                    className={inputClassName}
                  />
                </label>

                <fieldset className="flex flex-col gap-3">
                  <legend className="text-base font-medium text-foreground">Gender</legend>
                  <div className="grid grid-cols-2 gap-3">
                    {(['male', 'female'] as const).map((g) => (
                      <label
                        key={g}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-base capitalize transition-all cursor-pointer ${
                          form.gender === g
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 text-foreground'
                            : 'border-border text-muted-foreground hover:border-foreground/20'
                        }`}
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
                  </div>
                </fieldset>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-base font-medium text-foreground">Height (cm)</span>
                    <input
                      type="number"
                      placeholder="e.g. 175"
                      value={form.height}
                      onChange={(e) => update('height', e.target.value)}
                      className={`${inputClassName} placeholder:text-muted-foreground`}
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-base font-medium text-foreground">Weight (kg)</span>
                    <input
                      type="number"
                      placeholder="e.g. 70"
                      value={form.weight}
                      onChange={(e) => update('weight', e.target.value)}
                      className={`${inputClassName} placeholder:text-muted-foreground`}
                    />
                  </label>
                </div>

                <fieldset className="flex flex-col gap-2">
                  <legend className="text-base font-medium text-foreground">Fitness level</legend>
                  <div className="grid grid-cols-2 gap-3">
                    {FITNESS_LEVELS.map((level) => (
                      <label
                        key={level}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-base transition-all cursor-pointer ${
                          form.fitnessLevel === level
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 text-foreground'
                            : 'border-border text-muted-foreground hover:border-foreground/20'
                        }`}
                      >
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
                  </div>
                </fieldset>
              </>
            )}

            {step === 3 && (
              <fieldset className="flex flex-col gap-2">
                <legend className="text-base font-medium text-foreground">Dominant sport</legend>
                <div className="grid grid-cols-2 gap-3">
                  {SPORTS.map((sport) => (
                    <label
                      key={sport.value}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-base transition-all cursor-pointer ${
                        form.sport === sport.value
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 text-foreground'
                          : 'border-border text-muted-foreground hover:border-foreground/20'
                      }`}
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
                </div>
              </fieldset>
            )}

            {step === 4 && (
              <>
                <label
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-base transition-all cursor-pointer ${
                    selectedCodes.length === 0
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20 text-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCodes.length === 0}
                    onChange={handleNoneToggle}
                    className="accent-primary"
                  />
                  None — I have no medical conditions
                </label>

                <div className="flex flex-col gap-3">
                  {catalog.map((condition) => {
                    const isSelected = selectedCodes.includes(condition.code);
                    return (
                      <div key={condition.code} className="flex flex-col gap-2">
                        <label
                          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-base transition-all cursor-pointer ${
                            isSelected
                              ? 'border-amber-500/50 bg-amber-500/5 ring-2 ring-amber-500/20 text-foreground'
                              : 'border-border text-muted-foreground hover:border-foreground/20'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCondition(condition.code)}
                            className="accent-primary"
                          />
                          {condition.name_en}
                        </label>
                        {isSelected && (
                          <div className="ml-6 flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                            {condition.risk_notes && (
                              <p className="text-sm text-muted-foreground">
                                {condition.risk_notes}
                              </p>
                            )}
                            <label className="flex flex-col gap-1.5">
                              <span className="text-sm font-medium text-muted-foreground">
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
                                className="h-9 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50"
                              />
                            </label>
                            <label className="flex flex-col gap-1.5">
                              <span className="text-sm font-medium text-muted-foreground">
                                Notes
                              </span>
                              <textarea
                                rows={2}
                                value={
                                  form.medicalConditions.find((c) => c.code === condition.code)
                                    ?.notes ?? ''
                                }
                                onChange={(e) =>
                                  updateCondition(condition.code, 'notes', e.target.value)
                                }
                                className="rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/50 resize-none"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/8 px-4 py-3 text-sm text-danger">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {step > 1 ? (
          <Button variant="ghost" size="lg" onClick={() => setStep((s) => s - 1)} disabled={saving}>
            <ArrowLeft className="mr-1 size-4" />
            Back
          </Button>
        ) : (
          <div />
        )}
        {step < TOTAL_STEPS ? (
          <Button size="lg" onClick={() => setStep((s) => s + 1)}>
            Next
            <ArrowRight className="ml-1 size-4" />
          </Button>
        ) : (
          <Button size="lg" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle className="size-4" />
            )}
            Save profile
          </Button>
        )}
      </div>
    </div>
  );
}
