'use client';

import Image from 'next/image';
import { avatarIds } from '@/utils/get-avatar';
import { getRandomArrayElement } from '@/utils/get-random-array-element';
import { Title, Text } from '@/components/ui/text';
import { formatDate } from '@/utils/format-date';
import { Avatar } from '@/components/ui/avatar';
import signature from '@public/client-signature.svg';
import BasicTableWidget from '@/components/controlled-table/basic-table-widget';
import cn from '@/utils/class-names';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
interface DeliveryDetailsProps {
  className?: string;
  id:any;
}

const data = [
  {
    id: 1,
    date: new Date('2023-08-23T10:18:34.191Z'),
    deliveredBy: {
      name: 'Estelle Hansen MD',
      avatar: `https://isomorphic-furyroad.s3.amazonaws.com/public/avatars-blur/avatar-${getRandomArrayElement(
        avatarIds
      )}.png`,
    },
    receivedBy: {
      name: 'Sherry Kulas DVM',
      avatar: `https://isomorphic-furyroad.s3.amazonaws.com/public/avatars-blur/avatar-${getRandomArrayElement(
        avatarIds
      )}.png`,
    },
    receiversSignature: 'Shelia Schmeler PhD',
  },
];
// console.log("the data is--->",data)
export const getColumns = () => [
  {
    title: <span className="block whitespace-nowrap z-0">Campaign Name</span>,
    dataIndex: 'campaing_name',
    key: 'campaing_name',
    width: 300,
    render: (text: string, record: any, index: number) => {
      
      return (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {record?.campaign_name || 'N/A'}
        </Text>
      );
    },
  },
  {
    title: <span className="block whitespace-nowrap">Campaign Type</span>,
    dataIndex: 'campaign_type',
    key: 'campaign_type',
    width: 300,
    render: (value: string, record: any, index: number) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {record?.campaign_type || "N/A"}
        </Text>
      ),
  },
  {
    title: <span className="block whitespace-nowrap">Investment Time</span>,
    dataIndex: 'investment_time',
    key: 'investment_time',
    width: 300,
    render: (value: string, record: any, index: number) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {record?.investment_time || 'N/A'}
        </Text>
      ),
  },
  {
    title: <span className="block whitespace-nowrap">Investment Budget</span>,
    dataIndex: 'investment_budget',
    key: 'investment_budget',
    width: 300,
    render: (value: string,record: any, index: number) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {record?.investment_budget || 'N/A'}
        </Text>
      ),
  },
  {
    title: <span className="block whitespace-nowrap">Customer Name</span>,
    dataIndex: 'customer_name',
    key: 'customer_name',
    width: 300,
    render: (value: string,record: any, index: number) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {record?.customer_name || 'N/A'}
        </Text>
      ),
  },
];


const DeliveryDetails: React.FC<DeliveryDetailsProps> = ({ id }) => {
  const { data: session } = useSession();
  const [value, setValue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const response = await apiService.get(`/get-highlyinterest-by-id/${id}`);
          const userData = response.data.leads;
          // console.log("Customer Details in table--->", userData);
          setValue(userData);
        }
      } catch (error) {
        console.error('Error fetching Customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, id]);

  if (loading) {
    // Add a loading state while waiting for data
    return <Text>Loading...</Text>;
  }

  const data = value && value.length > 0 ? [value[0]] : [];

 
  // console.log("Value of data:", data);
  return (
    <BasicTableWidget
      title="Leads Details"
      className={cn('pb-0 lg:pb-0 [&_.rc-table-row:last-child_td]:border-b-0 z-[-999]')}
      data={data}
      getColumns={getColumns}
      noGutter
      enableSearch={false}
      scroll={{
        x: 900,
      }}
      
    />
  );
}
export default DeliveryDetails;