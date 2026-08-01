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
          {value ?? 'N/A'}
        </Text>
      ),
    }, 
    
    {
      title: (
        <HeaderCell
          title="Full Name"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'full_name'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('full_name'),
      dataIndex: 'full_name',
      key: 'full_name',
      width: 150,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value ?? 'N/A'}
        </Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Current Leads Assigned"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'lead_assigned'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('lead_assigned'),
      dataIndex: 'lead_assigned',
      key: 'lead_assigned',
      width: 100,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value ?? 'N/A'}
        </Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Total Dialed Calls"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'total_dialed_calls'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('total_dialed_calls'),
      dataIndex: 'total_dialed_calls',
      key: 'total_dialed_calls',
      width: 100,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value ?? 'N/A'}
        </Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Total Connected Calls"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'total_connected_calls'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('total_connected_calls'),
      dataIndex: 'total_connected_calls',
      key: 'total_connected_calls',
      width: 100,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value ?? 'N/A'}
        </Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Total WhatsApp"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'total_whatsapp'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('total_whatsapp'),
      dataIndex: 'total_whatsapp',
      key: 'total_whatsapp',
      width: 100,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value ?? 'N/A'}
        </Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Leads Followups"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'daily_lead_follow_up'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('daily_lead_follow_up'),
      dataIndex: 'daily_lead_follow_up',
      key: 'daily_lead_follow_up',
      width: 100,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value ?? 'N/A'}
        </Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Visits / Sites Visited"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'daily_office_visits'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('daily_office_visits'),
      dataIndex: 'daily_office_visits',
      key: 'daily_office_visits',
      width: 100,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value ?? 'N/A'}
        </Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Total Scheduled Meetings"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'dealers_meeting'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('dealers_meeting'),
      dataIndex: 'dealers_meeting',
      key: 'dealers_meeting',
      width: 100,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value ?? 'N/A'}
        </Text>
      ),
    },
    /* Legacy fields hidden from the current activity report UI.
    {
      title: (
        <HeaderCell
          title="Clients Matured"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'client_matured'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('client_matured'),
      dataIndex: 'client_matured',
      key: 'client_matured',
      width: 100,
    },
    {
      title: (
        <HeaderCell
          title="Dealers Registered"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'dealers_register'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('dealers_register'),
      dataIndex: 'dealers_register',
      key: 'dealers_register',
      width: 100,
    },
    */
    {
      title: (
        <HeaderCell
          title="Other Office Activity"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'office_activity'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('office_activity'),
      dataIndex: 'office_activity',
      key: 'office_activity',
      width: 500,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value ?? 'N/A'}
        </Text>
      ),
    }, 
    {
      title: (
        <HeaderCell
          title="Date"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'dt'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('st'),
      dataIndex: 'dt',
      key: 'dt',
      width: 150,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value?.split('T')[0] || 'N/A'}
        </Text>
      ),
    }, 
    {
  title: <HeaderCell title="Action" />,
  dataIndex: 'action',
  key: 'action',
  width: 50,
  render: (_: string, row: any) => {
    // Serialize the row data to a base64 string or other URL-safe format
    const serializedData = encodeURIComponent(JSON.stringify(row));
    
    return (
      <div className="flex items-center justify-start gap-3 pe-3">
        <Tooltip
          size="sm"
          content={() => 'Report'}
          placement="top"
          color="invert"
        >
          <Link href={routes.tamplets.DailyActivityReport(serializedData)}>
            <ActionIcon
              tag="span"
              size="sm"
              variant="outline"
              className="hover:!border-gray-900 hover:text-gray-700"
            >
              <FiFileText className="h-4 w-4" />
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



