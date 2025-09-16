import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  permission?: string;
  company_title?: string;
  assigned_to?: string;
  lead_pass?: string | number | boolean;
  last_updated?: string | null;
  city?: string | null;
  sp?: any;
  total?: string | number;
};

type Args = { id: string; total: number };
type Result = { data: Invoice[] | null; loading: boolean; error: Error | null };

export const useEmployeeData = ({ id, defaultTotal = 300 }: { id: string; defaultTotal?: number }) => {
  const { data: session, status } = useSession();
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [offset, setOffset] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);

  const abortRef = useRef<AbortController | null>(null);

  const email = session?.user?.email ?? null;
  const company = (session as any)?.user?.company_id ?? null;

  const fetchLeads = async (limit: number, append = false) => {
    if (status !== 'authenticated' || !email || !id) return;

    setLoading(!append);
    setError(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await apiService.get(`/highly-interested-tabel/${id}`, {
        params: { field: 'leads_label', email, company, limit, offset },
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
      }));

      setData(prev => (append ? [...prev, ...mapped] : mapped));
      setOffset(prev => prev + mapped.length);
      setTotalLeads(res?.data?.total ?? 0);

    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch'));
      toast.error('Error fetching leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    if (status === 'authenticated' && email && id) {
      fetchLeads(defaultTotal);
    } else {
      setData([]);
      setLoading(false);
    }
  }, [status, email, id]);

  const loadMore = () => {
    if (data.length < totalLeads) {
      fetchLeads(defaultTotal, true); // append next batch
    }
  };

  return { data, loading, error, loadMore, totalLeads };
};


