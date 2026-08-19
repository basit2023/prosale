'use client';

import React, { useEffect, useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { Text } from '@/components/ui/text';
import apiService from '@/utils/apiService';
import { PiFunnelDuotone } from 'react-icons/pi';
import { useUser } from '@/context/UserContext';

export default function LeadConversionFunnel({
  className,
  dashboardData,
  dashboardLoading = false,
}: {
  className?: string;
  dashboardData?: any;
  dashboardLoading?: boolean;
}) {
  const [data, setData] = useState({
    total: 0,
    open: 0,
    closed: 0
  });
  const [loading, setLoading] = useState(true);

  const { userData } = useUser() as { userData?: any };

  useEffect(() => {
    const fetchFunnelData = async () => {
      try {
        if (!userData) return;

        const perm = userData?.user?.permissions?.permission_level || userData?.user?.permission || 0;
        const id = userData?.user?.id || '';
        const user = userData?.user?.username || userData?.user?.name || '';
        const email = userData?.user?.email || '';
        const role = userData?.user?.role || userData?.user?.user_type || '';
        const params = { user, email, permission: perm, id, role };

        const openRes = await apiService.get('/highly-interested', { params });

        const totalLeads = dashboardData?.Total_Leads || 0;
        const closedLeads = dashboardData?.Close_Leads || 0;
        const openLeads = openRes.data?.total_unsigned || 0;

        setData({
          total: totalLeads,
          open: openLeads,
          closed: closedLeads
        });
      } catch (error) {
        console.error('Error fetching funnel data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!dashboardLoading) {
      fetchFunnelData();
    }
  }, [dashboardData, dashboardLoading, userData]);

  const maxVal = Math.max(data.total, 1);
  
  const funnelStages = [
    { name: 'Total Leads Generated', value: data.total, color: 'bg-blue-500' },
    { name: 'Open / In-Progress', value: data.open, color: 'bg-orange-400' },
    { name: 'Closed / Matured', value: data.closed, color: 'bg-green-500' }
  ];

  return (
    <WidgetCard
      title="Lead Conversion Funnel"
      titleClassName="font-semibold text-gray-800 text-lg"
      className={className}
      action={
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <PiFunnelDuotone className="h-5 w-5" />
        </div>
      }
    >
      <div className="mt-6 flex flex-col gap-6">
        {loading ? (
          <div className="flex h-48 items-center justify-center text-gray-500">Loading funnel...</div>
        ) : (
          funnelStages.map((stage, index) => {
            const widthPercent = (stage.value / maxVal) * 100;
            const prevWidth = index === 0 ? 100 : (funnelStages[index - 1].value / maxVal) * 100;
            const conversionRate = index === 0 ? 100 : Math.round((stage.value / Math.max(funnelStages[0].value, 1)) * 100);

            return (
              <div key={index} className="flex flex-col items-center w-full">
                <div className="flex w-full justify-between mb-1">
                  <Text className="text-sm font-medium text-gray-700">{stage.name}</Text>
                  <div className="text-right">
                     <Text className="text-sm font-bold text-gray-900">{stage.value.toLocaleString()}</Text>
                     {index > 0 && <Text className="text-xs text-gray-500">{conversionRate}% conversion</Text>}
                  </div>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-4 relative flex justify-center overflow-hidden">
                  <div 
                    className={`absolute h-full rounded-full ${stage.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                
                {/* CSS Triangle connector for funnel effect */}
                {index < funnelStages.length - 1 && (
                  <div 
                    className="h-6 mt-1 w-full flex justify-center opacity-20"
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, calc(50% + ' + (widthPercent/2) + '%) 100%, calc(50% - ' + (widthPercent/2) + '%) 100%)',
                      background: 'currentColor'
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </WidgetCard>
  );
}
