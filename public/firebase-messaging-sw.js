/**
 * Simple Service Worker for handling notifications
 * Backend-centric approach: No Firebase initialization needed
 * Backend sends notifications directly to service worker
 */

// Handle push events from backend
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received:', event);

  if (!event.data) {
    console.log('[Service Worker] Push event has no data');
    return;
  }

  let notificationData = {};
  try {
    notificationData = event.data.json();
  } catch (e) {
    console.log('[Service Worker] Could not parse JSON, using text:', event.data.text());
  }

  const notificationTitle = notificationData.title || 'New Notification';
  const notificationOptions = {
    body: notificationData.body || 'You have a new notification',
    icon: '/logo.png',
    badge: '/badge.png',
    tag: 'prosale-notification',
    requireInteraction: false,
    data: notificationData.data || {},
  };

  console.log('[Service Worker] Showing notification:', notificationTitle);
  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.notification.tag);
  event.notification.close();

  const data = event.notification.data || {};
  let urlToOpen = '/';

  if (data.leadId) {
    urlToOpen = `/leads/${data.leadId}`;
  }

  // Focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window with the app
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes('/') && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      // If no window found, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event.notification.tag);
});

// Background sync for when offline
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  console.log('[Service Worker] Syncing notifications...');
  // Can be used to sync notifications when app comes back online
}
