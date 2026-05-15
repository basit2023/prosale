'use client';

import React, { useEffect, useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { Title, Text } from '@/components/ui/text';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';
import { decryptData } from '@/components/encriptdycriptdata';
import SimpleBar from '@/components/ui/simplebar';
import { PiNotePencilDuotone, PiUsersDuotone } from 'react-icons/pi';
import { Avatar } from '@/components/ui/avatar';

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
  const [activities, setActivities] = useState<ActivityReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const encryptedData = localStorage.getItem('uData');
        if (!encryptedData) return;
        const userData: any = decryptData(encryptedData);
        if (!userData?.user) return;

        const perm = Number(userData.user.permission || 0);
        const id = encodeURIComponent(userData.user.id || '');
        const email = userData.user.email;

        const res = await apiService.get(`/daily-activity-report/${email}?permission=${perm}&id=${id}`);
        
        let data = res.data?.data || res.data || [];
        if (!Array.isArray(data)) {
           data = [];
        }
        
        setActivities(data.slice(0, 10)); // Top 10 most recent
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchActivities();
    }
  }, [session]);

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
            <PiNotePencilDuotone className="h-10 w-10 text-gray-300 mb-2" />
            <Text>No recent activity reports found.</Text>
          </div>
        ) : (
          <SimpleBar className="h-full pr-4">
            <div className="flex flex-col gap-5">
              {activities.map((item, index) => (
                <div key={index} className="relative flex items-start gap-x-3 pb-4 before:absolute before:top-0 before:z-0 before:h-full before:w-[1px] before:bg-gray-200 last:pb-0 last:before:hidden before:start-[19px]">
                  <Avatar name={item.full_name} className="h-10 w-10 shrink-0 border-2 border-white relative z-10" />
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <Title as="h6" className="text-sm font-medium">
                        {item.full_name}
                      </Title>
                      <Text className="text-xs text-gray-400">{formatDate(item.dt)}</Text>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100">
                      <ul className="grid grid-cols-2 gap-1">
                        {item.daily_lead_follow_up > 0 && <li>• Follow-ups: <span className="font-medium text-gray-800">{item.daily_lead_follow_up}</span></li>}
                        {item.client_matured > 0 && <li>• Clients Matured: <span className="font-medium text-gray-800">{item.client_matured}</span></li>}
                        {item.dealers_meeting > 0 && <li>• Dealer Mtgs: <span className="font-medium text-gray-800">{item.dealers_meeting}</span></li>}
                        {item.daily_office_visits > 0 && <li>• Office Visits: <span className="font-medium text-gray-800">{item.daily_office_visits}</span></li>}
                      </ul>
                      {item.office_activity && item.office_activity !== 'None' && item.office_activity !== '' && (
                        <p className="mt-1 pt-1 border-t border-gray-200 text-gray-500 line-clamp-2">
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
