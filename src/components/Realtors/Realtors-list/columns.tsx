// columns/businessProfilesColumns.tsx
'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import { HeaderCell } from '@/components/ui/table';
import { Text } from '@/components/ui/text';
import { Tooltip } from '@/components/ui/tooltip';
import { ActionIcon } from '@/components/ui/action-icon';
import EyeIcon from '@/components/icons/eye';
import { LiaEditSolid } from 'react-icons/lia';
import DeletePopover from '@/app/shared/delete-popover1';
import { useSession } from 'next-auth/react';
import { routes } from '@/config/routes';

type ColumnsProps = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
};

export const useBusinessProfilesColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
}: ColumnsProps) => {
  const { data: session } = useSession();
  const memoizedSession = useMemo(() => session, [session]);

  const columns = [
    {
      title: (
        <HeaderCell
          title="ID"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'id'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('id'),
      dataIndex: 'id',
      key: 'id',
      width: 70,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">{value || '—'}</Text>
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
      width: 220,
      render: (v: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">{v || '—'}</Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="CNIC"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'cnic'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('cnic'),
      dataIndex: 'cnic',
      key: 'cnic',
      width: 160,
      render: (v: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">{v || '—'}</Text>
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
      width: 150,
      render: (v: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">{v || '—'}</Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Email"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'email'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('email'),
      dataIndex: 'email',
      key: 'email',
      width: 220,
      render: (v: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">{v || '—'}</Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="City"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'city'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('city'),
      dataIndex: 'city',
      key: 'city',
      width: 140,
      render: (v: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">{v || '—'}</Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Office Name"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'office_name'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('office_name'),
      dataIndex: 'office_name',
      key: 'office_name',
      width: 220,
      render: (v: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">{v || '—'}</Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Bank Name"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'bank_name'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('bank_name'),
      dataIndex: 'bank_name',
      key: 'bank_name',
      width: 180,
      render: (v: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">{v || '—'}</Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Filer Status"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'filer_status'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('filer_status'),
      dataIndex: 'filer_status',
      key: 'filer_status',
      width: 140,
      render: (v: string | undefined) => (
        <div className="font-medium text-gray-700 dark:text-gray-600">
          {v === 'Active Filer' ? (
            <span className="px-2 py-1 rounded bg-green-500 text-white">Active Filer</span>
          ) : v === 'Non-Filer' ? (
            <span className="px-2 py-1 rounded bg-red-500 text-white">Non-Filer</span>
          ) : (
            <span className="px-2 py-1 rounded bg-gray-400 text-white">—</span>
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
      render: (v: 'N' | 'Y' | undefined) => (
        <div className="font-medium text-gray-700 dark:text-gray-600">
          {v === 'Y' ? (
            <span className="px-2 py-1 rounded bg-red-500 text-white">Inactive</span>
          ) : (
            <span className="px-2 py-1 rounded bg-green-500 text-white">Active</span>
          )}
        </div>
      ),
    },
    {
      title: <HeaderCell title="Action" />,
      dataIndex: 'action',
      key: 'action',
      width: 200,
      render: (_: string, row: any) => {
        return (
          <div className="flex items-center justify-start gap-3 pe-3">
            <Tooltip size="sm" content={() => 'View Details'} placement="top" color="invert">
              {/* Update this to your actual view route for business profiles */}
              <Link href={`/business-profiles/${row.id}`}>
                <ActionIcon tag="span" size="sm" variant="outline" className="hover:!border-gray-900 hover:text-gray-700">
                  <EyeIcon className="h-4 w-4" />
                </ActionIcon>
              </Link>
            </Tooltip>

            {memoizedSession?.user?.View_permission >= 9 && (
              <>
                <Tooltip size="sm" content={() => 'Edit Details'} placement="top" color="invert">
                  {/* Update this to your actual edit route for business profiles */}
                  <Link href={routes.realtors.edit(row.id)}>
                    <ActionIcon tag="span" size="sm" variant="outline" className="hover:!border-gray-900 hover:text-gray-700">
                      <LiaEditSolid className="h-4 w-4" />
                    </ActionIcon>
                  </Link>
                </Tooltip>

                <DeletePopover
                  title={`Delete Profile`}
                  description={`Are you sure you want to delete profile #${row.id}?`}
                  onDelete={() => onDeleteItem(row.id)}
                  id={row.id}
                  table={`business_profiles`}   // <-- IMPORTANT: correct table
                  name={`Profile`}
                  inactive="No"
                />
              </>
            )}
          </div>
        );
      },
    },
  ];

  return columns;
};
