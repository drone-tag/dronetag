'use client';

/**
 * /cookies — draft cookie and browser-storage notice.
 *
 * The inventory is taken from the code, not from a template: the two sign-in
 * cookies are `__dronetag_session` (src/app/api/session/route.ts) and
 * `__dronetag_idt` (src/contexts/AuthContext.tsx), and the two local-storage
 * keys are `dronetag-theme` (src/contexts/ThemeContext.tsx) and
 * `dronetag-language` (src/contexts/LanguageContext.tsx). Re-check this page
 * whenever any of those change.
 */

import { useLanguage } from '@/contexts/LanguageContext';
import { LegalPageShell, LegalSection } from '@/components/legal/LegalPageShell';

export default function CookiesPage() {
  const { t } = useLanguage();

  return (
    <LegalPageShell
      route="/cookies"
      title={t('legal.cookies.title')}
      subtitle={t('legal.cookies.subtitle')}
    >
      <LegalSection title={t('legal.cookies.scope.title')}>
        <p>{t('legal.cookies.scope.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.cookies.essential.title')}>
        <p>{t('legal.cookies.essential.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.cookies.storage.title')}>
        <p>{t('legal.cookies.storage.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.cookies.analytics.title')}>
        <p>{t('legal.cookies.analytics.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.cookies.thirdParty.title')}>
        <p>{t('legal.cookies.thirdParty.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.cookies.consent.title')}>
        <p>{t('legal.cookies.consent.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.cookies.control.title')}>
        <p>{t('legal.cookies.control.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.cookies.changes.title')}>
        <p>{t('legal.cookies.changes.body')}</p>
      </LegalSection>
    </LegalPageShell>
  );
}
