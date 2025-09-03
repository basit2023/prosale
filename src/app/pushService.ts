import { routes } from "@/config/routes";
import apiService from "@/utils/apiService";

export async function showPushNotification(title, options) {
  try {
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    } else if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, options);
      }
    }
  } catch (error) {
    console.error('Failed to show push notification:', error);
  }
}

export const subscribeUser = async (email) => {
  try {
    // Check browser support
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return { success: false, error: 'Push messaging not supported' };
    }

    // Validate email
    if (!email || typeof email !== 'string') {
      throw new Error('Valid email is required');
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered successfully');

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return { success: false, error: 'Notification permission denied' };
    }

    // Get VAPID key from environment
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BBVPcdOTcge5pKMiWxgWfBEm2ugpF-NZ6soK9l0bKTpMoXuaShylZcZwor43CYhG4YzOgHuCvnqwM9Fd0wTKLp4";
    if (!vapidKey) {
      throw new Error('VAPID public key not configured in environment variables');
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey)
    });

    // Send subscription to backend
    const response = await apiService.post(`/subscribe/${email}`, { 
      subscription, 
      email 
    });

    console.log('Push notification subscription successful');
    return { success: true, subscription, response };

  } catch (error) {
    console.error('Push notification subscription failed:', error);
    return { success: false, error: error.message };
  }
};

export const unsubscribeUser = async (email) => {
  try {
    if (!('serviceWorker' in navigator)) {
      return { success: false, error: 'Service Worker not supported' };
    }

    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!registration) {
      return { success: false, error: 'No service worker registration found' };
    }

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      
      // Notify backend about unsubscription
      if (email) {
        await apiService.delete(`/subscribe/${email}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return { success: false, error: error.message };
  }
};

export const checkSubscriptionStatus = async () => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return { isSupported: false, isSubscribed: false };
    }

    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!registration) {
      return { isSupported: true, isSubscribed: false };
    }

    const subscription = await registration.pushManager.getSubscription();
    return { 
      isSupported: true, 
      isSubscribed: !!subscription,
      subscription 
    };
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return { isSupported: false, isSubscribed: false, error: error.message };
  }
};

// Helper function for VAPID key conversion with proper error handling
function urlBase64ToUint8Array(base64String) {
  try {
    // Validate input
    if (!base64String) {
      throw new Error('VAPID public key is missing or undefined');
    }
    
    if (typeof base64String !== 'string') {
      throw new Error('VAPID public key must be a string');
    }

    // Add padding if needed
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    // Decode base64
    let rawData;
    try {
      rawData = window.atob(base64);
    } catch (error) {
      throw new Error('Invalid VAPID public key format');
    }

    // Convert to Uint8Array
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  } catch (error) {
    console.error('Error converting VAPID key:', error);
    throw error;
  }
}

// Utility function to check if push notifications are enabled
export const isPushNotificationSupported = () => {
  return 'serviceWorker' in navigator && 
         'PushManager' in window && 
         'Notification' in window;
};

// Utility function to get current permission status
export const getNotificationPermission = () => {
  if ('Notification' in window) {
    return Notification.permission;
  }
  return 'unsupported';
};