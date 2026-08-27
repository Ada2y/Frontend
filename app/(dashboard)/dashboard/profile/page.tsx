'use client';

import {useEffect, useState} from 'react';
import {AlertCircle, Calendar, Check, CheckCircle, Dumbbell, Loader2, Plus, Ruler, ShieldAlert, Tag, User, Weight, X} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {
  ApiClient,
  type AthleteGender,
  type AthleteMedicalCondition,
  type BodyMetricEntry,
  type Injury,
  type InjurySeverity,
  type MedicalConditionCatalogItem,
  type VideoSport
} from '@/lib/api';

const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite'] as const;
const SPORTS: {value: VideoSport; label: string}[] = [
  {value: 'gym', label: 'Gym'},
  {value: 'football', label: 'Football'}
];
const SEVERITIES: InjurySeverity[] = ['low', 'moderate', 'high', 'critical'];

const inputClassName =
  'h-10 rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none focus:ring-2 focus:ring-ring/50';
const selectClassName =
  'flex h-10 min-w-0 rounded-lg bg-input px-3 py-1 text-base text-foreground shadow-sm outline-none ring-1 ring-foreground/10 focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50';

const COLORS = {
  blue: '#3b82f6',
  primary: '#5e6ad2',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444'
} as const;

function formatDate(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-5 w-72 animate-pulse rounded bg-muted [animation-delay:100ms]" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-muted" />
          <div className="flex flex-col gap-4">
            <div className="h-5 w-36 animate-pulse rounded bg-muted" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 animate-pulse rounded-lg bg-muted" />
              <div className="h-10 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<AthleteGender | ''>('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [sport, setSport] = useState<VideoSport | ''>('');

  const [catalog, setCatalog] = useState<MedicalConditionCatalogItem[]>([]);
  const [myConditions, setMyConditions] = useState<AthleteMedicalCondition[]>([]);

  const [bodyMetrics, setBodyMetrics] = useState<BodyMetricEntry[]>([]);
  const [lastRecordedHeight, setLastRecordedHeight] = useState('');
  const [lastRecordedWeight, setLastRecordedWeight] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [newWeight, setNewWeight] = useState('');

  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [newInjuryPart, setNewInjuryPart] = useState('');
  const [newInjurySeverity, setNewInjurySeverity] = useState<InjurySeverity>('moderate');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profile, conditionsCatalog, mine, metrics, myInjuries] = await Promise.all([
          ApiClient.getMyProfile(),
          ApiClient.listMedicalConditionsCatalog(),
          ApiClient.listMyMedicalConditions(),
          ApiClient.listMyBodyMetrics(),
          ApiClient.listMyInjuries()
        ]);
        if (cancelled) return;
        setDob(profile.date_of_birth ?? '');
        setGender(profile.gender === 'unspecified' ? '' : profile.gender);
        setHeight(profile.height_cm != null ? String(profile.height_cm) : '');
        setWeight(profile.weight_kg != null ? String(profile.weight_kg) : '');
        setLastRecordedHeight(profile.height_cm != null ? String(profile.height_cm) : '');
        setLastRecordedWeight(profile.weight_kg != null ? String(profile.weight_kg) : '');
        setFitnessLevel(profile.fitness_level ?? '');
        setSport((profile.dominant_sport as VideoSport) ?? '');
        setCatalog(conditionsCatalog);
        setMyConditions(mine);
        setBodyMetrics(metrics);
        setInjuries(myInjuries);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load your profile.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSaveProfile() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await ApiClient.updateMyProfile({
        date_of_birth: dob || null,
        gender: gender || undefined,
        height_cm: height ? Number(height) : null,
        weight_kg: weight ? Number(weight) : null,
        dominant_sport: sport || null,
        fitness_level: fitnessLevel || null
      });

      const heightChanged = height !== lastRecordedHeight && height !== '';
      const weightChanged = weight !== lastRecordedWeight && weight !== '';
      if (heightChanged || weightChanged) {
        await ApiClient.recordMyBodyMetrics({
          height_cm: height ? Number(height) : undefined,
          weight_kg: weight ? Number(weight) : undefined
        });
        setBodyMetrics(await ApiClient.listMyBodyMetrics());
        setLastRecordedHeight(height);
        setLastRecordedWeight(weight);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save your profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleCondition(code: string, currentlySelected: boolean) {
    setError(null);
    try {
      if (currentlySelected) {
        const conditionId = catalog.find((c) => c.code === code)?.id;
        if (conditionId != null) await ApiClient.removeMyMedicalCondition(conditionId);
      } else {
        await ApiClient.addMyMedicalCondition({medical_condition_code: code});
      }
      setMyConditions(await ApiClient.listMyMedicalConditions());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update medical conditions.');
    }
  }

  async function handleAddBodyMetric() {
    if (!newHeight && !newWeight) return;
    setError(null);
    try {
      await ApiClient.recordMyBodyMetrics({
        height_cm: newHeight ? Number(newHeight) : undefined,
        weight_kg: newWeight ? Number(newWeight) : undefined
      });
      setBodyMetrics(await ApiClient.listMyBodyMetrics());
      setNewHeight('');
      setNewWeight('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record body metrics.');
    }
  }

  async function handleAddInjury() {
    if (!newInjuryPart.trim()) return;
    setError(null);
    try {
      await ApiClient.addMyInjury({body_part: newInjuryPart.trim(), severity: newInjurySeverity});
      setInjuries(await ApiClient.listMyInjuries());
      setNewInjuryPart('');
      setNewInjurySeverity('moderate');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add injury.');
    }
  }

  async function handleMarkRecovered(injuryId: string) {
    setError(null);
    try {
      await ApiClient.updateMyInjury(injuryId, {
        recovered_at: new Date().toISOString().slice(0, 10)
      });
      setInjuries(await ApiClient.listMyInjuries());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update injury.');
    }
  }

  if (loading) return <ProfileSkeleton />;

  const selectedCodes = new Set(myConditions.map((c) => c.condition.code));
  const activeInjuries = injuries.filter((i) => !i.recovered_at);
  const latestMetric = bodyMetrics.length > 0 ? bodyMetrics[bodyMetrics.length - 1] : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-base text-muted-foreground">
          Your athlete profile, medical conditions, body metrics, and injuries.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-base text-red-600">
          <AlertCircle className="size-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Personal & Physical */}
      <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.primary}} />
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <User className="size-6 text-primary" />
            </div>
            <div>
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Personal & physical
              </span>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Date of birth</span>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Gender</span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as AthleteGender)}
                className={selectClassName}
              >
                <option value="">Not set</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Height (cm)</span>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Weight (kg)</span>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Dominant sport</span>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value as VideoSport)}
                className={selectClassName}
              >
                <option value="">Not set</option>
                {SPORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Fitness level</span>
              <select
                value={fitnessLevel}
                onChange={(e) => setFitnessLevel(e.target.value)}
                className={selectClassName}
              >
                <option value="">Not set</option>
                {FITNESS_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Button size="lg" onClick={handleSaveProfile} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save profile
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <Check className="size-4" />
                Saved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Medical Conditions */}
      <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.amber}} />
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <Tag className="size-6 text-amber-600" />
            </div>
            <div>
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Medical conditions
              </span>
            </div>
          </div>
          {myConditions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {myConditions.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-700"
                >
                  {c.condition.name_en}
                  <button
                    onClick={() => handleToggleCondition(c.condition.code, true)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-amber-500/20"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {catalog
              .filter((c) => !selectedCodes.has(c.code))
              .map((condition, idx) => (
                <button
                  key={condition.id ?? `${condition.code}-${idx}`}
                  onClick={() => handleToggleCondition(condition.code, false)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-amber-500/50 hover:bg-amber-500/5 hover:text-amber-700"
                >
                  <Plus className="size-3" />
                  {condition.name_en}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Body Metrics */}
      <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.blue}} />
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
              <Ruler className="size-6 text-blue-500" />
            </div>
            <div>
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Body metrics
              </span>
            </div>
          </div>

          {/* Latest summary */}
          {latestMetric && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center rounded-lg bg-blue-500/8 px-2 py-3">
                <span className="text-xl font-bold text-blue-600">
                  {latestMetric.weight_kg != null ? latestMetric.weight_kg : '\u2014'}
                </span>
                <span className="text-[11px] font-medium text-blue-500/70">kg</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-cyan-500/8 px-2 py-3">
                <span className="text-xl font-bold text-cyan-600">
                  {latestMetric.height_cm != null ? latestMetric.height_cm : '\u2014'}
                </span>
                <span className="text-[11px] font-medium text-cyan-500/70">cm</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-blue-500/8 px-2 py-3">
                <span className="text-xl font-bold text-blue-600">
                  {latestMetric.bmi != null ? latestMetric.bmi : '\u2014'}
                </span>
                <span className="text-[11px] font-medium text-blue-500/70">BMI</span>
              </div>
            </div>
          )}

          {/* History */}
          {bodyMetrics.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-muted-foreground">History</p>
              <div className="flex flex-col gap-1.5">
                {bodyMetrics
                  .slice()
                  .reverse()
                  .map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2"
                    >
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="size-3.5" />
                        {formatDate(m.recorded_at)}
                      </span>
                      <span className="font-mono text-sm tabular-nums text-foreground">
                        {m.height_cm != null && `${m.height_cm}cm `}
                        {m.weight_kg != null && `${m.weight_kg}kg `}
                        {m.bmi != null && `/ BMI ${m.bmi}`}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {bodyMetrics.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">No entries yet.</p>
          )}

          {/* Add entry */}
          <div className="mt-4 flex items-end gap-2">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Height (cm)</span>
              <input
                type="number"
                value={newHeight}
                onChange={(e) => setNewHeight(e.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Weight (kg)</span>
              <input
                type="number"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className={inputClassName}
              />
            </label>
            <Button size="lg" variant="outline" onClick={handleAddBodyMetric}>
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Injuries */}
      <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div
          className={`absolute inset-x-0 top-0 h-[3px] ${
            activeInjuries.length > 0
              ? 'bg-gradient-to-r from-red-500 via-amber-400 to-red-500'
              : 'bg-gradient-to-r from-green-500 via-emerald-400 to-green-500'
          }`}
        />
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${
                activeInjuries.length > 0 ? 'bg-red-500/10' : 'bg-green-500/10'
              }`}
            >
              {activeInjuries.length > 0 ? (
                <ShieldAlert className="size-6 text-red-500" />
              ) : (
                <CheckCircle className="size-6 text-green-500" />
              )}
            </div>
            <div>
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Injuries
              </span>
              {activeInjuries.length > 0 && (
                <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600">
                  {activeInjuries.length} active
                </span>
              )}
            </div>
          </div>

          {/* Active injuries */}
          {activeInjuries.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {activeInjuries.map((inj) => {
                const isHigh = inj.severity === 'high' || inj.severity === 'critical';
                const isModerate = inj.severity === 'moderate';
                return (
                  <div
                    key={inj.id}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                      isHigh
                        ? 'border-red-500/30 bg-red-500/8'
                        : isModerate
                          ? 'border-amber-500/30 bg-amber-500/8'
                          : 'border-border bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                          isHigh
                            ? 'bg-red-500/15'
                            : isModerate
                              ? 'bg-amber-500/15'
                              : 'bg-muted'
                        }`}
                      >
                        <ShieldAlert
                          className={`size-4 ${isHigh ? 'text-red-500' : isModerate ? 'text-amber-500' : 'text-muted-foreground'}`}
                        />
                      </div>
                      <div>
                        <span className="text-base font-medium capitalize">{inj.body_part}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {formatDate(inj.occurred_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
                          isHigh
                            ? 'bg-red-500/15 text-red-600'
                            : isModerate
                              ? 'bg-amber-500/15 text-amber-600'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {inj.severity}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkRecovered(inj.id)}
                        className="text-sm"
                      >
                        Mark recovered
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recovered */}
          {injuries.filter((i) => i.recovered_at).length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-muted-foreground">Recovered</p>
              <div className="flex flex-col gap-1.5">
                {injuries
                  .filter((i) => i.recovered_at)
                  .map((inj) => (
                    <div
                      key={inj.id}
                      className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2"
                    >
                      <span className="text-sm capitalize text-muted-foreground">
                        {inj.body_part}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Recovered {formatDate(inj.recovered_at)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {injuries.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">No injuries logged.</p>
          )}

          {/* Add injury */}
          <div className="mt-4 flex items-end gap-2">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Body part</span>
              <input
                value={newInjuryPart}
                onChange={(e) => setNewInjuryPart(e.target.value)}
                placeholder="e.g. knee"
                className={`${inputClassName} placeholder:text-muted-foreground`}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Severity</span>
              <select
                value={newInjurySeverity}
                onChange={(e) => setNewInjurySeverity(e.target.value as InjurySeverity)}
                className={selectClassName}
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <Button size="lg" variant="outline" onClick={handleAddInjury}>
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
