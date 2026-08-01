'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PiNotePencilDuotone } from 'react-icons/pi';

import WidgetCard from '@/components/cards/widget-card';
import { Avatar } from '@/components/ui/avatar';
import SimpleBar from '@/components/ui/simplebar';
import { Title, Text } from '@/components/ui/text';
import { useUser } from '@/context/UserContext';
import apiService from '@/utils/apiService';

interface ActivityReport {
  id: number;
  full_name: string;
  daily_office_visits: number;
  client_matured: number;
  daily_lead_follow_up: number;
  lead_assigned: number;
  dealers_meeting: number;
  dealers_register: number;
  office_activity: string;
  dt: string;
}

export default function RecentActivities({ className }: { className?: string }) {
  const { data: session } = useSession();
  const { userData } = useUser() as { userData?: any };
  const [activities, setActivities] = useState<ActivityReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        if (!userData?.user) return;

        const perm = Number(userData.user.permission || 0);
        const id = userData.user.id || '';
        const email = userData.user.email;

        const res = await apiService.get(`/daily-activity-report/${email}`, {
          params: { permission: perm, id },
        });

        const data = res.data?.data || res.data || [];
        setActivities(Array.isArray(data) ? (data.slice(0, 10) as ActivityReport[]) : []);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchActivities();
    }
  }, [session, userData]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <WidgetCard
      title="Recent Activity Reports"
      titleClassName="font-semibold text-gray-800 text-lg"
      className={className}
    >
      <div className="mt-4 h-72">
        {loading ? (
          <div className="flex h-full items-center justify-center text-gray-500">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <PiNotePencilDuotone className="mb-2 h-10 w-10 text-gray-300" />
            <Text>No recent activity reports found.</Text>
          </div>
        ) : (
          <SimpleBar className="h-full pr-4">
            <div className="flex flex-col gap-5">
              {activities.map((item, index) => (
                <div
                  key={item.id || index}
                  className="relative flex items-start gap-x-3 pb-4 before:absolute before:top-0 before:z-0 before:h-full before:w-[1px] before:bg-gray-200 before:start-[19px] last:pb-0 last:before:hidden"
                >
                  <Avatar name={item.full_name} className="relative z-10 h-10 w-10 shrink-0 border-2 border-white" />
                  <div className="flex-grow">
                    <div className="flex items-start justify-between">
                      <Title as="h6" className="text-sm font-medium">
                        {item.full_name}
                      </Title>
                      <Text className="text-xs text-gray-400">{formatDate(item.dt)}</Text>
                    </div>

                    <div className="mt-2 rounded-md border border-gray-100 bg-gray-50 p-2 text-xs text-gray-600">
                      <ul className="grid grid-cols-2 gap-1">
                        {item.daily_lead_follow_up > 0 && <li>Follow-ups: <span className="font-medium text-gray-800">{item.daily_lead_follow_up}</span></li>}
                        {/* {item.client_matured > 0 && <li>Clients Matured: <span className="font-medium text-gray-800">{item.client_matured}</span></li>} */}
                        {item.dealers_meeting > 0 && <li>Dealer Mtgs: <span className="font-medium text-gray-800">{item.dealers_meeting}</span></li>}
                        {item.daily_office_visits > 0 && <li>Office Visits: <span className="font-medium text-gray-800">{item.daily_office_visits}</span></li>}
                      </ul>
                      {item.office_activity && item.office_activity !== 'None' && item.office_activity !== '' && (
                        <p className="mt-1 border-t border-gray-200 pt-1 text-gray-500 line-clamp-2">
                          <span className="font-medium">Note:</span> {item.office_activity}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SimpleBar>
        )}
      </div>
    </WidgetCard>
  );
}
