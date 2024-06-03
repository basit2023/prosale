// useEmployeeData.js

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiService from '@/utils/apiService';
import { useParams } from 'react-router-dom';

export type Invoice = {
  id: string;
  day_off: string;
  offices_no: string;
  last_name: string;
  user: string;
  time_in: string;
  time_out: string;
  del: string;
  office: string;
};

const AssignedOffice = ({id}:any) => {
  const { data: session } = useSession();
  const [value, setValue] = useState<any>([]);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const apiUrl:any = `/employee-office/${id}`;
          // const apiUrl = id ? `/employee-office/${id}` : "/employee-office";
          const response = await apiService.get(apiUrl);
          const userData = response.data.results; // Use response.data.results instead of response.data
          setValue(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
    };

    fetchData();
  }, [session]);

  const productsData = (value || []).map((user:any) => ({
    id: user.id,
    user_id: user.user_id, // Assuming 'user' property contains the name
    day_off: user.day_off,
    dt: user.dt,
    offices_no: user.offices,
    time_in: user.time_in,
    time_out: user.time_out,
    user: user.user,
    office: user.office_names.split(','), // Split office_names into an array
  }));
  return productsData;
};

export default AssignedOffice;

