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

 // eslint-disable-next-line react-hooks/exhaustive-deps

 



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
   
    // {
    //   title: (
    //     <HeaderCell
    //       title="EMP Id:"
    //       sortable
    //       ascending={
    //         sortConfig?.direction === 'asc' && sortConfig?.key === 'id'
    //       }
    //     />
    //   ),
    //   onHeaderCell: () => onHeaderCellClick('id'),
    //   dataIndex: 'id',
    //   key: 'id',
    //   width: 100,
    //   render: (value: string | undefined) => (
    //     <Text className="font-medium text-gray-700 dark:text-gray-600">
    //       {value || 'N/A'}
    //     </Text>
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
      width: 50,
      render: (value: any, row: any) => {
        const fullName = `${row.name || 'N/A'}`;
    
        // Conditional styles for status and sms
        const statusStyle = {
          color: typeof row.view_dt === 'string' ? 'black' : 'black',
        };
    
        
    
        return (
          <div>
            <Text className="font-medium text-gray-700 dark:text-gray-600">
              {fullName}
             
            </Text>
           
          </div>
        );
      },
    },
    {
      title: (
        <HeaderCell
          title="Designation"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'designation'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('designation'),
      dataIndex: 'designation',
      key: 'designation',
      width: 100,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value || 'N/A'}
        </Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Total Leads"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'total_lead_count'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('total_lead_count'),
      dataIndex: 'total_lead_count',
      key: 'total_lead_count',
      width: 100,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value || 'N/A'}
        </Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Unread Leads"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'unread_lead_count'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('unread_lead_count'),
      dataIndex: 'unread_lead_count',
      key: 'unread_lead_count',
      width: 100,
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
      width: 200,
      render: (_: string, row: any) => {
        
        return (
          <div className="flex items-center justify-start gap-3 pe-3 ml-4">
            <Tooltip
              size="sm"
              content={() => 'View Details'}
              placement="top"
              color="invert"
            >
              <Link href={routes.leads.team_member(row.id)}>
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
            {/* <Tooltip
              size="sm"
              content={() => 'Edit Details'}
              placement="top"
              color="invert"
            >
              <Link href={routes.employee.editzone(row.id)}>
                <ActionIcon
                  tag="span"
                  size="sm"
                  variant="outline"
                  className="hover:!border-gray-900 hover:text-gray-700"
                >
                  <LiaEditSolid className="h-4 w-4" />
                </ActionIcon>
              </Link>
            </Tooltip> */}
          </div>
        );
      },
    },
  ];

  return columns;
};


