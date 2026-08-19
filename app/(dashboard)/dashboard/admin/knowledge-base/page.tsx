'use client';

import {useEffect, useRef, useState, type FormEvent} from 'react';
import {BookOpen, Loader2, RotateCw, Trash2, UploadCloud} from 'lucide-react';
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
import {
  AdminService,
  type ChunkStatus,
  type KnowledgeDocument,
  type KnowledgeSourceType
} from '@/lib/mocks/admin-service';
import {cn} from '@/lib/utils';

const SPORT_TAGS = ['football', 'basketball', 'volleyball', 'swimming', 'general'];
const SOURCE_TYPES: KnowledgeSourceType[] = ['paper', 'guideline', 'clinical'];

const statusStyles: Record<ChunkStatus, string> = {
  embedding: 'bg-[#f59e0b]/10 text-[#f59e0b]',
  ready: 'bg-[#22c55e]/10 text-[#22c55e]',
  failed: 'bg-destructive/10 text-destructive'
};

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[] | null>(null);
  const [filename, setFilename] = useState('');
  const [sportTag, setSportTag] = useState(SPORT_TAGS[0]);
  const [sourceType, setSourceType] = useState<KnowledgeSourceType>('paper');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function refresh() {
    AdminService.listDocuments().then(setDocuments);
  }

  useEffect(() => {
    refresh();
  }, []);

  // Poll while any document is still embedding, so the "ready within 60s"
  // status transition (US-AD02 acceptance criteria) shows up without a manual refresh.
  useEffect(() => {
    const hasEmbedding = documents?.some((d) => d.status === 'embedding');
    if (hasEmbedding && !pollRef.current) {
      pollRef.current = setInterval(refresh, 1500);
    } else if (!hasEmbedding && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [documents]);

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await AdminService.uploadDocument({
        filename: file.name,
        sport_tag: sportTag,
        source_type: sourceType
      });
      refresh();
      setFilename('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    await AdminService.deleteDocument(id);
    refresh();
  }

  async function handleReembed(id: string) {
    await AdminService.reembedDocument(id);
    refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Knowledge base</h1>
        <p className="text-sm text-muted-foreground">
          Upload sports-science papers and clinical guidelines the RAG engine retrieves from.
        </p>
      </div>

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
              onChange={(e) => setFilename(e.target.files?.[0]?.name ?? '')}
              className="w-64"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Sport tag</Label>
            <Select value={sportTag} onValueChange={setSportTag}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPORT_TAGS.map((tag) => (
                  <SelectItem key={tag} value={tag} className="capitalize">
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Source type</Label>
            <Select
              value={sourceType}
              onValueChange={(v) => setSourceType(v as KnowledgeSourceType)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={!filename || uploading}>
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <UploadCloud className="size-3.5" />
            )}
            Upload
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
        <div className="rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Chunks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium text-foreground">{doc.filename}</TableCell>
                  <TableCell className="capitalize">{doc.sport_tag}</TableCell>
                  <TableCell className="capitalize">{doc.source_type}</TableCell>
                  <TableCell className="tabular-nums">{doc.chunk_count || '—'}</TableCell>
                  <TableCell>
                    <Badge className={cn(statusStyles[doc.status], 'capitalize')}>
                      {doc.status === 'embedding' && <Loader2 className="size-3 animate-spin" />}
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleReembed(doc.id)}>
                        <RotateCw className="size-3.5" />
                        Re-embed
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(doc.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
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
