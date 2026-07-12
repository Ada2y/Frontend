import {Apple, ShieldAlert} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import NutritionStatusBadge from '@/app/(dashboard)/_components/NutritionStatusBadge';
import {mockNutritionAutoApproved, mockNutritionPendingReview} from '@/lib/mocks/nutrition';
import type {NutritionRecommendation} from '@/lib/api';

const macroLabels: {key: keyof NutritionRecommendation['macros']; label: string; unit: string}[] = [
  {key: 'calories', label: 'Calories', unit: 'kcal'},
  {key: 'protein', label: 'Protein', unit: 'g'},
  {key: 'carbs', label: 'Carbs', unit: 'g'},
  {key: 'fats', label: 'Fats', unit: 'g'}
];

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
      <CardContent className="flex flex-col gap-6 px-0">
        {isPending ? (
          <div className="flex items-start gap-3 rounded-lg bg-[#f59e0b]/5 p-4 ring-1 ring-[#f59e0b]/20">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-[#f59e0b]" />
            <p className="text-sm text-foreground">
              This recommendation touches a logged medical condition and is held for a clinical
              safety check before it becomes final. Do not act on it until it&apos;s approved.
            </p>
          </div>
        ) : (
          <p className="text-sm text-foreground">{rec.summary}</p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {macroLabels.map((m) => (
            <div key={m.key} className="flex flex-col gap-1">
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {m.label}
              </span>
              <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
                {rec.macros[m.key]}
                <span className="ml-1 text-xs font-normal text-muted-foreground">{m.unit}</span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function NutritionPage() {
  const hasData = true;

  if (!hasData) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Nutrition</h1>
          <p className="text-sm text-muted-foreground">
            Clinically aware nutrition advice based on your training load and medical conditions.
          </p>
        </div>
        <EmptyState
          icon={Apple}
          title="No nutrition advice yet"
          description="Log a meal or upload a session to receive nutrition recommendations here."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Nutrition</h1>
        <p className="text-sm text-muted-foreground">
          Clinically aware nutrition advice based on your training load and medical conditions.
        </p>
      </div>

      {/* Both states rendered to verify the status branch — real page will show one at a time */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <NutritionCard rec={mockNutritionAutoApproved} />
        <NutritionCard rec={mockNutritionPendingReview} />
      </div>
    </div>
  );
}
