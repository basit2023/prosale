import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import apiService from '@/utils/apiService';

export type Invoice = {
    daily_office_visits: number;
    client_matured: number;
    daily_lead_follow_up: number;
    lead_assigned: number;
    dealers_meeting: number;
    dealers_register: number;
    office_activity: number;
    user: string;
    id:number;
  del: string;
  full_name: string;
};

export const useEmployeeData = () => {
  const { data: session } = useSession();
  const memoizedSession=useMemo(()=>session,[session])
  const [value, setValue] = useState<any>([]);

  const fetchData = useCallback(async () => {
    try {
      if (memoizedSession) {
        const response = await apiService.get(`/daily-activity-report/${memoizedSession?.user?.username}/?permission=${memoizedSession?.user?.permission}&&id=${memoizedSession?.user?.id}`);
        const userData = response?.data?.data || [];
        console.log("the data from thebacke end:",userData)
        setValue(userData);
      }
    } catch (error: any) {
      console.error('Error fetching employee data:', error);
      toast.error(error.response.data.message);
    }
  }, [memoizedSession]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  console.log("the set value data at the daily repiortis:",value)

  const productsData = useMemo(() => {
    return (value || []).map((user: any) => ({
      id: user.id,
      daily_office_visits: user.daily_office_visits,
      client_matured: user.client_matured,
      daily_lead_follow_up: user.daily_lead_follow_up,
      lead_assigned: user.lead_assigned,
      dealers_meeting: user.dealers_meeting,
      dealers_register: user.dealers_register,
      full_name: user.full_name,
      office_activity: user.office_activity,
      user: user.user,
      del: user.del,
      dt:user.dt
      
     
    }));
  }, [value]);

  return productsData;
};






