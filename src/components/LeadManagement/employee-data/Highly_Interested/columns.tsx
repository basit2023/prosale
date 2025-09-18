'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { Text } from '@/components/ui/text';
import { HeaderCell } from '@/components/ui/table';
import { ActionIcon } from '@/components/ui/action-icon';
import EyeIcon from '@/components/icons/eye';
import { useSession } from 'next-auth/react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip } from '@/components/ui/tooltip';

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
};

// Reusable wrapper to make a cell clickable to the row's details page
const RowLink: React.FC<{ id: string; children: React.ReactNode; className?: string }> = ({
  id,
  children,
  className,
}) => (
  <Link
    href={routes.leads.edit(id)}
    className={className ? `block ${className}` : 'block'}
    draggable={false}
  >
    {children}
  </Link>
);

// ---------- NEW: inline history renderer (simple, dependency-free) ----------
function HistoryInline({ row }: { row: any }) {
  const items = Array.isArray(row.history) ? row.history : [];
  if (!items.length) return null;

  return (
    <div
      className="mt-2"
      onClick={(e) => {
        // prevent row navigation when interacting with the history
        e.stopPropagation();
      }}
    >
      <details className="group open:mt-1">
        <summary className="cursor-pointer text-[12px] text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
          History ({items.length})
        </summary>

        <div className="mt-2 space-y-1 max-h-44 overflow-auto pr-1">
          {items.map((h: any) => (
            <div
              key={h.id}
              className="text-[12px] rounded border border-gray-200 dark:border-gray-800 px-2 py-1 flex items-center justify-between"
              title={`Lead #${h.id}`}
            >
              <div className="truncate">
                {/* <span className="font-medium">#{h.id}</span>
                {' • '} */}
                <span className="truncate">{h.project_name || '—'}</span>
                {' • '}
                <span className="uppercase">{h.status || '—'}</span>
                {' • '}
                <span>{h.assigned_to || '—'}</span>
              </div>
              <div className="shrink-0 text-[11px] text-gray-500 ml-2">
                {h.last_updated ? String(h.last_updated).slice(0, 10) : '—'}
              </div>
              <div className="shrink-0 text-[11px] text-gray-500 ml-2">
               <Tooltip size="sm" content={() => 'View Details'} placement="top" color="invert">
            <Link href={routes.leads.edit(h.id)}>
              <ActionIcon tag="span" size="sm" variant="outline" className="hover:!border-gray-900 hover:text-gray-700">
                <EyeIcon className="h-4 w-4" />
              </ActionIcon>
            </Link>
          </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

// --------------------------------------------------------------------------

export const useGetColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
}: Columns) => {
  const { data: session } = useSession();
  const memoizedSession = useMemo(() => session, [session]);

  const columns = [
    ...((memoizedSession?.user?.permission) >= 4
      ? [
          {
            title: (
              <div className="ps-2">
                <Checkbox
                  title={'Select All'}
                  onChange={handleSelectAll}
                  checked={checkedItems.length === data.length}
                  className="cursor-pointer"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                />
              </div>
            ),
            dataIndex: 'checked',
            key: 'checked',
            width: 30,
            render: (_: any, row: any) => (
              <div className="inline-flex ps-2" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  className="cursor-pointer"
                  checked={checkedItems.includes(row.id)}
                  {...(onChecked && { onChange: () => onChecked(row.id) })}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
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
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (_: any, row: any) => {
        const fullName = `${row.name || 'N/A'}`;
        const statusStyle = { color: 'black' };
        return (
          <RowLink id={row.id}>
            <Text className="font-medium text-gray-700 dark:text-gray-600">
              {fullName}
              <span style={statusStyle}>
                <div
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: row.view_dt === 'new_lead' ? 'red' : 'none',
                    marginLeft: '10px',
                  }}
                />
              </span>
            </Text>
          </RowLink>
        );
      },
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
      render: (value: any, row: any) => (
        <RowLink id={row.id}>
          <Text className="font-medium text-gray-700 dark:text-gray-600">
            {row.view_dt === 'new_lead' ? 'Lead Not Opened' : value || 'N/A'}
          </Text>
        </RowLink>
      ),
    },

    {
      title: (
        <HeaderCell
          title="Project Name"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'project_name'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('project_name'),
      dataIndex: 'project_name',
      key: 'project_name',
      width: 200,
      render: (value: string | undefined, row: any) => (
        <RowLink id={row.id}>
          <Text className="font-medium text-gray-700 dark:text-gray-600">
            {value || 'N/A'}
          </Text>
        </RowLink>
      ),
    },

    {
      title: (
        <HeaderCell
          title="Assigned On"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'last_updated'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('last_updated'),
      dataIndex: 'last_updated',
      key: 'last_updated',
      width: 200,
      render: (value: string | undefined, row: any) => (
        <RowLink id={row.id}>
          <Text className="font-medium text-gray-700 dark:text-gray-600">
            {value || 'N/A'}
          </Text>
        </RowLink>
      ),
    },

    {
      title: (
        <HeaderCell
          title="Interested In"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'interested_in'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('interested_in'),
      dataIndex: 'interested_in',
      key: 'interested_in',
      width: 200,
      render: (value: string | undefined, row: any) => (
        <RowLink id={row.id}>
          <Text className="font-medium text-gray-700 dark:text-gray-600">
            {value || 'N/A'}
          </Text>
        </RowLink>
      ),
    },

    // ---------- UPDATED COLUMN: History lives under Assigned To ----------
    {
      title: (
        <HeaderCell
          title="Assigned To"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'assigned_to'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('assigned_to'),
      dataIndex: 'assigned_to',
      key: 'assigned_to',
      width: 280, // a bit wider to fit the history toggle
      render: (value: string | undefined, row: any) => (
        <div className="w-full">
          {/* keep the top line clickable */}
          <RowLink id={row.id}>
            <Text className="font-medium text-gray-700 dark:text-gray-600">
              {value || 'N/A'}
            </Text>
          </RowLink>

          {/* inline history (not clickable to row) */}
          {Array.isArray(row.history) && row.history.length > 1  && (memoizedSession?.user?.permission) >= 4 && (
            <HistoryInline row={row} />
          )}
        </div>
      ),
    },
    // --------------------------------------------------------------------

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
      width: 200,
      render: (value: string | undefined, row: any) => (
        <RowLink id={row.id}>
          <Text className="font-medium text-gray-700 dark:text-gray-600">
            {value || 'N/A'}
          </Text>
        </RowLink>
      ),
    },

    {
      title: (
        <HeaderCell
          title="Status"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'status'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('status'),
      dataIndex: 'status',
      key: 'status',
      width: 200,
      render: (_: any, row: any) => (
        <RowLink id={row.id} className="w-full">
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
        </RowLink>
      ),
    },

    ...((memoizedSession?.user?.permission) >= 4
      ? [
          {
            title: (
              <HeaderCell
                title="Lead Pass"
                sortable
                ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'lead_pass'}
              />
            ),
            onHeaderCell: () => onHeaderCellClick('lead_pass'),
            dataIndex: 'lead_pass',
            key: 'lead_pass',
            width: 200,
            render: (_: any, row: any) => {
              const dotColor = row.view_dt === 'new_lead' ? 'red' : 'green';
              return (
                <RowLink id={row.id}>
                  <div className="flex items-center gap-2">
                    <Text className="font-medium text-gray-700 dark:text-gray-600">
                      {row.lead_pass || 'N/A'}
                    </Text>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
                  </div>
                </RowLink>
              );
            },
          },
        ]
      : []),

    {
      title: <HeaderCell title="Action" />,
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (_: string, row: any) => (
        <div
          className="flex items-center justify-start gap-3 pe-3 ml-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip size="sm" content={() => 'View Details'} placement="top" color="invert">
            <Link href={routes.leads.edit(row.id)}>
              <ActionIcon tag="span" size="sm" variant="outline" className="hover:!border-gray-900 hover:text-gray-700">
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
