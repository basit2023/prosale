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
const LazyBarChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.BarChart })),
  { ssr: false }
);
const LazyBar = dynamic(
  () => import('recharts').then(mod => ({ default: mod.Bar })),
  { ssr: false }
);
const LazyXAxis = dynamic(
  () => import('recharts').then(mod => ({ default: mod.XAxis })),
  { ssr: false }
);
const LazyYAxis = dynamic(
  () => import('recharts').then(mod => ({ default: mod.YAxis })),
  { ssr: false }
);
const LazyCartesianGrid = dynamic(
  () => import('recharts').then(mod => ({ default: mod.CartesianGrid })),
  { ssr: false }
);
const LazyTooltip = dynamic(
  () => import('recharts').then(mod => ({ default: mod.Tooltip })),
  { ssr: false }
);
const LazyLegend = dynamic(
  () => import('recharts').then(mod => ({ default: mod.Legend })),
  { ssr: false }
);
const LazyResponsiveContainer = dynamic(
  () => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })),
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
}

export default function LeadStats({ className, data, loading }: { className?: string; data?: any; loading?: boolean }) {
  const [view, setView] = useState<'table' | 'chart'>('table');
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
      icon: <PiUsersDuotone className="h-6 w-6" />,
      color: 'text-blue-600',
      fill: 'bg-blue-50',
    },
    {
      title: 'Unread Leads',
      metric: stats?.Unread_Leads || 0,
      icon: <PiEnvelopeOpenDuotone className="h-6 w-6" />,
      color: 'text-red-600',
      fill: 'bg-red-50',
    },
    {
      title: 'Follow-ups Created',
      metric: stats?.FollowUps_Created || 0,
      icon: <PiCalendarPlusDuotone className="h-6 w-6" />,
      color: 'text-orange-600',
      fill: 'bg-orange-50',
    },
    {
      title: 'Follow-ups Attended',
      metric: stats?.FollowUps_Attended || 0,
      icon: <PiCheckCircleDuotone className="h-6 w-6" />,
      color: 'text-green-600',
      fill: 'bg-green-50',
    },
  ];

  const chartData = stats?.Breakdown?.map(user => ({
    name: user.full_name,
    'Assigned Today': user.today_leads,
    'Open Leads': user.open_leads,
  })) || [];

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div key={item.title} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:bg-gray-900 transition-all hover:shadow-md">
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', item.fill, item.color)}>
              {item.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{item.metric || 0}</h3>
            </div>
          </div>
        ))}
      </div>

      {stats?.Breakdown && stats.Breakdown.length > 0 && (
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
