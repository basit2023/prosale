'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  PiUsersDuotone, 
  PiEnvelopeOpenDuotone, 
  PiCalendarPlusDuotone, 
  PiCheckCircleDuotone,
  PiTableDuotone,
  PiChartBarDuotone
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import { Title } from '@/components/ui/text';

// Lazy-load recharts — only needed when user clicks "Chart" toggle
const LazyBarChart = dynamic<any>(
  () => import('recharts').then(mod => mod.BarChart as any),
  { ssr: false }
);
const LazyBar = dynamic<any>(
  () => import('recharts').then(mod => mod.Bar as any),
  { ssr: false }
);
const LazyXAxis = dynamic<any>(
  () => import('recharts').then(mod => mod.XAxis as any),
  { ssr: false }
);
const LazyYAxis = dynamic<any>(
  () => import('recharts').then(mod => mod.YAxis as any),
  { ssr: false }
);
const LazyCartesianGrid = dynamic<any>(
  () => import('recharts').then(mod => mod.CartesianGrid as any),
  { ssr: false }
);
const LazyTooltip = dynamic<any>(
  () => import('recharts').then(mod => mod.Tooltip as any),
  { ssr: false }
);
const LazyLegend = dynamic<any>(
  () => import('recharts').then(mod => mod.Legend as any),
  { ssr: false }
);
const LazyResponsiveContainer = dynamic<any>(
  () => import('recharts').then(mod => mod.ResponsiveContainer as any),
  { ssr: false }
);

interface StatsData {
  Today_Leads: number;
  Unread_Leads: number;
  FollowUps_Created: number;
  FollowUps_Attended: number;
  Total_Leads?: number;
  Close_Leads?: number;
  Breakdown: any[];
  CardDetails?: Record<DetailKey, any[]>;
}

type DetailKey = 'todayAssigned' | 'unreadLeads' | 'followupsCreated' | 'followupsAttended';

const detailTitles: Record<DetailKey, string> = {
  todayAssigned: "Today's Assigned Leads",
  unreadLeads: 'Unread Leads',
  followupsCreated: 'Follow-ups Created',
  followupsAttended: 'Follow-ups Attended',
};

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

export default function LeadStats({
  className,
  data,
  loading,
  showStatCards = true,
  showTeamOverview = true,
}: {
  className?: string;
  data?: any;
  loading?: boolean;
  showStatCards?: boolean;
  showTeamOverview?: boolean;
}) {
  const [view, setView] = useState<'table' | 'chart'>('table');
  const [selectedDetail, setSelectedDetail] = useState<DetailKey | null>(null);
  const stats: StatsData | null = data || null;

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="h-48 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Assigned",
      metric: stats?.Today_Leads || 0,
      detailKey: 'todayAssigned' as DetailKey,
      icon: <PiUsersDuotone className="h-6 w-6" />,
      color: 'text-blue-600',
      fill: 'bg-blue-50',
    },
    {
      title: 'Unread Leads',
      metric: stats?.Unread_Leads || 0,
      detailKey: 'unreadLeads' as DetailKey,
      icon: <PiEnvelopeOpenDuotone className="h-6 w-6" />,
      color: 'text-red-600',
      fill: 'bg-red-50',
    },
    {
      title: 'Follow-ups Created',
      metric: stats?.FollowUps_Created || 0,
      detailKey: 'followupsCreated' as DetailKey,
      icon: <PiCalendarPlusDuotone className="h-6 w-6" />,
      color: 'text-orange-600',
      fill: 'bg-orange-50',
    },
    {
      title: 'Follow-ups Attended',
      metric: stats?.FollowUps_Attended || 0,
      detailKey: 'followupsAttended' as DetailKey,
      icon: <PiCheckCircleDuotone className="h-6 w-6" />,
      color: 'text-green-600',
      fill: 'bg-green-50',
    },
  ];

  const chartData = stats?.Breakdown?.map(user => ({
    name: user.full_name,
    Assigned: user.today_leads,
    Open: user.open_leads,
  })) || [];

  const detailRows = selectedDetail ? stats?.CardDetails?.[selectedDetail] || [] : [];

  const rowDetail = (row: any) => {
    if (selectedDetail === 'followupsCreated' || selectedDetail === 'followupsAttended') {
      return row.followup || '-';
    }

    return `${row.status || '-'} | ${row.label || 'No label'} | Assigned to ${row.assigned_to || '-'}`;
  };

  const rowTime = (row: any) => {
    if (selectedDetail === 'followupsCreated') return row.dt;
    if (selectedDetail === 'followupsAttended') return row.attended_at;
    return row.assigned_on;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {showStatCards && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setSelectedDetail(item.detailKey)}
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900"
            >
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', item.fill, item.color)}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{item.metric || 0}</h3>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedDetail && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
            <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-rose-600">Today details</div>
                <h3 className="mt-1 text-xl font-black text-gray-900 dark:text-white">{detailTitles[selectedDetail]}</h3>
                <p className="text-sm text-gray-500">{detailRows.length} rows for current date.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100"
              >
                Close
              </button>
            </div>

            <div className="max-h-[calc(90vh-98px)] overflow-auto p-5">
              {detailRows.length ? (
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3">Lead</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Project</th>
                      <th className="px-4 py-3">Assigned / User</th>
                      <th className="px-4 py-3">Details</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {detailRows.map((row, index) => (
                      <tr key={`${selectedDetail}-${row.id || row.lead_id || index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">#{row.lead_id || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900 dark:text-white">{row.customer_name || 'Customer'}</div>
                          <div className="text-xs font-semibold text-amber-600">{row.mobile || '-'}</div>
                          <div className="text-xs text-gray-500">{row.city || row.email || ''}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{row.project_name || 'No project'}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900 dark:text-white">{row.assigned_to || row.user || '-'}</div>
                          <div className="text-xs text-gray-500">Through {row.assigned_through || '-'}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{rowDetail(row)}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(rowTime(row))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
                  No rows found for current date.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showTeamOverview && stats?.Breakdown && stats.Breakdown.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:bg-gray-900 transition-all duration-300">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Title as="h3" className="text-base font-semibold text-gray-800 dark:text-gray-200">
              Team Performance Overview
            </Title>
            <div className="flex items-center rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              <button
                onClick={() => setView('table')}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  view === 'table' ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <PiTableDuotone className="h-4 w-4" />
                Table
              </button>
              <button
                onClick={() => setView('chart')}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  view === 'chart' ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <PiChartBarDuotone className="h-4 w-4" />
                Chart
              </button>
            </div>
          </div>

          {view === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="pb-3 font-medium">Member</th>
                    <th className="pb-3 text-center font-medium">Today Assigned</th>
                    <th className="pb-3 text-center font-medium">Open Today</th>
                    <th className="pb-3 text-center font-medium">Unread Today</th>
                    <th className="pb-3 text-center font-medium">Calls Today</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.Breakdown.map((user) => (
                    <tr key={user.name} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{user.full_name}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-center font-semibold text-blue-600 dark:text-blue-400">{user.today_leads}</td>
                      <td className="py-4 text-center font-semibold text-orange-600 dark:text-orange-400">{user.open_leads}</td>
                      <td className="py-4 text-center">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          user.unread_leads > 0 ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        )}>
                          {user.unread_leads}
                        </span>
                      </td>
                      <td className="py-4 text-center text-gray-600 dark:bg-gray-800 dark:text-gray-400">{user.today_calls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-[400px] w-full pt-4">
              <LazyResponsiveContainer width="100%" height="100%">
                <LazyBarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <LazyCartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <LazyXAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  />
                  <LazyYAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  />
                  <LazyTooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <LazyLegend iconType="circle" />
                  <LazyBar dataKey="Assigned" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <LazyBar dataKey="Open" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </LazyBarChart>
              </LazyResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
