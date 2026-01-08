// useBusinessProfiles.ts
import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiService from '@/utils/apiService';

export type BusinessProfile = {
  id: string;
  full_name: string;
  cnic: string;
  mobile: string;
  email?: string;
  city?: string;
  office_name?: string;
  bank_name?: string;
  filer_status: 'Active Filer' | 'Non-Filer';
  nationality?: string;
  company_id?: string;
  del: 'N' | 'Y';
  created_at?: string;
  status?: string;
  user?: string;
};

export const Realtors = () => {
  const { data: session, status } = useSession();

  const [raw, setRaw] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    setError(null);
    try {
      // Your API should return profiles for the user/company
      let response;
      if (session?.user?.permission>=9) {
        response = await apiService.get(`/business-profiles/?email=${session.user.email}`);
      } else {
          response = await apiService.get(`/business-profiles/${session.user.username}`);
                 
        }
        console.log('Response for non-admin user:', response);
      // Prefer `data`, but keep a fallback to `projects` if your backend still returns that key
      const list = response?.data?.data ?? response?.data?.projects ?? [];
      setRaw(Array.isArray(list) ? list : []);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to fetch business profiles';
      setError(msg);
      toast.error(msg);
      setRaw([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      setRaw([]);
      setLoading(false);
      return;
    }
    fetchData();
  }, [status, fetchData]);

  const data = useMemo<BusinessProfile[] | null>(() => {
    if (raw === null) return null;
    return raw.map((r: any) => ({
      id: String(r.id),
      full_name: r.full_name ?? '',
      cnic: r.cnic ?? '',
      mobile: r.mobile ?? '',
      email: r.email ?? '',
      city: r.city ?? '',
      office_name: r.office_name ?? '',
      bank_name: r.bank_name ?? '',
      filer_status: (r.filer_status as 'Active Filer' | 'Non-Filer') ?? 'Active Filer',
      nationality: r.nationality ?? 'Pakistani',
      company_id: r.company_id ? String(r.company_id) : undefined,
      del: (r.del as 'N' | 'Y') ?? 'N',
      created_at: r.created_at,
      updated_at: r.updated_at,
      user: r.user,
      status: r.status,
    }));
  }, [raw]);

  return { data, loading, error, refetch: fetchData };
};
