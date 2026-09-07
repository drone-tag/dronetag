'use client';

/**
 * Focus management for modal dialogs.
 *
 * A dialog that does not trap focus is only visually modal: keyboard and
 * screen-reader users tab straight out of it into the page behind, which is
 * still rendered and still interactive, and they have no reliable way to get
 * back. That was the state of `Modal` before this hook existed.
 *
 * Implemented directly rather than via a library. The behaviour needed here is
 * well-defined and small, and the two libraries usually reached for
 * (focus-trap-react, Radix) both cost noticeably more than the code below.
 *
 * What this handles, and why each part is needed:
 *
 *   • Initial focus, so the first Tab lands inside the dialog rather than at
 *     the top of the document.
 *   • Wrapping Tab and Shift+Tab at the boundaries.
 *   • Restoring focus to whatever opened the dialog. Without this, closing a
 *     dialog drops focus onto <body> and the user has to tab from the start of
 *     the page to get back to where they were.
 *   • Escape to close.
 *
 * Deliberately NOT handled: hiding the rest of the page from assistive
 * technology with `aria-hidden` or `inert`. Doing that correctly means
 * mutating siblings outside React's control, and `aria-modal="true"` on the
 * dialog already conveys the same thing to every screen reader the product
 * targets.
 */

import { useEffect, type RefObject } from 'react';

/**
 * Elements that can hold focus. `[tabindex="-1"]` is excluded: it means
 * "focusable by script but not by Tab", so including it would make the trap
 * stop on elements a real Tab press would skip.
 */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusableWithin(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => {
    // `offsetParent === null` catches `display: none` ancestors; the explicit
    // check covers `position: fixed` elements, where offsetParent is always
    // null and would otherwise produce a false negative.
    if (el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true') return false;
    return el.offsetParent !== null || getComputedStyle(el).position === 'fixed';
  });
}

export interface FocusTrapOptions {
  /** When false the hook does nothing, so callers can keep hook order stable. */
  active: boolean;
  containerRef: RefObject<HTMLElement | null>;
  onEscape?: () => void;
}

export function useFocusTrap({ active, containerRef, onEscape }: FocusTrapOptions): void {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    // Captured before focus moves, so it survives the dialog's lifetime.
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const initial = focusableWithin(container)[0];
    if (initial) {
      initial.focus();
    } else {
      // An empty dialog still needs focus inside it, otherwise the trap has
      // nothing to hold on to and Escape would not reach the handler.
      container.setAttribute('tabindex', '-1');
      container.focus();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onEscape?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const node = containerRef.current;
      if (!node) return;

      // Recomputed on every Tab rather than cached: dialog content is often
      // conditional, and a stale list would let focus escape through a control
      // that appeared after the dialog opened.
      const items = focusableWithin(node);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const activeEl = document.activeElement;

      if (event.shiftKey && (activeEl === first || !node.contains(activeEl))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeEl === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      // Only restore if focus is still somewhere in the dialog. If the close
      // handler already moved focus deliberately — say, to a newly created
      // row — stealing it back would be wrong.
      //
      // Reading the ref at cleanup time rather than capturing it earlier is
      // the point: on unmount it is already null, which is precisely the
      // "the dialog is gone, take focus back" case. The usual advice to copy
      // the ref into a variable inside the effect would freeze it to the node
      // as it was on open and break that check.
      // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
      const node = containerRef.current;
      const activeEl = document.activeElement;
      const focusStillInside = !node || !activeEl || node.contains(activeEl) || activeEl === document.body;
      if (focusStillInside && previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [active, containerRef, onEscape]);
}

/** Prevents the page behind a dialog from scrolling while it is open. */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}
