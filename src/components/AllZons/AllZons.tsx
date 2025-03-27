// useEmployeeData.js

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useMemo } from 'react';
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

export const useZoneData = () => {
  const { data: session } = useSession();
  const [value, setValue] = useState<any>([]);


  const fetchData = useCallback(async () => {
    try {
      if (session) {
        const response = await apiService.get(
          `/zones/${session?.user?.email}/?id=zonal_manager&&table=users_zones&&managerType=zonal`
        );
        const userData = response.data.leads;
        setValue(userData);
      }
    } catch (error) {
      console.error('Error fetching label leads:', error);
      toast.error('Error fetching label leads. Please try again.');
    }
  }, [session]); 


  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const productsData = useMemo(() => {
    return (value || []).map((user: any) => ({
      id: user.id,
      name: user.full_name,
      mobile: user.mobile,
      title: user.title,
      zonal_manager: user.zonal_manager,
      interested_in: user.interested_in,
      view_dt: user.view_dt,
      status: user.status,
      Zone_Teams: user.Zone_Teams,
      company_title: user.company_title,
      Edit_permission: user.userPermissions?.Edit_permission,
      View_permission: user.userPermissions?.View_permission,
    }));
  }, [value]); 

  return productsData;
};









