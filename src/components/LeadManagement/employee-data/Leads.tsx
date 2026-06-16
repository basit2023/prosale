import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiService from '@/utils/apiService';
import { AES, enc } from 'crypto-js';

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
  assigned_on?: string | null;
  last_updated?: string | null;
  city?: string | null;
  sp?: any;
  total?: string | number;
  history?: LeadHistoryItem[];
  customer_id?: number | string;
};

function formatLeadDate(value: any) {
  if (!value) return null;

  const rawValue = String(value).trim();
  if (/^\d+$/.test(rawValue)) {
    const numericValue = Number(rawValue);
    const timestamp = rawValue.length <= 10 ? numericValue * 1000 : numericValue;
    const date = new Date(timestamp);

    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }

  return rawValue.slice(0, 10);
}

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
  const [storedUser, setStoredUser] = useState<any>(null);
  const [checkedStoredUser, setCheckedStoredUser] = useState(false);
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalLeads, setTotalLeads] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const lastFetchKeyRef = useRef<string>('');
  const inFlightKeyRef = useRef<string>('');

  const sessionEmail = session?.user?.email ?? null;
  const sessionCompany = (session as any)?.user?.company_id ?? null;
  const activeEmail = sessionEmail ?? storedUser?.email ?? null;
  const activeCompany = sessionCompany ?? storedUser?.company_id ?? null;

  // Keep active user values in refs so event handlers can read the latest user
  // without forcing their callbacks to be recreated on every session object change.
  const emailRef = useRef<string | null>(null);
  const companyRef = useRef<any>(null);
  emailRef.current = activeEmail;
  companyRef.current = activeCompany;

  useEffect(() => {
    if (typeof window === 'undefined' || sessionEmail || storedUser) {
      setCheckedStoredUser(true);
      return;
    }

    try {
      const encryptedData = window.localStorage.getItem('userData');
      if (!encryptedData) return;

      const bytes = AES.decrypt(encryptedData, 'encryptionSecret');
      const decrypted = bytes.toString(enc.Utf8);
      if (!decrypted) return;

      const parsed = JSON.parse(decrypted);
      setStoredUser(parsed?.user ?? null);
    } catch (error) {
      console.warn('Unable to read stored user data:', error);
    } finally {
      setCheckedStoredUser(true);
    }
  }, [sessionEmail, storedUser]);

  const fetchLeads = useCallback(async (currentOffset: number, append: boolean, silent = false) => {
    const email = emailRef.current;
    const company = companyRef.current;

    if (!email || !id) {
      if (!append && !silent) setLoading(false);
      return;
    }

    // Deduplicate exact repeated requests. This also absorbs React strict-mode effect replay.
    const fetchKey = `${email}-${company}-${id}-${pageSize}-${currentOffset}-${append}`;
    if (inFlightKeyRef.current === fetchKey || (!append && lastFetchKeyRef.current === fetchKey)) {
      if (!append && !silent && lastFetchKeyRef.current === fetchKey) {
        setLoading(false);
      }
      return;
    }
    inFlightKeyRef.current = fetchKey;

    if (!append && !silent) {
      setLoading(true);
      setData([]);
      setTotalLeads(0);
    }
    if (append) {
      setFetchingMore(true);
    }
    setError(null);

    if (!append) {
      abortRef.current?.abort();
    }
    const controller = new AbortController();
    if (!append) {
      abortRef.current = controller;
    }

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
        assigned_on: formatLeadDate(user.assigned_on),
        last_updated: user.last_updated ? String(user.last_updated).substring(0, 10) : null,
        customer_id: user.customer_id,
        history: Array.isArray(user.history) ? user.history : [],
      }));

      setData(prev => (append ? [...prev, ...mapped] : mapped));
      setTotalLeads(res?.data?.total ?? 0);
      lastFetchKeyRef.current = fetchKey;
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      console.error('Error fetching leads:', err);
      lastFetchKeyRef.current = '';
      setError(err instanceof Error ? err : new Error('Failed to fetch'));
      toast.error('Error fetching leads. Please try again.');
    } finally {
      if (inFlightKeyRef.current === fetchKey) {
        inFlightKeyRef.current = '';
      }
      if (append) {
        setFetchingMore(false);
      }
      if (!silent && (!abortRef.current || abortRef.current === controller)) {
        setLoading(false);
      }
    }
    // Only id/pageSize here; active user values live in refs.
  }, [id, pageSize]);

  // Abort only on unmount. Aborting in the fetch effect cleanup can cancel the
  // first request when NextAuth/localStorage settle during a hard refresh.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // Trigger fetch when a stable user source is available or reloadSignal fires.
  useEffect(() => {
    if (!checkedStoredUser && !activeEmail) return;
    if (!emailRef.current || !id) {
      setLoading(false);
      return;
    }

    // On an explicit reload, clear the dedup key so the request goes through.
    if (reloadSignal) {
      lastFetchKeyRef.current = '';
    }

    fetchLeads(0, false);
  }, [activeEmail, activeCompany, checkedStoredUser, fetchLeads, reloadSignal, id]);

  // Listen for reassignment events to do a silent background refresh
  useEffect(() => {
    const handleRefresh = () => {
      if (loading) return;
      lastFetchKeyRef.current = ''; // Allow silent refresh to bypass dedup
      fetchLeads(0, false, true);
    };
    window.addEventListener('leads:reassigned', handleRefresh);
    window.addEventListener('leads:change', handleRefresh);
    return () => {
      window.removeEventListener('leads:reassigned', handleRefresh);
      window.removeEventListener('leads:change', handleRefresh);
    };
  }, [fetchLeads, loading]);

  const loadMore = () => {
    if (!loading && !fetchingMore && data.length < totalLeads) {
      fetchLeads(data.length, true);
    }
  };

  return {
    data,
    loading,
    error,
    loadMore,
    totalLeads,
    fetchingMore,
    missingUser: checkedStoredUser && !activeEmail,
  };
};
