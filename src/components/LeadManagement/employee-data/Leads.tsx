import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
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
  last_updated?: string | null;  // ISO
  assigned_on?: string | null;   // ISO
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

  // NEW: history of “same” customer’s other leads
  history?: LeadHistoryItem[];
  customer_id?: number | string;
};

export const useEmployeeData = ({ id, pageSize = 50 }: { id: string; pageSize?: number }) => {
  const { data: session, status } = useSession();
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [offset, setOffset] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false); // prevent double fetch in Strict Mode (dev)

  const email = session?.user?.email ?? null;
  const company = (session as any)?.user?.company_id ?? null;

  const fetchLeads = async ({
    limit,
    offsetArg,
    append,
  }: {
    limit: number;
    offsetArg: number;
    append: boolean;
  }) => {
    if (status !== 'authenticated' || !email || !id) return;

    setLoading(!append);
    setError(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await apiService.get(`/highly-interested-tabel/${id}`, {
        params: { field: 'leads_label', email, company, limit, offset: offsetArg },
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

        // NEW
        customer_id: user.customer_id,
        history: Array.isArray(user.history)
          ? user.history.map((h: any) => ({
              id: h.id,
              project_id: h.project_id ?? null,
              project_name: h.project_name ?? null,
              leads_label_id: h.leads_label_id ?? null,
              leads_label: h.leads_label ?? null,
              leads_label_bg: h.leads_label_bg ?? null,
              status: h.status ?? null,
              assigned_to: h.assigned_to ?? null,
              user: h.user ?? null,
              last_updated: h.last_updated ?? null,
              assigned_on: h.assigned_on ?? null,
            }))
          : [],
      }));

      setData(prev => (append ? [...prev, ...mapped] : mapped));
      setOffset(offsetArg + mapped.length); // advance by what we actually received
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

  // initial load (and when id/email/pageSize change)
  useEffect(() => {
    if (status === 'authenticated' && email && id) {
      // In React Strict Mode (dev) effects run twice on mount.
      // Guard with mountedRef so we don't start two fetches and show spinner twice.
      if (!mountedRef.current) {
        mountedRef.current = true;
        setOffset(0); // reset pagination
        fetchLeads({ limit: pageSize, offsetArg: 0, append: false });
      }
    } else {
      setData([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, email, id, pageSize]);

  const loadMore = () => {
    if (data.length < totalLeads) {
      fetchLeads({ limit: pageSize, offsetArg: offset, append: true });
    }
  };

  return { data, loading, error, loadMore, totalLeads };
};
