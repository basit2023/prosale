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
import VaultInformationModalView from '@/app/shared/VaultInformationModalView';
import { useModal } from '@/app/shared/modal-views/use-modal';
import apiService from '@/utils/apiService';
import { LiaEditSolid } from "react-icons/lia";


type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
};
export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
}: Columns) => {
  // const { openModal } = useModal();
 

 
  const columns = [
    // {
    
    //   title: (
    //     <div className="ps-2">
    //       <Checkbox
    //         title={'Select All'}
    //         onChange={handleSelectAll}
    //         checked={checkedItems.length === data.length}
    //         className="cursor-pointer"
    //       />
    //     </div>
    //   ),
    //   dataIndex: 'checked',
    //   key: 'checked',
    //   width: 30,
    //   render: (_: any, row: any) => (
    //     <div className="inline-flex ps-2">
    //       <Checkbox
    //         className="cursor-pointer"
    //         checked={checkedItems.includes(row.id)}
    //         {...(onChecked && { onChange: () => onChecked(row.id) })}
    //       />
    //     </div>
    //   ),
    // },
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
          title="Email"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'email'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('email'),
      dataIndex: 'email',
      key: 'email',
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
          title="Job Title"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'job_title'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('job_title'),
      dataIndex: 'job_title',
      key: 'job_title',
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
          title="City"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'city'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('city'),
      dataIndex: 'city',
      key: 'city',
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
      title: <HeaderCell title="Action" />,
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (_: string, row: any) => (
        <div className="flex items-center justify-start gap-3 pe-3">
          <Tooltip
            size="sm"
            content={() => 'Edit Details'}
            placement="top"
            color="invert"
          >
            
            <Link href={routes.leads.editCustomer(row.id)}>
              <ActionIcon
                tag="span"
                size="sm"
                variant="outline"
                className="hover:!border-gray-900 hover:text-gray-700"
              >
                <LiaEditSolid className="h-4 w-4" />
              </ActionIcon>
            </Link>
          
          </Tooltip>
          <Tooltip
            size="sm"
            content={() => 'View Details'}
            placement="top"
            color="invert"
          >
            
            <Link href="{routes.leads.viewCustomer(row.id)}">
              <ActionIcon
                tag="span"
                size="sm"
                variant="outline"
                className="hover:!border-gray-900 hover:text-gray-700"
              >
                <EyeIcon className="h-4 w-4" />
              </ActionIcon>
            </Link>
          
          </Tooltip>
        </div>
      ),
    },
  ];

  return columns;
};


