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
  city?:string | null;
  sp?:any;
};

type Args = { id: string };
type Result = { data: Invoice[] | null; loading: boolean; error: Error | null };

export const useEmployeeData = ({ id, sp }: Args): Result => {
  const { data: session, status } = useSession();


  // null = not loaded yet; [] = loaded but no rows
  const [data, setData] = useState<Invoice[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // tolerate different company id keys
  const email = session?.user?.email ?? null;
  const company =
    (session as any)?.user?.comanpy_id ??
    (session as any)?.user?.company_id ??
    (session as any)?.user?.companyId ??
    null;

  useEffect(() => {
    // while NextAuth is resolving, stay in "loading"
    if (status === 'loading') {
      setLoading(true);
      setData(null);
      setError(null);
      return;
    }

    // if unauthenticated or required fields missing, stop loading
    if (status !== 'authenticated' || !email || !id) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    // start fetch
    setLoading(true);
    setError(null);
    setData(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const res = await apiService.get(`/highly-interested-tabel/${id}`, {
          params: { field: 'leads_label', email, company },
          signal: controller.signal,
        });
        console.log('the leads raw data is;',res)

        // accept both {leads} and {data:{leads}}
        const leadsRaw =
          (res?.data?.leads as any[]) ??
          (res?.data?.data?.leads as any[]) ??
          [];

        const mapped: Invoice[] = (leadsRaw || []).map((user: any) => ({
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
          city:user.city,
          last_updated: user.last_updated
            ? String(user.last_updated).substring(0, 10)
            : null,
        }));

        setData(mapped);
      } catch (err: any) {
        // ignore cancellations
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;

        console.error('Error fetching label leads:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch'));
        setData([]);
        toast.error('Error fetching label leads. Please try again.');
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [status, email, company, id]);

  // expose consistent flags
  return { data, loading: loading || data === null, error };
};
