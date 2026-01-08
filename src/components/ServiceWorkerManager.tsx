// components/ServiceWorkerManager.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
// import { subscribeUser } from '@/utils/pushService'; // Adjust the path as necessary
import { subscribeUser } from '@/app/pushService';
const ServiceWorkerManager = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleRouteChange = async (url: string) => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js');
          console.log('Service Worker registered with scope:', registration.scope);

          // Only subscribe if user is authenticated
          if (status === 'authenticated' && session?.user?.email) {
            const email = session.user.email;
            await subscribeUser(email);
          } else {
            console.log('Skipping push notification subscription - user not authenticated');
          }
        } catch (error) {
          console.error('Service Worker registration or subscription failed:', error);
        }
      }
    };

    // Register service worker and subscribe for push notifications on initial load and subsequent route changes
    handleRouteChange(window.location.pathname);
    router?.events?.on('routeChangeComplete', handleRouteChange);

    return () => {
      router?.events?.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, session, status]); // Add session and status to dependencies

  return null;
};

export default ServiceWorkerManager;
