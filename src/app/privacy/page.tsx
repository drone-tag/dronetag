'use client';

/**
 * /privacy — draft privacy notice.
 *
 * Placeholder pending legal review. The statements about what does and does
 * not reach the public drone page are checked against the code rather than
 * assumed: the public route reads only `dronesPublic/{slug}`, whose shape is
 * fixed by `DronePublicSnapshot` in src/lib/types/entities.ts and built by
 * `projectSnapshot()` in src/lib/firebase/dronesPublic.ts. If either changes,
 * the "what is visible" and "what is not published" sections must change too.
 */

import { useLanguage } from '@/contexts/LanguageContext';
import { LegalPageShell, LegalSection } from '@/components/legal/LegalPageShell';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <LegalPageShell
      route="/privacy"
      title={t('legal.privacy.title')}
      subtitle={t('legal.privacy.subtitle')}
    >
      <LegalSection title={t('legal.privacy.who.title')}>
        <p>{t('legal.privacy.who.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.privacy.collect.title')}>
        <p>{t('legal.privacy.collect.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.privacy.why.title')}>
        <p>{t('legal.privacy.why.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.privacy.public.title')}>
        <p>{t('legal.privacy.public.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.privacy.notPublic.title')}>
        <p>{t('legal.privacy.notPublic.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.privacy.sharing.title')}>
        <p>{t('legal.privacy.sharing.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.privacy.retention.title')}>
        <p>{t('legal.privacy.retention.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.privacy.requests.title')}>
        <p>{t('legal.privacy.requests.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.privacy.security.title')}>
        <p>{t('legal.privacy.security.body')}</p>
      </LegalSection>

      <LegalSection title={t('legal.privacy.changes.title')}>
        <p>{t('legal.privacy.changes.body')}</p>
      </LegalSection>
    </LegalPageShell>
  );
}
