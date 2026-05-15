'use client';

import React, { useEffect, useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { Title, Text } from '@/components/ui/text';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';
import { decryptData } from '@/components/encriptdycriptdata';
import SimpleBar from '@/components/ui/simplebar';
import { Badge } from '@/components/ui/badge';
import { ActionIcon } from '@/components/ui/action-icon';
import { PiCheckCircle, PiPhoneCall, PiCalendarBlank } from 'react-icons/pi';
import Link from 'next/link';

interface Task {
  id: string | number;
  customer_name?: string;
  lead_name?: string;
  name?: string;
  time?: string;
  date?: string;
  followup_date?: string;
  followup_time?: string;
  status?: string;
  type?: string;
  message?: string;
}

export default function MyDailyTasks({ className }: { className?: string }) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const encryptedData = localStorage.getItem('uData');
        if (!encryptedData) return;
        const userData: any = decryptData(encryptedData);
        if (!userData?.user?.email) return;

        const perm = Number(userData.user.permission || 0);
        const id = encodeURIComponent(userData.user.id || '');
        
        // Fetching pending follow-ups
        const res = await apiService.get(`/follow-up/${userData.user.email}?permission=${perm}&id=${id}&filter=pending&pageSize=10`);
        
        let data = res.data?.leads || res.data?.data || res.data || [];
        if (!Array.isArray(data)) {
           data = [];
        }
        
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchTasks();
    }
  }, [session]);

  return (
    <WidgetCard
      title="My Daily Action Plan"
      titleClassName="font-semibold text-gray-800 text-lg"
      className={className}
      action={
        <Link href="/leads" className="text-sm text-primary font-medium hover:underline">
          View All
        </Link>
      }
    >
      <div className="mt-4 h-72">
        {loading ? (
          <div className="flex h-full items-center justify-center text-gray-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <PiCheckCircle className="h-10 w-10 text-green-500 mb-2" />
            <Text>All caught up for today!</Text>
          </div>
        ) : (
          <SimpleBar className="h-full pr-4">
            <div className="flex flex-col gap-3">
              {tasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 shadow-sm hover:border-primary/20 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      {task.type?.toLowerCase().includes('call') ? <PiPhoneCall className="h-5 w-5" /> : <PiCalendarBlank className="h-5 w-5" />}
                    </div>
                    <div>
                      <Title as="h6" className="text-sm font-medium">
                        {task.customer_name || task.lead_name || task.name || 'Unknown Lead'}
                      </Title>
                      <Text className="text-xs text-gray-500 line-clamp-1">
                        {task.message || 'Follow up required'}
                      </Text>
                      <div className="mt-1 flex items-center gap-2">
                         <Badge renderAsDot color="warning" />
                         <span className="text-[11px] text-gray-500">
                            {task.followup_date || task.date || 'Today'} {task.followup_time || task.time || ''}
                         </span>
                      </div>
                    </div>
                  </div>
                  <ActionIcon size="sm" variant="outline" className="rounded-full hover:bg-green-50 text-gray-400 hover:text-green-600 hover:border-green-600" title="Mark Done">
                    <PiCheckCircle className="h-4 w-4" />
                  </ActionIcon>
                </div>
              ))}
            </div>
          </SimpleBar>
        )}
      </div>
    </WidgetCard>
  );
}
