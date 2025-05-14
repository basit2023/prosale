'use client';
import React, { useEffect, useMemo, useState } from 'react';
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
  followupdate: string;
  date: string;
  [key: string]: any;
}

interface ShowFollowupProps {
  className?: string;
  id: string;
  update: boolean;
}

const ShowFollowup: React.FC<ShowFollowupProps> = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const memoizedSession = useMemo(() => session, [session]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    const checkDueDates = () => {
      comments.forEach(comment => {
        if (comment.followupdate) {
          const followupTime = new Date(comment.followupdate).getTime();
          const now = Date.now();
          if (followupTime <= now && followupTime > now - 60000) {
            showNotification(comment);
          }
        }
      });
    };

    const interval = setInterval(checkDueDates, 60000);
    return () => clearInterval(interval);
  }, [comments]);

  const showNotification = (record: Comment) => {
    if (Notification.permission === 'granted') {
      new Notification('Follow Up Due Now', {
        body: `Action required for: ${record.fullName || 'Contact'}`,
      });
    }
  };

  const fetchComments = async () => {
    try {
      if (memoizedSession) {
        const response = await apiService.get(`/follow-up/${memoizedSession.user?.username}/?permission=${memoizedSession.user?.permission}&&id=${memoizedSession.user?.id}`);
        const userData = Array.isArray(response?.data?.leads) ? response.data.leads : [];
        const filtered = userData.filter(comment => comment.followupdate); // Only if followupdate exists
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
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      } else {
        toast.error('Error Deleting comment. Please try again.');
      }
    } catch (error) {
      toast.error('Error Deleting comment. Please try again.');
    }
  };

  const getDateStatus = (followupdate: string) => {
    if (!followupdate) return { status: 'N/A', colorClass: 'text-gray-700 dark:text-gray-600', sortOrder: 5 };

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
          render: (text: string, record: Comment) => (
            <>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {record?.fullName || 'N/A'}
              </Text>
              <div>
                <span>
                  <div style={{ display: 'inline-block' }}>{record?.date?.substring(0, 10)}</div>
                </span>
              </div>
            </>
          ),
        },
        {
          title: <span className="block whitespace-nowrap">Comments</span>,
          dataIndex: 'comments',
          key: 'comments',
          width: 300,
          render: (value: string, record: Comment) => (
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
          render: (value: string, record: Comment) => (
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
          render: (value: string, record: Comment) => {
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
                <Text className={`font-medium ${colorClass}`}>{status}</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</Text>
              </div>
            );
          },
        },
        {
          title: (
            <span className="block whitespace-nowrap" style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '40px' }}>
              Action
            </span>
          ),
          dataIndex: 'status',
          key: 'status',
          width: 300,
          render: (value: string, record: Comment) => (
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
      scroll={{
        x: 900,
      }}
    />
  );
};

export default ShowFollowup;
