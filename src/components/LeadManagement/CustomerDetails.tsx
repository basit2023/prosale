'use client'
import { Badge } from '@/components/ui/badge';
import { Title, Text } from '@/components/ui/text';
import Image from 'next/image';
import cn from '@/utils/class-names';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

// WidgetCard Component
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
        className="mb-3.5 text-base font-semibold lg:mb-5 4xl:text-lg"
      >
        {title}
      </Title>
      <div
        className={cn(
          'rounded-lg border border-gray-200 px-5 sm:px-7 lg:rounded-xl',
          childrenWrapperClass
        )}
      >
        {children}
      </div>
    </div>
  );
}

// CustomerDetails Component
export function CustomerDetails({ id }: any) {
  const { data: session } = useSession();
  const [value, setValue] = useState<any>([]);
  

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
  }, [session, id]);

  return (

    <WidgetCard
    childrenWrapperClass="py-7 @5xl:py-8 flex  pt-[2.8rem]" 
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
         {value[0]?.customer_name ? value[0]?.customer_name: "N/A"}
      </Title>
      <Text as="p" className="mb-2 break-all last:mb-0">
         {value[0]?.email ? value[0]?.email : "N/A"}
      </Text>
      <Text as="p" className="mb-2 last:mb-0">
         {value[0]?.mobile ? value[0]?.mobile : "N/A"}
      </Text>
    </div>
    </WidgetCard>
  )
}

// InvoiceDetails Component
export function InvoiceDetails({ id }: any) {
  const { data: session } = useSession();
  const [value, setValue] = useState<any>([]);
 

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const response = await apiService.get(`/get-highlyinterest-by-id/${id}`);
          const userData = response.data.leads;
         

          setValue(userData);
          console.log("the result is:",userData)
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
    };

    fetchData();
  }, [session, id]);

  const timestamp = value[0]?.assigned_on;
  const date = new Date(timestamp * 1000);

  const formattedDate = `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;

  return (
    <div className="rounded-xl border border-gray-300 p-4 w-full bg-transparent">
      <ul className="grid grid-cols-2 gap-3"> 
        <li className="flex items-center gap-3 justify-start sm:gap-2">
        <span className="font-semibold text-gray-900">Lead Id:</span>
          <span className="font-semibold text-gray-900">
            {value[0]?.main_id}
          </span>
        </li>
        <li className="flex items-center gap-3 justify-start sm:gap-2">
          <span className="font-semibold text-gray-900">Category:</span>
          <span className="text-base font-semibold text-gray-900 sm:text-sm px-1 rounded-sm"
          style={{ backgroundColor: `#${value[0]?.bg_color.split(',')[0]}`, color: `#${value[0]?.color}` }}>
          {value[0]?.label ? value[0]?.label : "N/A"}
          </span>
        </li>
        <li className="flex items-center gap-3 justify-start sm:gap-2">
          <span className="font-semibold text-gray-900">Status:</span>
          <span className="text-base font-semibold text-gray-900">
          {value[0]?.status === 'open' ? (
            <Badge color="success" rounded="md">
              {value[0]?.status}
            </Badge>
          ) : (
            <Badge color="danger" rounded="md">
              {value[0]?.status}
            </Badge>
          )}
          </span>
        </li>
        <li className="flex items-center gap-3 justify-start sm:gap-3">
          <span className="font-semibold text-gray-900">Project:</span> 
          <span className="text-base font-semibold text-gray-900 sm:text-sm">
            {value[0]?.project_name ? value[0]?.project_name : "N/A"} 
          </span>
        </li>
        <li className="flex items-center gap-3 justify-start sm:gap-3">
          <span className="font-semibold text-gray-900">Interested In:</span> 
          <span className="text-base font-semibold text-gray-900 sm:text-sm">
            {value[0]?.category ? value[0]?.category : "N/A"} 
          </span>
        </li>
        <li className="flex items-center gap-3 justify-start sm:gap-3">
          <span className="font-semibold text-gray-900">Assigned On:</span> 
          <span className="text-base font-semibold text-gray-900 sm:text-sm">
          {value[0]?.assigned_on ? formattedDate : "N/A"}
          </span>
        </li>
        <li className="flex items-center gap-3 justify-start sm:gap-3">
          <span className="font-semibold text-gray-900">Assigned To:</span> 
          <span className="text-base font-semibold text-gray-900 sm:text-sm">
          {value[0]?.assigned_to ? value[0]?.assigned_to : "N/A"}
          </span>
        </li>
        {/* this part is add */}
        <li className="flex items-center gap-3 justify-start sm:gap-3">
          <span className="font-semibold text-gray-900">Campaign Type:</span> 
          <span className="text-base font-semibold text-gray-900 sm:text-sm">
          {value[0]?.campaign_type ? value[0]?.campaign_type: "N/A"}
          </span>
        </li>
      </ul>
    </div>
  );
}
