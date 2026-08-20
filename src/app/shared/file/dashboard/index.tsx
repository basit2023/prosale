'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  PiCalendarCheckDuotone,
  PiChartLineUpDuotone,
  PiMagnifyingGlassDuotone,
  PiPlusCircleDuotone,
  PiUsersThreeDuotone,
} from 'react-icons/pi';

import apiService from '@/utils/apiService';
import { useUser } from '@/context/UserContext';

import FileStats from './file-stats';
import LeadStats from './lead-stats';

const skeleton = (height: string) => (
  <div className={`${height} animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800`} />
);

const StorageReport = dynamic(() => import('@/app/shared/file/dashboard/storage-report'), {
  loading: () => skeleton('h-96'),
});
const TopPerformersLeaderboard = dynamic(() => import('./top-performers-leaderboard'), {
  loading: () => skeleton('h-64'),
});
const LeadConversionFunnel = dynamic(() => import('./lead-conversion-funnel'), {
  loading: () => skeleton('h-64'),
});
const TeamWorkload = dynamic(() => import('./team-workload'), {
  loading: () => skeleton('h-64'),
});
const TeamEffortAnalytics = dynamic(() => import('./team-effort-analytics'), {
  loading: () => skeleton('h-64'),
});
const SalesActivityInsights = dynamic(() => import('./sales-activity-insights'), {
  loading: () => skeleton('h-96'),
});
const QuickActions = dynamic(() => import('./quick-actions'), {
  loading: () => skeleton('h-64'),
});
const HotInventory = dynamic(() => import('./hot-inventory'), {
  loading: () => skeleton('h-64'),
});
const MyDailyTasks = dynamic(() => import('./my-daily-tasks'), {
  loading: () => skeleton('h-64'),
});
const RecentActivities = dynamic(() => import('./recent-activities'), {
  loading: () => skeleton('h-64'),
});
const AISmartInsights = dynamic(() => import('./ai-smart-insights'), {
  loading: () => skeleton('h-40'),
});
const SuperAdminSalesDashboard = dynamic(() => import('./super-admin-sales-dashboard'), {
  loading: () => skeleton('h-[720px]'),
});
const SalesExecutionWorkspace = dynamic(() => import('./sales-execution-workspace'), {
  loading: () => skeleton('h-[560px]'),
});

function SalesCommandCenter({
  data,
  loading,
  isAdmin,
  isManager,
}: {
  data: any;
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
}) {
  const unread = data?.Unread_Leads ?? 0;
  const today = data?.Today_Leads ?? 0;
  const created = data?.FollowUps_Created ?? 0;
  const attended = data?.FollowUps_Attended ?? 0;
  const followUpRate = created ? Math.round((attended / created) * 100) : 0;

  const actions = [
    {
      title: 'New Lead',
      description: 'Capture a fresh enquiry',
      href: '/leads/new-lead',
      icon: PiPlusCircleDuotone,
      tone: 'bg-rose-50 text-rose-600 ring-rose-100',
    },
    {
      title: 'Lead Queue',
      description: isAdmin || isManager ? 'Review team pipeline' : 'Work assigned leads',
      href: '/leads/management',
      icon: PiUsersThreeDuotone,
      tone: 'bg-blue-50 text-blue-600 ring-blue-100',
    },
    {
      title: 'Follow-ups',
      description: 'Handle pending callbacks',
      href: '/leads/followup',
      icon: PiCalendarCheckDuotone,
      tone: 'bg-amber-50 text-amber-600 ring-amber-100',
    },
    {
      title: 'Search',
      description: 'Find any lead quickly',
      href: '/leads/search',
      icon: PiMagnifyingGlassDuotone,
      tone: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    },
  ];

  return (
    <div className="col-span-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
            <PiChartLineUpDuotone className="h-4 w-4" />
            Sales command center
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
            Move the hottest leads first.
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Today assigned: <strong className="text-gray-900 dark:text-gray-100">{loading ? '-' : today}</strong>
            <span className="mx-2 text-gray-300">|</span>
            Unread: <strong className={unread > 0 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}>{loading ? '-' : unread}</strong>
            <span className="mx-2 text-gray-300">|</span>
            Follow-up completion: <strong className="text-gray-900 dark:text-gray-100">{loading ? '-' : `${followUpRate}%`}</strong>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:min-w-[560px]">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-xl border border-gray-100 bg-gray-50 p-3 transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-white hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <span className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1 ${action.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">{action.title}</span>
                <span className="mt-0.5 block text-xs text-gray-500">{action.description}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SalesPlaybook({
  data,
  loading,
  isAdmin,
  isManager,
}: {
  data: any;
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
}) {
  const target = Number(data?.targetRevenue || data?.Target_Revenue || 0);
  const achieved = Number(data?.achievedRevenue || data?.Achieved_Revenue || 0);
  const progress = target ? Math.min(100, Math.round((achieved / target) * 100)) : 0;

  const plays = [
    {
      title: 'Work priority leads',
      description: 'Open the lead queue and start from unread, overdue, and high-intent enquiries.',
      href: '/leads/management',
      icon: PiChartLineUpDuotone,
    },
    {
      title: 'Clear follow-ups',
      description: 'Clear due callbacks first, then add new tasks from fresh conversations.',
      href: '/leads/followup',
      icon: PiCalendarCheckDuotone,
    },
    {
      title: 'Find exact lead',
      description: 'Search by customer, project, city, mobile, or assigned owner.',
      href: '/leads/search',
      icon: PiMagnifyingGlassDuotone,
    },
    {
      title: isAdmin ? 'Review team activity' : isManager ? 'Check team work' : 'Update next step',
      description: isAdmin || isManager
        ? 'See calls, follow-ups, and daily movement clearly.'
        : 'Record the result, next follow-up, and customer intent after each contact.',
      href: '/activitylogs',
      icon: PiUsersThreeDuotone,
    },
  ];

  return (
    <div className="col-span-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-rose-600">Sales playbook</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Today winning moves</h3>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? 'Loading revenue progress...' : `Revenue progress: ${progress}%`}
          </p>
        </div>
        <div className="inline-flex h-12 min-w-16 items-center justify-center rounded-xl bg-rose-50 px-4 text-lg font-black text-rose-600">
          {loading ? '-' : `${progress}%`}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {plays.map((play) => {
          const Icon = play.icon;
          return (
            <Link
              key={play.title}
              href={play.href}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-rose-200 hover:bg-white hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <Icon className="h-5 w-5" />
              </span>
              <span className="block text-sm font-semibold text-gray-900 dark:text-white">{play.title}</span>
              <span className="mt-1 block text-xs leading-5 text-gray-500">{play.description}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function FileDashboard() {
  const { status } = useSession();
  const { userData } = useUser() as { userData?: any };
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [superAdminSummary, setSuperAdminSummary] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  const user = userData?.user;
  const permission = Number(user?.permissions?.permission_level || user?.permission || 0);
  const role = user?.role || '';
  const isSuperAdmin = permission >= 20;
  const isAdmin = permission >= 9;
  const isManager = (permission >= 4 && permission < 9) || role === 'manager';
  const isUser = permission < 4 && role !== 'manager';

  const userParams = useMemo(() => {
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
    const fetchDashboardData = async () => {
      try {
        if (!userParams || (!userParams.user && !userParams.email)) {
          setLoading(false);
          return;
        }



        setLoading(true);
        const response = await apiService.get('/total-items', { params: userParams });
        setDashboardData(response.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [userParams, status]);

  const handleSuperAdminSummaryChange = useCallback((summary: Record<string, any> | null) => {
    setSuperAdminSummary(summary);
  }, []);

  const cardData = useMemo(() => {
    if (!isSuperAdmin || !superAdminSummary) return dashboardData;
    const connectedCalls = Number(superAdminSummary.calls_started || 0);
    const dialedCalls = Number(superAdminSummary.dialed_calls || 0);
    const connectedPercentage = dialedCalls ? Number(((connectedCalls / dialedCalls) * 100).toFixed(2)) : 0;

    return {
      ...dashboardData,
      Auto_Landed_Leads: superAdminSummary.auto_landed_leads ?? 0,
      Today_Leads: superAdminSummary.leads_assigned ?? 0,
      Unread_Leads: superAdminSummary.unread_leads ?? 0,
      FollowUps_Created: superAdminSummary.followups_created ?? 0,
      FollowUps_Attended: superAdminSummary.followups_attended ?? 0,
      Total_Connected_Calls: connectedCalls,
      Total_Dialed_Calls: dialedCalls,
      Total_Calls: connectedCalls,
      TotalCallsPercentage: connectedPercentage,
    };
  }, [dashboardData, isSuperAdmin, superAdminSummary]);

  return (
    <div className="mt-2 @container">
      <div className="grid grid-cols-1 gap-6 @container lg:grid-cols-12 2xl:gap-8">
        <div className="col-span-full">
          <FileStats className="mb-4" data={cardData} loading={loading} />
          <LeadStats
            className="mb-4"
            data={dashboardData}
            loading={loading}
            showTeamOverview={false}
          />
        </div>
        {!isSuperAdmin && <SalesExecutionWorkspace />}
        {!isSuperAdmin && (
          <>
            <SalesCommandCenter
              data={dashboardData}
              loading={loading}
              isAdmin={isAdmin}
              isManager={isManager}
            />
            <SalesPlaybook
              data={dashboardData}
              loading={loading}
              isAdmin={isAdmin}
              isManager={isManager}
            />
          </>
        )}
        {isSuperAdmin && (
          <div className="col-span-full">
            <SuperAdminSalesDashboard className="w-full" onSummaryChange={handleSuperAdminSummaryChange} />
          </div>
        )}
        {!isSuperAdmin && (isAdmin || isManager) && (
          <div className="col-span-full">
            <SalesActivityInsights className="w-full" />
          </div>
        )}
        <div className="col-span-full">
          <AISmartInsights className="w-full" />
        </div>
        {!isSuperAdmin && (
          <div className="col-span-full">
            <LeadStats
              className="mb-4"
              data={dashboardData}
              loading={loading}
              showStatCards={false}
            />
          </div>
        )}

        {isAdmin && (
          <>
            <div className="col-span-full grid grid-cols-1 gap-6 lg:grid-cols-12">
              <TopPerformersLeaderboard className="col-span-12 lg:col-span-6" />
              <LeadConversionFunnel
                className="col-span-12 lg:col-span-6"
                dashboardData={dashboardData}
                dashboardLoading={loading}
              />
            </div>
            <div className="col-span-full">
              <StorageReport className="w-full" />
            </div>
            <div className="col-span-full">
              <MyDailyTasks className="w-full" />
            </div>
          </>
        )}

        {isManager && (
          <>
            <div className="col-span-full grid grid-cols-1 gap-6 lg:grid-cols-12">
              <TeamWorkload className="col-span-12 lg:col-span-6" />
              <TeamEffortAnalytics className="col-span-12 lg:col-span-6" />
            </div>
            <div className="col-span-full">
              <StorageReport className="w-full" />
            </div>
            <div className="col-span-full">
              <MyDailyTasks className="w-full" />
            </div>
          </>
        )}

        {isUser && (
          <>
            <div className="col-span-full">
              <StorageReport className="w-full" />
            </div>
            <div className="col-span-full">
              <MyDailyTasks className="w-full" />
            </div>
            <div className="col-span-full grid grid-cols-1 gap-6 lg:grid-cols-12">
              <QuickActions className="col-span-12 lg:col-span-8" />
              <HotInventory className="col-span-12 lg:col-span-4" />
            </div>
          </>
        )}

        {(isAdmin || isManager) && (
          <div className="col-span-full flex flex-col gap-6 lg:grid lg:grid-cols-12">
            <div className="col-span-12">
              <RecentActivities className="w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

