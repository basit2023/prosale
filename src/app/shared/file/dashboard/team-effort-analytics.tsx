'use client';

import React, { useEffect, useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { Title, Text } from '@/components/ui/text';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';
import { decryptData } from '@/components/encriptdycriptdata';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useMedia } from '@/hooks/use-media';
import { PiChartBarDuotone } from 'react-icons/pi';

export default function TeamEffortAnalytics({ className }: { className?: string }) {
  const { data: session } = useSession();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const isTablet = useMedia('(max-width: 800px)', false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const encryptedData = localStorage.getItem('uData');
        if (!encryptedData) return;
        const userData: any = decryptData(encryptedData);
        if (!userData?.user) return;

        const perm = Number(userData.user.permission || 0);
        const id = encodeURIComponent(userData.user.id || '');
        const email = userData.user.email;

        // Fetch follow up stats for the manager's team
        const res = await apiService.get(`/follow-up-stats?email=${email}&permission=${perm}&id=${id}`);
        
        let usersData = res.data?.data?.users || [];
        
        // Filter out users with 0 activity to keep chart clean
        usersData = usersData.filter((u: any) => u.total_calls > 0 || u.total_followups > 0);
        
        // Take top 7 active users
        usersData = usersData.slice(0, 7);
        
        setData(usersData);
      } catch (error) {
        console.error('Error fetching team effort stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchStats();
    }
  }, [session]);

  return (
    <WidgetCard
      title="Today's Team Effort Analytics"
      titleClassName="font-semibold text-gray-800 text-lg"
      className={className}
      action={
        <div className="rounded-full bg-indigo-100 p-2 text-indigo-600">
          <PiChartBarDuotone className="h-5 w-5" />
        </div>
      }
    >
      <div className="mt-6 h-72 w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-gray-500">Loading analytics...</div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            No call or follow-up activity recorded today.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
            >
              <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
              <XAxis dataKey="full_name" axisLine={false} tickLine={false} tickFormatter={(val) => val.split(' ')[0]} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 cursor={{ fill: '#f3f4f6' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="total_calls" name="Calls Made" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} barSize={32} />
              <Bar dataKey="total_followups" name="Follow-Ups" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </WidgetCard>
  );
}
