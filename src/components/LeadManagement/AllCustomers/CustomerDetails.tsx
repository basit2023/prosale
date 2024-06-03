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
          const response = await apiService.get(`/get-customer-by-id/${id}`);
          const userData = response.data.customer;
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
        {value?.full_name}
      </Title>
      <Text as="p" className="mb-2 break-all last:mb-0">
        {value?.email}
      </Text>
      <Text as="p" className="mb-2 last:mb-0">
        {value?.mobile}
      </Text>
    </div>
    </WidgetCard>
  )
}

export function InvoiceDetails({id}:any) {
  const { data: session } = useSession();
  const [value, setValue] = useState<any>([]);
  const [value1, setValue1] = useState([]);
// for getting office


//for getting the empoyees data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const response = await apiService.get(`/get-customer-by-id/${id}`);
          const userData = response.data.customer;
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
      <div className="rounded-xl border border-gray-300 p-5 w-full bg-transparent mt-1">
        <ul className="grid gap-3"> {/* Remove grid and adjust gap */}
          <li className="flex items-center gap-3 justify-start">
            <span className="font-semibold text-gray-900">WhatsApp :</span>
            <span className="text-base font-semibold text-gray-900">
              {value?.whatsapp ? value?.whatsapp : "N/A"}
            </span>
          </li>
          <li className="flex items-center gap-3 justify-start">
            <span className="font-semibold text-gray-900">Job Title :</span>
            <span className="text-base font-semibold text-gray-900">
              {value?.job_title ? value?.job_title : "N/A"}
            </span>
          </li>
          <li className="flex items-center gap-3 justify-start">
            <span className="font-semibold text-gray-900">City :</span>
            <span className="text-base font-semibold text-gray-900">
              {value?.city ? value?.city : "N/A"}
            </span>
          </li>
          {/* Commented out items removed */}
        </ul>
      </div>
    );
}







