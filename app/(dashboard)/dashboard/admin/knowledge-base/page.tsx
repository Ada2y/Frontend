'use client';

import {useCallback, useEffect, useRef, useState, type FormEvent} from 'react';
import {BookOpen, CheckCircle2, Loader2, Trash2, UploadCloud} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {Table, TableHeader, TableBody, TableRow, TableHead, TableCell} from '@/components/ui/table';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import StatCard from '@/app/(dashboard)/_components/StatCard';
import {
  ApiClient,
  SPORT_CATEGORIES,
  type DocumentStatus,
  type KnowledgeDoc,
  type KnowledgeSourceType,
  type SportCategory
} from '@/lib/api';
import {cn} from '@/lib/utils';

const COLORS = {
  primary: '#5e6ad2',
  green: '#22c55e',
  amber: '#f59e0b'
} as const;

const SOURCE_LABELS: Record<KnowledgeSourceType, string> = {
  research_paper: 'Research paper',
  clinical_guideline: 'Clinical guideline',
  technique_guideline: 'Technique guideline',
  athlete_history: 'Athlete history'
};

const SOURCE_TYPES = Object.keys(SOURCE_LABELS) as KnowledgeSourceType[];

const STATUS_STYLES: Record<DocumentStatus, string> = {
  processing: 'bg-warning-bg text-warning',
  ready: 'bg-success-bg text-success',
  failed: 'bg-danger-bg text-danger'
};

const NO_SPORT = 'none';

function formatUploaded(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<KnowledgeDoc[] | null>(null);
  const [title, setTitle] = useState('');
  const [citation, setCitation] = useState('');
  const [sport, setSport] = useState<SportCategory | typeof NO_SPORT>(NO_SPORT);
  const [sourceType, setSourceType] = useState<KnowledgeSourceType>('research_paper');
  const [language, setLanguage] = useState('en');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      setDocuments(await ApiClient.listKnowledge());
      setError(null);
    } catch (err) {
      setDocuments([]);
      setError(err instanceof Error ? err.message : 'Failed to load the knowledge base.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, [refresh]);

  // A Celery worker chunks and embeds the PDF after upload, flipping status
  // from processing to ready/failed - so poll only while something is still
  // in flight, and stop as soon as the queue is clear.
  useEffect(() => {
    if (!documents?.some((d) => d.status === 'processing')) return;
    const timer = setInterval(() => void refresh(), 3000);
    return () => clearInterval(timer);
  }, [documents, refresh]);

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file || !title.trim()) return;
    setUploading(true);
    setError(null);
    try {
      await ApiClient.uploadKnowledge({
        file,
        title: title.trim(),
        source_type: sourceType,
        sport: sport === NO_SPORT ? undefined : sport,
        language,
        citation: citation.trim() || undefined
      });
      setTitle('');
      setCitation('');
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(docId: string) {
    try {
      await ApiClient.deleteKnowledge(docId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete that document.');
    }
  }

  const ready = documents?.filter((d) => d.status === 'ready').length ?? 0;
  const processing = documents?.filter((d) => d.status === 'processing').length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Knowledge base</h1>
        <p className="text-base text-muted-foreground">
          Sports-science papers and clinical guidelines the RAG engine retrieves from.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={BookOpen}
          label="Documents"
          value={documents?.length ?? '—'}
          description="In the knowledge base"
          accentColor={COLORS.primary}
        />
        <StatCard
          icon={CheckCircle2}
          label="Indexed"
          value={ready}
          description="Embedded and retrievable"
          accentColor={COLORS.green}
        />
        <StatCard
          icon={Loader2}
          label="Processing"
          value={processing}
          description={processing > 0 ? 'Chunking and embedding' : 'Nothing in flight'}
          accentColor={COLORS.amber}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleUpload} className="rounded-xl bg-card p-8 ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kb-file">PDF file</Label>
            <Input
              id="kb-file"
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              required
              onChange={(e) => {
                const picked = e.target.files?.[0];
                setFileName(picked?.name ?? '');
                // The backend requires a separate title, so default it to the
                // filename rather than making the admin retype it.
                if (picked && !title.trim()) setTitle(picked.name.replace(/\.pdf$/i, ''));
              }}
              className="w-64"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kb-title">Title</Label>
            <Input
              id="kb-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ACL injury prevention in football"
              className="w-64"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Source type</Label>
            <Select
              value={sourceType}
              onValueChange={(v) => setSourceType(v as KnowledgeSourceType)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {SOURCE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Sport</Label>
            <Select value={sport} onValueChange={(v) => setSport(v as SportCategory)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_SPORT}>Any sport</SelectItem>
                {SPORT_CATEGORIES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kb-citation">Citation (optional)</Label>
            <Input
              id="kb-citation"
              value={citation}
              onChange={(e) => setCitation(e.target.value)}
              placeholder="Br J Sports Med, 2024"
              className="w-56"
            />
          </div>
          <Button type="submit" disabled={!fileName || !title.trim() || uploading}>
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <UploadCloud className="size-3.5" />
            )}
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        </div>
      </form>

      {documents === null ? (
        <div className="h-48 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10" />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Knowledge base is empty"
          description="Upload a PDF above to ground the AI agents in real sports-science literature."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Lang</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{doc.title}</div>
                    {doc.citation && (
                      <div className="text-xs text-muted-foreground">{doc.citation}</div>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">{doc.sport ?? 'Any'}</TableCell>
                  <TableCell>{SOURCE_LABELS[doc.source_type] ?? doc.source_type}</TableCell>
                  <TableCell className="uppercase text-muted-foreground">{doc.language}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {formatUploaded(doc.created_at)}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(STATUS_STYLES[doc.status], 'capitalize')}>
                      {doc.status === 'processing' && <Loader2 className="size-3 animate-spin" />}
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Delete ${doc.title}`}
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="size-3.5 text-danger" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
