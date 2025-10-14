'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Text } from '@/components/ui/text';
import { useRouter } from 'next/navigation';
import BasicTableWidget from '@/components/controlled-table/basic-table-widget';
import cn from '@/utils/class-names';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { PiTrashFill } from 'react-icons/pi';

interface DeliveryDetailsProps {
  className?: string;
  id: any;
  update: any;
}

const ShowComments: React.FC<DeliveryDetailsProps> = ({ id, update }: any) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      if (!session) return;
      const response = await apiService.get(`/show-comments/${id}`);
      const userData = response?.data?.leads ?? [];
      setComments(userData); // always set; server is source of truth
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // remove `comments` from deps to avoid infinite refetch
  }, [session, id, update]);

  // Newest first (descending by date)
  const sortedComments = useMemo(
    () =>
      [...comments].sort(
        (a, b) => Date.parse(b?.date ?? 0) - Date.parse(a?.date ?? 0)
      ),
    [comments]
  );

  const handleDeleteComment = async (commentId: any) => {
    try {
      const response = await apiService.put(`/delete-comments/${commentId}`);
      if (response.status === 200) {
        toast.success('Comment deleted successfully.');
        setComments(prev => prev.filter(c => c.id !== commentId));
      } else {
        console.error('Error Deleting comment:', response.statusText);
        toast.error('Error Deleting comment. Please try again.');
      }
    } catch (error) {
      console.error('Error Deleting comment:', error);
      toast.error('Error Deleting comment. Please try again.');
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <BasicTableWidget
      key={sortedComments.length} // forces table to refresh layout when count changes
      title="All comments"
      className={cn('pb-0 lg:pb-0 [&_.rc-table-row:last-child_td]:border-b-0')}
      data={sortedComments} // <-- use the sorted data
      getColumns={() => [
        {
          title: <span className="block whitespace-nowrap">Comment By</span>,
          dataIndex: 'fullName',
          key: 'fullName',
          width: 300,
          render: (_: string, record: any) => (
            <>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {record?.fullName || 'N/A'}
              </Text>
              <div>
                <span>
                  <div style={{ display: 'inline-block' }}>
                    {(record?.date || '').slice(0, 10) || '—'}
                  </div>
                </span>
              </div>
            </>
          ),
        },
        {
          title: <span className="block whitespace-nowrap">Comments</span>,
          dataIndex: 'comments',
          key: 'comments',
          width: 300,
          render: (_: string, record: any) => (
            <Text className="font-medium text-gray-700 dark:text-gray-600">
              {record?.comments || 'N/A'}
            </Text>
          ),
        },
        {
          title: <span className="block whitespace-nowrap">Follow up</span>,
          dataIndex: 'followup',
          key: 'followup',
          width: 300,
          render: (_: string, record: any) => (
            <Text className="font-medium text-gray-700 dark:text-gray-600">
              {record?.followup || 'N/A'}
            </Text>
          ),
        },
        {
          title: <span className="block whitespace-nowrap">Date</span>,
          dataIndex: 'followupdate',
          key: 'followupdate',
          width: 300,
          render: (_: string, record: any) => (
            <Text className="font-medium text-gray-700 dark:text-gray-600">
              {record?.followupdate || 'N/A'}
            </Text>
          ),
        },
        {
          title: (
            <span
              className="block whitespace-nowrap"
              style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '40px' }}
            >
              Action
            </span>
          ),
          dataIndex: 'status',
          key: 'status',
          width: 300,
          render: (_: string, record: any) => (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '40px' }}>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => handleDeleteComment(record.id)}
              >
                <PiTrashFill className="me-1 h-[17px] w-[17px]" />
              </button>
            </div>
          ),
        },
      ]}
      noGutter
      enableSearch={false}
      scroll={{ x: 900 }}
    />
  );
};

export default ShowComments;
