'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { resyncUserPublicDrones } from '@/lib/firebase/dronesPublic';
import {
  ensureAccount,
  updateAccount,
  uploadAccountBranding,
} from '@/lib/firebase/account';
import { errorMessage } from '@/lib/client/errorMessage';
import { DEMO_MODE } from '@/lib/firebase/config';
import { ensurePilot, updatePilot } from '@/lib/firebase/pilots';
import type { Address, UserAccount } from '@/lib/types/account';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { UploadField } from '@/components/ui/UploadField';
import { FormErrorBanner } from '@/components/account/FormErrorBanner';
import { PlanSlotsSummary } from '@/components/account/PlanSlotsSummary';
import { LoadError, PageLoading } from '@/components/ui/LoadError';
import { useToast } from '@/contexts/ToastContext';

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif';

const EMPTY_ADDRESS: Address = { line1: '', line2: '', city: '', postalCode: '', country: '' };

interface AccountFormState {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: Address;
  companyName: string;
  companyContactPerson: string;
  companyVat: string;
  companyUniqueNumber: string;
  profilePhotoUrl: string;
  logoUrl: string;
  bannerUrl: string;
}

type AccountErrors = Partial<Record<'submit', string>>;

export default function AccountProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const a = await ensureAccount(user.uid, user.email ?? '');
      setAccount(a);
      setLoadError(null);
      // The pilot record mirrors the account; it must not hold up the page.
      void ensurePilot(user.uid, {
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        phone: a.phone,
        address: a.address,
        dateOfBirth: a.dateOfBirth,
      }).catch((err) => console.warn('[account] ensurePilot failed', err));
    } catch (err) {
      console.error('[account] load failed', err);
      setLoadError(errorMessage(err, t, 'loadError.body'));
    }
  }, [user, t]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        await load();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, load]);

  if (loading) return <PageLoading />;

  if (!user) return null;
  if (!account) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <LoadError message={loadError} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <IdentityCard uid={user.uid} account={account} onSaved={(next) => setAccount(next)} />
      <PlanSlotsSummary />
      <AccountCard
        uid={user.uid}
        initial={account}
        onSaved={(next) => setAccount(next)}
      />
      <Card padding="md">
        <h2 className="text-base font-semibold text-[var(--color-text)]">{t('account.delete.title')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {t('account.delete.body')}
        </p>
        <div className="mt-4">
          <Button
            href="/account/support?subject=Account%20deletion%20request"
            variant="secondary"
            size="sm"
          >
            {t('account.delete.cta')}
          </Button>
        </div>
      </Card>
      <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        {t('legal.platformDisclaimer')}
      </p>
    </div>
  );
}

/**
 * Registered identity, read-only once set (changes go through support). A
 * name that was never filled in — accounts created by an admin, or a Google
 * profile without one — can be completed here once.
 */
function IdentityCard({
  uid,
  account,
  onSaved,
}: {
  uid: string;
  account: UserAccount;
  onSaved: (a: UserAccount) => void;
}) {
  const { t } = useLanguage();
  const toast = useToast();
  const isCompany = account.accountType === 'company';
  const missingName = isCompany
    ? !account.companyName.trim()
    : !account.firstName.trim() || !account.lastName.trim();
  const [firstName, setFirstName] = useState(account.firstName);
  const [lastName, setLastName] = useState(account.lastName);
  const [companyName, setCompanyName] = useState(account.companyName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = isCompany
    ? companyName.trim().length > 0
    : firstName.trim().length > 0 && lastName.trim().length > 0;

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const patch = isCompany
        ? { companyName: companyName.trim() }
        : { firstName: firstName.trim(), lastName: lastName.trim() };
      await updateAccount(uid, patch);
      if (!isCompany) {
        await updatePilot(uid, patch).catch((err) =>
          console.warn('[account] pilot name sync failed', err),
        );
      } else {
        void resyncUserPublicDrones(uid).catch((err) =>
          console.warn('[account] public resync failed', err),
        );
      }
      onSaved({ ...account, ...patch, updatedAt: new Date().toISOString() });
      toast.success(t('account.saved'));
    } catch (err) {
      console.error('[account] identity save failed', err);
      setError(errorMessage(err, t));
    } finally {
      setSaving(false);
    }
  }

  const displayName = isCompany
    ? account.companyName
    : [account.firstName, account.lastName].filter(Boolean).join(' ');
  const rows: { label: string; value: string }[] = [
    { label: isCompany ? t('field.companyName') : t('account.identity.name'), value: displayName },
    { label: t('field.email'), value: account.email },
    { label: t('field.phone'), value: account.phone },
  ];

  return (
    <Card padding="md">
      <h2 className="text-base font-semibold text-[var(--color-text)]">
        {isCompany ? t('account.section.companyInfo') : t('account.section.privateInfo')}
      </h2>
      {missingName ? (
        <form onSubmit={handleSave} noValidate className="mt-3 space-y-4">
          <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {t('account.identity.completeHint')}
          </p>
          <FormErrorBanner show={Boolean(error)} message={error ?? undefined} />
          {isCompany ? (
            <Input
              label={t('field.companyName')}
              name="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoComplete="organization"
              required
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={t('field.firstName')}
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
              />
              <Input
                label={t('field.lastName')}
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
              />
            </div>
          )}
          <div className="flex justify-end">
            <Button type="submit" loading={saving} disabled={!canSave}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      ) : (
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          {rows.map((row) => (
            <div key={row.label} className="min-w-0">
              <dt className="text-xs text-[var(--color-text-secondary)]">{row.label}</dt>
              <dd className="mt-0.5 truncate font-medium text-[var(--color-text)]">{row.value || '—'}</dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}

function AccountCard({
  uid,
  initial,
  onSaved,
}: {
  uid: string;
  initial: UserAccount;
  onSaved: (a: UserAccount) => void;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState<AccountFormState>(() => toAccountForm(initial));
  const [errors, setErrors] = useState<AccountErrors>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [photoObjUrl, setPhotoObjUrl] = useState<string>();
  const [logoObjUrl, setLogoObjUrl] = useState<string>();
  const [bannerObjUrl, setBannerObjUrl] = useState<string>();
  const blobUrlsRef = useRef(new Set<string>());
  const [progress, setProgress] = useState<Partial<Record<'photo' | 'logo' | 'banner', number>>>({});

  useEffect(() => {
    setForm(toAccountForm(initial));
    setPhotoFile(null);
    setLogoFile(null);
    setBannerFile(null);
    setPhotoObjUrl(undefined);
    setLogoObjUrl(undefined);
    setBannerObjUrl(undefined);
    setErrors({});
    setDirty(false);
    setSavedAt(initial.profilePhotoUrl || initial.logoUrl || initial.bannerUrl ? Date.now() : null);
    // Sync when account identity / branding changes — not on every new object reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally narrow deps
  }, [
    initial.uid,
    initial.updatedAt,
    initial.profilePhotoUrl,
    initial.logoUrl,
    initial.bannerUrl,
  ]);

  useEffect(() => {
    const tracked = blobUrlsRef.current;
    return () => {
      tracked.forEach((url) => URL.revokeObjectURL(url));
      tracked.clear();
    };
  }, []);

  function trackBlobUrl(url: string) {
    blobUrlsRef.current.add(url);
    return url;
  }

  function handleImageSelect(
    file: File,
    setFile: (f: File | null) => void,
    setPreview: (url: string | undefined) => void,
    prevPreview?: string,
  ) {
    if (prevPreview && blobUrlsRef.current.has(prevPreview)) {
      URL.revokeObjectURL(prevPreview);
      blobUrlsRef.current.delete(prevPreview);
    }
    setFile(file);
    setPreview(trackBlobUrl(URL.createObjectURL(file)));
    setDirty(true);
  }

  function setField<K extends keyof AccountFormState>(key: K, value: AccountFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    setSaving(true);
    try {
      // The three images go up in parallel; each route stores its own URL.
      const track = (kind: 'photo' | 'logo' | 'banner') => (fraction: number) =>
        setProgress((p) => ({ ...p, [kind]: fraction }));
      const [profilePhotoUrl, logoUrl, bannerUrl] = await Promise.all([
        photoFile ? uploadAccountBranding('photo', photoFile, track('photo')) : form.profilePhotoUrl,
        logoFile ? uploadAccountBranding('logo', logoFile, track('logo')) : form.logoUrl,
        bannerFile ? uploadAccountBranding('banner', bannerFile, track('banner')) : form.bannerUrl,
      ]);

      // Removals (and every demo-mode change) are written here; uploads
      // in live mode were already stored by POST /api/account/branding.
      const removed = {
        ...(!photoFile && initial.profilePhotoUrl !== profilePhotoUrl ? { profilePhotoUrl } : {}),
        ...(!logoFile && initial.logoUrl !== logoUrl ? { logoUrl } : {}),
        ...(!bannerFile && initial.bannerUrl !== bannerUrl ? { bannerUrl } : {}),
      };
      if (DEMO_MODE) {
        await updateAccount(uid, { profilePhotoUrl, logoUrl, bannerUrl });
      } else if (Object.keys(removed).length > 0) {
        await updateAccount(uid, removed);
      }

      // Public pages pick up the new branding in the background.
      void resyncUserPublicDrones(uid).catch((err) =>
        console.warn('[account] public resync failed', err),
      );

      const patch = {
        ...form,
        profilePhotoUrl,
        logoUrl,
        bannerUrl,
      };

      const next: UserAccount = {
        ...initial,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      setForm(patch);
      onSaved(next);
      setPhotoFile(null);
      setLogoFile(null);
      setBannerFile(null);
      setPhotoObjUrl(undefined);
      setLogoObjUrl(undefined);
      setBannerObjUrl(undefined);
      setDirty(false);
      setSavedAt(Date.now());
    } catch (err) {
      console.error('[account] save failed', err);
      setErrors({ submit: errorMessage(err, t) });
    } finally {
      setSaving(false);
      setProgress({});
    }
  }

  function removeImage(
    key: 'profilePhotoUrl' | 'logoUrl' | 'bannerUrl',
    setFile: (f: File | null) => void,
    setPreview: (url: string | undefined) => void,
  ) {
    setFile(null);
    setPreview(undefined);
    setField(key, '');
  }

  const photoPreview = photoObjUrl || form.profilePhotoUrl || undefined;
  const logoPreview = logoObjUrl || form.logoUrl || undefined;
  const bannerPreview = bannerObjUrl || form.bannerUrl || undefined;

  return (
    <Card padding="md">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--color-text)]">
              {t('account.section.media')}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              {t('account.lockedIdentityHint')}{' '}
              <Link
                href="/account/support?subject=Richiesta%20cambio%20dati"
                className="font-medium text-[var(--color-action)] underline-offset-2 hover:underline"
              >
                {t('support.nav')}
              </Link>
            </p>
          </div>
          {savedAt && !dirty ? (
            <span className="rounded-full bg-[var(--tone-success-bg)] px-2.5 py-1 text-xs font-medium text-[var(--tone-success-fg)] ring-1 ring-inset ring-[var(--tone-success-ring)]">
              {t('account.saved')}
            </span>
          ) : null}
        </header>

        <FormErrorBanner show={Boolean(errors.submit)} message={errors.submit} />

        <div className="space-y-4">
          <UploadField
            label={t('field.photo')}
            accept={IMAGE_ACCEPT}
            currentUrl={photoPreview}
            onUpload={(file) => handleImageSelect(file, setPhotoFile, setPhotoObjUrl, photoObjUrl)}
            onRemove={photoPreview && !saving ? () => removeImage('profilePhotoUrl', setPhotoFile, setPhotoObjUrl) : undefined}
            progress={saving && photoFile ? progress.photo ?? 0 : null}
            preview
          />
          <UploadField
            label={t('field.logo')}
            accept={IMAGE_ACCEPT}
            currentUrl={logoPreview}
            onUpload={(file) => handleImageSelect(file, setLogoFile, setLogoObjUrl, logoObjUrl)}
            onRemove={logoPreview && !saving ? () => removeImage('logoUrl', setLogoFile, setLogoObjUrl) : undefined}
            progress={saving && logoFile ? progress.logo ?? 0 : null}
            preview
          />
          <UploadField
            label={t('field.banner')}
            accept={IMAGE_ACCEPT}
            currentUrl={bannerPreview}
            onUpload={(file) => handleImageSelect(file, setBannerFile, setBannerObjUrl, bannerObjUrl)}
            onRemove={bannerPreview && !saving ? () => removeImage('bannerUrl', setBannerFile, setBannerObjUrl) : undefined}
            progress={saving && bannerFile ? progress.banner ?? 0 : null}
            preview
          />
        </div>

        <div className="flex items-center justify-end">
          <Button type="submit" loading={saving} disabled={!dirty}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function toAccountForm(a: UserAccount): AccountFormState {
  return {
    firstName: a.firstName,
    lastName: a.lastName,
    dateOfBirth: a.dateOfBirth,
    email: a.email,
    phone: a.phone,
    address: { ...EMPTY_ADDRESS, ...a.address },
    companyName: a.companyName,
    companyContactPerson: a.companyContactPerson,
    companyVat: a.companyVat,
    companyUniqueNumber: a.companyUniqueNumber,
    profilePhotoUrl: a.profilePhotoUrl ?? '',
    logoUrl: a.logoUrl ?? '',
    bannerUrl: a.bannerUrl ?? '',
  };
}
