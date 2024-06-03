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
    {
      title: (
        <HeaderCell
          title="S/NO:"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'id'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('id'),
      dataIndex: 'id',
      key: 'id',
      width: 5,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value || 'N/A'}
        </Text>
      ),
    },

    {
      title: (
        <HeaderCell
          title="Team"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'title'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('title'),
      dataIndex: 'title',
      key: 'title',
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
          title="Manager"
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
          title="Zone"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'zone_title'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('zone_title'),
      dataIndex: 'zone_title',
      key: 'zone_title',
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
          title="Total Members"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'total_members'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('total_members'),
      dataIndex: 'total_members',
      key: 'total_members',
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
        const editPermission = row.Edit_permission; // Implement a function to check user's permission level
        
        return (
          <div className="flex items-center justify-start gap-3 pe-3">
            {editPermission >= 5 && (
              <Tooltip
                size="sm"
                content={() => 'Edit Details'}
                placement="top"
                color="invert"
              >
                <Link href={routes.employee.editteam(row.id)}>
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
            )}
            <Tooltip
              size="sm"
              content={() => 'View Details'}
              placement="top"
              color="invert"
            >
              <Link href={routes.employee.members(row.manager_id)}>
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
        );
      },

    },
  ];

  return columns;
};


