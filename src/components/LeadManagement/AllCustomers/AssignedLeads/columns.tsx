'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { type Invoice } from '@/data/invoice-data';
import { routes } from '@/config/routes';
import { Title, Text } from '@/components/ui/text';
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
export const useGetColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
}: Columns) => {
 

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
          title="Assigned On"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'assigned_on'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('assigned_on'),
      dataIndex: 'assigned_on',
      key: 'assigned_on',
      width: 200,
      render: (value:any) => {
        if (value === undefined) {
          return <Text className="font-medium text-gray-700 dark:text-gray-600">N/A</Text>;
        }
        
        let date = new Date(value * 1000);
    
        // Define an array of month names
        let monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
    
        // Get the components of the date
        let year = date.getUTCFullYear();
        let month = monthNames[date.getUTCMonth()];
        let day = date.getUTCDate();
    
        // Format the date as Month Day, Year
        let formattedDate = `${month} ${day}, ${year}`;
    
        return (
          <Text className="font-medium text-gray-700 dark:text-gray-600">
            {formattedDate}
          </Text>
        );
      },
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
          ) : (
            <span className="px-2 py-1 rounded bg-red-500 text-white">Closed</span>
          ) || <span className="px-2 py-1 rounded bg-yellow-500 text-white">N/A</span>}
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
            {/* <button onClick={() => handleClick(row.id)}> */}
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
          {/* </button> */}
          </Tooltip>
         
        </div>
      ),
    },
  ];

  return columns;
};


