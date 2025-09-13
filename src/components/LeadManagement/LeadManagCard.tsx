'use client';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import apiService from '@/utils/apiService';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { useModal } from '@/app/shared/modal-views/use-modal';
import ChangeCompany from './SelectCompany';
import Spinner from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';

const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});

export default function Vaultinformation() {
  const router = useRouter();
  const { data: session } = useSession();
  const { openModal, closeModal } = useModal();
  const [company_id, setCompany_id] = useState<string | undefined>(undefined);
  const [leads, setLeads] = useState<any>(null);
  const [allLabel, setAllLabel] = useState<any[]>([]);
  const [userType, setUserType] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoize session to prevent unnecessary re-renders
  const memoizedSession = useMemo(() => session, [session]);
  

  // Fetch all data in parallel using Promise.all
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!memoizedSession?.user?.email || !memoizedSession?.user?.company_id) {
        return;
      }

      const [labelsResponse, leadsResponse] = await Promise.all([
        apiService.get(`/lables/${memoizedSession.user.email}/?company=${memoizedSession.user.company_id}`),
        apiService.get(`/leads/?email=${memoizedSession.user.email}&permission=${memoizedSession.user?.permission}`)
      ]);

      setAllLabel(labelsResponse.data.allLabels || []);
      setLeads(leadsResponse.data || null);
      
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(error?.response?.data?.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  }, [memoizedSession]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Memoize sorted data to prevent unnecessary sorting on every render
  const sortedData = useMemo(() => {
    return [...allLabel].sort((a, b) => parseFloat(a.sort) - parseFloat(b.sort));
  }, [allLabel]);
console.log("teh rorted data is:",sortedData)
  // Memoize permission check for better performance
  const hasAdminPermission = useMemo(() => {
    return memoizedSession?.user?.permission >= 9;
  }, [memoizedSession]);

  if (loading) {
    return (
      <div className="grid place-content-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="content">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button for mobile and small screens */}
        <div className="block lg:hidden mb-4">
          <button
            onClick={() => router.back()}
            className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        </div>

        {/* Admin-level labels */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
  {hasAdminPermission ? (
    // --- Admin view: full per-label cards ---
    sortedData
      .filter((data) => Number(data?.permission) >= 9)
      .map((data) => (
        <Link
          key={data.id}
          href={routes.leads.show_label(data.id,{ view: "table", sort: "created" })}
          className="col-span-1"
        >
          <div className="bg-white rounded border border-gray-300 w-full pb-10 mb-5 mt-4">
            <h3
              className="text-black text-lg font-semibold p-4 mb-4"
              style={{ backgroundColor: `#${data.bg.split(',')[0]}` }}
            >
              {data.label}
            </h3>
            <div className="flex flex-col items-center text-center">
              <div
                className="text-theme text-7xl font-bold mb-2 text-gray-200"
                style={{ color: `#${data.bg.split(',')[0]}` }}
              >
                {data.label === 'Un Assigned' ? leads?.total_unsigned : leads?.total}
              </div>
              <div className="text-2xl bg-badc58 pb-4">Leads</div>
            </div>
            <div className="text-muted ml-3 mt-2">
              Closed: <strong>0</strong>
            </div>
          </div>
        </Link>
      ))
  ) : (
    // --- Non-admin view: single card locked to label id 11 ---
    (() => {
      const labelIdForNonAdmin = 11;
      const label = sortedData.find((l) => Number(l.id) === labelIdForNonAdmin);
      const colorHex = label?.bg ? `#${label.bg.split(',')[0]}` : '#4287f5';
      const title = label?.label || 'My Leads';

      return (
        <Link
          href={routes.leads.show_label(labelIdForNonAdmin,{ view: "table", sort: "created" })}
          className="col-span-1 sm:col-span-2"
        >
          <div className="bg-white rounded border border-gray-300 w-full pb-10 mb-5 mt-4">
            <h3
              className="text-black text-lg font-semibold p-4 mb-4"
              style={{ backgroundColor: colorHex }}
            >
              {title}
            </h3>
            <div className="flex flex-col items-center text-center">
              <div
                className="text-theme text-7xl font-bold mb-2 text-gray-200"
                style={{ color: colorHex }}
              >
                {leads?.total}
              </div>
              <div className="text-2xl bg-badc58 pb-4">Leads</div>
            </div>
            <div className="text-muted ml-3 mt-2">
              Closed: <strong>0</strong>
            </div>
          </div>
        </Link>
      );
    })()
  )}
</div>



     

        {/* Regular user labels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-3">
          {sortedData
            .filter(data => parseFloat(data.permission) <= 8)
            .map(data => (
              <Link key={data.id} href={routes.leads.show_label(data.id,{ view: "table", sort: "created" })} className="col-span-1">
                <div className="bg-white rounded border border-gray-300 w-full mb-5">
                  <h3 
                    className="text-black text-lg font-semibold p-4 mb-4" 
                    style={{ backgroundColor: `#${data.bg.split(',')[0]}` }}
                  >
                    {data.label}
                  </h3>
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="text-theme text-7xl font-bold mb-2" 
                      style={{ color: `#${data.bg.split(',')[0]}` }}
                    >
                      {data.totalLeads}
                    </div>
                    <div className="text-2xl bg-badc58 pb-4">Leads</div>
                  </div>
                  <div className="text-muted pb-3 pl-2">
                    Closed: <strong>0</strong>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}