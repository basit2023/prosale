'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { type Invoice } from '@/data/invoice-data';
import { routes } from '@/config/routes';
import { Title, Text } from '@/components/ui/text';
import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { ActionIcon } from '@/components/ui/action-icon';
import PencilIcon from '@/components/icons/pencil';
import DeletePopover from '@/app/shared/delete-popover1';
import EyeIcon from './../../icons/eye';
import { useModal } from '@/app/shared/modal-views/use-modal';
import useModalHook from './modelHook';
import { useEmployeeData } from '@/components/employee-data/employeeList';

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
};
export const useGetColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
}: Columns) => {
  const { handleViewInvoice }: any = useModalHook();
  const {setValue1}=useEmployeeData()

  const columns = [
    {
      title: (
        <HeaderCell
          title="Name"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'name'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('name'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (value: any, row: any) => {
        const fullName = `${row.first_name || 'N/A'} ${row.last_name || 'N/A'}`;

        return (
          <div>
            <Text className="font-medium text-gray-700 dark:text-gray-600">
              {fullName}
            </Text>
            <div>
              <span>
                Status: <div style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: row.status === 'Y' ? 'green' : 'red', marginRight: '5px' }}></div>
              </span>
              <span>
                SMS: <div style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: row.sms === 'Y' ? 'green' : 'red' }}></div>
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <HeaderCell
          title="Designation"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'designation'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('designation'),
      dataIndex: 'designation',
      key: 'designation',
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
          title="Department"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'department'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('department'),
      dataIndex: 'department',
      key: 'department',
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
          title="Mobile"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'mobile'}
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
          title="Company"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'company_title'}
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
          title="Assigned Office"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'office'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('office'),
      dataIndex: 'office',
      key: 'office',
      width: 150,
      render: (value: string[] | undefined) => (
        <div className="office-cell">
          {value ? (
            <ul className="office-list">
              {value.map((office: any, index) => (
                <li key={index} className="text-xs bg-gray-100 rounded p-1 mb-1">
                  {office.office_name}
                </li>
              ))}
            </ul>
          ) : (
            <span className="no-office text-xs bg-gray-200 rounded p-1">N/A</span>
          )}
        </div>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Status"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'del'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('del'),
      dataIndex: 'del',
      key: 'del',
      width: 120,
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
      width: 140,
      render: (_: string, row: any) => (
        <div className="flex items-center justify-end gap-3 pe-3">
          <Tooltip
            size="sm"
            content={() => 'Edit Employee Details'}
            placement="top"
            color="invert"
          >
            <Link href={routes.employee.edit(row.id)}>
              <ActionIcon
                tag="span"
                size="sm"
                variant="outline"
                className="hover:!border-gray-900 hover:text-gray-700"
              >
                <PencilIcon className="h-4 w-4" />
              </ActionIcon>
            </Link>
          </Tooltip>
          <Tooltip
            size="sm"
            content={() => 'Change status'}
            placement="top"
            color="invert"
          >
            <ActionIcon
              tag="span"
              size="sm"
              variant="outline"
              className="hover:!border-gray-900 hover:text-gray-700"
            >
              <button onClick={() => handleViewInvoice(row.id)}>
                <EyeIcon className="h-4 w-4" />
              </button>
            </ActionIcon>
          </Tooltip>
          <Tooltip
            size="sm"
            content={() => row.del === 'Y' ? 'Inactive employee' : 'Delete Employee'}
            placement="top"
            color="invert"
          >
            <div className="relative">
              <ActionIcon
                tag="span"
                size="sm"
                variant="outline"
                className={`hover:!border-gray-900 hover:text-gray-700 ${row.del === 'Y' ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {row.del !== 'Y' && (
                  <DeletePopover
                    title={`Delete Employee`}
                    description={`Are you sure you want to delete this #${row.id} employee?`}
                    onDelete={() => onDeleteItem(row.id)}
                    id={row.id}
                    table={`users`}
                    name={`Employee`}
                    inactive={"No"}
                  
                  />
                )}
              
              {row.del === 'Y' && (
                <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 bg-gray-100">
                  <DeletePopover
                    title={`Inactive Employee`}
                    description={`Are you sure you want to inactive this #${row.id} employee?`}
                    onDelete={() => onDeleteItem(row.id)}
                    id={row.id}
                    table={`users`}
                    name={`Employee`}
                    inactive={"Yes"}
                 
                  />
                </span>
              )}
              </ActionIcon>
            </div>
          </Tooltip>
        </div>
      ),
    },
  ];
  return columns;
};
