'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { type Invoice } from '@/data/invoice-data';
import { Title, Text } from '@/components/ui/text';
import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import {useState} from 'react'
import { Switch } from "rizzui";
import { useEmployeeData } from '@/components/employee-data/employeeList';
import { PiGearThin } from "react-icons/pi";
import axios from 'axios';
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
 

  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>({});

  // Function to handle switch change
  const handleSwitchChange = async (checked: boolean, rowId: string) => {
    try {
      const status = checked ? 'Y' : 'N';
      await axios.post('/api/update-status', { id: rowId, sms: status });

      // Update the local state to reflect the switch status
      setSwitchStates((prevState) => ({
        ...prevState,
        [rowId]: checked,
      }));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
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
      width: 100,
      
      render: (value: any, row: any) => {
        const fullName = `${row.first_name || 'N/A'} ${row.last_name || 'N/A'}`;
        return (
          <div>
            <Text className="font-medium text-gray-700 dark:text-gray-600">
              {fullName}
            </Text>
            <div>
              <span>
                Status: <div style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: row.del === 'Y' ? 'red' : (row.status === 'Y' ? 'green' : 'red'), marginRight: '5px' }}></div>
              </span>
              <span>
                SMS: <div style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: row.del === 'Y' ? 'red' : (row.sms === 'Y' ? 'green' : 'red') }}></div>
              </span>
            </div>
          </div>
        );
      },
    },
    // {
    //   title: (
    //     <HeaderCell
    //       title="Designation"
    //       sortable
    //       ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'designation'}
    //     />
    //   ),
    //   onHeaderCell: () => onHeaderCellClick('designation'),
    //   dataIndex: 'designation',
    //   key: 'designation',
    //   width: 200,
    //   render: (value: string | undefined) => (
    //     <Text className="font-medium text-gray-700 dark:text-gray-600">
    //       {value || 'N/A'}
    //     </Text>
    //   ),
    // },
    // {
    //   title: (
    //     <HeaderCell
    //       title="Department"
    //       sortable
    //       ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'department'}
    //     />
    //   ),
    //   onHeaderCell: () => onHeaderCellClick('department'),
    //   dataIndex: 'department',
    //   key: 'department',
    //   width: 200,
    //   render: (value: string | undefined) => (
    //     <Text className="font-medium text-gray-700 dark:text-gray-600">
    //       {value || 'N/A'}
    //     </Text>
    //   ),
    // },
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
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'del'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('del'),
      dataIndex: 'del',
      key: 'del',
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
      width: 70,
      render: (_: string, row: any) => (
        <div className="flex items-center">
          
          <Tooltip
            size="sm"
            content={() => 'Change status'}
            placement="top"
            color="invert"
          >
            <Switch
              variant="outline"
              
              onChange={(checked) => handleSwitchChange(checked, row.id)}
            />
          </Tooltip>
          
        </div>
      ),
    },
  ];
  return columns;
};
