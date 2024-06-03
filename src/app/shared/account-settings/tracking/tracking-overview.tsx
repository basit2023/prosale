'use client';

import cn from '@/utils/class-names';
import { useParams } from 'next/navigation';
import { Title, Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { IoMdCloseCircleOutline } from "react-icons/io";
import { PiCheckCircle, PiCopySimple, PiMoped,PiNotePencilLight } from 'react-icons/pi';
import ShipmentNewsletterForm from '@/app/shared/logistics/tracking/shipment-newsletter';
import Timeline from '@/app/shared/logistics/tracking/timeline';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';


const timelineData = [
  {
    title: 'Created Activity',
    text: 'Delivered, Individual Picked Up at Postal Facility',
    hightlightedText: '8502 Preston Rd. Inglewood, Maine 98380',
    date: 'May 02, 2023',
    time: '11:30 am',
    icon: <PiCheckCircle className="h-6 w-6 text-green" />,
    status: 'success',
  },
  {
    title: 'Updated Activity',
    text: 'Not Delivered yet, Individual Picked Up at Postal Facility',
    hightlightedText: '8502 Preston Rd. Inglewood, Maine 98380',
    date: 'May 02, 2023',
    time: '11:00 am',
    icon: '',
    status: '',
  },
  {
    title: 'Updated',
    text: '',
    hightlightedText: '',
    date: 'May 02, 2023',
    time: '09:00 am',
    icon: '',
    status: '',
  },
  {
    title: 'Deleted Activity',
    text: '',
    hightlightedText: '',
    date: 'April 29, 2023',
    time: '05:31 am',
    icon: '',
    status: '',
  },
  {
    title: 'Deleted Activity',
    text: '',
    hightlightedText: '',
    date: 'April 28, 2023',
    time: '8:00 am',
    icon: '',
    status: '',
  },
  {
    title: 'Order Received',
    text: '',
    hightlightedText: '',
    date: 'April 26, 2023',
    time: '12:30 pm',
    icon: '',
    status: '',
  },
];

export default function TrackingOverview({ className }: { className?: string }){
  const [value2, setValue2] = useState<any>();
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session?.user?.email) {
          const response = await apiService.get(`/logs/${session?.user?.email}`);
          const userData = response.data.results;
          console.log("user details are:", userData);
          setValue2(userData);
          console.log("the value2 is:",value2)
          const newTimelineData = userData.map((item:any, index:any) => {
            const timestamp = item.dt;
            const date = new Date(timestamp * 1000);
      
            const options: Intl.DateTimeFormatOptions = {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
              hour12: true, // Use 12-hour format
              timeZone: 'Asia/Karachi', // Set timezone to Pakistan Standard Time
            };
      
            const formattedDate = date.toLocaleDateString('en-US', options);
            let icon;
            if (item.log_type === 'Create') {
              icon = <PiCheckCircle className="h-6 w-6 text-orange" />;
            } else if (item.log_type === 'Edit') {
              icon = <PiNotePencilLight className="h-6 w-6 text-green" />;
            }
           else if (item.log_type === 'Delete') {
            icon = <IoMdCloseCircleOutline className="h-6 w-6 text-red" />;
          }
            return {
              title: `Activity ${item.log_type}`,
              icon: icon,
              text: item.log_descp,
              highlightedText: item.log_descp, // Modify this as needed
              date: ` at ${formattedDate}`, // Replace with the actual property containing date
              ip: item.ipAddress, // Replace with the actual property containing time
              device:item.macAddress,
              
              status: item.log_type,
            };
          });
      
          setTimelineData(newTimelineData);
        } else {
          // Handle the case when there is no user email in the session
          console.error('No user email in the session.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Add toast or error handling as needed
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-10 lg:grid-cols-2 xl:gap-20',
        className
      )}
    >
      <div>
        <TrackingSummary />
        {/* <ShipmentSubscription className="mt-10" /> */}
      </div>
      <div>
        <Timeline data={timelineData} showmoreButton={true} order="desc" />
      </div>
    </div>
  );
}

export function TrackingSummary() {
  const params = useParams();
  const [isCopied, setCopied] = useState(false);
  const [_, copyToClipboard] = useCopyToClipboard();
  const [value1, setValue] = useState<any>();
  const [isEditing, setIsEditing] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session?.user?.email) {
          const response = await apiService.get(`/logs/${session?.user?.email}`);
          const userData = response.data.results[0];
          console.log("user details are:", userData);
          setValue(userData);
        } else {
          // Handle the case when there is no user email in the session
          console.error('No user email in the session.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Add toast or error handling as needed
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);



   //convet back to original time
   const timestamp = value1?.dt;
const date = new Date(timestamp * 1000); // Convert seconds to milliseconds

// Get individual date components
const year = date.getFullYear();
const month = date.getMonth() + 1; // Month is zero-based, so add 1
const day = date.getDate();
const hours = date.getHours();
const minutes = date.getMinutes();
const seconds = date.getSeconds();

// Format the date in a human-readable way
const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours}:${minutes}:${seconds}`;

  function handleCopyToClipboard(value: string) {
    copyToClipboard(value);
    toast.success(<b>{`Copied '${value}' to clipboard`}</b>);

    setCopied(() => true);
    setTimeout(() => {
      setCopied(() => false);
    }, 2000);
  }
  return (
    <>
      <Text className="mb-2 text-gray-700">User:</Text>
      <Title
        as="h2"
        className="mb-3 text-2xl font-bold text-gray-700 3xl:text-3xl"
      >
        {value1?.user}
      </Title>

      <div className="mb-7 flex items-center gap-x-5">
        {/* <Button
          variant="text"
          onClick={() => handleCopyToClipboard(params.id as string)}
          className="inline-flex h-auto w-auto items-center gap-1 px-0 py-0 font-normal"
        >
          <PiCopySimple className="h-5 w-5" />
          <Text as="span" className="text-gray-700">
            {isCopied ? 'Copied' : 'Copy'}
          </Text>
        </Button> */}
        {/* <Text className="inline-flex items-center gap-1">
          <PiMoped className="h-5 w-5" />
          <Text as="span" className="text-gray-700">
            Add to delivery information
          </Text>
        </Text> */}
      </div>

      <div className="max-w-[505px] rounded-lg border border-l-4 border-primary bg-primary-lighter/10 p-7">
        <Title as="h3" className="mb-3 text-xl font-semibold text-gray-900">
          Latest Update
        </Title>
        <Text className="mb-2 text-gray-500 md:text-base md:leading-relaxed">
          Your have done last activity at {`${hours}:${minutes}:${seconds}`} on {`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`}
          <Text as="span" className="font-semibold text-gray-700">
            
          </Text>
        </Text>
      </div>
    </>
  );
}

// export function ShipmentSubscription({ className }: { className?: string }) {
//   return (
//     <div className={cn(className)}>
//       <Text className="mb-3">
//         Want update on this shipment? Enter your email address & we will do the
//         rest!
//       </Text>
//       <ShipmentNewsletterForm
//         placeholderText="smith@example.com"
//         buttonClassName="bg-gray-900 hover:enabled:bg-gray-800 rounded-lg max-w-[118px]"
//         buttonLabel="Submit"
//         className="w-full max-w-3xl"
//       />
//     </div>
//   );
// }
