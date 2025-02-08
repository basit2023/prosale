// components/ServiceWorkerManager.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
// import { subscribeUser } from '@/utils/pushService'; // Adjust the path as necessary
import { subscribeUser } from '@/app/pushService';
const ServiceWorkerManager = () => {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const handleRouteChange = async (url: string) => {
      if ('serviceWorker' in navigator) {
        try {
            const email=session?.user?.email;
          const registration = await navigator.serviceWorker.register('/service-worker.js');
          console.log('Service Worker registered with scope:', registration.scope);
          await subscribeUser(email);
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
  }, [router]);

  return null;
};

export default ServiceWorkerManager;
