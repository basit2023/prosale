// 'use client';
// import React, { useEffect, useMemo, useState } from 'react';
// import { Text } from '@/components/ui/text';
// import { useRouter } from 'next/navigation';
// import BasicTableWidget from '@/components/controlled-table/basic-table-widget';
// import cn from '@/utils/class-names';
// import apiService from '@/utils/apiService';
// import { useSession } from 'next-auth/react';
// import toast from 'react-hot-toast';
// import { PiTrashFill, PiEye } from 'react-icons/pi';
// import { routes } from '@/config/routes';

// interface Comment {
//   id: string;
//   lead_id: string;
//   fullName: string;
//   comments: string;
//   followup: string;
//   followupdate: string;
//   date: string;
//   [key: string]: any;
// }

// interface ShowFollowupProps {
//   className?: string;
//   id: string;
//   update: boolean;
// }

// const ShowFollowup: React.FC<ShowFollowupProps> = () => {
//   const router = useRouter();
//   const { data: session } = useSession();
//   const memoizedSession = useMemo(() => session, [session]);
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (typeof window !== 'undefined' && 'Notification' in window) {
//       if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
//         Notification.requestPermission();
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const checkDueDates = () => {
//       comments.forEach(comment => {
//         if (comment.followupdate) {
//           const followupTime = new Date(comment.followupdate).getTime();
//           const now = Date.now();
//           if (followupTime <= now && followupTime > now - 60000) {
//             showNotification(comment);
//           }
//         }
//       });
//     };

//     const interval = setInterval(checkDueDates, 60000);
//     return () => clearInterval(interval);
//   }, [comments]);

//   const showNotification = (record: Comment) => {
//     if (Notification.permission === 'granted') {
//       new Notification('Follow Up Due Now', {
//         body: `Action required for: ${record.fullName || 'Contact'}`,
//       });
//     }
//   };

//   const fetchComments = async () => {
//     try {
//       if (memoizedSession) {
//         const response = await apiService.get(`/follow-up/${memoizedSession.user?.username}/?permission=${memoizedSession.user?.permission}&&id=${memoizedSession.user?.id}`);
//         const userData = Array.isArray(response?.data?.leads) ? response.data.leads : [];
//         const filtered = userData.filter(comment => comment.followupdate); // Only if followupdate exists
//         setComments(filtered);
//       }
//     } catch (error) {
//       console.error('Error fetching comments:', error);
//       setComments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (memoizedSession) {
//       fetchComments();
//     }
//   }, [memoizedSession]);

//   const handleDeleteComment = async (commentId: string, leadId: string) => {
//     try {
//       const response = await apiService.put(`/delete-comments/${commentId}`);
//       if (response.status === 200) {
//         toast.success('Comment deleted successfully.');
//         setComments(prev => prev.filter(comment => comment.id !== commentId));
//       } else {
//         toast.error('Error Deleting comment. Please try again.');
//       }
//     } catch (error) {
//       toast.error('Error Deleting comment. Please try again.');
//     }
//   };

//   const getDateStatus = (followupdate: string) => {
//     if (!followupdate) return { status: 'N/A', colorClass: 'text-gray-700 dark:text-gray-600', sortOrder: 5 };

//     const followupDate = new Date(followupdate);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const compareDate = new Date(followupDate);
//     compareDate.setHours(0, 0, 0, 0);

//     const timeDiff = compareDate.getTime() - today.getTime();
//     const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

//     if (daysDiff === 0) {
//       return { status: 'Today', colorClass: 'text-green-600 dark:text-green-400', sortOrder: 0 };
//     } else if (daysDiff === 1) {
//       return { status: 'Tomorrow', colorClass: 'text-orange-600 dark:text-orange-400', sortOrder: 1 };
//     } else if (daysDiff > 1 && daysDiff <= 7) {
//       return { status: 'Coming Soon', colorClass: 'text-orange-500 dark:text-orange-300', sortOrder: 2 };
//     } else if (daysDiff > 7) {
//       return { status: 'Scheduled', colorClass: 'text-blue-600 dark:text-blue-400', sortOrder: 3 };
//     } else {
//       return { status: 'Overdue', colorClass: 'text-red-600 dark:text-red-400', sortOrder: 4 };
//     }
//   };

//   const sortedComments = useMemo(() => {
//     return [...comments].sort((a, b) => {
//       const aStatus = getDateStatus(a.followupdate).sortOrder;
//       const bStatus = getDateStatus(b.followupdate).sortOrder;
//       return aStatus - bStatus;
//     });
//   }, [comments]);

//   if (loading) {
//     return <Text>Loading...</Text>;
//   }

//   return (
//     <BasicTableWidget
//       key={sortedComments.length}
//       title="All comments"
//       className={cn('pb-0 lg:pb-0 [&_.rc-table-row:last-child_td]:border-b-0')}
//       data={sortedComments}
//       getColumns={() => [
//         {
//           title: <span className="block whitespace-nowrap">Comment By</span>,
//           dataIndex: 'fullName',
//           key: 'fullName',
//           width: 300,
//           render: (text: string, record: Comment) => (
//             <>
//               <Text className="font-medium text-gray-700 dark:text-gray-600">
//                 {record?.fullName || 'N/A'}
//               </Text>
//               <div>
//                 <span>
//                   <div style={{ display: 'inline-block' }}>{record?.date?.substring(0, 10)}</div>
//                 </span>
//               </div>
//             </>
//           ),
//         },
//         {
//           title: <span className="block whitespace-nowrap">Comments</span>,
//           dataIndex: 'comments',
//           key: 'comments',
//           width: 300,
//           render: (value: string, record: Comment) => (
//             <Text className="font-medium text-gray-700 dark:text-gray-600">
//               {record?.comments || 'N/A'}
//             </Text>
//           ),
//         },
//         {
//           title: <span className="block whitespace-nowrap">Follow up</span>,
//           dataIndex: 'followup',
//           key: 'followup',
//           width: 300,
//           render: (value: string, record: Comment) => (
//             <Text className="font-medium text-gray-700 dark:text-gray-600">
//               {record?.followup || 'N/A'}
//             </Text>
//           ),
//         },
//         {
//           title: <span className="block whitespace-nowrap">Date</span>,
//           dataIndex: 'followupdate',
//           key: 'followupdate',
//           width: 300,
//           render: (value: string, record: Comment) => {
//             const { status, colorClass } = getDateStatus(record?.followupdate);
//             const formattedDate = record?.followupdate
//               ? new Date(record.followupdate).toLocaleString('en-US', {
//                   month: 'short',
//                   day: 'numeric',
//                   year: 'numeric',
//                   hour: '2-digit',
//                   minute: '2-digit',
//                 })
//               : 'N/A';

//             return (
//               <div className="flex flex-col">
//                 <Text className={`font-medium ${colorClass}`}>{status}</Text>
//                 <Text className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</Text>
//               </div>
//             );
//           },
//         },
//         {
//           title: (
//             <span className="block whitespace-nowrap" style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '40px' }}>
//               Action
//             </span>
//           ),
//           dataIndex: 'status',
//           key: 'status',
//           width: 300,
//           render: (value: string, record: Comment) => (
//             <div className="flex justify-end gap-2 mr-5">
             
//               <button
//                 className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-colors"
//                 onClick={() => router.push(routes.leads.edit(record.lead_id))}
//                 title="Edit Lead"
//               >
//                 <PiEye className="h-5 w-5" />
//               </button>
//               <button
//                 className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
//                 onClick={() => handleDeleteComment(record.id, record.lead_id)}
//                 title="Delete Comment"
//               >
//                 <PiTrashFill className="h-5 w-5" />
//               </button>
//             </div>
//           ),
//         },
//       ]}
//       noGutter
//       enableSearch={false}
//       scroll={{
//         x: 900,
//       }}
//     />
//   );
// };

// export default ShowFollowup;







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

  // Notification permission state
  const [notifReady, setNotifReady] = useState(false);
  // Track which follow-up IDs we’ve already notified for (avoid duplicates)
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  // Initialize notifReady on mount (don’t request here—only check)
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
      // Some browsers mute non-gesture calls—this is on click
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
    console.log('showing notifications')
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      new Notification('Follow Up Due', {
        body: `Action required for: ${record.fullName || 'Contact'}`,
        tag: `followup:${record.id}`, // avoid stacking duplicates
        renotify: true,
      });
    } catch {
      // Fallback toast if Notification ctor fails

      toast((t) => (
        <div>
          <strong>Follow Up Due</strong>
          <div>Action required for: {record.fullName || 'Contact'}</div>
        </div>
      ));
    }
  };

  // Poll for due/overdue items; notify once per ID
  useEffect(() => {
    console.log("cheking for notifications")
    if (!notifReady) return; // don’t check until permission granted

    const checkDueDates = () => {
      const now = Date.now();

      comments.forEach((c) => {
        if (!c.followupdate) return;

        // Expect ISO with timezone. If your API isn’t sending that, fix it server-side.
        const t = Date.parse(c.followupdate);
        if (Number.isNaN(t)) return;

        const isDueOrOverdue = t <= now;
        const alreadyNotified = notifiedIdsRef.current.has(c.id);

        if (isDueOrOverdue && !alreadyNotified) {
          showNotification(c);
          notifiedIdsRef.current.add(c.id);
        }
      });
    };

    // Run immediately so overdue items notify right away
    checkDueDates();

    // Poll every 15s (browsers may throttle in background)
    const interval = setInterval(checkDueDates, 15000);
    return () => clearInterval(interval);
  }, [comments, notifReady]);

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
        // Also clear notified flag for that comment (optional)
        notifiedIdsRef.current.delete(commentId);
      } else {
        toast.error('Error Deleting comment. Please try again.');
      }
    } catch (error) {
      toast.error('Error Deleting comment. Please try again.');
    }
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
      {/* Enable notifications CTA (only shown if not granted yet) */}
      {typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission !== 'granted' && (
          <div className="flex items-center justify-between gap-3 rounded-md border p-3">
            <div className="text-sm text-gray-700 dark:text-gray-400">
              Enable notifications to get instant follow-up alerts (even if the tab is in the background).
            </div>
            <button
              className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              onClick={requestNotifPermission}
            >
              Enable notifications
            </button>
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
                  <Text className={`font-medium ${colorClass}`}>{status}</Text>
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

