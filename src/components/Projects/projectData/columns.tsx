'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { type Invoice } from '@/data/invoice-data';
import { routes } from '@/config/routes';
import { Title, Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import DeletePopover from '@/app/shared/delete-popover1';
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

 // eslint-disable-next-line react-hooks/exhaustive-deps

 



  const columns = [
   
    {
      title: (
        <HeaderCell
          title="ID:"
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
          title="Name"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'name'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('name'),
      dataIndex: 'name',
      key: 'name',
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
          title="Csv Label"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'Csv_Label'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('Csv_Label'),
      dataIndex: 'Csv_Label', // Check this key
      key: 'Csv_Label',
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
          title="WhatsApp Sort"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'Whatsapp_Sort'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('Whatsapp_Sort'),
      dataIndex: 'Whatsapp_Sort',
      key: 'Whatsapp_Sort',
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
          title="WhatsApp Status"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'Whatsapp_Status'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('Whatsapp_Status'),
      dataIndex: 'Whatsapp_Status',
      key: 'Whatsapp_Status',
      width: 100,
      render: (value: string | undefined) => (
        <div className="font-medium text-gray-700 dark:text-gray-600">
          {value === 'Y' ? (
            <span className="px-2 py-1 rounded bg-red-500 text-white">Inactive</span>
          ) : (
            <span className="px-2 py-1 rounded bg-green-500 text-white">Active</span>
          ) || <span className="px-2 py-1 rounded bg-yellow-500 text-white">N/A</span>}
        </div>
      ),
    },    
    {
      title: (
        <HeaderCell
          title="Portal Status"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'Portal_Status'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('Portal_Status'),
      dataIndex: 'Portal_Status',
      key: 'Portal_Status',
      width: 100,
      render: (value: string | undefined) => (
        <div className="font-medium text-gray-700 dark:text-gray-600">
          {value === 'Y' ? (
            <span className="px-2 py-1 rounded bg-red-500 text-white">Inactive</span>
          ) : (
            <span className="px-2 py-1 rounded bg-green-500 text-white">Active</span>
          ) || <span className="px-2 py-1 rounded bg-yellow-500 text-white">N/A</span>}
        </div>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Image"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'Image'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('Image'),
      dataIndex: 'Image',
      key: 'Image',
      width: 100,
      render: (value: string | undefined) => (
        <img
          src={value || 'N'}
          alt="Image"
          style={{
            maxWidth: '32px',
            maxHeight: '32px', 
            borderRadius: '2px',
          }}
        />
      ),
    },
    {
      title: (
        <HeaderCell
          title="Location"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'Location'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('Location'),
      dataIndex: 'Location',
      key: 'Location',
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
      title: (
        <HeaderCell
          title="Status"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'status'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('Status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value: string | undefined) => (
        <div className="font-medium text-gray-700 dark:text-gray-600">
          {value === 'Y' ? (
            <span className="px-2 py-1 rounded bg-red-500 text-white">Inactive</span>
          ) : (
            <span className="px-2 py-1 rounded bg-green-500 text-white">Active</span>
          ) || <span className="px-2 py-1 rounded bg-yellow-500 text-white">N/A</span>}
        </div>
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
            
              <Tooltip
                size="sm"
                content={() => 'Edit Details'}
                placement="top"
                color="invert"
              >
                <Link href={routes.project.editProject(row.id)}>
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
              <DeletePopover
              title={`Delete Project`}
              description={`Are you sure you want to delete this #${row.id} Project?`}
              onDelete={() => onDeleteItem(row.id)}
              id={row.id}
              table={`lead_projects`}
              name={`Project`}
            />
          </div>
        );
      },

    },
  ];

  return columns;
};


