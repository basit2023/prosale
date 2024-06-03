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
  view_dt:any;
     
};
export const AllTeamMembers = ({id}:any) => {

  const { data: session } = useSession();
  const [value, setValue] = useState<any>([]);
  const [value1, setValue1] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const response = await apiService.get(`/teamates/${id}/?email=${session?.user?.email}`);
          const userData = response.data.team;
        
          setValue(userData);
        }
      } catch (error:any) {
        console.error('Error fetching team memeber:', error);
        toast.error(error.response.data.message)
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }, [session]);

  const productsData = (value || []).map((user:any) => ({
    id:user.id,
    name: user.full_name,
   
    manager: user.manager_full_name,
    title: user.title,
    designation: user.designation,
    manager_id: user.manager_id,
    number: user.number,
    email:user.email,
    total_lead_count:user.total_lead_count,
    unread_lead_count:user.unread_lead_count,
    
  }));

  return productsData;
};










