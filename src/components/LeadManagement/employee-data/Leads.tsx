import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import apiService from '@/utils/apiService';

export type Invoice = {
  id: string;
  name: string;
  mobile: number;
  project_name: string;
  project_status: string;
  interested_in: string;
  status: string;
  view_dt: any;
};

export const useEmployeeData = ({ id }: { id: string }) => {
  const { data: session } = useSession();
  const [value, setValue] = useState([]);
  
  // Memoize session to prevent unnecessary changes
  const memoizedSession = useMemo(() => session, [session]);

  // Memoize the fetch function to prevent recreating it on every render
  const fetchData = useCallback(async () => {
    try {
      if (memoizedSession) {
        const response = await apiService.get(
          `/highly-interested-tabel/${id}?field=leads_label&email=${memoizedSession?.user?.email}&company=${memoizedSession?.user?.comanpy_id}`
        );
        
        const userData = response.data.leads;
        setValue(userData);
      }
    } catch (error) {
      console.error('Error fetching label leads:', error);
      toast.error('Error fetching label leads. Please try again.');
    }
  }, [id, memoizedSession]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoize the transformed data to prevent recomputation on every render
  const productsData = useMemo(() => {
    return (value || []).map((user: any) => ({
      id: user.id,
      name: user.customer_name,
      permission: user.permission,
      mobile: user.mobile,
      project_name: user.project_name,
      project_status: user.project_status,
      interested_in: user.interested_in,
      view_dt: user.view_dt,
      status: user.status,
      company_title: user.company_title,
      assigned_to: user.assigned_to,
      last_updated: user.last_updated ? user.last_updated.substring(0, 10) : null,
    }));
  }, [value]);

  return productsData;
};