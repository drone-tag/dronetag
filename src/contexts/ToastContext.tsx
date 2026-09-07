'use client';

/**
 * Global toast notifications.
 *
 * Before this, feedback for create/update/delete/upload was inconsistent:
 * some flows set a local success string, some logged to the console, most did
 * nothing at all, so a user could publish a profile or delete a drone with no
 * confirmation that anything had happened.
 *
 * Written by hand rather than pulled from a library. The requirement is a
 * queue, a timer and a live region — a dependency would add more bundle weight
 * than the 150 lines it replaces, and the accessibility behaviour is the part
 * that actually matters, which is easier to get right when it is visible here.
 *
 * Accessibility notes:
 *   • The viewport is a single persistent `aria-live` region. Screen readers
 *     only announce changes inside a region that already existed, so mounting
 *     the container conditionally would silently break announcements.
 *   • Errors are `assertive` (they interrupt) while everything else is
 *     `polite` (waits for a pause). Two separate regions are required for
 *     this, since politeness is a property of the region, not the message.
 *   • Toasts are not focus-stealing. They must never interrupt what someone
 *     is typing, so dismissal is optional and everything auto-expires except
 *     errors.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ToastTone = 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  id: string;
  tone: ToastTone;
  message: string;
  /** Milliseconds before auto-dismiss. `null` means it stays until dismissed. */
  duration: number | null;
}

export interface ToastOptions {
  duration?: number | null;
}

interface ToastContextValue {
  show: (tone: ToastTone, message: string, options?: ToastOptions) => string;
  success: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Errors default to staying put: they usually carry something the user has to
 * read and act on, and a message that vanishes after four seconds is worse
 * than no message when it was the only explanation of a failure.
 */
const DEFAULT_DURATION: Record<ToastTone, number | null> = {
  success: 4000,
  info: 5000,
  warning: 7000,
  error: null,
};

/** Beyond this the stack starts covering content; oldest non-error goes first. */
const MAX_VISIBLE = 4;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (tone: ToastTone, message: string, options?: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const duration = options?.duration === undefined ? DEFAULT_DURATION[tone] : options.duration;

      setToasts((prev) => {
        const next = [...prev, { id, tone, message, duration }];
        if (next.length <= MAX_VISIBLE) return next;
        // Drop the oldest dismissible toast rather than simply the oldest, so
        // a burst of successes cannot push an error off screen unread.
        const victim = next.find((t) => t.tone !== 'error') ?? next[0];
        const timer = timers.current.get(victim.id);
        if (timer) {
          clearTimeout(timer);
          timers.current.delete(victim.id);
        }
        return next.filter((t) => t.id !== victim.id);
      });

      if (duration !== null) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }

      return id;
    },
    [dismiss],
  );

  // Clearing on unmount matters in tests and fast refresh, where the provider
  // remounts and orphaned timers would fire against a dead setState.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      dismiss,
      success: (message, options) => show('success', message, options),
      info: (message, options) => show('info', message, options),
      warning: (message, options) => show('warning', message, options),
      error: (message, options) => show('error', message, options),
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside a ToastProvider');
  return ctx;
}

const TONE_CLASS: Record<ToastTone, string> = {
  success:
    'bg-[var(--tone-success-bg)] text-[var(--tone-success-fg)] ring-[var(--tone-success-ring)]',
  info: 'bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)] ring-[var(--tone-info-ring)]',
  warning:
    'bg-[var(--tone-warning-bg)] text-[var(--tone-warning-fg)] ring-[var(--tone-warning-ring)]',
  error: 'bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] ring-[var(--tone-danger-ring)]',
};

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  const assertive = toasts.filter((t) => t.tone === 'error');
  const polite = toasts.filter((t) => t.tone !== 'error');

  return (
    // `pb-[env(safe-area-inset-bottom)]` keeps toasts clear of the home
    // indicator on iOS, and the bottom tab bar the app shows on small screens.
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] sm:pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:items-end sm:px-6"
      // Both regions live here permanently. Rendering them only when a toast
      // exists would mean the region is created at the same moment its content
      // appears, which screen readers do not reliably announce.
    >
      <ToastRegion politeness="assertive" toasts={assertive} onDismiss={onDismiss} />
      <ToastRegion politeness="polite" toasts={polite} onDismiss={onDismiss} />
    </div>
  );
}

function ToastRegion({
  politeness,
  toasts,
  onDismiss,
}: {
  politeness: 'polite' | 'assertive';
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live={politeness}
      aria-atomic="false"
      className="flex w-full flex-col items-stretch gap-2 sm:max-w-sm"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-lg ring-1 ${TONE_CLASS[toast.tone]}`}
        >
          <span className="flex-1 break-words">{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            // Labelled rather than relying on the "×" glyph, which reads as
            // "times" or is skipped entirely.
            aria-label="Dismiss notification"
            className="-mr-1 shrink-0 rounded px-1 text-base leading-none opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
