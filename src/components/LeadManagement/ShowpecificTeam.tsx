// useEmployeeData.js

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
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

export const useSpecificTeam  = ({ id, id1 }: { id: string; id1: string }) => {
 
  const [value, setValue] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        
          const response = await apiService.get(`/specific-team-member-tabel/${id}/${id1}?field=leads_label`);
          const userData = response.data.leads;
          setValue(userData);
      
      } catch (error) {
        console.error('Error fetching label leads:', error);
        toast.error('Error fetching label leads. Please try again.');
      }
    };

    fetchData();
  }, [ id, id1]);

  const productsData = (value || []).map((user:any) => ({
    id: user.id,
    name: user.customer_name,
    mobile: user.mobile,
    project_name: user.project_name,
    project_status: user.project_status,
    interested_in: user.interested_in,
    view_dt: user.view_dt,
    status: user.status,
  }));

  return productsData;
};
