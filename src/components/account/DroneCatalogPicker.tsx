'use client';

import { useMemo, useState } from 'react';
import {
  CUSTOM_DRONE_CATALOG_ID,
  droneCatalogLabel,
  searchDroneCatalog,
  type DroneCatalogEntry,
} from '@/lib/droneCatalog';
import { useLanguage } from '@/contexts/LanguageContext';
import { classNames } from '@/lib/utils';

type DroneCatalogPickerProps = {
  selectedId: string | null;
  onSelect: (entry: DroneCatalogEntry | null) => void;
};

export function DroneCatalogPicker({ selectedId, onSelect }: DroneCatalogPickerProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchDroneCatalog(query), [query]);
  const isCustom = selectedId === CUSTOM_DRONE_CATALOG_ID;

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="drone-catalog-search" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
          {t('drone.catalog.search')}
        </label>
        <input
          id="drone-catalog-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
          placeholder={t('drone.catalog.searchPlaceholder')}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-action)] focus:ring-2 focus:ring-[var(--color-action)]/20"
          autoComplete="off"
        />
        <p className="mt-1.5 text-xs text-[var(--color-text-secondary)]">{t('drone.catalog.hint')}</p>
      </div>

      <div
        className="max-h-52 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]"
        role="listbox"
        aria-label={t('drone.catalog.title')}
      >
        {results.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-[var(--color-text-secondary)]">
            {t('drone.catalog.empty')}
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {results.map((entry) => {
              const active = selectedId === entry.id;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => onSelect(entry)}
                    className={classNames(
                      'flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors',
                      active
                        ? 'bg-[var(--color-action-light)]'
                        : 'hover:bg-[var(--color-hover)]',
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[var(--color-text)]">
                        {droneCatalogLabel(entry)}
                      </span>
                      {entry.note ? (
                        <span className="mt-0.5 block text-[11px] text-[var(--color-text-secondary)]">
                          {entry.note}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 rounded-full bg-[var(--color-hover)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-[var(--color-text)]">
                      {entry.classMarking}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={() => onSelect(null)}
        className={classNames(
          'w-full rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors',
          isCustom
            ? 'border-[var(--color-action)] bg-[var(--color-action-light)] text-[var(--color-action)]'
            : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]',
        )}
      >
        {t('drone.catalog.custom')}
      </button>
    </div>
  );
}
