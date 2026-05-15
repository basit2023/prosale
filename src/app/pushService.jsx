// Push service (legacy JSX wrapper)
// This file is kept for backward compatibility.
// All functionality has been migrated to pushService.ts

import apiService from '@/utils/apiService';

export const subscribeUser = async (email) => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BBVPcdOTcge5pKMiWxgWfBEm2ugpF-NZ6soK9l0bKTpMoXuaShylZcZwor43CYhG4YzOgHuCvnqwM9Fd0wTKLp4")
    });

    const response = await apiService.post(`/subscribe/${email}`, {
      subscription: JSON.stringify(subscription),
      email
    });

    if (response.status !== 201) {
      throw new Error('Failed to save subscription');
    }

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe the user:', error);
    throw error;
  }
};

export const showPushNotification = (title, options) => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, options);
    });
  }
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}