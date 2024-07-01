// RootLayout.tsx

import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      }
    };

    // Register service worker on initial load and subsequent route changes
    handleRouteChange(router.asPath);
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

export default RootLayout;
