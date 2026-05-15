'use client';

import React, { useEffect, useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { Title, Text } from '@/components/ui/text';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';
import { PiWarningCircleFill, PiArrowRightBold } from 'react-icons/pi';
import Link from 'next/link';
import cn from '@/utils/class-names';

export default function UnassignedLeadsAlert({ className }: { className?: string }) {
  const { data: session } = useSession();
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await apiService.get('/highly-interested'); // returns total_unsigned
        setUnassignedCount(res.data?.total_unsigned || 0);
      } catch (error) {
        console.error('Error fetching unassigned leads:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchAlerts();
    }
  }, [session]);

  if (loading || unassignedCount === 0) return null;

  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-red-50 border border-red-200 p-6 flex flex-col justify-between shadow-sm", className)}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 shrink-0">
          <PiWarningCircleFill className="h-7 w-7 text-red-600" />
        </div>
        <div>
          <Title as="h3" className="text-lg font-bold text-red-900 mb-1">
            Unassigned Leads Alert
          </Title>
          <Text className="text-red-700 text-sm">
            There are currently <span className="font-bold text-red-900">{unassignedCount}</span> leads sitting in the open pool without an assigned agent. Leads go cold quickly!
          </Text>
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <Link 
          href="/leads/management" 
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Assign Leads <PiArrowRightBold />
        </Link>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute -right-6 -top-6 text-red-100 opacity-50 pointer-events-none">
        <PiWarningCircleFill className="w-32 h-32" />
      </div>
    </div>
  );
}
