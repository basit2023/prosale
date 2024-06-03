// PersonalInfoView.js

'use client';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Spinner from '@/components/ui/spinner';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';                                           
import { routes } from '@/config/routes';
import Link from 'next/link';
const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,

  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});


export default function ManagerInfo({id}:any) {
  const { data: session } = useSession();
  const [value, setValue] = useState<any>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {

          const response = await apiService.get(`/teamates/${id}/?email=${session?.user?.email}`);
          const userData = response.data.team[0];
     
          setValue(userData);
        }
      } catch (error:any) {
        console.error('Error fetching team memeber:', error);
        toast.error(error.response.data.message)
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }, [session]);







 return (
     <>
     <div className="flex flex-col">
  <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
    <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
      <div className="overflow-hidden">
        <table className="min-w-full text-center text-sm font-light text-surface dark:text-white border rounded">
          <thead className="border-b border-neutral-200 bg-[#332D2D] font-medium text-white dark:border-white/10">
            <tr>
              <th colSpan={4} className=" px-6 py-4">Team {value?.title} Manager: {value?.manager_full_name}</th>
              
            </tr>
          </thead>
          {/* <tbody>
            <tr className="border-b border-neutral-200 dark:border-white/10">
              <td className="whitespace-nowrap  px-6 py-4 font-medium">1</td>
              <td className="whitespace-nowrap  px-6 py-4">Mark</td>
              <td className="whitespace-nowrap  px-6 py-4">Otto</td>
              <td className="whitespace-nowrap  px-6 py-4">@mdo</td>
            </tr>
            <tr className="border-b border-neutral-200 dark:border-white/10">
              <td className="whitespace-nowrap  px-6 py-4 font-medium">2</td>
              <td className="whitespace-nowrap  px-6 py-4 ">Jacob</td>
              <td className="whitespace-nowrap  px-6 py-4">Thornton</td>
              <td className="whitespace-nowrap  px-6 py-4">@fat</td>
            </tr>
            <tr className="border-b border-neutral-200 dark:border-white/10">
              <td className="whitespace-nowrap  px-6 py-4 font-medium">3</td>
              <td colSpan={2} className="whitespace-nowrap  px-6 py-4">
                Larry the Bird
              </td>
              <td className="whitespace-nowrap  px-6 py-4">@twitter</td>
            </tr>
          </tbody> */}
        </table>
      </div>
    </div>
  </div>
</div>

     
     </>
  );
}