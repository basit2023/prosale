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
import Spinner from '../ui/spinner';

interface Comment {
  id: string;
  lead_id: string;
  fullName: string;
  full_name?: string; // <-- you’re using this in columns
  comments: string;
  followup: string;
  followupdate: string;
  nextfollowup: boolean;
  date: string;
  user_id?: string;
  assigned_to?: string;
  created_by?: string;
  owner_id?: string;
  [key: string]: any;
}

interface ShowFollowupProps {
  className?: string;
  id: string;
  update: boolean;
}

const STORAGE_KEY = 'followup_notified_ids';
const STORAGE_EXPIRY_KEY = 'followup_notified_expiry';

const ShowFollowup: React.FC<ShowFollowupProps> = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const memoizedSession = useMemo(() => session, [session]);

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Notifications
  const [notifReady, setNotifReady] = useState(false);
  const notifiedIdsRef = useRef<Set<string>>(new Set());
  const lastCheckRef = useRef<number>(Date.now()); // used to avoid flood on first load
  const commentsRef = useRef<Comment[]>([]);       // keep latest comments in interval

  // Filters / table UX
  const [showMyFollowupsOnly, setShowMyFollowupsOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  // --- Load/restore notified state (daily reset) ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const expiryTime = localStorage.getItem(STORAGE_EXPIRY_KEY);
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      if (expiryTime && now - parseInt(expiryTime) > oneDayMs) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_EXPIRY_KEY);
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          notifiedIdsRef.current = new Set(JSON.parse(stored));
        }
      }

      if (!expiryTime) {
        localStorage.setItem(STORAGE_EXPIRY_KEY, String(now));
      }
    } catch (e) {
      console.warn('Failed to load notification state:', e);
    }
  }, []);

  const saveNotifiedIds = () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(notifiedIdsRef.current)));
    } catch (e) {
      console.warn('Failed to save notification state:', e);
    }
  };

  // --- Notification capability detection ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    setNotifReady(Notification.permission === 'granted');
  }, []);

  const requestNotifPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Notifications not supported in this browser.');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      const granted = perm === 'granted';
      setNotifReady(granted);
      granted ? toast.success('Notifications enabled.') : toast.error('Please allow notifications in your browser settings.');
    } catch {
      toast.error('Could not request notification permission.');
    }
  };

  const showNotification = (record: Comment) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      new Notification('Follow Up Due', {
        body: `Action required for: ${record.fullName || 'Contact'}`,
        tag: `followup:${record.id}`,
        renotify: true,
        icon: '/favicon.ico',
        requireInteraction: true,
      });
    } catch {
      toast((t) => (
        <div>
          <strong>Follow Up Due</strong>
          <div>Action required for: {record.fullName || 'Contact'}</div>
        </div>
      ));
    }
  };

  const belongsToCurrentUser = (comment: Comment): boolean => {
    const u = memoizedSession?.user as any;
    if (!u) return false;

    return (
      comment.user_id === u.id ||
      comment.assigned_to === u.id ||
      comment.created_by === u.id ||
      comment.owner_id === u.id ||
      comment.user_id === u.username ||
      comment.assigned_to === u.username ||
      (u.name && typeof u.name === 'string' && comment.fullName?.toLowerCase() === u.name.toLowerCase())
    );
  };

  // Keep latest comments in a ref for the interval
  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  // Initialize last check time ONCE to "now" so first run doesn't flood
  useEffect(() => {
    lastCheckRef.current = Date.now();
  }, []);

  // Notify ONLY when followupdate "crosses" between lastCheck and now
  useEffect(() => {
    if (!notifReady || !memoizedSession?.user) return;

    const checkDueDates = () => {
      const now = Date.now();
      const last = lastCheckRef.current;
      let mutated = false;

      const list = commentsRef.current;

      for (const c of list) {
        if (!c.followupdate) continue;

        if (showMyFollowupsOnly && !belongsToCurrentUser(c)) continue;

        const t = Date.parse(c.followupdate);
        if (Number.isNaN(t)) continue;

        // Fire only if it just crossed within this window
        const crossedNow = t > last && t <= now;
        if (crossedNow && !notifiedIdsRef.current.has(c.id)) {
          showNotification(c);
          notifiedIdsRef.current.add(c.id);
          mutated = true;
        }
      }

      if (mutated) saveNotifiedIds();
      lastCheckRef.current = now;
    };

    // Check every 30s
    const interval = setInterval(checkDueDates, 30000);
    // Optional quick first tick (won't flood because lastCheckRef was set to now)
    setTimeout(checkDueDates, 1500);

    return () => clearInterval(interval);
  }, [notifReady, memoizedSession, showMyFollowupsOnly]);

  // --- Data fetch ---
  const fetchComments = async () => {
    try {
      const u = memoizedSession?.user as any;
      if (!u) return;

      const resp = await apiService.get(`/follow-up/${u?.username}/?permission=${u?.permission}&&id=${u?.id}`);
      const arr = Array.isArray(resp?.data?.leads) ? resp.data.leads : [];
      const withDates = arr.filter((c: Comment) => c.followupdate);
      setComments(withDates);
    } catch (e) {
      console.error('Error fetching comments:', e);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memoizedSession) fetchComments();
  }, [memoizedSession]);

  const handleDeleteComment = async (commentId: string, leadId: string) => {
    try {
      const response = await apiService.put(`/delete-comments/${commentId}`);
      if (response.status === 200) {
        toast.success('Comment deleted successfully.');
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        notifiedIdsRef.current.delete(commentId);
        saveNotifiedIds();
      } else {
        toast.error('Error Deleting comment. Please try again.');
      }
    } catch {
      toast.error('Error Deleting comment. Please try again.');
    }
  };

  const getDateStatus = (followupdate: string) => {
    if (!followupdate) {
      return { status: 'N/A', colorClass: 'text-gray-700 dark:text-gray-600', sortOrder: 5 };
    }

    const followupDate = new Date(followupdate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(followupDate);
    d.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

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

  // ----- SEARCH + FILTER + SORT -----
  const normalizedQuery = query.trim().toLowerCase();

  const filteredSorted = useMemo(() => {
    const base = showMyFollowupsOnly
      ? comments.filter(belongsToCurrentUser)
      : comments.filter((c) => c.nextfollowup);

    const searched = normalizedQuery
      ? base.filter((c) => {
          const hay = [
            c.fullName,
            c.full_name,
            c.comments,
            c.followup,
            c.followupdate,
            c.lead_id,
          ]
            .filter(Boolean)
            .map((v) => String(v).toLowerCase())
            .join(' ');
          return hay.includes(normalizedQuery);
        })
      : base;

    // Sort by "urgency"
    return [...searched].sort((a, b) => {
      const aStatus = getDateStatus(a.followupdate).sortOrder;
      const bStatus = getDateStatus(b.followupdate).sortOrder;
      return aStatus - bStatus;
    });
  }, [comments, showMyFollowupsOnly, normalizedQuery]);

  // Reset to page 1 when the dataset or filters change
  useEffect(() => {
    setPage(1);
  }, [normalizedQuery, showMyFollowupsOnly, comments.length]);

  // ----- PAGINATION -----
  const totalItems = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;
  const pageData = filteredSorted.slice(start, start + pageSize);

  // Ensure each row has a stable key
  const pageDataWithKeys = useMemo(
    () => pageData.map((r) => ({ ...r, key: r.id ?? `${r.lead_id}-${r.date}` })),
    [pageData]
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {memoizedSession?.user?.permission >= 4 && (
            <button
              className={`px-3 py-1.5 rounded text-white transition-colors ${
                showMyFollowupsOnly ? 'bg-green-700 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={() => setShowMyFollowupsOnly((v) => !v)}
            >
              {showMyFollowupsOnly ? 'Showing: My Follow-Ups' : 'My Follow-Up'}
            </button>
          )}

          {!notifReady && (
            <button
              className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              onClick={requestNotifPermission}
            >
              Enable Notifications
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, comment, follow-up..."
            className="w-full sm:w-64 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={pageSize}
            onChange={(e) => {
              const n = Number(e.target.value);
              setPageSize(n);
              setPage(1); // reset to first page when page size changes
            }}
            className="px-0 py-1.5 rounded border border-gray-300 w-[30%] !focus:ring-black !focus:border-black dark:border-gray-700 bg-white/80 dark:bg-gray-900/60"
            title="Rows per page"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </select>
        </div>
      </div>

      <BasicTableWidget
        /* Force clean rerender when paging changes (helps if the widget memoizes internally) */
        key={`pg-${page}-ps-${pageSize}-q-${normalizedQuery}-mine-${showMyFollowupsOnly}`}
        title="All comments"
        className={cn('pb-0 lg:pb-0 [&_.rc-table-row:last-child_td]:border-b-0')}
        data={pageDataWithKeys}
        /* 🔑 Make sure the inner table uses a stable row key */
        rowKey="key"
        /* 🧭 Turn off any built-in pagination so our manual paging shows */
        pagination={false}
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
                    <div style={{ display: 'inline-block' }}>
                      {record?.date?.substring(0, 10)}
                    </div>
                  </span>
                </div>
                {belongsToCurrentUser(record) && (
                  <div className="text-xs text-blue-600 font-medium">Your Task</div>
                )}
              </>
            ),
          },
          {
            title: <span className="block whitespace-nowrap">Customer</span>,
            dataIndex: 'full_name',
            key: 'full_name',
            width: 300,
            render: (_: string, record: Comment) => (
              <>
                <Text className="font-medium text-gray-700 dark:text-gray-600">
                  {record?.full_name || 'N/A'}
                </Text>
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
              const formatted = record?.followupdate
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
                    {notifiedIdsRef.current.has(record.id) && (
                      <span className="ml-2 text-xs text-gray-500">🔔</span>
                    )}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">{formatted}</Text>
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

      {/* Pagination footer */}
      <div className="flex items-center justify-between pt-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing <strong>{pageData.length}</strong> of <strong>{totalItems}</strong> results
          {normalizedQuery && <span> (filtered)</span>}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <span className="text-sm">
            Page <strong>{page}</strong> / <strong>{totalPages}</strong>
          </span>
          <button
            className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowFollowup;
