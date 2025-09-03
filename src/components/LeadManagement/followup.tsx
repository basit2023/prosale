'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text } from '@/components/ui/text';
import { useRouter } from 'next/navigation';
import BasicTableWidget from '@/components/controlled-table/basic-table-widget';
import cn from '@/utils/class-names';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { PiTrashFill, PiEye } from 'react-icons/pi';
import { routes } from '@/config/routes';

interface Comment {
  id: string;
  lead_id: string;
  fullName: string;
  comments: string;
  followup: string;
  followupdate: string; // should be ISO with timezone e.g. "2025-09-01T10:30:00+05:00"
  date: string;
  user_id?: string; // Add user_id field to match against session user
  assigned_to?: string; // Alternative field name if your API uses this
  [key: string]: any;
}

interface ShowFollowupProps {
  className?: string;
  id: string;
  update: boolean;
}

// Persistent storage key for notified IDs
const STORAGE_KEY = 'followup_notified_ids';
const STORAGE_EXPIRY_KEY = 'followup_notified_expiry';

const ShowFollowup: React.FC<ShowFollowupProps> = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const memoizedSession = useMemo(() => session, [session]);

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifReady, setNotifReady] = useState(false);
  
  // Persistent storage for notified IDs
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  // Load previously notified IDs from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Check if stored data has expired (clear daily)
      const expiryTime = localStorage.getItem(STORAGE_EXPIRY_KEY);
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      if (expiryTime && now - parseInt(expiryTime) > oneDayMs) {
        // Clear expired data
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_EXPIRY_KEY);
      } else {
        // Load existing notified IDs
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedIds = JSON.parse(stored);
          notifiedIdsRef.current = new Set(parsedIds);
        }
      }
      
      // Set expiry if not exists
      if (!expiryTime) {
        localStorage.setItem(STORAGE_EXPIRY_KEY, now.toString());
      }
    } catch (error) {
      console.warn('Failed to load notification state:', error);
    }
  }, []);

  // Save notified IDs to localStorage
  const saveNotifiedIds = () => {
    if (typeof window === 'undefined') return;
    try {
      const idsArray = Array.from(notifiedIdsRef.current);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(idsArray));
    } catch (error) {
      console.warn('Failed to save notification state:', error);
    }
  };

  // Initialize notification permission state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    setNotifReady(Notification.permission === 'granted');
  }, []);

  // Ask permission via user gesture
  const requestNotifPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Notifications not supported in this browser.');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      const ok = perm === 'granted';
      setNotifReady(ok);
      if (ok) {
        toast.success('Notifications enabled.');
      } else {
        toast.error('Please allow notifications in your browser settings.');
      }
    } catch {
      toast.error('Could not request notification permission.');
    }
  };

  const showNotification = (record: Comment) => {
    console.log('Showing notification for:', record.fullName);
    
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      new Notification('Follow Up Due', {
        body: `Action required for: ${record.fullName || 'Contact'}`,
        tag: `followup:${record.id}`, // avoid stacking duplicates
        renotify: true,
        icon: '/favicon.ico', // Add your app icon
        requireInteraction: true, // Keep notification visible until user interacts
      });
    } catch (error) {
      console.warn('Native notification failed:', error);
      // Fallback toast if Notification constructor fails
      toast((t) => (
        <div>
          <strong>Follow Up Due</strong>
          <div>Action required for: {record.fullName || 'Contact'}</div>
        </div>
      ));
    }
  };

  // Check if the follow-up belongs to current user
  const belongsToCurrentUser = (comment: Comment): boolean => {
    if (!memoizedSession?.user) return false;
    
    const currentUserId = memoizedSession.user.id;
    const currentUsername = memoizedSession.user.username;
    
    // Check multiple possible fields for user assignment
    return (
      comment.user_id === currentUserId ||
      comment.assigned_to === currentUserId ||
      comment.user_id === currentUsername ||
      comment.assigned_to === currentUsername ||
      // Add any other field names your API might use
      comment.created_by === currentUserId ||
      comment.owner_id === currentUserId
    );
  };

  // Poll for due/overdue items; notify once per ID
  useEffect(() => {
    if (!notifReady || !memoizedSession?.user) return;

    const checkDueDates = () => {
      const now = Date.now();
      let hasNewNotifications = false;

      comments.forEach((comment) => {
        if (!comment.followupdate) return;
        
        // Only check notifications for current user's follow-ups
        if (!belongsToCurrentUser(comment)) return;

        // Parse the followup date
        const followupTime = Date.parse(comment.followupdate);
        if (Number.isNaN(followupTime)) return;

        const isDueOrOverdue = followupTime <= now;
        const alreadyNotified = notifiedIdsRef.current.has(comment.id);

        // Only notify when time has actually reached/passed and not notified before
        if (isDueOrOverdue && !alreadyNotified) {
          console.log(`Notifying for follow-up: ${comment.id}, User: ${comment.fullName}`);
          showNotification(comment);
          notifiedIdsRef.current.add(comment.id);
          hasNewNotifications = true;
        }
      });

      // Save to localStorage if there were new notifications
      if (hasNewNotifications) {
        saveNotifiedIds();
      }
    };

    // Don't run immediately on mount - only when time actually matches
    // Check every 30 seconds (reduce frequency to avoid performance issues)
    const interval = setInterval(checkDueDates, 30000);
    
    // Optional: Run once after a small delay to catch any immediate due items
    const initialTimeout = setTimeout(checkDueDates, 2000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [comments, notifReady, memoizedSession]);

  const fetchComments = async () => {
    try {
      if (memoizedSession) {
        const response = await apiService.get(
          `/follow-up/${memoizedSession.user?.username}/?permission=${memoizedSession.user?.permission}&&id=${memoizedSession.user?.id}`
        );
        const userData = Array.isArray(response?.data?.leads) ? response.data.leads : [];
        const filtered = userData.filter((comment: Comment) => comment.followupdate);
        setComments(filtered);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memoizedSession) {
      fetchComments();
    }
  }, [memoizedSession]);

  const handleDeleteComment = async (commentId: string, leadId: string) => {
    try {
      const response = await apiService.put(`/delete-comments/${commentId}`);
      if (response.status === 200) {
        toast.success('Comment deleted successfully.');
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));
        
        // Remove from notified list and update storage
        notifiedIdsRef.current.delete(commentId);
        saveNotifiedIds();
      } else {
        toast.error('Error Deleting comment. Please try again.');
      }
    } catch (error) {
      toast.error('Error Deleting comment. Please try again.');
    }
  };

  // Clear all notifications (utility function for testing/debugging)
  const clearNotificationHistory = () => {
    notifiedIdsRef.current.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_EXPIRY_KEY);
    }
    toast.success('Notification history cleared');
  };

  const getDateStatus = (followupdate: string) => {
    if (!followupdate)
      return { status: 'N/A', colorClass: 'text-gray-700 dark:text-gray-600', sortOrder: 5 };

    const followupDate = new Date(followupdate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(followupDate);
    compareDate.setHours(0, 0, 0, 0);

    const timeDiff = compareDate.getTime() - today.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      return { status: 'Today', colorClass: 'text-green-600 dark:text-green-400', sortOrder: 0 };
    } else if (daysDiff === 1) {
      return { status: 'Tomorrow', colorClass: 'text-orange-600 dark:text-orange-400', sortOrder: 1 };
    } else if (daysDiff > 1 && daysDiff <= 7) {
      return { status: 'Coming Soon', colorClass: 'text-orange-500 dark:text-orange-300', sortOrder: 2 };
    } else if (daysDiff > 7) {
      return { status: 'Scheduled', colorClass: 'text-blue-600 dark:text-blue-400', sortOrder: 3 };
    } else {
      return { status: 'Overdue', colorClass: 'text-red-600 dark:text-red-400', sortOrder: 4 };
    }
  };

  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      const aStatus = getDateStatus(a.followupdate).sortOrder;
      const bStatus = getDateStatus(b.followupdate).sortOrder;
      return aStatus - bStatus;
    });
  }, [comments]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <div className="space-y-3">
      {/* Enable notifications CTA */}
      {typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission !== 'granted' && (
          <div className="flex items-center justify-between gap-3 rounded-md border p-3">
            <div className="text-sm text-gray-700 dark:text-gray-400">
              Enable notifications to get instant follow-up alerts for your assigned tasks.
            </div>
            <button
              className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              onClick={requestNotifPermission}
            >
              Enable notifications
            </button>
          </div>
        )}

      {/* Debug/Admin controls - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="flex gap-2">
          <button
            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
            onClick={clearNotificationHistory}
          >
            Clear Notification History (Debug)
          </button>
          <span className="text-xs text-gray-500">
            Notified IDs: {notifiedIdsRef.current.size}
          </span>
        </div>
      )}

      <BasicTableWidget
        key={sortedComments.length}
        title="All comments"
        className={cn('pb-0 lg:pb-0 [&_.rc-table-row:last-child_td]:border-b-0')}
        data={sortedComments}
        getColumns={() => [
          {
            title: <span className="block whitespace-nowrap">Comment By</span>,
            dataIndex: 'fullName',
            key: 'fullName',
            width: 300,
            render: (_: string, record: Comment) => (
              <>
                <Text className="font-medium text-gray-700 dark:text-gray-600">
                  {record?.fullName || 'N/A'}
                </Text>
                <div>
                  <span>
                    <div style={{ display: 'inline-block' }}>{record?.date?.substring(0, 10)}</div>
                  </span>
                </div>
                {/* Show indicator if this belongs to current user */}
                {belongsToCurrentUser(record) && (
                  <div className="text-xs text-blue-600 font-medium">Your Task</div>
                )}
              </>
            ),
          },
          {
            title: <span className="block whitespace-nowrap">Comments</span>,
            dataIndex: 'comments',
            key: 'comments',
            width: 300,
            render: (_: string, record: Comment) => (
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {record?.comments || 'N/A'}
              </Text>
            ),
          },
          {
            title: <span className="block whitespace-nowrap">Follow up</span>,
            dataIndex: 'followup',
            key: 'followup',
            width: 300,
            render: (_: string, record: Comment) => (
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {record?.followup || 'N/A'}
              </Text>
            ),
          },
          {
            title: <span className="block whitespace-nowrap">Date</span>,
            dataIndex: 'followupdate',
            key: 'followupdate',
            width: 300,
            render: (_: string, record: Comment) => {
              const { status, colorClass } = getDateStatus(record?.followupdate);
              const formattedDate = record?.followupdate
                ? new Date(record.followupdate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'N/A';

              return (
                <div className="flex flex-col">
                  <Text className={`font-medium ${colorClass}`}>
                    {status}
                    {/* Show notification indicator */}
                    {notifiedIdsRef.current.has(record.id) && (
                      <span className="ml-2 text-xs text-gray-500">🔔</span>
                    )}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</Text>
                </div>
              );
            },
          },
          {
            title: (
              <span
                className="block whitespace-nowrap"
                style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '40px' }}
              >
                Action
              </span>
            ),
            dataIndex: 'status',
            key: 'status',
            width: 300,
            render: (_: string, record: Comment) => (
              <div className="flex justify-end gap-2 mr-5">
                <button
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-colors"
                  onClick={() => router.push(routes.leads.edit(record.lead_id))}
                  title="Edit Lead"
                >
                  <PiEye className="h-5 w-5" />
                </button>
                <button
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                  onClick={() => handleDeleteComment(record.id, record.lead_id)}
                  title="Delete Comment"
                >
                  <PiTrashFill className="h-5 w-5" />
                </button>
              </div>
            ),
          },
        ]}
        noGutter
        enableSearch={false}
        scroll={{ x: 900 }}
      />
    </div>
  );
};

export default ShowFollowup;