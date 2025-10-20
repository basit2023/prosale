'use client';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Spinner from '@/components/ui/spinner';
import { useEffect, useState, useCallback, useMemo } from 'react';
import apiService from '@/utils/apiService';

const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});

export default function ManagerInfo({ id }: any) {
  const { data: session } = useSession();
  const [value, setValue] = useState<any>();

  // Memoize the session email to prevent unnecessary dependency changes
  const sessionEmail = useMemo(() => session?.user?.email, [session]);

  // Memoized fetch function to prevent recreation on every render
  const fetchData = useCallback(async () => {
    try {
      if (sessionEmail) {
        const response = await apiService.get(`/teamates/${id}/?email=${sessionEmail}`);
        const userData = response.data.team[0];
        console.log('Fetched team member data:', userData);
        setValue(userData);
      }
    } catch (error: any) {
      console.error('Error fetching team member:', error);
      // toast.error(error.response?.data?.message || 'Error fetching team member');
    }
  }, [id, sessionEmail]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoize the table header content to prevent unnecessary re-renders
  const tableHeader = useMemo(() => (
    <thead className="border-b border-neutral-200 bg-[#332D2D] font-medium text-white dark:border-white/10">
      <tr>
        <th colSpan={4} className="px-6 py-4">
          Team {value?.title} Manager: {value?.manager_full_name}
        </th>
      </tr>
    </thead>
  ), [value?.title, value?.manager_full_name]);

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <table className="min-w-full text-center text-sm font-light text-surface dark:text-white border rounded">
              {tableHeader}
              {/* Table body commented out as per original */}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}