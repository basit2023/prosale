'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  PiChatCircleTextDuotone,
  PiEyeDuotone,
  PiPhoneCallDuotone,
  PiUserMinusDuotone,
} from 'react-icons/pi';

import apiService from '@/utils/apiService';
import { useUser } from '@/context/UserContext';

type ActivityUser = {
  username: string;
  full_name: string;
  total_actions: number;
  lead_opens: number;
  comments_added: number;
  calls_started: number;
  followups_done: number;
  reassignments: number;
  work_score: number;
  status: 'active' | 'low_activity' | 'no_activity';
  last_activity_at?: string | null;
};

type ActivityData = {
  summary?: {
    total_actions?: number;
    lead_opens?: number;
    comments_added?: number;
    reassignments?: number;
    calls_started?: number;
    followups_done?: number;
  };
  users?: ActivityUser[];
  topCommenters?: ActivityUser[];
  inactiveUsers?: ActivityUser[];
  recent?: Array<{
    id: number;
    action: string;
    actor_name?: string;
    lead_id?: string;
    created_at: string;
  }>;
};

const statCards = [
  {
    key: 'lead_opens',
    label: 'Lead opens',
    icon: PiEyeDuotone,
    tone: 'bg-blue-50 text-blue-600',
  },
  {
    key: 'comments_added',
    label: 'Comments',
    icon: PiChatCircleTextDuotone,
    tone: 'bg-emerald-50 text-emerald-600',
  },
  {
    key: 'calls_started',
    label: 'Calls',
    icon: PiPhoneCallDuotone,
    tone: 'bg-amber-50 text-amber-600',
  },
  {
    key: 'reassignments',
    label: 'Assignments',
    icon: PiUserMinusDuotone,
    tone: 'bg-rose-50 text-rose-600',
  },
] as const;

const formatAction = (action: string) =>
  action
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function SalesActivityInsights({ className = '' }: { className?: string }) {
  const { userData } = useUser() as { userData?: any };
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  const user = userData?.user;
  const permission = Number(user?.permissions?.permission_level || user?.permission || 0);
  const params = useMemo(() => {
    if (!user) return null;
    return {
      user: user.username || user.name || '',
      email: user.email || '',
      permission,
      id: user.id || '',
      role: user.role || user.user_type || '',
    };
  }, [permission, user]);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!params) return;

      try {
        setLoading(true);
        const response = await apiService.get('/sales-activity-analytics', { params });
        setData(response.data?.data || null);
      } catch (error) {
        console.error('Error fetching sales activity analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [params]);

  const summary = data?.summary || {};
  const users = data?.users || [];
  const topCommenters = data?.topCommenters || [];
  const inactiveUsers = data?.inactiveUsers || [];
  const recent = data?.recent || [];

  return (
    <div className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 ${className}`}>
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-rose-600">Team tracking</div>
          <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">Sales activity control</h3>
          <p className="mt-1 text-sm text-gray-500">
            Daily sales-user activity only. Admin and permission 9+ users are excluded.
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 px-4 py-3 text-right dark:bg-gray-800">
          <div className="text-xs text-gray-500">Daily actions</div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {loading ? '-' : Number(summary.total_actions || 0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <span className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${card.tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="text-2xl font-black text-gray-900 dark:text-white">
                {loading ? '-' : Number(summary[card.key] || 0)}
              </div>
              <div className="text-xs font-medium text-gray-500">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
          <div className="mb-3 font-semibold text-gray-900 dark:text-white">Most comments</div>
          <div className="space-y-3">
            {loading ? (
              <div className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            ) : topCommenters.length ? (
              topCommenters.slice(0, 5).map((item) => (
                <div key={item.username} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">{item.full_name}</div>
                    <div className="text-xs text-gray-500">Score {item.work_score}</div>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                    {item.comments_added}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No comments logged today.</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
          <div className="mb-3 font-semibold text-gray-900 dark:text-white">Needs attention</div>
          <div className="space-y-3">
            {loading ? (
              <div className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            ) : inactiveUsers.length ? (
              inactiveUsers.slice(0, 5).map((item) => (
                <div key={item.username} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">{item.full_name}</div>
                    <div className="text-xs text-gray-500">
                      {item.status === 'no_activity' ? 'No activity today' : 'Low activity today'}
                    </div>
                  </div>
                  <div className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">
                    {item.work_score}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">Everyone has useful activity today.</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
          <div className="mb-3 font-semibold text-gray-900 dark:text-white">Recent tracked steps</div>
          <div className="space-y-3">
            {loading ? (
              <div className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            ) : recent.length ? (
              recent.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{formatAction(item.action)}</div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {item.actor_name || 'Unknown user'} {item.lead_id ? `| Lead #${item.lead_id}` : ''}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No tracked steps yet today.</div>
            )}
          </div>
        </div>
      </div>

      {!loading && users.length > 0 ? (
        <div className="mt-5 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-[1.4fr_repeat(5,0.7fr)] gap-2 bg-gray-50 px-4 py-3 text-xs font-bold uppercase text-gray-500 dark:bg-gray-800">
            <span>User</span>
            <span>Opens</span>
            <span>Comments</span>
            <span>Calls</span>
            <span>Follow-ups</span>
            <span>Score</span>
          </div>
          {users.slice(0, 8).map((item) => (
            <div
              key={item.username}
              className="grid grid-cols-[1.4fr_repeat(5,0.7fr)] gap-2 border-t border-gray-100 px-4 py-3 text-sm dark:border-gray-700"
            >
              <span className="truncate font-semibold text-gray-900 dark:text-white">{item.full_name}</span>
              <span>{item.lead_opens}</span>
              <span>{item.comments_added}</span>
              <span>{item.calls_started}</span>
              <span>{item.followups_done}</span>
              <span className="font-bold">{item.work_score}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
