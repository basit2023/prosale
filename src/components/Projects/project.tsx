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
  const { data: session, status } = useSession();
  const [value, setValue] = useState<any>([]);

  const [raw, setRaw] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Memoize the fetch function using useCallback
  const fetchData = useCallback(async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    setError(null);
    try {
      if (session) {
        const response = await apiService.get(`/project-data/?email=${session?.user?.email}`);
        const userData = response.data.projects;
        setRaw(userData?? []);
        setValue(userData);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to fetch employees';
      setError(msg);
      toast.error(msg);
      setRaw([]);
    } finally {
      setLoading(false);
    }
  }, [session]); // The function is recreated only if `session` changes

  useEffect(() => {
    if (status === 'loading') return;            // wait for session
    if (status === 'unauthenticated') {
      setRaw([]);
      setLoading(false);
      return;
    }
    fetchData();
  }, [status, fetchData]);

  // Memoize the productsData to prevent re-calculating it on every render
  const data = useMemo<Invoice[] | null>(() => {
      if (raw === null) return null;               // still not loaded
      return raw.map((user: any) => ({
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
  }, [raw]);

  return { data, loading, error };
};
