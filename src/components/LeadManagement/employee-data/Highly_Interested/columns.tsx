'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { type Invoice } from '@/data/invoice-data';
import { routes } from '@/config/routes';
import { Title, Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { ActionIcon } from '@/components/ui/action-icon';
import EyeIcon from '@/components/icons/eye';
// import VaultInformationModalView from '@/app/shared/VaultInformationModalView';
// import { useModal } from '@/app/shared/modal-views/use-modal';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';
import { Checkbox } from '@/components/ui/checkbox';

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
};
export const useGetColumns  = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
}: Columns) => {
  // const { openModal } = useModal();
  const { data: session } = useSession();
 const handleClick= async (id: string) =>{
      try {
        const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();
        

        const result = await apiService.put(`/lead-open/${id}` ,{
          dt:getCurrentTimestamp(),
          email:session?.user?.email
        });
      
    } catch (error) {
        console.error('Error while updating lead status:', error);
        // Handle error if necessary
    }
    }


  // const handleViewInvoice = (rowId: string) => {
  //   openModal({
  //     view: <VaultInformationModalView id={rowId} />,  // Pass rowId to the modal
  //     customSize: '420px',
  //   });
  // };
  const columns = [
    ...(parseFloat(data[0].permission) >= 9
    ? [
        {
          title: (
            <div className="ps-2">
              <Checkbox
                title={"Select All"}
                onChange={handleSelectAll}
                checked={checkedItems.length === data.length}
                className="cursor-pointer"
              />
            </div>
          ),
          dataIndex: "checked",
          key: "checked",
          width: 30,
          render: (_: any, row: any) => (
            <div className="inline-flex ps-2">
              <Checkbox
                className="cursor-pointer"
                checked={checkedItems.includes(row.id)}
                {...(onChecked && { onChange: () => onChecked(row.id) })}
              />
            </div>
          ),
        },
      ]
    : []),
    
    {
      title: (
        <HeaderCell
          title="Name"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'name'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('name'),
      dataIndex: 'name', // Check this key
      key: 'name',
      width: 200,
      render: (value: any, row: any) => {
        const fullName = `${row.name || 'N/A'}`;
    
        // Conditional styles for status and sms
        const statusStyle = {
          color: typeof row.view_dt === 'string' ? 'black' : 'black',
        };
    
        const smsStyle = {
          color: row.sms === 'Y' ? 'black' : 'black',
        };
    
        return (
          <div>
            <Text className="font-medium text-gray-700 dark:text-gray-600">
              {fullName}
              <span style={statusStyle}>
                <div style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: row.view_dt === 'new_lead' ? 'red' : 'none', marginLeft: '10px' }}></div>
              </span>
            </Text>
            <div>
               {/* <span style={statusStyle}>
                <div style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: (typeof row.view_dt) === 'string' ? 'red' : 'green', marginRight: '5px' }}></div>
              </span> */}
             {/* <span style={smsStyle}>
                SMS: <div style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: row.sms === 'Y' ? 'green' : 'red' }}></div>
              </span> */}
            </div>
          </div>
        );
      },
    },
    
    {
      title: (
        <HeaderCell
          title="Mobile"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'mobile'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('mobile'),
      dataIndex: 'mobile',
      key: 'mobile',
      width: 200,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value || 'N/A'}
        </Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Project Name"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'project_name'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('project_name'),
      dataIndex: 'project_name',
      key: 'project_name',
      width: 200,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value || 'N/A'}
        </Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Company"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'company_title'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('company_title'),
      dataIndex: 'company_title',
      key: 'company_title',
      width: 200,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value || 'N/A'}
        </Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Interested In"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'interested_in'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('interested_in'),
      dataIndex: 'interested_in',
      key: 'interested_in',
      width: 200,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value || 'N/A'}
        </Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Assigned To"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'assigned_to'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('assigned_to'),
      dataIndex: 'assigned_to',
      key: 'assigned_to',
      width: 200,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value || 'N/A'}
        </Text>
      ),
    },
    
    {
      title: (
        <HeaderCell
          title="Status"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'status'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('status'),
      dataIndex: 'status',
      key: 'status',
      width: 200,
      render: (value: any, row: any) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          <div className="font-medium text-gray-700 dark:text-gray-600">
          {row.status === 'open' ? (
              <span className="px-2 py-1 rounded bg-green-500 text-white">Open</span>
            ) : row.status === 'close' ? (
              <span className="px-2 py-1 rounded bg-red-500 text-white">Closed</span>
            ) : row.status === 'un_assigned' ? (
              <span className="px-2 py-1 rounded bg-blue-500 text-white">Unassigned</span>
            ) : (
              <span className="px-2 py-1 rounded bg-yellow-500 text-white">N/A</span>
            )}
        </div>
          
        </Text>
        
      ),
    },    
    {
      title: <HeaderCell title="Action" />,
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (_: string, row: any) => (
        <div className="flex items-center justify-start gap-3 pe-3 ml-4">
          <Tooltip
            size="sm"
            content={() => 'View Details'}
            placement="top"
            color="invert"
          >
            <button onClick={() => handleClick(row.id)}>
            <Link href={routes.leads.edit(row.id)}>
              <ActionIcon
                tag="span"
                size="sm"
                variant="outline"
                className="hover:!border-gray-900 hover:text-gray-700"
              >
                <EyeIcon className="h-4 w-4" />
              </ActionIcon>
            </Link>
          </button>
          </Tooltip>
         
        </div>
      ),
    },
  ];

  return columns;
};


