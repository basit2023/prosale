'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { decryptData } from '@/components/encriptdycriptdata';
import apiService from '@/utils/apiService';
import { useUser } from '@/context/UserContext';

// Eagerly loaded — above the fold
import FileStats from './file-stats';
import LeadStats from './lead-stats';

// Lazy-loaded — below the fold, only loaded when needed
const StorageReport = dynamic(() => import('@/app/shared/file/dashboard/storage-report'), {
  loading: () => <div className="h-96 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />,
});
const TopPerformersLeaderboard = dynamic(() => import('./top-performers-leaderboard'), {
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />,
});
const LeadConversionFunnel = dynamic(() => import('./lead-conversion-funnel'), {
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />,
});
const TeamWorkload = dynamic(() => import('./team-workload'), {
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />,
});
const TeamEffortAnalytics = dynamic(() => import('./team-effort-analytics'), {
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />,
});
const QuickActions = dynamic(() => import('./quick-actions'), {
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />,
});
const HotInventory = dynamic(() => import('./hot-inventory'), {
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />,
});
const MyDailyTasks = dynamic(() => import('./my-daily-tasks'), {
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />,
});
const RecentActivities = dynamic(() => import('./recent-activities'), {
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />,
});

export default function FileDashboard() {
  const { data: session, status } = useSession();
  const { userData } = useUser();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const permission = Number(userData?.user?.permission || 0);
  const role = userData?.user?.role || '';

  // Single API call for all dashboard data — eliminates the duplicate call
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!userData) return;

        const username = userData?.user?.username || userData?.user?.name;
        const email = userData?.user?.email;
        const perm = userData?.user?.permissions?.permission_level || userData?.user?.permission || 0;
        const id = userData?.user?.id || '';
        const userRole = userData?.user?.role || userData?.user?.user_type || '';

        if (!username && !email) return;

        const response = await apiService.get(`total-items?user=${username}&email=${email}&permission=${perm}&id=${id}&role=${userRole}`);
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
  }, [userData, status]);

  const isAdmin = permission >= 9;
  const isManager = permission >= 4 && permission < 9 || role === 'manager';
  const isUser = permission < 4 && role !== 'manager';

  return (
    <div className="mt-2 @container">
      <div className="grid grid-cols-1 gap-6 @container lg:grid-cols-12 2xl:gap-8">
        
        {/* Admin Layout */}
        {isAdmin && (
          <>
            <div className="col-span-full">
              <FileStats className="mb-4" data={dashboardData} loading={loading} />
              <LeadStats className="mb-4" data={dashboardData} loading={loading} />
            </div>
            <div className="col-span-full grid grid-cols-1 gap-6 lg:grid-cols-12">
              <TopPerformersLeaderboard className="col-span-12 lg:col-span-6" />
              <LeadConversionFunnel className="col-span-12 lg:col-span-6" />
            </div>
            <div className="col-span-full">
              <StorageReport className="w-full" />
            </div>
            <div className="col-span-full">
              <MyDailyTasks className="w-full" />
            </div>
          </>
        )}

        {/* Manager Layout */}
        {isManager && (
          <>
            <div className="col-span-full">
              <FileStats className="mb-4" data={dashboardData} loading={loading} />
              <LeadStats className="mb-4" data={dashboardData} loading={loading} />
            </div>
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

        {/* Standard User Layout */}
        {isUser && (
          <>
            <div className="col-span-full">
              <FileStats className="mb-4" data={dashboardData} loading={loading} />
              <LeadStats className="mb-4" data={dashboardData} loading={loading} />
            </div>
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

        {/* General Footer Section - Visible to Admins & Managers */}
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
