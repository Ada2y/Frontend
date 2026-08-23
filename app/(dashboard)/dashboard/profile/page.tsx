'use client';

import {useEffect, useState} from 'react';
import {AlertCircle, Check, Loader2, Plus} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
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
  'h-8 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50';
const selectClassName =
  'flex h-9 min-w-0 rounded-md bg-input px-3 py-1 text-sm text-foreground shadow-sm outline-none ring-1 ring-foreground/10 focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50';

function formatDate(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
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

      // Height/weight ARE body metrics - a profile edit that changes either
      // one is itself a new measurement, so it belongs in the same
      // append-only history the "Add entry" form below writes to, without
      // making the athlete re-enter the same number twice.
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const selectedCodes = new Set(myConditions.map((c) => c.condition.code));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your athlete profile, medical conditions, body metrics, and injuries.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-danger">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <Card className="p-8">
        <CardHeader className="px-0">
          <CardTitle className="text-base">Personal & physical</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Date of birth</span>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Gender</span>
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
              <span className="text-xs font-medium text-muted-foreground">Height (cm)</span>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Weight (kg)</span>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Dominant sport</span>
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
              <span className="text-xs font-medium text-muted-foreground">Fitness level</span>
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
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              Save
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-xs text-success">
                <Check className="size-3.5" />
                Saved
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="p-8">
        <CardHeader className="px-0">
          <CardTitle className="text-base">Medical conditions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 px-0">
          {catalog.map((condition) => {
            const isSelected = selectedCodes.has(condition.code);
            return (
              <label
                key={condition.code}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleCondition(condition.code, isSelected)}
                  className="accent-primary"
                />
                {condition.name_en}
              </label>
            );
          })}
        </CardContent>
      </Card>

      <Card className="p-8">
        <CardHeader className="px-0">
          <CardTitle className="text-base">Body metrics history</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 px-0">
          {bodyMetrics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {bodyMetrics.map((m) => (
                <li key={m.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{formatDate(m.recorded_at)}</span>
                  <span className="font-mono text-foreground tabular-nums">
                    {m.height_cm != null && `${m.height_cm}cm `}
                    {m.weight_kg != null && `${m.weight_kg}kg `}
                    {m.bmi != null && `· BMI ${m.bmi}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-end gap-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Height (cm)</span>
              <input
                type="number"
                value={newHeight}
                onChange={(e) => setNewHeight(e.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Weight (kg)</span>
              <input
                type="number"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className={inputClassName}
              />
            </label>
            <Button size="sm" variant="outline" onClick={handleAddBodyMetric}>
              <Plus className="size-3.5" />
              Add entry
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="p-8">
        <CardHeader className="px-0">
          <CardTitle className="text-base">Injuries</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 px-0">
          {injuries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No injuries logged.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {injuries.map((inj) => (
                <li key={inj.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-foreground capitalize">
                    {inj.body_part} <span className="text-muted-foreground">({inj.severity})</span>
                  </span>
                  {inj.recovered_at ? (
                    <span className="text-xs text-muted-foreground">
                      Recovered {formatDate(inj.recovered_at)}
                    </span>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => handleMarkRecovered(inj.id)}>
                      Mark recovered
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-end gap-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Body part</span>
              <input
                value={newInjuryPart}
                onChange={(e) => setNewInjuryPart(e.target.value)}
                placeholder="e.g. knee"
                className={`${inputClassName} placeholder:text-muted-foreground`}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Severity</span>
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
            <Button size="sm" variant="outline" onClick={handleAddInjury}>
              <Plus className="size-3.5" />
              Add injury
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
