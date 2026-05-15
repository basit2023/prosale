'use client';

import React, { useEffect, useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { Title, Text } from '@/components/ui/text';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';
import { decryptData } from '@/components/encriptdycriptdata';
import SimpleBar from '@/components/ui/simplebar';
import { PiTrophyFill, PiMedalFill } from 'react-icons/pi';

interface UserPerformance {
  name: string;
  email: string;
  achieved: number;
  target: number;
}

export default function TopPerformersLeaderboard({ className }: { className?: string }) {
  const { data: session } = useSession();
  const [performers, setPerformers] = useState<UserPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopPerformers = async () => {
      try {
        const encryptedData = localStorage.getItem('uData');
        if (!encryptedData) return;
        const userData: any = decryptData(encryptedData);
        if (!userData?.user) return;

        const perm = Number(userData.user.permission || 0);
        
        // This widget is primarily for admins, but we'll fetch anyway just in case
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        // Fetch all users data for the current month
        const res = await apiService.get(`/revenue-targets-dashbrod/?permission=${perm >= 9 ? 9 : perm}&year=${year}&month=${month}`);
        
        let payload = res.data?.data || res.data || res;
        let usersArray = Array.isArray(payload) ? payload : Array.isArray(payload?.users) ? payload.users : [];

        // Safely parse numbers
        const toNum = (v: any) => {
          const n = Number.parseFloat(typeof v === 'string' ? v.replace(/,/g, '') : v ?? '0');
          return Number.isFinite(n) ? n : 0;
        };

        const parsedUsers: UserPerformance[] = usersArray.map((u: any) => ({
          name: u?.name || u?.full_name || u?.username || u?.employee || u?.email || 'Unknown',
          email: u?.email || '',
          achieved: toNum(u?.achievedRevenue ?? u?.achieved ?? u?.achieved_revenue ?? u?.revenue_achieved),
          target: toNum(u?.targetRevenue ?? u?.target ?? u?.target_revenue ?? u?.revenue_target),
        }));

        // Sort by achieved revenue, descending
        const sorted = parsedUsers
          .filter(u => u.achieved > 0)
          .sort((a, b) => b.achieved - a.achieved)
          .slice(0, 10); // Top 10

        setPerformers(sorted);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchTopPerformers();
    }
  }, [session]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <PiTrophyFill className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <PiMedalFill className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <PiMedalFill className="h-6 w-6 text-amber-700" />;
    return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">{index + 1}</span>;
  };

  return (
    <WidgetCard
      title="Top Performers"
      titleClassName="font-semibold text-gray-800 text-lg"
      className={className}
      action={
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
          This Month
        </div>
      }
    >
      <div className="mt-4 h-72">
        {loading ? (
          <div className="flex h-full items-center justify-center text-gray-500">Loading leaderboard...</div>
        ) : performers.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <PiTrophyFill className="h-10 w-10 text-gray-300 mb-2" />
            <Text>No revenue data found for this month.</Text>
          </div>
        ) : (
          <SimpleBar className="h-full pr-4">
            <div className="flex flex-col gap-3">
              {performers.map((user, index) => {
                const percentage = user.target > 0 ? Math.min(100, (user.achieved / user.target) * 100) : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 shadow-sm hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex shrink-0 items-center justify-center">
                        {getRankIcon(index)}
                      </div>
                      <div>
                        <Title as="h6" className="text-sm font-medium">
                          {user.name}
                        </Title>
                        <Text className="text-xs text-gray-500">
                          {user.achieved.toLocaleString()} / {user.target.toLocaleString()} ({percentage.toFixed(0)}%)
                        </Text>
                      </div>
                    </div>
                    <div className="w-20">
                       <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full ${percentage >= 100 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-primary'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SimpleBar>
        )}
      </div>
    </WidgetCard>
  );
}
