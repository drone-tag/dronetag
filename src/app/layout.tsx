import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppShell } from '@/components/layout/AppShell';
import { AuthRoutePrefetch } from '@/components/auth/AuthRoutePrefetch';
import { ServiceWorkerCleanup } from '@/components/system/ServiceWorkerCleanup';
import { DEMO_MODE } from '@/lib/firebase/config';
import './globals.css';

const BRAND_ASSET_VERSION = '3';

const themeBootScript = `(function(){try{var k='dronetag-theme';var t=localStorage.getItem(k);var dark=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var v=dark?'dark':'light';document.documentElement.setAttribute('data-theme',v);document.documentElement.style.colorScheme=v;var l=localStorage.getItem('dronetag-language');if(l==='en'||l==='it'||l==='de'||l==='es'||l==='fr'){document.documentElement.lang=l;}else{document.documentElement.lang='it';}}catch(e){}})();`;

export const metadata: Metadata = {
  title: 'DroneTag — Drone Identification Platform',
  description:
    'Digital identification and document management for drone operators. Not an official aviation authority registry.',
  applicationName: 'DroneTag',
  icons: {
    icon: [
      {
        url: `/favicon.png?v=${BRAND_ASSET_VERSION}`,
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: `/icon-192.png?v=${BRAND_ASSET_VERSION}`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: `/icon-512.png?v=${BRAND_ASSET_VERSION}`,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: `/apple-touch-icon.png?v=${BRAND_ASSET_VERSION}`,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f8fc' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" data-demo={DEMO_MODE ? 'true' : undefined} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="theme-transition antialiased">
        <ServiceWorkerCleanup />
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <AuthRoutePrefetch />
              <AppShell>{children}</AppShell>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
