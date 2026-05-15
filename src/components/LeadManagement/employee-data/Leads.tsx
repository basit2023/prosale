import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiService from '@/utils/apiService';

export type LeadHistoryItem = {
  id: number | string;
  project_id?: number | string | null;
  project_name?: string | null;
  leads_label_id?: number | string | null;
  leads_label?: string | null;
  leads_label_bg?: string | null;
  status?: string | null;
  assigned_to?: string | null;
  user?: string | null;
  last_updated?: string | null;
  assigned_on?: string | null;
};

export type Invoice = {
  id: string;
  name: string;
  mobile: number;
  project_name: string;
  project_status: string;
  interested_in: string;
  status: string;
  view_dt: any;
  permission?: string | number;
  company_title?: string;
  assigned_to?: string;
  lead_pass?: string | number | boolean;
  last_updated?: string | null;
  city?: string | null;
  sp?: any;
  total?: string | number;
  history?: LeadHistoryItem[];
  customer_id?: number | string;
};

export const useEmployeeData = ({ 
  id, 
  pageSize = 50, 
  reloadSignal = 0 
}: { 
  id: string; 
  pageSize?: number; 
  reloadSignal?: number 
}) => {
  const { data: session, status } = useSession();
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalLeads, setTotalLeads] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  
  const email = session?.user?.email ?? null;
  const company = (session as any)?.user?.company_id ?? null;

  const fetchLeads = useCallback(async (currentOffset: number, append: boolean, silent = false) => {
    if (status !== 'authenticated' || !email || !id) {
      setLoading(false);
      return;
    }

    if (!append && !silent) {
      setLoading(true);
      setData([]); // Clear old data for a hard reset
      setTotalLeads(0);
    }
    setError(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await apiService.get(`/highly-interested-tabel/${id}`, {
        params: { 
          field: 'leads_label', 
          email, 
          company, 
          limit: pageSize, 
          offset: currentOffset 
        },
        signal: controller.signal,
      });

      const leadsRaw = res?.data?.leads ?? [];
      const mapped: Invoice[] = leadsRaw.map((user: any) => ({
        id: String(user.id ?? ''),
        name: user.customer_name ?? '',
        permission: user.permission,
        mobile: Number(user.mobile ?? 0),
        project_name: user.project_name ?? '',
        project_status: user.project_status ?? '',
        interested_in: user.interested_in ?? '',
        view_dt: user.view_dt ?? null,
        status: user.status ?? '',
        company_title: user.company_title,
        assigned_to: user.assigned_to,
        lead_pass: user.lead_pass,
        city: user.city,
        last_updated: user.last_updated ? String(user.last_updated).substring(0, 10) : null,
        customer_id: user.customer_id,
        history: Array.isArray(user.history) ? user.history : [],
      }));

      setData(prev => (append ? [...prev, ...mapped] : mapped));
      setTotalLeads(res?.data?.total ?? 0);
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch'));
      toast.error('Error fetching leads. Please try again.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [status, email, id, company, pageSize]);

  // Initial load and reset on dependency change
  useEffect(() => {
    fetchLeads(0, false);
    return () => abortRef.current?.abort();
  }, [fetchLeads, reloadSignal]);

  // Listen for reassignment events to refresh data automatically (soft refresh)
  useEffect(() => {
    const handleRefresh = () => {
      fetchLeads(0, false, true); // true = silent refresh
    };
    window.addEventListener('leads:reassigned', handleRefresh);
    window.addEventListener('leads:change', handleRefresh);
    return () => {
      window.removeEventListener('leads:reassigned', handleRefresh);
      window.removeEventListener('leads:change', handleRefresh);
    };
  }, [fetchLeads]);

  const loadMore = () => {
    if (!loading && data.length < totalLeads) {
      fetchLeads(data.length, true);
    }
  };

  return { data, loading, error, loadMore, totalLeads };
};
