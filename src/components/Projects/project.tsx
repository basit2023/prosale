import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
  company_title?: string;
  del?: string;
};

export const ProjectData = (pageSize = 10) => {
  const { data: session, status } = useSession();
  const [raw, setRaw] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProjects, setTotalProjects] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (page: number) => {
    if (!session?.user?.email) return;
    
    setLoading(true);
    setError(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await apiService.get(`/project-data/`, {
        params: { 
          email: session.user.email,
          limit: pageSize,
          page: page
        },
        signal: controller.signal
      });

      const userData = response.data.projects ?? [];
      setRaw(userData);
      setTotalProjects(response.data.total ?? 0);
      setCurrentPage(page);
    } catch (err: any) {
      if (err?.name === 'CanceledError') return;
      const msg = err?.response?.data?.message || 'Failed to fetch projects';
      setError(msg);
      // toast.error(msg); // Reduced noise
    } finally {
      setLoading(false);
    }
  }, [session, pageSize]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData(1);
    } else if (status === 'unauthenticated') {
      setRaw([]);
      setLoading(false);
    }
    return () => abortRef.current?.abort();
  }, [status, fetchData]);

  const data = useMemo<Invoice[]>(() => {
    return raw.map((user: any) => ({
      id: String(user.id),
      name: user.name,
      status: user.status,
      Csv_Label: user.Csv_Label,
      Whatsapp_Sort: user.Whatsapp_Sort,
      Whatsapp_Status: user.Whatsapp_Status,
      Portal_Status: user.Portal_Status,
      Status: user.status1 || user.status,
      Location: user.Location,
      Image: user.Image,
      company_title: user.company_title,
      slug: user.slug,
      del: user.del,
    }));
  }, [raw]);

  const handlePageChange = (page: number) => {
    fetchData(page);
  };

  return { data, loading, error, handlePageChange, totalProjects, currentPage };
};
