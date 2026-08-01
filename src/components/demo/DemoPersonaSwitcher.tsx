'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DEMO_PERSONAS,
  getDemoPersonaId,
  setDemoPersonaId,
  type DemoPersonaId,
} from '@/lib/demo/personas';
import { classNames } from '@/lib/utils';

export function DemoPersonaSwitcher({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState<DemoPersonaId>('demo-admin');

  useEffect(() => {
    setCurrent(getDemoPersonaId());
  }, []);

  function onChange(id: DemoPersonaId) {
    const persona = DEMO_PERSONAS.find((p) => p.id === id);
    setCurrent(id);
    setDemoPersonaId(id);
    // Admin stays in /admin; users in /account. Do not re-seed on switch —
    // otherwise admin verify results would be wiped when opening Anna/Carlos.
    router.push(persona?.isAdmin ? '/admin' : '/account');
  }

  if (compact) {
    return (
      <label className="inline-flex items-center gap-2 text-xs text-white/95">
        <span className="hidden sm:inline">Persona</span>
        <select
          value={current}
          onChange={(e) => onChange(e.target.value as DemoPersonaId)}
          className="max-w-[14rem] rounded-md border border-white/30 bg-black/20 px-2 py-1 text-xs text-white outline-none"
        >
          {DEMO_PERSONAS.map((p) => (
            <option key={p.id} value={p.id} className="text-black">
              {p.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div className="space-y-3">
      {DEMO_PERSONAS.map((p) => {
        const active = p.id === current;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={classNames(
              'w-full rounded-xl border px-4 py-3 text-left transition-colors',
              active
                ? 'border-[var(--color-action)] bg-[var(--color-action-light)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-hover)]',
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--color-text)]">{p.label}</p>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                {p.isAdmin ? 'Admin' : 'User'}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{p.summary}</p>
            <p className="mt-1 font-mono text-[11px] text-[var(--color-text-secondary)]">{p.email}</p>
          </button>
        );
      })}
    </div>
  );
}
