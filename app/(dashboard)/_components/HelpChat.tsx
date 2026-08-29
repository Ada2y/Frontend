'use client';

/**
 * The help assistant, grounded in Ada2y's own documentation.
 *
 * Two things the UI has to be honest about, because the backend is:
 *
 * - It answers from a corpus, and it says when the corpus doesn't cover
 *   something. `used_context: false` is a refusal or a miss, not an answer, so
 *   the sources block is hidden and the reply is marked rather than presented
 *   as authoritative.
 * - It cannot see the reader's account, videos or results. That is stated up
 *   front instead of being discovered by asking "why did my squat fail?" and
 *   getting a redirect.
 */

import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Bot,
  ChevronDown,
  Languages,
  Loader2,
  MessageCircle,
  Quote,
  Send,
  ShieldCheck,
  Sparkles,
  User as UserIcon
} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {ApiClient, type HelpAnswer, type HelpSource} from '@/lib/api';
import {cn} from '@/lib/utils';

const SUGGESTIONS = [
  'How do I film a squat?',
  'What does the depth check measure?',
  'Why does my video say retry needed?',
  'What does Ada2y not measure?'
];

/** The backend caps the question; matching it here turns a 422 into a
 * character counter. */
const MAX_QUESTION_CHARS = 800;

/** How many previous exchanges to replay for context. The backend only reads
 * the last few, so sending more is wasted payload. */
const HISTORY_TURNS = 3;

interface Exchange {
  question: string;
  answer: HelpAnswer | null;
  /** Set when the request itself failed, as opposed to the assistant declining. */
  error?: string;
}

function SourceList({sources}: {sources: HelpSource[]}) {
  const [open, setOpen] = useState(false);
  if (sources.length === 0) return null;

  return (
    <div className="mt-2 border-t border-border pt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <BookOpen className="size-3" />
        {sources.length} source{sources.length === 1 ? '' : 's'}
        <ChevronDown className={cn('size-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <ul className="mt-2 flex flex-col gap-2">
          {sources.map((source, i) => (
            <li
              key={`${source.document_id}-${i}`}
              className="rounded-md border border-border bg-background/60 p-2"
            >
              <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Quote className="size-3 shrink-0 text-muted-foreground" />
                {source.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{source.excerpt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AnswerBubble({exchange, arabic}: {exchange: Exchange; arabic: boolean}) {
  if (exchange.error) {
    return (
      <div className="rounded-xl rounded-tl-sm border border-danger/30 bg-danger-bg/40 p-3">
        <p className="text-sm text-danger">{exchange.error}</p>
      </div>
    );
  }

  if (!exchange.answer) {
    return (
      <div className="flex items-center gap-2 rounded-xl rounded-tl-sm border border-border bg-muted/40 p-3">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Checking the documentation…</span>
      </div>
    );
  }

  const {answer} = exchange;
  const text = arabic ? answer.answer_ar : answer.answer_en;

  return (
    <div className="rounded-xl rounded-tl-sm border border-border bg-muted/40 p-3">
      {!answer.used_context && (
        <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-warning">
          <ShieldCheck className="size-3" />
          Not covered by the Ada2y documentation
        </p>
      )}
      {answer.extractive && (
        <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
          Quoted from the documentation
        </p>
      )}
      <p
        className="whitespace-pre-line text-sm leading-relaxed text-foreground"
        dir={arabic ? 'rtl' : 'ltr'}
      >
        {text}
      </p>
      <SourceList sources={answer.sources} />
    </div>
  );
}

export default function HelpChat() {
  const [question, setQuestion] = useState('');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [asking, setAsking] = useState(false);
  const [arabic, setArabic] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only scroll once there is a conversation - doing it on mount would yank
    // the page down to an empty chat panel.
    if (exchanges.length > 0)
      endRef.current?.scrollIntoView({behavior: 'smooth', block: 'nearest'});
  }, [exchanges]);

  async function ask(raw: string) {
    const text = raw.trim();
    if (!text || asking) return;

    setQuestion('');
    setAsking(true);
    setExchanges((prev) => [...prev, {question: text, answer: null}]);

    // Only exchanges that actually produced an answer are replayed; a failed
    // request is not a turn the assistant ever saw.
    const history = exchanges
      .filter((e) => e.answer)
      .slice(-HISTORY_TURNS)
      .map((e) => ({question: e.question, answer: e.answer!.answer_en}));

    try {
      const answer = await ApiClient.askHelp(text, history);
      setExchanges((prev) => prev.map((e, i) => (i === prev.length - 1 ? {...e, answer} : e)));
    } catch {
      setExchanges((prev) =>
        prev.map((e, i) =>
          i === prev.length - 1
            ? {...e, error: "Couldn't reach the assistant. Please try again."}
            : e
        )
      );
    } finally {
      setAsking(false);
    }
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            Ask Ada2y
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Answers about how the platform works, grounded in its own documentation.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setArabic((v) => !v)}
          aria-pressed={arabic}
          title="Switch answer language"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Languages className="size-3.5" />
          {arabic ? 'عربي' : 'EN'}
        </button>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          {exchanges.length === 0 ? (
            <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-4">
              <div className="flex items-start gap-2">
                <Bot className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Ask about filming a movement, what a check measures, reading your report, or what
                  the analysis does and doesn&apos;t claim.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => ask(suggestion)}
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            exchanges.map((exchange, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex items-start justify-end gap-2">
                  <p className="max-w-[85%] rounded-xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
                    {exchange.question}
                  </p>
                  <UserIcon className="mt-2 size-4 shrink-0 text-muted-foreground" />
                </div>
                <div className="flex items-start gap-2">
                  <Bot className="mt-2 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <AnswerBubble exchange={exchange} arabic={arabic} />
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
          className="flex flex-col gap-1.5"
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MessageCircle className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value.slice(0, MAX_QUESTION_CHARS))}
                placeholder="Ask about Ada2y…"
                aria-label="Ask the Ada2y help assistant"
                disabled={asking}
                className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground disabled:opacity-60"
              />
            </div>
            <Button type="submit" size="sm" disabled={asking || !question.trim()}>
              {asking ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            The assistant can&apos;t see your account or your videos, and doesn&apos;t give medical
            advice. For feedback on one session, use the coach chat on that{' '}
            <Link href="/dashboard/biomechanics" className="underline hover:text-foreground">
              session&apos;s report
            </Link>
            .
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
