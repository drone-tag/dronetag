'use client';

import {
  type DragEvent,
  type ChangeEvent,
  useCallback,
  useId,
  useRef,
  useState,
} from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { classNames } from '@/lib/utils';
import { PDFPreview } from '@/components/ui/PDFPreview';
import { DIRECT_MAX_BYTES } from '@/lib/client/fileUpload';

function filenameFromUrl(url: string): string {
  try {
    const path = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://x').pathname;
    const base = path.split('/').pop() || 'document';
    return decodeURIComponent(base);
  } catch {
    return 'document';
  }
}

function isLikelyImageUrl(url: string): boolean {
  if (url.startsWith('data:image/')) return true;
  const lower = url.toLowerCase().split('?')[0] ?? '';
  return /\.(png|jpe?g|gif|webp|svg|avif|bmp|heic|heif)$/i.test(lower);
}

function isLikelyPdfUrl(url: string): boolean {
  if (url.startsWith('data:application/pdf')) return true;
  try {
    return decodeURIComponent(url).toLowerCase().includes('.pdf');
  } catch {
    return url.toLowerCase().includes('.pdf');
  }
}

type PickedKind = 'pdf' | 'image' | 'other';

function kindOfFile(file: File): PickedKind {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) return 'pdf';
  if (file.type.startsWith('image/') || /\.(heic|heif)$/i.test(file.name)) return 'image';
  return 'other';
}

/** Whether `file` matches an `accept` attribute value (types, wildcards, extensions). */
function matchesAccept(file: File, accept: string): boolean {
  const rules = accept.split(',').map((r) => r.trim().toLowerCase()).filter(Boolean);
  if (rules.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

export type UploadFieldProps = {
  label: string;
  accept: string;
  currentUrl?: string;
  onUpload: (file: File) => void;
  onRemove?: () => void;
  preview?: boolean;
  required?: boolean;
  className?: string;
  /** Upload progress between 0 and 1 while a transfer is running. */
  progress?: number | null;
  /** Largest accepted file, for the hint and the pick-time check. */
  maxBytes?: number;
};

export function UploadField({
  label,
  accept,
  currentUrl,
  onUpload,
  onRemove,
  preview = true,
  required,
  className,
  progress = null,
  maxBytes = DIRECT_MAX_BYTES,
}: UploadFieldProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const [dragOver, setDragOver] = useState(false);
  const [picked, setPicked] = useState<{ kind: PickedKind; name: string } | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);

  const pickFile = useCallback(
    (fileList: FileList | null) => {
      const file = fileList?.[0];
      if (!file) return;
      // Drag-and-drop ignores the `accept` attribute, so check here.
      if (!matchesAccept(file, accept)) {
        setPickError(t('upload.error.type'));
        return;
      }
      if (file.size > maxBytes) {
        setPickError(t('upload.error.tooLarge', { mb: Math.round(maxBytes / (1024 * 1024)) }));
        return;
      }
      setPickError(null);
      setPicked({ kind: kindOfFile(file), name: file.name });
      onUpload(file);
    },
    [accept, maxBytes, onUpload, t],
  );

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    pickFile(e.target.files);
    e.target.value = '';
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    pickFile(e.dataTransfer.files);
  }

  const acceptsPdf = /pdf/i.test(accept);
  const acceptsImage = /image|\.jpe?g|\.png|\.webp|\.heic/i.test(accept);
  const showPreview = Boolean(preview && currentUrl);
  // Object URLs carry no extension or name: rely on what was picked.
  const isLocal = Boolean(currentUrl?.startsWith('blob:'));
  const localKind = isLocal ? picked?.kind ?? null : null;
  const displayName = isLocal && picked ? picked.name : currentUrl ? filenameFromUrl(currentUrl) : '';
  const handleRemove = onRemove
    ? () => {
        setPicked(null);
        onRemove();
      }
    : undefined;
  const showImagePreview =
    showPreview &&
    (localKind
      ? localKind === 'image'
      : isLikelyImageUrl(currentUrl!) || (acceptsImage && !acceptsPdf));
  const showPdfPreview =
    showPreview &&
    !showImagePreview &&
    (localKind ? localKind === 'pdf' : isLikelyPdfUrl(currentUrl!) || (acceptsPdf && !acceptsImage));

  const formats = [acceptsPdf ? 'PDF' : '', acceptsImage ? 'JPG, PNG, HEIC' : '']
    .filter(Boolean)
    .join(', ');
  const uploading = typeof progress === 'number';

  return (
    <div className={classNames('w-full', className)}>
      <span className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
        {label}
        {required ? (
          <span className="ml-0.5 text-[var(--color-danger)]" aria-hidden>
            *
          </span>
        ) : null}
      </span>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleChange}
        tabIndex={-1}
        aria-hidden
      />

      {showImagePreview ? (
        <div className="relative mb-3 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-hover)]">
          {/*
            V-020: user-controlled URL. `referrerPolicy="no-referrer"` so
            we don't leak the in-app page URL to the image host (which
            could be an attacker if URL allowlist is widened later).
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl}
            alt=""
            referrerPolicy="no-referrer"
            decoding="async"
            className="max-h-48 w-full object-contain"
          />
          {handleRemove && !uploading ? (
            <button
              type="button"
              onClick={handleRemove}
              className="tap-44 absolute top-2 right-2 rounded-md bg-[var(--color-card)]/90 px-3 py-1.5 text-xs font-medium text-[var(--color-text)] shadow-sm ring-1 ring-[var(--color-border)] transition hover:bg-[var(--color-card)]"
            >
              {t('common.remove')}
            </button>
          ) : null}
        </div>
      ) : null}

      {showPdfPreview ? (
        <div className="relative mb-3">
          <PDFPreview url={currentUrl!} label={displayName} compact />
          {handleRemove && !uploading ? (
            <button
              type="button"
              onClick={handleRemove}
              className="tap-44 absolute top-2 right-2 z-10 rounded-md bg-[var(--color-card)]/95 px-3 py-1.5 text-xs font-medium text-[var(--color-text)] shadow-sm ring-1 ring-[var(--color-border)] transition hover:bg-[var(--color-card)]"
            >
              {t('common.remove')}
            </button>
          ) : null}
        </div>
      ) : null}

      {showPreview && currentUrl && !showImagePreview && !showPdfPreview ? (
        <div className="relative mb-3 flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-hover)] px-4 py-3">
          <svg
            className="h-10 w-10 shrink-0 text-[var(--color-text-secondary)]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--color-text)]">
            {displayName}
          </span>
          {handleRemove && !uploading ? (
            <button
              type="button"
              onClick={handleRemove}
              className="tap-44 shrink-0 rounded-md bg-[var(--color-card)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] shadow-sm ring-1 ring-[var(--color-border)] transition hover:bg-[var(--color-hover)]"
            >
              {t('common.remove')}
            </button>
          ) : null}
        </div>
      ) : null}

      {uploading ? (
        <div className="mb-3" role="status" aria-live="polite">
          <div className="mb-1 flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>{t('upload.progress')}</span>
            <span className="tabular-nums">{Math.round((progress ?? 0) * 100)}%</span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-hover)]"
            role="progressbar"
            aria-label={t('upload.progress')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round((progress ?? 0) * 100)}
          >
            <div
              className="h-full rounded-full bg-[var(--color-action)] transition-[width] duration-200"
              style={{ width: `${Math.max(4, Math.round((progress ?? 0) * 100))}%` }}
            />
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={uploading}
        aria-label={`${label} — ${t('common.clickOrDragToUpload')}`}
        aria-describedby={hintId}
        className={classNames(
          'flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition disabled:cursor-wait disabled:opacity-60 sm:py-8',
          dragOver
            ? 'border-[var(--color-action)] bg-[var(--tone-info-bg)]'
            : 'border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]/80'
        )}
      >
        <span className="text-sm font-medium text-[var(--color-text)]">{t('common.clickOrDragToUpload')}</span>
        <span id={hintId} className="mt-1 text-xs text-[var(--color-text-secondary)]">
          {t('upload.hint', { formats: formats || accept, mb: Math.round(maxBytes / (1024 * 1024)) })}
        </span>
      </button>
      {pickError ? (
        <p role="alert" className="mt-2 text-xs font-medium text-[var(--tone-danger-fg)]">
          {pickError}
        </p>
      ) : null}
    </div>
  );
}
