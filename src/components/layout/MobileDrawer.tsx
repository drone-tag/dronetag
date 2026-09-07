'use client';

import { type ReactNode, useCallback, useRef } from 'react';
import { classNames } from '@/lib/utils';
import { useFocusTrap, useScrollLock } from '@/lib/hooks/useFocusTrap';

type MobileDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: 'left' | 'right';
};

export function MobileDrawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'left',
}: MobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const handleEscape = useCallback(() => onClose(), [onClose]);

  // The drawer is a modal surface like any other: without a trap, Tab walks
  // straight through it into the page it is covering.
  useFocusTrap({ active: isOpen, containerRef: panelRef, onEscape: handleEscape });
  useScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label={title}>
      {/* Not a button: it would be a tab stop announced before the drawer's
          own contents. Escape and the header close button serve keyboard users. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={classNames(
          'absolute top-0 flex h-full w-[min(20rem,88vw)] flex-col border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl',
          side === 'left' ? 'left-0 border-r safe-pt safe-pb' : 'right-0 border-l safe-pt safe-pb',
        )}
        style={{ paddingBottom: 'var(--safe-bottom)' }}
      >
        {title ? (
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <span className="text-sm font-semibold text-[var(--color-text)]">{title}</span>
            <button
              type="button"
              className="tap-44 rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]"
              onClick={onClose}
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : null}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
