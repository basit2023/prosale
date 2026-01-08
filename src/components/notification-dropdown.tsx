import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Clock, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface NotificationItem {
  id: number;
  title: string;
  body: string;
  lead_id: number;
  notification_type: string;
  created_at: string;
  read: boolean;
}

interface NotificationDropdownProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ userId, isOpen, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications();
    }
  }, [isOpen, userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/history/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notifId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notifId}`, {
        method: 'PATCH',
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const deleteNotification = async (notifId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notifId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notifId));
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const clearAll = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/history/${userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setNotifications([]);
        toast.success('All notifications cleared');
      }
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type === 'followup') {
      return <Clock size={20} className="text-orange-600" />;
    }
    return <UserPlus size={20} className="text-blue-600" />;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose}></div>

      {/* Dropdown */}
      <div className="absolute right-4 top-16 w-96 max-h-96 bg-white rounded-lg shadow-lg z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bell size={20} />
            <span className="font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-white text-red-600 rounded-full px-2 py-0.5 text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="hover:bg-red-700 p-1 rounded transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <Bell size={32} className="mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`border-b p-3 hover:bg-gray-50 transition cursor-pointer ${!notif.read ? 'bg-blue-50' : ''
                  }`}
              >
                <Link href={`/leads/${notif.lead_id}`}>
                  <div onClick={() => {
                    if (!notif.read) markAsRead(notif.id);
                    onClose();
                  }}>
                    {/* Title and time */}
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notif.notification_type)}
                        <h4 className={`text-sm font-semibold ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notif.title}
                        </h4>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          deleteNotification(notif.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Body */}
                    <p className="text-xs text-gray-600 line-clamp-2 ml-7">
                      {notif.body}
                    </p>

                    {/* Footer */}
                    <div className="flex justify-between items-center mt-2 ml-7">
                      <span className="text-xs text-gray-400">
                        {new Date(notif.created_at).toLocaleDateString()} {new Date(notif.created_at).toLocaleTimeString()}
                      </span>
                      {!notif.read && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                          <CheckCircle size={12} />
                          Mark read
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t p-2 flex gap-2 bg-gray-50">
            <button
              onClick={() => {
                fetchNotifications();
              }}
              className="flex-1 text-sm py-2 text-gray-600 hover:bg-gray-200 rounded transition"
            >
              Refresh
            </button>
            <button
              onClick={clearAll}
              className="flex-1 text-sm py-2 text-red-600 hover:bg-red-50 rounded transition font-semibold"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
