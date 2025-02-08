import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiService from '@/utils/apiService';

export type Invoice = {
  id: string;
  name: string;
  status: string;
  Status: string;
  Csv_Label: string;
  Whatsapp_Sort: string;
  Whatsapp_Status: string;
  Portal_Status: string;
  Location: string;
  Image: string;
  slug: string;
};

export const ProjectData = () => {
  const { data: session } = useSession();
  const [value, setValue] = useState<any>([]);

  // Memoize the fetch function using useCallback
  const fetchData = useCallback(async () => {
    try {
      if (session) {
        const response = await apiService.get(`/project-data/?email=${session?.user?.email}`);
        const userData = response.data.projects;
        setValue(userData);
      }
    } catch (error) {
      console.error('Error fetching Project information:', error);
      toast.error('Error fetching Project information. Please try again.');
    }
  }, [session]); // The function is recreated only if `session` changes

  // Fetch data only once when session is available
  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, fetchData]);

  // Memoize the productsData to prevent re-calculating it on every render
  const productsData = useMemo(() => {
    return (value || []).map((user: any) => ({
      id: user.id,
      name: user.name,
      status: user.status,
      Csv_Label: user.Csv_Label,
      Whatsapp_Sort: user.Whatsapp_Sort,
      Whatsapp_Status: user.Whatsapp_Status,
      Portal_Status: user.Portal_Status,
      Status: user.status1, // Corrected the property name
      Location: user.Location,
      Image: user.Image,
      company_title: user.company_title,
      slug: user.slug,
      del: user.del,
    }));
  }, [value]); // The productsData will only be re-calculated if `value` changes

  return productsData;
};
