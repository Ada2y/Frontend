'use client';

import {useEffect, useState} from 'react';
import {Loader2, Sparkles} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import {ApiClient, type BiometricProfile} from '@/lib/api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function SuggestionCard({suggestion}: {suggestion: BiometricProfile}) {
  return (
    <Card className="p-8">
      <CardHeader className="px-0">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base capitalize">
            {suggestion.recommended_sport ?? 'No suggestion'}
          </CardTitle>
          {suggestion.confidence_score != null && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {Math.round(suggestion.confidence_score * 100)}% confidence
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-0">
        {suggestion.notes && <p className="text-sm text-foreground">{suggestion.notes}</p>}
        <p className="text-xs text-muted-foreground">{formatDate(suggestion.measured_at)}</p>
      </CardContent>
    </Card>
  );
}

export default function SportSuggestionPage() {
  const [suggestions, setSuggestions] = useState<BiometricProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ApiClient.listSportSuggestions()
      .then((list) => {
        if (!cancelled) setSuggestions(list);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load suggestions.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const suggestion = await ApiClient.generateSportSuggestion();
      setSuggestions((prev) => [suggestion, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate a suggestion.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Sport Suggestion</h1>
          <p className="text-sm text-muted-foreground">
            A fun, non-clinical suggestion based on your profile, BMI, and injury history - not a
            talent-identification verdict.
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating && <Loader2 className="size-3.5 animate-spin" />}
          Generate suggestion
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : suggestions.length === 0 ? (
        !generating && (
          <EmptyState
            icon={Sparkles}
            title="No suggestions yet"
            description="Generate a suggestion to see which sport might suit you."
          />
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {suggestions.map((s) => (
            <SuggestionCard key={s.id} suggestion={s} />
          ))}
        </div>
      )}
    </div>
  );
}
