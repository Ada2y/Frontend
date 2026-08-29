'use client';

/**
 * An evidence or correction JPEG from the pipeline.
 *
 * `<img>` can't send an Authorization header and these are behind auth, so the
 * bytes are fetched and handed to the element as a blob: URL.
 */

import {useEffect, useRef, useState} from 'react';
import Image from 'next/image';
import {ImageOff, Loader2} from 'lucide-react';
import {ApiClient} from '@/lib/api';
import {cn} from '@/lib/utils';

export default function EvidenceImage({
  videoId,
  filename,
  alt,
  className
}: {
  videoId: string;
  filename: string;
  alt: string;
  className?: string;
}) {
  // The loaded blob is tagged with the image it belongs to rather than cleared
  // in the effect. Clearing it there would be a synchronous setState in an
  // effect (a cascading render), and it would also leave a window where the
  // PREVIOUS image is still on screen under the new filename - briefly showing
  // one rep's evidence labelled as another's.
  const key = `${videoId}/${filename}`;
  const [loaded, setLoaded] = useState<{key: string; src: string} | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    ApiClient.fetchEvidenceBlob(videoId, filename)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        urlRef.current = url;
        setLoaded({key: `${videoId}/${filename}`, src: url});
      })
      .catch(() => !cancelled && setFailedKey(`${videoId}/${filename}`));

    return () => {
      cancelled = true;
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [videoId, filename]);

  const src = loaded?.key === key ? loaded.src : null;
  const error = failedKey === key;

  if (error) {
    return (
      <div
        className={cn(
          'flex h-48 w-full max-w-sm flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-muted text-muted-foreground',
          className
        )}
      >
        <ImageOff className="size-5" />
        <span className="text-xs">Image unavailable</span>
      </div>
    );
  }

  if (!src) {
    return (
      <div
        className={cn(
          'flex h-48 w-full max-w-sm items-center justify-center rounded-lg bg-muted',
          className
        )}
      >
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    // unoptimized because the source is a blob: URL created in this browser from
    // an authenticated fetch - the optimizer runs server-side and cannot reach
    // it. Everything else next/image gives us (layout stability from the
    // explicit intrinsic size, lazy loading, decoding) still applies.
    <Image
      src={src}
      alt={alt}
      width={640}
      height={480}
      unoptimized
      sizes="(max-width: 640px) 100vw, 384px"
      className={cn('h-auto w-full max-w-sm rounded-lg border border-border', className)}
    />
  );
}
