
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
import { PiCopyLight } from "react-icons/pi";
import apiService from '@/utils/apiService';
import {encodeId} from '@/components/encriptdycriptdata';
import { BsRepeat } from "react-icons/bs";
import { PiPlusBold } from 'react-icons/pi';
import { PiFolderLight } from "react-icons/pi";
import { PiUploadSimpleThin } from "react-icons/pi";
import { PiCopyThin } from "react-icons/pi";
import { Button } from '@/components/ui/button';
import { Popover } from '@/components/ui/popover';
import TrashIcon from '@/components/icons/trash';
import { PiTrashFill } from 'react-icons/pi';
import { LiaEditSolid } from "react-icons/lia";
import toast from 'react-hot-toast';
import { useModalHook } from './LinkModel';
import { BsLink } from "react-icons/bs";
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
  const { handleViewInvoice }: any = useModalHook();
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
    
  //   {
  //     title: (
  //       <HeaderCell
  //         title="Booking"
  //         sortable
  //         ascending={
  //           sortConfig?.direction === 'asc' && sortConfig?.key === 'booking_pr'
  //         }
  //       />
  //     ),
  //     onHeaderCell: () => onHeaderCellClick('booking_pr'),
  //     dataIndex: 'booking_pr',
  //     key: 'booking_pr',
  //     width: 100,
      
  //     render: (value: string | undefined) => (
  //       <Text className="font-medium text-gray-700 dark:text-gray-600">
  //         {`${value}%`}
  //       </Text>
  //     ),
  //   },
  //   {
  //     title: (
  //       <HeaderCell
  //         title="Confirmation"
  //         sortable
  //         ascending={
  //           sortConfig?.direction === 'asc' && sortConfig?.key === 'confirmation_Pr'
  //         }
  //       />
  //     ),
  //     onHeaderCell: () => onHeaderCellClick('confirmation_Pr'),
  //     dataIndex: 'confirmation_Pr',
  //     key: 'confirmation_Pr',
  //     width: 100,
  //     render: (value: string | undefined) => (
  //       <Text className="font-medium text-gray-700 dark:text-gray-600">
  //         {`${value}%`}
  //       </Text>
  //     ),
  //   },
  //   {
  //     title: (
  //       <HeaderCell
  //         title="Allocation"
  //         sortable
  //         ascending={
  //           sortConfig?.direction === 'asc' && sortConfig?.key === 'allocation_pr'
  //         }
  //       />
  //     ),
  //     onHeaderCell: () => onHeaderCellClick('allocation_pr'),
  //     dataIndex: 'allocation_pr',
  //     key: 'allocation_pr',
  //     width: 100,
  //     render: (value: string | undefined) => (
  //       <Text className="font-medium text-gray-700 dark:text-gray-600">
  //         {`${value}%`}
  //       </Text>
  //     ),
  //   },
   
  //   {
  //     title: (
  //       <HeaderCell
  //         title="Monthly Installments"
  //         sortable
  //         ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'monthly'}
  //       />
  //     ),
  //     onHeaderCell: () => onHeaderCellClick('monthly'),
  //     dataIndex: 'monthly',
  //     key: 'monthly',
  //     width: 100,
  //     render: (value: string | undefined, record: any) => {
  //       if (value) {
  //         return (
  //           <>
  //             <Text className="font-medium text-gray-700 dark:text-gray-600">
  //               {`${record.monthly_Installments} X ${record.monthly_Installmentspr}%`}
  //             </Text>
  //             <Text className="font-medium text-gray-700 dark:text-gray-600">
  //               {`${record.monthly_Installments * record.monthly_Installmentspr}%`}
  //             </Text>
  //           </>
  //         );
  //       }
  //       return null;
  //     },
  //   }
  //   ,{
  //     title: (
  //       <HeaderCell
  //         title="Half Yearly Installments"
  //         sortable
  //         ascending={
  //           sortConfig?.direction === 'asc' && sortConfig?.key === 'halfyearly'
  //         }
  //       />
  //     ),
  //     onHeaderCell: () => onHeaderCellClick('halfyearly'),
  //     dataIndex: 'halfyearly',
  //     key: 'halfyearly',
  //     width: 100,
  //     render: (value: string | undefined, record: any) => {
  //       if (value) {
  //         return (
  //           <>
  //             <Text className="font-medium text-gray-700 dark:text-gray-600">
  //               {`${record.half_yearly_Installments} X ${record.half_yearly_Installmentspr}%`}
  //             </Text>
  //             <Text className="font-medium text-gray-700 dark:text-gray-600">
  //               {`${record.half_yearly_Installments * record.half_yearly_Installmentspr}%`}
  //             </Text>
  //           </>
  //         );
  //       }
  //       return null;
  //     },
  //   },{
  //     title: (
  //       <HeaderCell
  //         title="Yearly Installments"
  //         sortable
  //         ascending={
  //           sortConfig?.direction === 'asc' && sortConfig?.key === 'yearly'
  //         }
  //       />
  //     ),
  //     onHeaderCell: () => onHeaderCellClick('yearly'),
  //     dataIndex: 'yearly',
  //     key: 'yearly',
  //     width: 100,
  //     render: (value: string | undefined, record: any) => {
  //       if (value) {
  //         return (
  //           <>
  //             <Text className="font-medium text-gray-700 dark:text-gray-600">
  //               {`${record.yearly_Installments} X ${record.yearly_Installmentspr}%`}
  //             </Text>
  //             <Text className="font-medium text-gray-700 dark:text-gray-600">
  //               {`${record.yearly_Installments * record.yearly_Installmentspr}%`}
  //             </Text>
  //           </>
  //         );
  //       }
  //       return null;
  //     },
  //   },{
  //     title: (
  //       <HeaderCell
  //         title="Possession"
  //         sortable
  //         ascending={
  //           sortConfig?.direction === 'asc' && sortConfig?.key === 'possessionpr'
  //         }
  //       />
  //     ),
  //     onHeaderCell: () => onHeaderCellClick('possessionpr'),
  //     dataIndex: 'possessionpr',
  //     key: 'possessionpr',
  //     width: 100,
  //     render: (value: string | undefined) => (
  //       <Text className="font-medium text-gray-700 dark:text-gray-600">
  //         {`${value}%`}
  //       </Text>
  //     ),
  //   },
   
  // {
  //   title: (
  //     <HeaderCell
  //       title="Projects"
  //       sortable
  //       ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'project_names'}
  //     />
  //   ),
  //   onHeaderCell: () => onHeaderCellClick('project_names'),
  //   dataIndex: 'project_names',
  //   key: 'project_names',
  //   width: 100,
  //   render: (value: string[] | undefined) => (
  //     <Text className="font-medium text-gray-700 dark:text-gray-600">
  //       {value? value.join(', ') : 'No Link'}
  //     </Text>
  //   ),
  // },  
  {
    title: (
      <HeaderCell
        title="Linked Projects"
        sortable
        ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'project_names'}
      />
    ),
    onHeaderCell: () => onHeaderCellClick('project_names'),
    dataIndex: 'project_names',
    key: 'project_names',
    width: 200,
    render: (value: string[] | undefined, row: any) => (
      <div className="flex flex-wrap items-center space-x-2">
        {/* Display buttons for each project name */}
        {value && value.length > 0 ? (
          value.map((project, index) => (
         <Link href={routes.project.viewProject(project.replace(/ /g, "_"))}>
            <button
              key={index}
              // onClick={() => routes.project.viewProject(project.replace(/ /g, "_"))}
              className="bg-transperent text-black px-1 py-0.5 rounded hover:bg-gray-100 border text-xs uppercase"
            >
              {project}
            </button>
            </Link>
          ))
        ) : (
          <Text className="font-medium text-gray-700 dark:text-gray-600"></Text>
        )}
  
        {/* Add the action icon with a tooltip */}
        <Tooltip
          size="sm"
          content= {() => "Link this Project"}
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
              <BsLink className="h-4 w-4" />
            </button>
          </ActionIcon>
        </Tooltip>
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
              content={() => 'Generate Payment Plan'}
              placement="top"
              color="invert"
            >
              <Link href={routes.paymentPlans.generatePaymentPlan(encodeId(row.id))}>
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
              content={() => 'Edit Floor'}
              placement="top"
              color="invert"
            >
              <Link href={routes.paymentPlans.editpaymentplan(encodeId(row.id))}>
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
            {!row.project_names ? (
  <Tooltip
    size="sm"
    content={() => 'Delete Floor'}
    placement="top"
    color="invert"
  >
    <ActionIcon
      tag="span"
      size="sm"
      variant="outline"
      className="hover:!border-gray-900 hover:text-gray-700"
    >
      <Popover
        placement="left"
        className="z-50"
        content={({ setOpen }) => (
          <div className="w-56 pb-2 pt-1 text-left rtl:text-right">
            <Title
              as="h6"
              className="mb-0.5 flex items-start text-sm text-gray-700 sm:items-center"
            >
              <PiTrashFill className="me-1 h-[17px] w-[17px]" /> Delete this PaymentPlan
            </Title>
            <Text className="mb-2 leading-relaxed text-gray-500">
              {`Are you sure you want to delete this Floor?`}
            </Text>
            <div className="flex items-center justify-end">
              <Button
                size="sm"
                className="me-1.5 h-7"
                onClick={() => handleDelete(row.id, setOpen)}
              >
                Yes
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={() => setOpen(false)}
              >
                No
              </Button>
            </div>
          </div>
        )}
      >
        <ActionIcon
          size="sm"
          variant="outline"
          aria-label={'Delete Item'}
          className={actionIconClassName}
        >
          <TrashIcon className="h-4 w-4 border:none" />
        </ActionIcon>
      </Popover>
    </ActionIcon>
  </Tooltip>
) : (
  <span className="text-gray-400 cursor-not-allowed border rounded">
    <ActionIcon
          size="sm"
          variant="outline"
          aria-label={'Delete Item'}
          className={actionIconClassName}
          disabled={true}
        >
          <TrashIcon className="h-4 w-4 border:none" />
        </ActionIcon>
  </span>
)}

          </div>
        );
      },

    },
  ];

  return columns;
};



