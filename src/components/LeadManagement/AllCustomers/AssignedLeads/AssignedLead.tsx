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
  id: any;
  name: string;
  mobile: number;
  project_name: string;
  project_status: string;
  interested_in: string;
  status:string;
  view_dt:any;
     
};
export const useEmployeeData = ({ id }:any) => {
    
  const { data: session, status } = useSession();
  const [value, setValue] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const companyId = localStorage.getItem('company_id') || '';
        const response = await apiService.get(`/highly-interested-tabel/${id}?field=customer&email=${session.user.email}&company=${companyId}`);
        setValue(response.data.leads);
      } catch (error) {
        console.error('Error fetching label leads:', error);
        setError('Failed to load assigned leads. Please try again.');
        toast.error('Error fetching label leads. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }, [id, session?.user?.email, status]);
  let  productsData = (value || []).map((user:any) => ({
    id:user.id,
    name: user.customer_name,
    mobile: user.mobile,
    project_name: user.project_name,
    project_status: user.project_status,
    interested_in: user.interested_in,
    view_dt: user.view_dt,
    status:user.status,
    company_title:user.company_title,
    assigned_on: user.assigned_on,
 
   

    
  }));
  return { data: productsData, loading, error };
};

// export default useEmployeeData;








