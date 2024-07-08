// useEmployeeData.js

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiService from '@/utils/apiService';

// export type ProductType = {
//   id:string;
//   name: string;
//   first_name: string;
//   last_name: string;
//   email: string;
//   designation: string;
//   department: string;
//   mobile: number;
//   cnic: number;
// };
export type Invoice = {
  id: string;
  name: string;
  mobile: number;
  project_name: string;
  project_status: string;
  interested_in: string;
  status:string;
  view_dt:any;
     
};
export const useEmployeeData = ({ id }: { id: string }) => {
  const { data: session } = useSession();
  const [value, setValue] = useState([]);
  const [value1, setValue1] = useState([]);
  const comanpy_id = localStorage.getItem('company_id');

  useEffect(() => {
    const fetchData = async () => {
      
      try {
        if (session) {
          const response = await apiService.get(`/highly-interested-tabel/${id}?field=leads_label&email=${session?.user?.email}&company=${comanpy_id}`);
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
    name: user.customer_name,
    permission:user.permission,
    mobile: user.mobile,
    project_name: user.project_name,
    project_status: user.project_status,
    interested_in: user.interested_in,
    view_dt: user.view_dt,
    status:user.status,
    company_title:user.company_title,
    assigned_to:user.assigned_to,
   

    
  }));

  return productsData;
};










