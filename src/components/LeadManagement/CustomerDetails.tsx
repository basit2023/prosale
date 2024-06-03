'use client'
import { Badge } from '@/components/ui/badge';
import { Title, Text } from '@/components/ui/text';
import Image from 'next/image';
import cn from '@/utils/class-names';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';
// import {logs,logsCreate} from './logs';
import toast from 'react-hot-toast';
const data = [
  {
    Agency: 'Deprixa Miami',
    Office: 'Miami - Florida',
    'Logistics': 'Ocean Freight',
  },
  
];

//customer pic and other details

function WidgetCard({
  title,
  className,
  children,
  childrenWrapperClass,
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
  childrenWrapperClass?: string;
}) {
  return (
    <div className={className}>
      <Title
        as="h3"
        className="mb-3.5 text-base font-semibold @5xl:mb-5 4xl:text-lg"
      >
        {title}
      </Title>
      <div
        className={cn(
          'rounded-lg border border-gray-200 px-5 @sm:px-7 @5xl:rounded-xl',
          childrenWrapperClass
        )}
      >
        {children}
      </div>
    </div>
  );
}
//************************************************************ */

export function CustomerDetails({id}:any){
  
  const { data: session } = useSession();
  const [value, setValue] = useState<any>([]);
// for getting office


//for getting the empoyees data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const response = await apiService.get(`/get-highlyinterest-by-id/${id}`);
          const userData = response.data.leads;
          setValue(userData);
        }
      } catch (error) {
        console.error('Error fetching Customer data:', error);
        
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }, [session]);
  
  return (

    <WidgetCard
    childrenWrapperClass="py-7 @5xl:py-8 flex"
    >
    <div className="relative aspect-square h-16 w-16 shrink-0 @5xl:h-20 @5xl:w-20">
      <Image
        fill
        alt="avatar"
        className="object-cover"
        sizes="(max-width: 768px) 100vw"
        src="https://isomorphic-furyroad.s3.amazonaws.com/public/avatar.png"
      />
    </div>
    <div className="ps-4 @5xl:ps-6">
      <Title
        as="h3"
        className="mb-2.5 text-base font-semibold @7xl:text-lg"
      >
        {value[0]?.customer_name}
      </Title>
      <Text as="p" className="mb-2 break-all last:mb-0">
        {value[0]?.email}
      </Text>
      <Text as="p" className="mb-2 last:mb-0">
        {value[0]?.mobile}
      </Text>
    </div>
    </WidgetCard>
  )
}

export function InvoiceDetails({id}:any) {
  const { data: session } = useSession();
  const [value, setValue] = useState<any>([]);
  const [value1, setValue1] = useState<any>([]);
// for getting office


//for getting the empoyees data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const response = await apiService.get(`/get-highlyinterest-by-id/${id}`);
          const userData = response.data.leads;
          setValue(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }, [session]);
  const timestamp=value[0]?.assigned_on
  const date = new Date(timestamp * 1000);

    // Format the date as "DD/MM/YYYY"
    const formattedDate = `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;

  return (
    <div className="grid items-start rounded-xl border border-gray-300 p-5 grid-cols-1 @2xl:grid-cols-3 @3xl:p-8 @5xl:grid-cols-3 gap-5 bg-transparent"> {/* Adjust grid-cols */}
  <ul className="grid gap-3 col-span-1 @3xl:col-span-1 @3xl:mb-2 @5xl:col-span-1 @5xl:mb-0"> {/* Adjust col-span */}
    <li className="flex items-center gap-3 @3xl:justify-between @5xl:justify-start">
      <span className="font-semibold text-gray-900">Lead Id :</span>
      <span className="text-base font-semibold text-gray-900">
        {value[0]?.main_id}
      </span>
    </li>
    <li className="flex items-center gap-3 @3xl:justify-between @5xl:justify-start">
      <span className="font-semibold text-gray-900">Category:</span>
      <span
        className="px-2 py-1 rounded-md text-xs"
        style={{ backgroundColor: `#${value[0]?.bg_color.split(',')[0]}` }}
      >
        {value[0]?.label ? value[0]?.label : "N/A"}
      </span>
    </li>
    <li className="flex items-center gap-3 @3xl:justify-between @5xl:justify-start">
      <span className="font-semibold text-gray-900">Status :</span>
      {value[0]?.status==='open' ? (<Badge color="success" rounded="md">
        {value[0]?.status}
      </Badge>) : (<Badge color="danger" rounded="md">
        {value[0]?.status}
      </Badge>)}
    </li>
  </ul>
  <ul className="grid gap-3 col-span-1 @3xl:col-span-1 @3xl:mb-2 @5xl:col-span-1 @5xl:mb-0"> {/* Adjust col-span */}
    <li className="flex items-center gap-3 @3xl:justify-between @5xl:justify-start">
      <span className="font-semibold text-gray-900">Project :</span>
      <span className="text-base font-semibold text-gray-900">
        {value[0]?.project_name ? value[0]?.project_name: "N/A"}
      </span>
    </li>
    <li className="flex items-center gap-3 @3xl:justify-between @5xl:justify-start">
      <span className="font-semibold text-gray-900">Interested In :</span>
      <span className="text-base font-semibold text-gray-900">
        {value[0]?.category ?value[0]?.category: "N/A"}
        </span>
    </li>
    <li className="flex items-center gap-3 @3xl:justify-between @5xl:justify-start">
      <span className="font-semibold text-gray-900">Assigned On :</span>
      <span className="text-base font-semibold text-gray-900">
        {value[0]?.assigned_on ?formattedDate: "N/A"}
        </span>
    </li>
  </ul>
</div>



  
  
  );
}







