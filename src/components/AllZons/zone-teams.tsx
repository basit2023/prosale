// useEmployeeData.js

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiService from '@/utils/apiService';


export type Invoice = {
  id: string;
  name: string;
  mobile: number;
  zonal_manager: string;
  title: string;
  interested_in: string;
  status:string;
  total_members:any;
  view_dt:any;
     
};
export const ZoneTeamData = ({id}:any) => {

  const { data: session } = useSession();
  const [value, setValue] = useState<any>([]);
  const [value1, setValue1] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const response = await apiService.get(`/zone-team/${id}?table=users_teams&&managerType=manager&&email=${session?.user?.email}`
         );
          const userData = response.data.leads;
        
          setValue(userData);
        }
      } catch (error) {
        console.error('Error fetching label leads:', error);
        toast.error('Error fetching label leads. Please try again.');
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }, [session]);

  const productsData = (value || []).map((user:any) => ({
    id:user.id,
    name: user.full_name,
   
    zone_title: user.zone_title,
    title: user.title,
    zonal_manager: user.zonal_manager,
    manager_id: user.manager_id,
    view_dt: user.view_dt,
    status:user.status,
    total_members:user.total_members,
    
  }));

  return productsData;
};










