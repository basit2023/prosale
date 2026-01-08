// import dynamic from 'next/dynamic';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
// import AuthProvider from '@/app/api/auth/[...nextauth]/auth-provider';
// import GlobalDrawer from '@/app/shared/drawer-views/container';
// import GlobalModal from '@/app/shared/modal-views/container';
// import { ThemeProvider } from '@/app/shared/theme-provider';
// import { siteConfig } from '@/config/site.config';
// import { inter, lexendDeca }  from '@/app/fonts';
// import { Toaster } from 'react-hot-toast';
// import cn from '@/utils/class-names';

// import '@/app/globals.css';
// const NextProgress = dynamic(() => import('@/components/next-progress'), {
//   ssr: false,
// });
// // styles


// export const metadata = {
//   title: siteConfig.title,
//   description: siteConfig.description,
// };

// export default async function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const session = await getServerSession(authOptions);

//   return (
//     <html lang="en" dir="ltr" suppressHydrationWarning>
//       <head>
//         {/* Link to manifest.json and icons */}
//         <link rel="manifest" href="/manifest.json" />
//         <link rel="icon" href="/favicon.ico" />

//         <meta name="theme-color" content="#000000" />
//       </head>
//       <body
//         suppressHydrationWarning
//         className={cn(inter.variable, lexendDeca.variable, 'font-inter')}
//       >
//         <AuthProvider session={session}>
//           <ThemeProvider>
//             <NextProgress />
//             {children}
//             <Toaster />
//             <GlobalDrawer />
//             <GlobalModal />
//           </ThemeProvider>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }



export const dynamic = 'force-dynamic';

// import dynamic from 'next/dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import AuthProvider from '@/app/api/auth/[...nextauth]/auth-provider';
import GlobalDrawer from '@/app/shared/drawer-views/container';
import GlobalModal from '@/app/shared/modal-views/container';
import { ThemeProvider } from '@/app/shared/theme-provider';
import { siteConfig } from '@/config/site.config';
import { inter, lexendDeca } from '@/app/fonts';
import { Toaster } from 'react-hot-toast';
import cn from '@/utils/class-names';
import ServiceWorkerManager from '@/components/ServiceWorkerManager';
import FCMProvider from '@/app/FCMProvider';

import '@/app/globals.css';
import NextProgress from '@/components/next-progress';

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
  // Fetch the session asynchronously
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error('Failed to fetch session:', error);
    // Optionally, render a fallback UI or redirect
  }



  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/prosale-favicon.png" />
        <link rel="apple-touch-icon" href="/logo/logo-192.png" />

        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#c54e57" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Prosale" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

        {/* Notification Icons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/prosale-favicon.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/prosale-favicon.png" />
      </head>
      <body
        suppressHydrationWarning
        className={cn(inter.variable, lexendDeca.variable, 'font-inter')}
      >
        {/* Wrap the entire application with the AuthProvider */}
        <AuthProvider session={session}>
          <ThemeProvider>
            <FCMProvider>
              {/* Progress bar for route transitions */}
              <NextProgress />
              {/* Main content */}
              {children}
              {/* Toast notifications */}
              <Toaster />
              {/* Global drawer and modal components */}
              <GlobalDrawer />
              <GlobalModal />
              {/* Service worker manager for PWA */}
              <ServiceWorkerManager />
            </FCMProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}