// PWA Push Service for Next.js - Web Notifications
import apiService from "@/utils/apiService";

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if browser supports push notifications
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    console.warn('❌ Push notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log(`✅ Notification permission: ${permission}`);
    return permission;
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Subscribe user to push notifications
 */
export async function subscribeUser(email: string): Promise<{
  success: boolean;
  subscription?: PushSubscription;
  error?: string;
}> {
  try {
    if (!isPushNotificationSupported()) {
      return { success: false, error: 'Push notifications not supported' };
    }

    // Check permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Notification permission denied' };
    }

    // Register service worker - try both paths for compatibility
    console.log('📋 Registering service worker...');
    let registration: ServiceWorkerContainer['controller'];
    try {
      registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });
    } catch {
      // Fallback to alternative path
      registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
    }
    console.log('✅ Service worker registered');

    // Get VAPID public key
    const vapidPublicKey =
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
      'BBVPcdOTcge5pKMiWxgWfBEm2ugpF-NZ6soK9l0bKTpMoXuaShylZcZwor43CYhG4YzOgHuCvnqwM9Fd0wTKLp4';

    if (!vapidPublicKey) {
      return { success: false, error: 'VAPID key not configured' };
    }

    // Subscribe to push notifications
    console.log('🔔 Subscribing to push notifications...');
    const subscription = await (registration as any).pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    console.log('✅ Push subscription successful');

    // Send subscription to backend
    console.log('📤 Sending subscription to backend...');
    const response = await apiService.post(`/subscribe/${email}`, {
      subscription,
      email,
    });

    if (response.data.success) {
      console.log('✅ Subscription saved to backend');
      return { success: true, subscription };
    }

    return { success: false, error: 'Failed to save subscription to backend' };
  } catch (error) {
    console.error('❌ Error subscribing to push notifications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Unsubscribe user from push notifications
 */
export const unsubscribeUser = async (email: string) => {
  try {
    if (!isPushNotificationSupported()) {
      return { success: false, error: 'Push notifications not supported' };
    }

    let registration: any;
    try {
      registration = await navigator.serviceWorker.getRegistration('/');
    } catch {
      registration = await navigator.serviceWorker.getRegistration('/sw.js');
    }

    if (!registration) {
      return { success: false, error: 'No service worker registration found' };
    }

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('✅ Unsubscribed from push notifications');

      // Notify backend about unsubscription
      if (email) {
        try {
          await apiService.post(`/unsubscribe/${email}`, { email });
        } catch (error) {
          console.error('❌ Error notifying backend of unsubscription:', error);
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to unsubscribe:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Get current push subscription status
 */
export async function getPushSubscriptionStatus(): Promise<{
  isSupported: boolean;
  isSubscribed: boolean;
  subscription?: PushSubscription;
}> {
  try {
    if (!isPushNotificationSupported()) {
      return { isSupported: false, isSubscribed: false };
    }

    let registration: any;
    try {
      registration = await navigator.serviceWorker.getRegistration('/');
    } catch {
      registration = await navigator.serviceWorker.getRegistration('/sw.js');
    }

    if (!registration) {
      return { isSupported: true, isSubscribed: false };
    }

    const subscription = await registration.pushManager.getSubscription();
    return {
      isSupported: true,
      isSubscribed: !!subscription,
      subscription: subscription || undefined,
    };
  } catch (error) {
    console.error('❌ Error checking subscription status:', error);
    return { isSupported: false, isSubscribed: false };
  }
}

/**
 * Show a test notification
 */
export async function showTestNotification(
  title: string = 'Test Notification',
  body: string = 'This is a test notification'
): Promise<void> {
  try {
    if (!isPushNotificationSupported()) {
      console.warn('❌ Notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
      });
      console.log('✅ Test notification shown');
    }
  } catch (error) {
    console.error('❌ Error showing test notification:', error);
  }
}

/**
 * Get notification history from backend
 */
export async function getNotificationHistory(email: string, limit: number = 20): Promise<{
  success: boolean;
  notifications?: any[];
  error?: string;
}> {
  try {
    const response = await apiService.get(`/getNotification/${email}?limit=${limit}`);
    return {
      success: response.data.success,
      notifications: response.data.data,
    };
  } catch (error) {
    console.error('❌ Error fetching notification history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default {
  isPushNotificationSupported,
  requestNotificationPermission,
  subscribeUser,
  unsubscribeUser,
  getPushSubscriptionStatus,
  showTestNotification,
  getNotificationHistory,
};