/**
 * Turn any error thrown by a data-layer call into a sentence for the user.
 *
 * Raw messages ("Missing or insufficient permissions.", "upload policy pdf
 * failed (413)") are English, technical and often misleading, so they are
 * logged by the caller and never shown.
 */

import { ApiError } from '@/lib/client/apiError';
import { FileTooLargeError, UnsupportedFileError } from '@/lib/client/fileUpload';
import { UnsupportedImageError } from '@/lib/client/imagePrep';

type Translate = (key: string, params?: Record<string, string | number>) => string;

function code(err: unknown): string {
  return err && typeof err === 'object' && 'code' in err ? String((err as { code: unknown }).code) : '';
}

export function errorMessage(err: unknown, t: Translate, fallbackKey = 'account.saveError'): string {
  if (err instanceof FileTooLargeError) {
    return t('upload.error.tooLarge', { mb: Math.round(err.limitBytes / (1024 * 1024)) });
  }
  if (err instanceof UnsupportedImageError) return t('upload.error.heic');
  if (err instanceof UnsupportedFileError) return t('upload.error.type');

  if (err instanceof Error && err.message === 'storage_billing_required') {
    return t('account.storageBillingRequired');
  }

  if (err instanceof ApiError) {
    if (err.code === 'locked') return t('error.locked');
    if (err.code === 'suspended') return t('error.suspended');
    if (err.code === 'quota') return t('error.quota');
    if (err.code === 'invalid_link') return t('error.invalidLink');
    if (err.code === 'email_in_use') return t('error.emailInUse');
    if (err.code === 'invalid_email') return t('signup.errorInvalidEmail');
    if (err.status === 401) return t('error.session');
    if (err.status === 403) return t('error.permission');
    if (err.status === 404) return t('error.notFound');
    if (err.status === 413) return t('upload.error.tooLarge', { mb: 50 });
    if (err.status === 415) return t('upload.error.type');
    if (err.status === 429) return t('error.rateLimited');
    if (err.status >= 500) return t('error.server');
    return t(fallbackKey);
  }

  const c = code(err);
  if (c === 'permission-denied' || c === 'storage/unauthorized') return t('error.permission');
  if (c === 'unavailable' || c === 'storage/retry-limit-exceeded') return t('error.network');
  if (c === 'storage/canceled') return t('upload.error.canceled');
  if (c === 'storage/quota-exceeded') return t('error.server');
  if (c === 'auth/network-request-failed') return t('error.network');
  if (err instanceof TypeError && /fetch|network|load failed/i.test(err.message)) {
    return t('error.network');
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return t('error.network');
  return t(fallbackKey);
}
