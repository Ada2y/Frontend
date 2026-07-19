'use client';

import {useEffect, useState} from 'react';
import {Apple, Loader2, ShieldAlert} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import NutritionStatusBadge from '@/app/(dashboard)/_components/NutritionStatusBadge';
import {ApiClient, type NutritionRecommendation} from '@/lib/api';
import {LAST_NUTRITION_ID_KEY} from '@/lib/last-generated';

function NutritionCard({rec}: {rec: NutritionRecommendation}) {
  const isPending = rec.status === 'pending_review';

  return (
    <Card className="p-8">
      <CardHeader className="px-0">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base">Nutrition recommendation</CardTitle>
          <NutritionStatusBadge status={rec.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-0">
        {isPending && (
          <div className="flex items-start gap-3 rounded-lg bg-[#f59e0b]/5 p-4 ring-1 ring-[#f59e0b]/20">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-[#f59e0b]" />
            <p className="text-sm text-foreground">
              This recommendation touches a logged medical condition and is held for a clinical
              safety check before it becomes final. Do not act on it until it&apos;s approved.
            </p>
          </div>
        )}
        {rec.recommendation_en && (
          <p className="whitespace-pre-line text-sm text-foreground">{rec.recommendation_en}</p>
        )}
        {rec.recommendation_ar && (
          <p dir="rtl" className="whitespace-pre-line text-right text-sm text-foreground">
            {rec.recommendation_ar}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function NutritionPage() {
  const [recommendation, setRecommendation] = useState<NutritionRecommendation | null>(null);
  const [loading, setLoading] = useState(
    () => typeof window !== 'undefined' && !!localStorage.getItem(LAST_NUTRITION_ID_KEY)
  );
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedId =
      typeof window !== 'undefined' ? localStorage.getItem(LAST_NUTRITION_ID_KEY) : null;
    if (!savedId) return;
    ApiClient.getNutrition(savedId)
      .then(setRecommendation)
      .catch(() => localStorage.removeItem(LAST_NUTRITION_ID_KEY))
      .finally(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const rec = await ApiClient.generateNutrition();
      setRecommendation(rec);
      localStorage.setItem(LAST_NUTRITION_ID_KEY, rec.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate a recommendation.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Nutrition</h1>
          <p className="text-sm text-muted-foreground">
            Clinically aware nutrition advice based on your training load and medical conditions.
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating && <Loader2 className="size-3.5 animate-spin" />}
          {recommendation ? 'Regenerate' : 'Generate recommendation'}
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {generating && !recommendation && (
        <p className="text-sm text-muted-foreground">
          Generating your recommendation - this calls a real LLM and can take several seconds…
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : !recommendation && !generating ? (
        <EmptyState
          icon={Apple}
          title="No nutrition advice yet"
          description="Generate a recommendation to get clinically aware nutrition advice."
        />
      ) : (
        recommendation && (
          <div className="max-w-xl">
            <NutritionCard rec={recommendation} />
          </div>
        )
      )}
    </div>
  );
}
