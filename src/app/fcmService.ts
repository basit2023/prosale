/**
 * Firebase Cloud Messaging Service for Next.js PWA
 * Handles push notifications for web/PWA platform
 */

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration - Get from Firebase Console
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let messaging: any = null;
let isInitialized = false;

/**
 * Initialize Firebase and messaging service
 */
export async function initializeFirebase() {
  try {
    if (typeof window === 'undefined') return; // Only in browser

    if (isInitialized) return;

    // Check if all config values are present
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn('⚠️ Firebase config incomplete. Set environment variables:');
      console.warn('  NEXT_PUBLIC_FIREBASE_API_KEY');
      console.warn('  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
      console.warn('  NEXT_PUBLIC_FIREBASE_PROJECT_ID');
      console.warn('  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
      console.warn('  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
      console.warn('  NEXT_PUBLIC_FIREBASE_APP_ID');
      return false;
    }

    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    isInitialized = true;

    console.log('✅ Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    return false;
  }
}

/**
 * Register service worker for FCM
 */
export async function registerServiceWorker() {
  try {
    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Workers not supported');
      return false;
    }

    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
      { scope: '/firebase-cloud-messaging-push-scope' }
    );

    console.log('✅ Service Worker registered:', registration);
    return true;
  } catch (error) {
    console.error('❌ Error registering service worker:', error);
    return false;
  }
}

/**
 * Request notification permission and get FCM token from backend
 */
export async function requestNotificationPermission(userId: number) {
  try {
    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Workers not supported');
      return null;
    }

    // Register service worker first
    const registered = await registerServiceWorker();
    if (!registered) {
      console.warn('⚠️ Service Worker registration failed');
      return null;
    }

    if (Notification.permission === 'denied') {
      console.warn('⚠️ Notification permission denied');
      return null;
    }

    if (Notification.permission === 'granted') {
      return await getFCMToken(userId);
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return await getFCMToken(userId);
    }

    return null;
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return null;
  }
}

/**
 * Get FCM token for device from backend
 * Backend-centric approach: No Firebase Installations API needed
 */
export async function getFCMToken(userId: number) {
  try {
    // Request token from backend instead of Firebase
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fcm/get-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      console.error('❌ Failed to get token from backend:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.success && data.token) {
      console.log('✅ FCM Token obtained from backend');
      return data.token;
    }

    console.warn('⚠️ Could not get FCM token');
    return null;
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    return null;
  }
}

/**
 * Register FCM token with backend
 */
export async function registerTokenWithBackend(userId: number, token: string, platform = 'web') {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fcm/register-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        token,
        platform,
      }),
    });

    const result = await response.json();
    console.log('✅ Token registered with backend:', result);
    return result;
  } catch (error) {
    console.error('❌ Error registering token:', error);
    return null;
  }
}

/**
 * Subscribe user to push notifications (Backend-centric)
 */
export async function subscribeUserToNotifications(userId: number) {
  try {
    // No need to initialize Firebase for client-side
    // Backend handles everything

    const token = await requestNotificationPermission(userId);
    if (!token) {
      console.warn('⚠️ Could not get notification permission');
      return false;
    }

    // Token already registered in backend via getFCMToken
    // Just save to localStorage for reference
    localStorage.setItem('fcm_token', token);
    localStorage.setItem('fcm_user_id', userId.toString());

    console.log('✅ User subscribed to notifications');
    return true;
  } catch (error) {
    console.error('❌ Error subscribing to notifications:', error);
    return false;
  }
}

/**
 * Listen for incoming messages (notifications)
 * Call this in your app's main layout or context
 */
export async function onFCMMessage(callback: (data: any) => void) {
  try {
    if (!messaging) {
      const initialized = await initializeFirebase();
      if (!initialized) return;
    }

    onMessage(messaging, (payload) => {
      console.log('📬 FCM Message received:', payload);

      const notification = {
        title: payload.notification?.title || '',
        body: payload.notification?.body || '',
        ...payload.data,
      };

      // Call callback with notification data
      callback(notification);

      // Also show notification if it's in foreground
      if (typeof window !== 'undefined' && 'Notification' in window) {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/logo/logo-192.png',
          badge: '/logo/logo-96.png',
        });
      }
    });

    console.log('✅ FCM message listener registered');
  } catch (error) {
    console.error('❌ Error setting up FCM message listener:', error);
  }
}

/**
 * Get notification history from backend
 */
export async function getNotificationHistory(userId: number, limit = 20) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/fcm/history/${userId}?limit=${limit}`
    );
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('❌ Error fetching notification history:', error);
    return [];
  }
}

/**
 * Send test notification (for testing)
 */
export async function sendTestNotification(userId: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fcm/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        title: 'Test Notification',
        body: 'This is a test notification from FCM',
        type: 'test',
      }),
    });

    const result = await response.json();
    console.log('✅ Test notification sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    return null;
  }
}
