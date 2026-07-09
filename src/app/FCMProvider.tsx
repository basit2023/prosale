'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { subscribeUserToNotifications, onFCMMessage } from './fcmService';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export default function FCMProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const socketRef = useRef<any>(null);

  const showBrowserNotification = (title: string, body: string, leadId?: number) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/logo/logo-192.png',
        badge: '/logo/logo-96.png',
        tag: 'prosale-notification',
        requireInteraction: true,
      });

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

  const displayNotification = (title: string, body: string, leadId?: number) => {
    toast.success(`${title}\n${body}`, {
      duration: 0,
      position: 'top-right',
      className: 'bg-green-50 text-green-900 cursor-pointer',
      icon: '🔔',
    });
    showBrowserNotification(title, body, leadId);
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    const initializeFCM = async () => {
      try {
        const subscribed = await subscribeUserToNotifications(Number(session.user.id));
        if (subscribed) {
          onFCMMessage((notification) => {
            displayNotification(
              notification.title,
              notification.body,
              notification.leadId
            );
          });
        }
      } catch (error) {
        console.error('FCM initialization failed:', error);
      }
    };

    const initializeSocketIO = () => {
      try {
        const socketUrl = window.location.hostname === 'localhost'
          ? 'http://localhost:4000'
          : `https://${window.location.hostname.replace('www.', '')}`;

        const finalUrl = socketUrl.includes('prosale.sale') && !socketUrl.includes('api.')
          ? 'https://api.prosale.sale'
          : socketUrl;
        const usePollingOnly = window.location.protocol === 'https:' && finalUrl.includes('api.prosale.sale');

        const socket = io(finalUrl, {
          path: '/api/socket.io',
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 20,
          withCredentials: true,
          transports: usePollingOnly ? ['polling'] : ['polling', 'websocket'],
          upgrade: !usePollingOnly,
        });

        socket.on('connect', () => {
          socket.emit('register', session?.user?.id);
        });

        socket.on('notification', (data) => {
          let title = 'New Notification';
          let body = 'You have a new notification';
          let leadId = null;

          if (data.type === 'followup') {
            title = data.title || 'Follow-Up Reminder';
            body = data.body || 'You have a follow-up reminder';
            leadId = data.leadId;
          } else if (data.event === 'lead_assigned' && data.data) {
            title = 'New Lead Assigned';
            body = data.data.message || `New lead assigned (ID: ${data.data.leadId})`;
            leadId = data.data.leadId;
          } else {
            title = data.title || 'New Notification';
            body = data.body || data.message || 'You have a new notification';
            leadId = data.leadId || data.id;
          }

          displayNotification(title, body, leadId);
        });

        socket.on('error', (error) => {
          console.error('Socket.IO error:', error);
        });

        socketRef.current = socket;

        return () => {
          socket.disconnect();
        };
      } catch (error) {
        console.error('Socket.IO initialization failed:', error);
      }
    };

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
