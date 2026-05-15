import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import apiService from '@/utils/apiService';

export const useAdvancedSearchLeads = (pageSize = 50) => {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  
  const abortRef = useRef<AbortController | null>(null);

  const fetchLeads = useCallback(async (params: any, append: boolean) => {
    if (status !== 'authenticated' || !session?.user?.email) return;

    if (!append) {
      setLoading(true);
      setData([]);
      setTotal(0);
      setCurrentPage(0);
    }
    setError(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await apiService.get('/advanced-search-leads', {
        params: {
          ...params,
          email: session.user.email,
          permission: (session as any).user.permission,
          userId: (session as any).user.id,
          limit: pageSize,
          offset: append ? data.length : 0,
        },
        signal: controller.signal,
      });

      const rawData = res.data.data ?? [];
      const mapped = rawData.map((lead: any) => ({
        id: String(lead.id),
        name: lead.name,
        mobile: lead.mobile,
        project_name: lead.project_name,
        interested_in: lead.interested_in,
        city: lead.city,
        status: lead.status,
        assigned_to: lead.assigned_to,
        last_updated: lead.last_updated,
        label: lead.label,
        bg_color: lead.bg_color,
      }));

      setData(prev => (append ? [...prev, ...mapped] : mapped));
      setTotal(res.data.total ?? 0);
    } catch (err: any) {
      if (err?.name === 'CanceledError') return;
      setError('Error fetching search results');
    } finally {
      setLoading(false);
    }
  }, [status, session, pageSize, data.length]);

  const search = useCallback((params: any) => {
    fetchLeads(params, false);
  }, [fetchLeads]);

  const loadMore = useCallback((params: any) => {
    fetchLeads(params, true);
  }, [fetchLeads]);

  const hasMore = data.length < total;

  return { data, loading, error, search, loadMore, hasMore, total };
};
