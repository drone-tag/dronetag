'use client';

/**
 * /terms — draft terms of service.
 *
 * Placeholder pending legal review. Sections that would need a lawyer to say
 * anything binding (liability, governing law, refunds, minimum age) state
 * that they are unresolved instead of proposing wording.
 */

import { useLanguage } from '@/contexts/LanguageContext';
import { LegalPageShell, LegalSection } from '@/components/legal/LegalPageShell';

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <LegalPageShell
      route="/terms"
      title={t('legal.terms.title')}
      subtitle={t('legal.terms.subtitle')}
    >
      <LegalSection title={t('legal.terms.what.title')}>
        <p>{t('legal.terms.what.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.terms.eligibility.title')}>
        <p>{t('legal.terms.eligibility.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.terms.account.title')}>
        <p>{t('legal.terms.account.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.terms.content.title')}>
        <p>{t('legal.terms.content.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.terms.publication.title')}>
        <p>{t('legal.terms.publication.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.terms.verification.title')}>
        <p>{t('legal.terms.verification.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.terms.plans.title')}>
        <p>{t('legal.terms.plans.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.terms.availability.title')}>
        <p>{t('legal.terms.availability.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.terms.suspension.title')}>
        <p>{t('legal.terms.suspension.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.terms.liability.title')}>
        <p>{t('legal.terms.liability.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.terms.law.title')}>
        <p>{t('legal.terms.law.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.terms.changes.title')}>
        <p>{t('legal.terms.changes.body')}</p>
      </LegalSection>
    </LegalPageShell>
  );
}
