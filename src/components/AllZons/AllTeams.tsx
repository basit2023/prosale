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
  company_title:any;
  Edit_permission:any;
     
};
export const useTeamData = () => {

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
        const response = await apiService.get(`/teams/${session.user.email}/?id=manager_id&&table=users_teams&&managerType=manager`);
        setValue(response.data.leads);
      } catch (error) {
        console.error('Error fetching label leads:', error);
        setError('Failed to load teams. Please try again.');
        toast.error('Error fetching label leads. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }, [session?.user?.email, status]);

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
    company_title:user.company_title,
    Edit_permission: user.userPermissions.Edit_permission,
    View_permission: user.userPermissions.View_permission,
    
  }));

  return { data: productsData, loading, error };
};

// export default useEmployeeData;








