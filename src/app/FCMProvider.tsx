'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { subscribeUserToNotifications, onFCMMessage } from './fcmService';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export default function FCMProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const socketRef = useRef<any>(null);

  // Function to display actual browser notification
  const showBrowserNotification = (title: string, body: string, leadId?: number) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: '/logo/logo-192.png',
        badge: '/logo/logo-96.png',
        tag: 'prosale-notification',
        requireInteraction: true, // User must interact to dismiss
      });

      // Only navigate on click, don't auto-redirect
      notification.onclick = () => {
        window.focus();
        notification.close();
        if (leadId) {
          window.location.href = `/leads/${leadId}`;
        }
      };

      return notification;
    }
  };

  // Function to show toast + browser notification
  const displayNotification = (title: string, body: string, leadId?: number) => {
    console.log('🎉 Displaying notification:', { title, body, leadId });

    // Show toast notification - stores leadId in toast for later access
    toast.success(`${title}\n${body}`, {
      duration: 0, // Don't auto-dismiss, let user close it
      position: 'top-right',
      className: 'bg-green-50 text-green-900 cursor-pointer',
      icon: '🔔',
    });

    // Show browser notification (user can click to navigate)
    showBrowserNotification(title, body, leadId);
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    const initializeFCM = async () => {
      try {
        console.log('🔄 Initializing FCM for user:', session.user.id);

        // Subscribe user to notifications (Backend-centric approach)
        const subscribed = await subscribeUserToNotifications(Number(session.user.id));

        if (subscribed) {
          console.log('✅ Subscribed to FCM notifications');

          // Listen for incoming notifications via Service Worker
          onFCMMessage((notification) => {
            console.log('📬 FCM Notification received:', notification);
            displayNotification(
              notification.title,
              notification.body,
              notification.leadId
            );
          });
        } else {
          console.warn('⚠️ Failed to subscribe to notifications');
        }
      } catch (error) {
        console.error('❌ FCM initialization failed:', error);
      }
    };

    // Initialize Socket.IO for real-time notifications
    const initializeSocketIO = () => {
      try {
        const socketUrl = window.location.hostname === 'localhost'
          ? 'http://localhost:4000'
          : `https://${window.location.hostname.replace('www.', '')}`;

        // Use api.prosale.sale if we're on the main domain
        const finalUrl = socketUrl.includes('prosale.sale') && !socketUrl.includes('api.')
          ? 'https://api.prosale.sale'
          : socketUrl;

        const socket = io(finalUrl, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 20, // Increased for production
          withCredentials: true,
          transports: ['websocket', 'polling'], // Allow fallback to polling
        });

        socket.on('connect', () => {
          console.log('🔌 Socket.IO connected:', socket.id);
          // Emit user registration
          socket.emit('register', session?.user?.id);
        });

        socket.on('notification', (data) => {
          console.log('📢 Real-time notification received via Socket.IO:', data);

          // Handle different notification types
          let title = 'New Notification';
          let body = 'You have a new notification';
          let leadId = null;

          // Handle follow-up notifications
          if (data.type === 'followup') {
            title = data.title || 'Follow-Up Reminder';
            body = data.body || 'You have a follow-up reminder';
            leadId = data.leadId;
          }
          // Handle lead assignment notifications
          else if (data.event === 'lead_assigned' && data.data) {
            title = 'New Lead Assigned';
            body = data.data.message || `New lead assigned (ID: ${data.data.leadId})`;
            leadId = data.data.leadId;
          }
          // Generic notification format
          else {
            title = data.title || 'New Notification';
            body = data.body || data.message || 'You have a new notification';
            leadId = data.leadId || data.id;
          }

          displayNotification(title, body, leadId);
        });

        socket.on('disconnect', () => {
          console.log('❌ Socket.IO disconnected');
        });

        socket.on('error', (error) => {
          console.error('⚠️ Socket.IO error:', error);
        });

        socketRef.current = socket;

        return () => {
          socket.disconnect();
        };
      } catch (error) {
        console.error('❌ Socket.IO initialization failed:', error);
      }
    };

    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    initializeFCM();
    initializeSocketIO();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [session?.user?.id]);

  return <>{children}</>;
}
