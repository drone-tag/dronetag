'use client';

import { type ReactNode, useCallback, useEffect, useId, useRef } from 'react';
import { classNames } from '@/lib/utils';
import { useFocusTrap, useScrollLock } from '@/lib/hooks/useFocusTrap';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /**
   * Short supporting text announced with the title. Use for consequences a
   * screen-reader user should hear before the body is read out — a destructive
   * action, say — not as a general subtitle.
   */
  description?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, description }: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Stable identity so the trap does not tear down and re-run whenever the
  // parent re-renders with a fresh inline callback.
  const handleEscape = useCallback(() => onClose(), [onClose]);

  useFocusTrap({ active: isOpen, containerRef: panelRef, onEscape: handleEscape });
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => {
      backdropRef.current?.classList.remove('opacity-0');
      backdropRef.current?.classList.add('opacity-100');
      panelRef.current?.classList.remove('translate-y-2', 'scale-[0.98]', 'opacity-0');
      panelRef.current?.classList.add('translate-y-0', 'scale-100', 'opacity-100');
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      {/*
        A plain div, not a button. Click-outside-to-close is a convenience for
        pointer users; as a <button> it also became a tab stop announced as
        "Close dialog", which put a control before the dialog's own content and
        gave keyboard users a second, redundant close affordance. Escape and
        the header close button cover them properly.
      */}
      <div
        ref={backdropRef}
        aria-hidden
        className="absolute inset-0 bg-black/45 opacity-0 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={classNames(
          'relative z-10 flex w-full max-w-lg flex-col rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl sm:rounded-xl',
          // Tablets get a roomier dialog than the phone sheet but stay well
          // short of the desktop width, which looked stranded at 768–1024px.
          'max-h-[min(92dvh,100dvh)] sm:max-w-xl sm:max-h-[min(85dvh,40rem)] lg:max-w-lg',
          'translate-y-2 scale-[0.98] opacity-0 transition-all duration-200 ease-out',
        )}
      >
        <div
          className="mx-auto mt-2.5 h-1 w-12 shrink-0 rounded-full bg-[var(--color-border)] sm:hidden"
          aria-hidden
        />

        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="min-w-0 pr-1 text-sm font-semibold leading-snug text-[var(--color-text)] sm:text-lg"
            >
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-xs text-[var(--color-text-secondary)] sm:text-sm">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="tap-44 -mr-2 inline-flex items-center justify-center rounded-lg p-1.5 text-[var(--color-text-secondary)] transition hover:bg-[var(--color-hover)] hover:text-[var(--color-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action)]"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-6 sm:py-4">
          {children}
        </div>

        {footer ? (
          <div className="safe-pb shrink-0 border-t border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 sm:px-6 sm:py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
