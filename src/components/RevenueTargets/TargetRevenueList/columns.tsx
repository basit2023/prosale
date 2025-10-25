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
import { FiFileText } from "react-icons/fi";

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
          title="Sr."
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'id'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('id'),
      dataIndex: 'id',
      key: 'id',
      width: 50,
      render: (value: string | undefined) => (
        
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value || 'N/A'}
        </Text>
      ),
    }, 
    
   {
    title: (
      <HeaderCell
        title="Full Name"
        sortable
        ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'full_name'}
      />
    ),
    onHeaderCell: () => onHeaderCellClick('full_name'),
    dataIndex: 'full_name',
    key: 'full_name',
    width: 150,
    render: (value: string | undefined) => (
      <Text className="font-medium text-gray-700 dark:text-gray-600">
        {value || 'N/A'}
      </Text>
    ),
  },
  {
    title: (
      <HeaderCell
        title="Achieved Revenue"
        sortable
        ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'achievedRevenue'}
      />
    ),
    onHeaderCell: () => onHeaderCellClick('achievedRevenue'),
    dataIndex: 'achievedRevenue',
    key: 'achievedRevenue',
    width: 150,
    render: (value: string | undefined) => (
      <Text className="font-medium text-gray-700 dark:text-gray-600">
        {value || 'N/A'}
      </Text>
    ),
  },
  {
    title: (
      <HeaderCell
        title="Target Revenue"
        sortable
        ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'targetRevenue'}
      />
    ),
    onHeaderCell: () => onHeaderCellClick('targetRevenue'),
    dataIndex: 'targetRevenue',
    key: 'targetRevenue',
    width: 150,
    render: (value: string | undefined) => (
      <Text className="font-medium text-gray-700 dark:text-gray-600">
        {value || 'N/A'}
      </Text>
    ),
  },
    //   {
    //   title: (
    //     <HeaderCell
    //       title="Date"
    //       sortable
    //       ascending={
    //         sortConfig?.direction === 'asc' && sortConfig?.key === 'dt'
    //       }
    //     />
    //   ),
    //   onHeaderCell: () => onHeaderCellClick('dt'),
    //   dataIndex: 'dt',
    //   key: 'dt',
    //   width: 150,
    //   render: (value: string | undefined) => (
    //     <Text className="font-medium text-gray-700 dark:text-gray-600">
    //       {value?.split('T')[0] || 'N/A'}
    //     </Text>
    //   ),
    // }, 
     {
      title: (
        <HeaderCell
          title="Month"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'period_month'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('period_month'),
      dataIndex: 'period_month',
      key: 'period_month',
      width: 150,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value || 'N/A'}
        </Text>
      ),
    }, 
    {
      title: (
        <HeaderCell
          title="Year"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'period_year'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('period_year'),
      dataIndex: 'period_year',
      key: 'period_year',
      width: 150,
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
  width: 50,
  render: (_: string, row: any) => {
    // Extract the id and full_name from the row
    const { user, full_name } = row;

    // Construct the URL with id as a path parameter and full_name as a query parameter
    const url = routes.RevenueTargets.updateTarget(user, full_name);

    return (
      <div className="flex items-center justify-start gap-3 pe-3">
        <Tooltip
          size="sm"
          content={() => 'Update Target'}
          placement="top"
          color="invert"
        >
          <Link href={url}>
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
}

  ];

  return columns;
};


