'use client';

import Link from 'next/link';
import {Activity} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {MOCK_ANALYSES, RISK_STYLES} from '@/lib/mocks/biomechanics';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';

export default function BiomechanicsPage() {
  if (!MOCK_ANALYSES.length) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Biomechanics</h1>
          <p className="text-sm text-muted-foreground">
            Joint-angle analysis and injury-risk reports from your uploaded videos.
          </p>
        </div>
        <EmptyState
          icon={Activity}
          title="No analyses yet"
          description="Upload a video and it will be processed for biomechanics analysis."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Biomechanics</h1>
        <p className="text-sm text-muted-foreground">
          Joint-angle analysis and injury-risk reports from your uploaded videos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {MOCK_ANALYSES.map((a) => {
          const risk = RISK_STYLES[a.injuryRiskLevel];
          return (
            <Link key={a.id} href={`/dashboard/biomechanics/${a.videoSessionId}`}>
              <Card size="sm" className="cursor-pointer transition-colors hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-sm truncate">{a.videoFileName}</CardTitle>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${risk.bg} ${risk.text}`}
                    >
                      {risk.label} risk
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{a.athleteName}</span>
                    <span>{a.sport}</span>
                    <span>Score: {a.techniqueScore}/100</span>
                    <span>
                      {new Date(a.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
