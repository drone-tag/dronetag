'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPdfjs, loadPdfBytes } from '@/lib/pdf/loadPdfBytes';
import { classNames } from '@/lib/utils';

export type PDFPreviewProps = {
  url: string;
  label?: string;
  /** Shorter canvas stack for inline form fields. */
  compact?: boolean;
};

type LoadState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; totalPages: number; renderedPages: number }
  | { kind: 'error'; message: string };

/**
 * Pages rendered up front. Long policies run to dozens of pages, and every
 * page is a full-size canvas: rendering them all at once is slow and can
 * exhaust the canvas memory budget on iOS Safari.
 */
const INITIAL_PAGES = 3;

export function PDFPreview({ url, label, compact = false }: PDFPreviewProps) {
  const { t } = useLanguage();
  const [state, setState] = useState<LoadState>({ kind: 'idle' });
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasUrl = Boolean(url?.trim());
  const displayLabel = label || t('field.policyPdf');
  const maxHeight = compact ? 'max-h-56' : 'max-h-[min(70vh,520px)]';

  useEffect(() => {
    setShowAll(false);
  }, [url]);

  useEffect(() => {
    if (!hasUrl) {
      setState({ kind: 'idle' });
      return;
    }

    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    setState({ kind: 'loading' });
    container.replaceChildren();

    (async () => {
      let loadingTask: { destroy: () => Promise<void> } | null = null;
      try {
        const pdfjs = await getPdfjs();
        const data = await loadPdfBytes(url);
        if (cancelled) return;

        const task = pdfjs.getDocument({ data });
        loadingTask = task;
        const doc = await task.promise;
        if (cancelled) return;

        const pageLimit = showAll ? doc.numPages : Math.min(doc.numPages, compact ? 1 : INITIAL_PAGES);
        // Sharp on high-density screens without blowing up canvas memory.
        const density = Math.min(window.devicePixelRatio || 1, 2);
        const scale = (compact ? 1.1 : 1.35) * density;
        for (let pageNum = 1; pageNum <= pageLimit; pageNum += 1) {
          if (cancelled) return;
          const page = await doc.getPage(pageNum);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.className = 'mx-auto block h-auto w-full max-w-full bg-[var(--color-card)] shadow-sm';
          if (pageNum > 1) canvas.className += ' mt-2';

          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('canvas unavailable');

          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          page.cleanup();
          if (cancelled) return;
          container.appendChild(canvas);
          // Show the first page as soon as it exists instead of waiting
          // for the whole document.
          if (pageNum === 1) {
            setState({ kind: 'ready', totalPages: doc.numPages, renderedPages: 1 });
          }
        }

        if (!cancelled) {
          setState({ kind: 'ready', totalPages: doc.numPages, renderedPages: pageLimit });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            kind: 'error',
            message: err instanceof Error ? err.message : String(err),
          });
        }
      } finally {
        if (loadingTask) void loadingTask.destroy();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, hasUrl, compact, showAll]);

  if (!hasUrl) {
    return (
      <div
        className={classNames(
          'flex flex-col items-center justify-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-hover)] px-6 py-10 text-center',
          maxHeight,
        )}
      >
        <svg className="h-12 w-12 text-[var(--color-border)]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 12h8v2H8v-2zm0 4h8v2H8v-2z" />
        </svg>
        <p className="text-sm text-[var(--color-text-secondary)]">{t('common.noDocument')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={classNames(
          'overflow-y-auto overflow-x-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-hover)] p-2 shadow-sm',
          maxHeight,
        )}
      >
        {state.kind === 'loading' ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 py-10 text-sm text-[var(--color-text-secondary)]">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-text-secondary)]" />
            {t('common.pdfPreviewLoading')}
          </div>
        ) : null}

        {state.kind === 'error' ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 px-4 py-10 text-center text-sm text-[var(--color-text-secondary)]">
            <p>{t('common.pdfPreviewFailed')}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--color-action)] underline-offset-2 hover:underline"
            >
              {t('common.viewDocument')}
            </a>
          </div>
        ) : null}

        <div ref={containerRef} className={state.kind === 'ready' ? '' : 'sr-only'} aria-hidden={state.kind !== 'ready'} />

        {state.kind === 'ready' && !showAll && state.totalPages > state.renderedPages && !compact ? (
          <div className="mt-2 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-xs font-semibold text-[var(--color-action)] transition hover:bg-[var(--color-hover)]"
            >
              {t('common.pdfShowAllPages', { count: state.totalPages })}
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <svg className="h-9 w-9 shrink-0 text-[var(--tone-danger-fg)]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 12h8v2H8v-2zm0 4h8v2H8v-2z" />
          </svg>
          <div className="min-w-0 text-left">
            <p className="text-sm font-medium text-[var(--color-text)]">{displayLabel}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--color-action)] underline-offset-2 hover:underline"
            >
              {t('common.viewDocument')}
            </a>
          </div>
        </div>
        <a
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-[var(--color-action-solid)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-action-solid-hover)]"
        >
          {t('common.download')}
        </a>
      </div>
    </div>
  );
}
