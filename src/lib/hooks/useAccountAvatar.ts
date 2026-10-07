'use client';

import { useEffect, useState } from 'react';
import { getAccount } from '@/lib/firebase/account';
import type { UserAccount } from '@/lib/types/account';

const EVENT = 'dronetag-account-avatar';

export type AccountAvatarPatch = { uid: string; name?: string; photoUrl?: string };

/** The sidebar and the header load the name once. Profile saves call this so they update immediately. */
export function notifyAccountAvatar(patch: AccountAvatarPatch): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<AccountAvatarPatch>(EVENT, { detail: patch }));
}

export function accountDisplayName(
  account: Pick<UserAccount, 'accountType' | 'companyName' | 'firstName' | 'lastName'> | null | undefined,
): string {
  if (!account) return '';
  if (account.accountType === 'company') return account.companyName.trim();
  return [account.firstName, account.lastName].filter(Boolean).join(' ').trim();
}

/** Loads account display name + profile photo for avatar chips. */
export function useAccountAvatar(uid: string | undefined | null) {
  // The loaded values carry the uid they describe. Clearing them for a missing
  // uid then becomes a matter of the uid not matching, rather than an effect
  // that wrote empty strings on its way past. It also closes a gap in the old
  // version: the reset only ran when the uid went away, so switching straight
  // from one account to another kept showing the previous person's avatar
  // until the new request came back.
  const [loaded, setLoaded] = useState<{ uid: string; photoUrl: string; name: string } | null>(
    null,
  );

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    // A save can land while the first read is still in flight. That read must
    // not overwrite the name the save just published.
    let saved = false;
    void getAccount(uid)
      .then((a) => {
        if (cancelled || saved) return;
        setLoaded({
          uid,
          photoUrl: a?.profilePhotoUrl || '',
          name: accountDisplayName(a),
        });
      })
      .catch(() => {
        if (!cancelled && !saved) setLoaded({ uid, photoUrl: '', name: '' });
      });

    function onUpdate(event: Event) {
      const detail = (event as CustomEvent<AccountAvatarPatch>).detail;
      if (!detail || detail.uid !== uid) return;
      saved = true;
      setLoaded((prev) => {
        const base = prev?.uid === uid ? prev : { uid, photoUrl: '', name: '' };
        return {
          uid,
          name: detail.name !== undefined ? detail.name : base.name,
          photoUrl: detail.photoUrl !== undefined ? detail.photoUrl : base.photoUrl,
        };
      });
    }
    window.addEventListener(EVENT, onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener(EVENT, onUpdate);
    };
  }, [uid]);

  const current = uid && loaded?.uid === uid ? loaded : null;

  return { photoUrl: current?.photoUrl ?? '', name: current?.name ?? '' };
}
