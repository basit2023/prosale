'use client';

import React, { useEffect, useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { Title, Text } from '@/components/ui/text';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';
import { decryptData } from '@/components/encriptdycriptdata';
import SimpleBar from '@/components/ui/simplebar';
import { Avatar } from '@/components/ui/avatar';
import { PiUsersThreeFill } from 'react-icons/pi';

interface TeamMember {
  name: string;
  email: string;
  achieved: number;
  target: number;
}

export default function TeamWorkload({ className }: { className?: string }) {
  const { data: session } = useSession();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const encryptedData = localStorage.getItem('uData');
        if (!encryptedData) return;
        const userData: any = decryptData(encryptedData);
        if (!userData?.user) return;

        const perm = Number(userData.user.permission || 0);
        const role = String(userData.user.role || userData.user.user_type || '').toLowerCase();
        const id = encodeURIComponent(userData.user.id || '');
        
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        const queryParams = `?id=${id}&permission=${perm}&role=${role}&year=${year}&month=${month}`;
        
        const res = await apiService.get(`/revenue-targets-dashbrod/${queryParams}`);
        
        let payload = res.data?.data || res.data || res;
        let usersArray = Array.isArray(payload) ? payload : Array.isArray(payload?.users) ? payload.users : [];

        // Safely parse numbers
        const toNum = (v: any) => {
          const n = Number.parseFloat(typeof v === 'string' ? v.replace(/,/g, '') : v ?? '0');
          return Number.isFinite(n) ? n : 0;
        };

        const parsedUsers: TeamMember[] = usersArray.map((u: any) => ({
          name: u?.name || u?.full_name || u?.username || u?.employee || u?.email || 'Unknown',
          email: u?.email || '',
          achieved: toNum(u?.achievedRevenue ?? u?.achieved ?? u?.achieved_revenue ?? u?.revenue_achieved),
          target: toNum(u?.targetRevenue ?? u?.target ?? u?.target_revenue ?? u?.revenue_target),
        }));

        // Exclude the manager themselves if they appear (optional, but usually managers want to see their team)
        const myEmail = userData.user.email?.toLowerCase();
        const justTeam = parsedUsers.filter(u => u.email?.toLowerCase() !== myEmail);

        setTeam(justTeam);
      } catch (error) {
        console.error('Error fetching team workload data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchTeamData();
    }
  }, [session]);

  return (
    <WidgetCard
      title="Team Workload & Progress"
      titleClassName="font-semibold text-gray-800 text-lg"
      className={className}
      action={
        <div className="flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-md">
          <PiUsersThreeFill className="h-4 w-4" /> Team
        </div>
      }
    >
      <div className="mt-4 h-72">
        {loading ? (
          <div className="flex h-full items-center justify-center text-gray-500">Loading team data...</div>
        ) : team.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <PiUsersThreeFill className="h-10 w-10 text-gray-300 mb-2" />
            <Text>No team members found.</Text>
          </div>
        ) : (
          <SimpleBar className="h-full pr-4">
            <div className="flex flex-col gap-4">
              {team.map((member, index) => {
                const percentage = member.target > 0 ? Math.min(100, (member.achieved / member.target) * 100) : 0;
                
                return (
                  <div key={index} className="flex items-center gap-4">
                    <Avatar
                      name={member.name}
                      color="invert"
                      className="shrink-0"
                    />
                    <div className="flex-grow">
                      <div className="flex justify-between items-end mb-1">
                        <Title as="h6" className="text-sm font-medium line-clamp-1">
                          {member.name}
                        </Title>
                        <Text className="text-xs text-gray-500">
                          {percentage.toFixed(0)}%
                        </Text>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${percentage >= 100 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-primary'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <Text className="text-[10px] text-gray-400 mt-1">
                        Achieved: {member.achieved.toLocaleString()}
                      </Text>
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
