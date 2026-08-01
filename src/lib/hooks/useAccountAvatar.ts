'use client';

import { useEffect, useState } from 'react';
import { getAccount } from '@/lib/firebase/account';

/** Loads account display name + profile photo for avatar chips. */
export function useAccountAvatar(uid: string | undefined | null) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (!uid) {
      setPhotoUrl('');
      setName('');
      return;
    }
    let cancelled = false;
    void getAccount(uid)
      .then((a) => {
        if (cancelled || !a) return;
        setPhotoUrl(a.profilePhotoUrl || '');
        const n = [a.firstName, a.lastName].filter(Boolean).join(' ').trim();
        setName(n);
      })
      .catch(() => {
        if (!cancelled) {
          setPhotoUrl('');
          setName('');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return { photoUrl, name };
}
