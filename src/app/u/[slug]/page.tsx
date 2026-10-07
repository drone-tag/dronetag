/**
 * Public drone page — `/u/[slug]`, the target of every NFC tag and QR code.
 *
 * The page reads ONLY the sanitised `dronesPublic/{slug}` projection
 * (never raw `drones/*`), first on the server so the card is in the HTML
 * on a cold phone scan, then — only if that read could not run — from
 * the browser. See `PublicDroneView` for the client half.
 */

import type { Metadata } from 'next';
import { loadPublicSnapshot } from '@/lib/server/publicSnapshot';
import { PublicDroneView } from './PublicDroneView';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeSlug((await params).slug);
  const initial = await loadPublicSnapshot(slug);
  const drone =
    initial.kind === 'snapshot'
      ? [initial.snapshot.manufacturer, initial.snapshot.model].filter(Boolean).join(' ').trim()
      : '';
  return {
    title: drone ? `${drone} — DroneTag` : 'DroneTag',
    // Owner pages are reachable by scanning a tag; they must never be indexed.
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function PublicDronePage({ params }: Props) {
  const slug = decodeSlug((await params).slug);
  const initial = await loadPublicSnapshot(slug);
  return <PublicDroneView key={slug} slug={slug} initial={initial} />;
}
