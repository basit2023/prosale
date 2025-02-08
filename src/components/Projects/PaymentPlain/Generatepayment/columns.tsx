
'use client';

import { Title, Text } from '@/components/ui/text';

import { HeaderCell } from '@/components/ui/table';
import apiService from '@/utils/apiService';
import {encodeId} from '@/components/encriptdycriptdata';

import toast from 'react-hot-toast';

import { useEmployeeData } from '@/components/employee-data/employeeList';
type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  id?:any;
  slug?:any;
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
console.log("the data at the columns is:",data)
 // eslint-disable-next-line react-hooks/exhaustive-deps
 const actionIconClassName = "rizzui-action-icon-root inline-flex items-center justify-center active:enabled:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-50 transition-colors duration-200 p-0.5 w-7 h-7 rounded-md bg-transparent border-0 focus-visible:ring-offset-2 border-gray-300 hover:enabled:border-0 focus-visible:enabled:border-0 focus-visible:ring-gray-900/30";
 const handleDelete = async (id: any,  setOpen: (value: boolean) => void) => {
  const data = { id };
  try {
    const response = await apiService.delete('/delete-paymentplan', { data });
    if (response.data.success) {
      toast.success(response.data.message);
      setOpen(false);  // Close the popover
    } else {
      toast.error("There was an issue while deleting the Payment Plan");
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || "An error occurred");
  }
};
 



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
          title="Preset Name"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'preset_name'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('preset_name'),
      dataIndex: 'preset_name',
      key: 'preset_name',
      width: 100,
      render: (value: string | undefined, record: any) => (
        <>
          <Text className="font-medium text-gray-700 dark:text-gray-600 uppercase">
            {value || 'N/A'}
          </Text>
          {/* <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Area: {record.size || 'N/A'} Sqft | Minimum
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Floor Rate: {record.SqFtRate || 'N/A'} Rs Per Sqft
          </p> */}
        </>
      ),
    },
    

    {
      title: (
        <HeaderCell
          title="Years"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'preset_year'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('preset_year'),
      dataIndex: 'preset_year', // Check this key
      key: 'preset_year',
      width: 50,
      render: (value: string | undefined) => (
        
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value}
        </Text>
      ),
    },
    
    data[0]?.booking_pr && {
      title: (
        <HeaderCell
          title="Booking"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'booking_pr'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('booking_pr'),
      dataIndex: 'booking_pr',
      key: 'booking_pr',
      width: 100,
      
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {`${value}%`}
        </Text>
      ),
    },
    data[0]?.confirmation_Pr && {
      title: (
        <HeaderCell
          title="Confirmation"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'confirmation_Pr'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('confirmation_Pr'),
      dataIndex: 'confirmation_Pr',
      key: 'confirmation_Pr',
      width: 100,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {`${value}%`}
        </Text>
      ),
    },
    data[0]?.allocation_pr && {
      title: (
        <HeaderCell
          title="Allocation"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'allocation_pr'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('allocation_pr'),
      dataIndex: 'allocation_pr',
      key: 'allocation_pr',
      width: 100,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {`${value}%`}
        </Text>
      ),
    },
   
    data[0]?.monthly && {
      title: (
        <HeaderCell
          title="Monthly Installments"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'monthly'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('monthly'),
      dataIndex: 'monthly',
      key: 'monthly',
      width: 100,
      render: (value: string | undefined, record: any) => {
        if (value) {
          return (
            <>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {`${record.monthly_Installments} X ${record.monthly_Installmentspr}%`}
              </Text>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {`${record.monthly_Installments * record.monthly_Installmentspr}%`}
              </Text>
            </>
          );
        }
        return null;
      },
    }
    ,
    data[0]?.halfyearly && {
      title: (
        <HeaderCell
          title="Half Yearly Installments"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'halfyearly'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('halfyearly'),
      dataIndex: 'halfyearly',
      key: 'halfyearly',
      width: 100,
      render: (value: string | undefined, record: any) => {
        if (value) {
          return (
            <>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {`${record.half_yearly_Installments} X ${record.half_yearly_Installmentspr}%`}
              </Text>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {`${record.half_yearly_Installments * record.half_yearly_Installmentspr}%`}
              </Text>
            </>
          );
        }
        return null;
      },
    },
    data[0]?.yearly && {
      title: (
        <HeaderCell
          title="Yearly Installments"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'yearly'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('yearly'),
      dataIndex: 'yearly',
      key: 'yearly',
      width: 100,
      render: (value: string | undefined, record: any) => {
        if (value) {
          return (
            <>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {`${record.yearly_Installments} X ${record.yearly_Installmentspr}%`}
              </Text>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {`${record.yearly_Installments * record.yearly_Installmentspr}%`}
              </Text>
            </>
          );
        }
        return null;
      },
    },
    data[0]?.possessionpr && {
      title: (
        <HeaderCell
          title="Possession"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'possessionpr'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('possessionpr'),
      dataIndex: 'possessionpr',
      key: 'possessionpr',
      width: 100,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value? `${value}%`: ""} 
        </Text>
      ),
    },
   
    data[0]?.transferpr && {
   
     title: (
        <HeaderCell
          title="Transfer"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'transferpr'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('transferpr'),
      dataIndex: 'transferpr',
      key: 'transferpr',
      width: 100,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value? `${value}%`: ""} 
        </Text>
      ),
    },
    data[0]?.extrapr1 && {
      title: (
        <HeaderCell
          title="Extra Installments 1"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'extrainstall1'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('extrainstall1'),
      dataIndex: 'extrainstall1',
      key: 'extrainstall1',
      width: 100,
      render: (value: string | undefined, record: any) => {
        if (value) {
          return (
            <>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {`${record.extrainstall1} X ${record.extrapr1}%`}
              </Text>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {`${record.extrainstall1 * record.extrapr1}%`}
              </Text>
            </>
          );
        }
        return null;
      },
    },
    data[0]?.extrapr2 && {
      title: (
        <HeaderCell
          title="Extra Installments 2"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'extrapr2'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('extrapr2'),
      dataIndex: 'extrapr2',
      key: 'extrapr2',
      width: 100,
      render: (value: string | undefined, record: any) => {
        if (value) {
          return (
            <>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {`${record.extrainstall2} X ${record.extrapr2}%`}
              </Text>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {`${record.extrainstall2 * record.extrapr2}%`}
              </Text>
            </>
          );
        }
        return null;
      },
    },
    data[0]?.extrapr3 && {
      title: (
        <HeaderCell
          title="Extra Installments 3"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'extrapr3'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('extrapr3'),
      dataIndex: 'extrapr3',
      key: 'extrapr3',
      width: 100,
      render: (value: string | undefined, record: any) => {
        if (value) {
          return (
            <>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {`${record.extrainstall3} X ${record.extrapr3}%`}
              </Text>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {`${record.extrainstall3 * record.extrapr3}%`}
              </Text>
            </>
          );
        }
        return null;
      },
    },
    data[0]?.extrapr4 && {
      title: (
        <HeaderCell
          title="Extra Installments 4"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'extrapr4'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('extrapr4'),
      dataIndex: 'extrapr4',
      key: 'extrapr4',
      width: 100,
      render: (value: string | undefined, record: any) => {
        if (value) {
          return (
            <>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {`${record.extrainstall4} X ${record.extrapr4}%`}
              </Text>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {`${record.extrainstall4 * record.extrapr4}%`}
              </Text>
            </>
          );
        }
        return null;
      },
    },
    data[0]?.extrapr5 && {
      title: (
        <HeaderCell
          title="Extra Installments 5"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'extrapr5'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('extrapr5'),
      dataIndex: 'extrapr5',
      key: 'extrapr5',
      width: 100,
      render: (value: string | undefined, record: any) => {
        if (value) {
          return (
            <>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {`${record.extrainstall5} X ${record.extrapr5}%`}
              </Text>
              <Text className="font-medium text-gray-700 dark:text-gray-600">
                {`${record.extrainstall5 * record.extrapr5}%`}
              </Text>
            </>
          );
        }
        return null;
      },
    },
 
  ];

  return columns;
};



