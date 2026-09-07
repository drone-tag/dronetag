'use client';

import { useEffect, useState } from 'react';
import { getAccount } from '@/lib/firebase/account';

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
    void getAccount(uid)
      .then((a) => {
        if (cancelled) return;
        setLoaded({
          uid,
          photoUrl: a?.profilePhotoUrl || '',
          name: a ? [a.firstName, a.lastName].filter(Boolean).join(' ').trim() : '',
        });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ uid, photoUrl: '', name: '' });
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const current = uid && loaded?.uid === uid ? loaded : null;

  return { photoUrl: current?.photoUrl ?? '', name: current?.name ?? '' };
}
