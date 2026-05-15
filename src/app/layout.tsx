export const dynamic = 'force-dynamic';

import dynamic_import from 'next/dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import AuthProvider from '@/app/api/auth/[...nextauth]/auth-provider';
import { ThemeProvider } from '@/app/shared/theme-provider';
import { siteConfig } from '@/config/site.config';
import { inter, lexendDeca } from '@/app/fonts';
import { Toaster } from 'react-hot-toast';
import cn from '@/utils/class-names';
import FCMProvider from '@/app/FCMProvider';
import NextProgress from '@/components/next-progress';

import '@/app/globals.css';

// Lazy-load components that are not needed for initial page render
const GlobalDrawer = dynamic_import(() => import('@/app/shared/drawer-views/container'), { ssr: false });
const GlobalModal = dynamic_import(() => import('@/app/shared/modal-views/container'), { ssr: false });
const ServiceWorkerManager = dynamic_import(() => import('@/components/ServiceWorkerManager'), { ssr: false });

export const metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  manifest: '/manifest.json',
  icons: {
    icon: '/prosale-favicon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Prosale',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.prosale.sale',
    siteName: 'Prosale',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prosale',
    description: 'Prosale CRM application',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error('Failed to fetch session:', error);
  }

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/prosale-favicon.png" />
        <link rel="apple-touch-icon" href="/logo/logo-192.png" />
        <meta name="theme-color" content="#c54e57" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Prosale" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" type="image/png" sizes="192x192" href="/prosale-favicon.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/prosale-favicon.png" />
      </head>
      <body
        suppressHydrationWarning
        className={cn(inter.variable, lexendDeca.variable, 'font-inter')}
      >
        <AuthProvider session={session}>
          <ThemeProvider>
            <FCMProvider>
              <NextProgress />
              {children}
              <Toaster />
              <GlobalDrawer />
              <GlobalModal />
              <ServiceWorkerManager />
            </FCMProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}