/**
 * Local demo branding assets under /public/demo (generated portraits + marks).
 * Michele keeps production Storage URLs via micheleCaffagni.ts.
 */
export const DEMO_BRANDING = {
  admin: {
    profilePhotoUrl: '/demo/admin-photo.jpg',
    logoUrl: '',
    bannerUrl: '',
  },
  alpine: {
    profilePhotoUrl: '/demo/alpine-photo.jpg',
    logoUrl: '/demo/alpine-logo.png',
    bannerUrl: '/demo/alpine-banner.jpg',
  },
  anna: {
    profilePhotoUrl: '/demo/anna-photo.jpg',
    logoUrl: '/demo/anna-logo.png',
    bannerUrl: '/demo/anna-banner.jpg',
  },
  /** Incomplete persona: photo only, no logo/banner. */
  pierre: {
    profilePhotoUrl: '/demo/pierre-photo.jpg',
    logoUrl: '',
    bannerUrl: '',
  },
  carlos: {
    profilePhotoUrl: '/demo/carlos-photo.jpg',
    logoUrl: '/demo/carlos-logo.png',
    bannerUrl: '/demo/carlos-banner.jpg',
  },
} as const;
