
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
import { useModalHook } from './floorAction/UpdateRatesModel';
import {useModalHook1} from './floorAction/PaymentPlanModel'
import { PiCopyLight } from "react-icons/pi";
import apiService from '@/utils/apiService';
import { LiaEditSolid } from "react-icons/lia";
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
  const { handleViewInvoice }: any = useModalHook();
  const { handlePaymentplan }: any = useModalHook1();

 // eslint-disable-next-line react-hooks/exhaustive-deps
 const actionIconClassName = "rizzui-action-icon-root inline-flex items-center justify-center active:enabled:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-50 transition-colors duration-200 p-0.5 w-7 h-7 rounded-md bg-transparent border-0 focus-visible:ring-offset-2 border-gray-300 hover:enabled:border-0 focus-visible:enabled:border-0 focus-visible:ring-gray-900/30";
 const handleDelete = async (id: any, slug: any, setOpen: (value: boolean) => void) => {
  const data = { id, slug };
  try {
    const response = await apiService.delete('/delete-floor', { data });
    if (response.data.success) {
      toast.success(response.data.message);
      setOpen(false);  // Close the popover
    } else {
      toast.error("There was an issue while deleting the floor");
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
          title="Floor"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'floor'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('floor'),
      dataIndex: 'floor',
      key: 'floor',
      width: 400,
      render: (value: string | undefined, record: any) => (
        <>
          <Text className="font-medium text-gray-700 dark:text-gray-600 uppercase">
            {value || 'N/A'}
          </Text>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Total Area: {record.size || 'N/A'} Sqft | Minimum
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Floor Rate: {record.SqFtRate || 'N/A'} Rs Per Sqft
          </p>
        </>
      ),
    },
    

    {
      title: (
        <HeaderCell
          title="Total Units"
          sortable
          ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'total_units'}
        />
      ),
      onHeaderCell: () => onHeaderCellClick('total_units'),
      dataIndex: 'total_units', // Check this key
      key: 'total_units',
      width: 50,
      render: (value: string | undefined) => (
        
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value}
        </Text>
      ),
    },
    
    {
      title: (
        <HeaderCell
          title="Sold Unit"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'sold_units'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('sold_units'),
      dataIndex: 'sold_units',
      key: 'sold_units',
      width: 100,
      
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value}
        </Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Hold Units"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'hold_units'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('hold_units'),
      dataIndex: 'hold_units',
      key: 'hold_units',
      width: 100,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value}
        </Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Available Units"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'available_units'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('available_units'),
      dataIndex: 'available_units',
      key: 'available_units',
      width: 100,
      render: (value: string | undefined) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          {value}
        </Text>
      ),
    },
   
    
   
    {
      title: (
        <HeaderCell
          title="Status"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'del'
          }
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
              <Link href={routes.project.floorunites(row.slug, encodeId(row.id))}>
                <ActionIcon
                  tag="span"
                  size="sm"
                  variant="outline"
                  className="hover:!border-gray-900 hover:text-gray-700 w-20"
                >
                  <PiFolderLight className="h-4 w-4" /> View
                </ActionIcon>
              </Link>
            </Tooltip>
            <Tooltip
              size="sm"
              content={() => 'Update Rates'}
              placement="top"
              color="invert"
            >
              
                <ActionIcon
                  tag="span"
                  size="sm"
                  variant="outline"
                  className="hover:!border-gray-900 hover:text-gray-700"
                >
                  <button onClick={() => handleViewInvoice(row.slug, row.id, row.floor, row.SqFtRate)}>
                <BsRepeat className="h-4 w-4" />
              </button>
                 
                </ActionIcon>
       
            </Tooltip>
            <Tooltip
              size="sm"
              content={() => 'Add New Unites to this floor'}
              placement="top"
              color="invert"
            >
              <Link href={routes.project.addnewunites(row.slug, encodeId(row.id))}>
                <ActionIcon
                  tag="span"
                  size="sm"
                  variant="outline"
                  className="hover:!border-gray-900 hover:text-gray-700 w-20"
                >
                  <PiPlusBold className="h-4 w-4" /> Units
                </ActionIcon>
              </Link>
            </Tooltip>
            <Tooltip
              size="sm"
              content={() => 'View Details'}
              placement="top"
              color="invert"
              
            >
              <button onClick={() => handlePaymentplan(row.slug, row.id, row.floor, row.SqFtRate)}>
                <ActionIcon
                  tag="span"
                  size="sm"
                  variant="outline"
                  className="hover:!border-gray-900 hover:text-gray-700 w-36"
                >
                  Payment plan
                </ActionIcon>
              </button>
            </Tooltip>
            
            <Tooltip
              size="sm"
              content={() => 'Edit Floor'}
              placement="top"
              color="invert"
            >
              <Link href={routes.project.editFloor(row.slug, encodeId(row.id))}>
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
            <Tooltip
              size="sm"
              content={() => 'Duplicate this Floor'}
              placement="top"
              color="invert"
            >
              <Link href={routes.project.duplicatefloor(row.slug, encodeId(row.id))}>
                <ActionIcon
                  tag="span"
                  size="sm"
                  variant="outline"
                  className="hover:!border-gray-900 hover:text-gray-700"
                >
                 
                  <PiCopyLight  className="h-4 w-4" />
                </ActionIcon>
              </Link>
            </Tooltip>
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
                  <PiUploadSimpleThin className="h-4 w-4" />
                </ActionIcon>
              </Link>
            </Tooltip>
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
                        <PiTrashFill className="me-1 h-[17px] w-[17px]" /> Delete this Floor
                      </Title>
                      <Text className="mb-2 leading-relaxed text-gray-500">
                        {`Are you sure you want to delete this Floor?`}
                      </Text>
                      <div className="flex items-center justify-end">
                        <Button size="sm" className="me-1.5 h-7" onClick={() => handleDelete(row.id, row.slug, setOpen)}>
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
                    aria-label={'Activate Item'}
                    className={actionIconClassName}
                  >
                    <TrashIcon className="h-4 w-4 border:none" />
                  </ActionIcon>
                </Popover>
             </ActionIcon>
              </Tooltip>
              
          </div>
        );
      },

    },
  ];

  return columns;
};











// 'use client';
// import React, { useEffect } from 'react';
// import Link from 'next/link';
// import { type Invoice } from '@/data/invoice-data';
// import { routes } from '@/config/routes';
// import { Title, Text } from '@/components/ui/text';
// import { Badge } from '@/components/ui/badge';
// import { Tooltip } from '@/components/ui/tooltip';
// import DeletePopover from '@/app/shared/delete-popover1';
// import { HeaderCell } from '@/components/ui/table';
// import { ActionIcon } from '@/components/ui/action-icon';
// import EyeIcon from '@/components/icons/eye';
// import { useModalHook } from './floorAction/UpdateRatesModel';
// import { PiCopyLight } from "react-icons/pi";
// import apiService from '@/utils/apiService';
// import { LiaEditSolid } from "react-icons/lia";
// import {encodeId} from '@/components/encriptdycriptdata';
// import { BsRepeat } from "react-icons/bs";
// import { PiPlusBold } from 'react-icons/pi';
// import { PiFolderLight } from "react-icons/pi";
// import { PiUploadSimpleThin } from "react-icons/pi";
// import { PiCopyThin } from "react-icons/pi";
// type Columns = {
//   data: any[];
//   sortConfig?: any;
//   handleSelectAll: any;
//   checkedItems: string[];
//   onDeleteItem: (id: string) => void;
//   onHeaderCellClick: (value: string) => void;
//   onChecked?: (id: string) => void;
// };
// export const useGetColumns = ({
//   data,
//   sortConfig,
//   checkedItems,
//   onDeleteItem,
//   onHeaderCellClick,
//   handleSelectAll,
//   onChecked,
// }: Columns) => {
//   const { handleViewInvoice }: any = useModalHook();
//  // eslint-disable-next-line react-hooks/exhaustive-deps

 



//   const columns = [
   
//     {
//       title: (
//         <HeaderCell
//           title="ID:"
//           sortable
//           ascending={
//             sortConfig?.direction === 'asc' && sortConfig?.key === 'id'
//           }
//         />
//       ),
//       onHeaderCell: () => onHeaderCellClick('id'),
//       dataIndex: 'id',
//       key: 'id',
//       width: 5,
//       render: (value: string | undefined) => (
//         <Text className="font-medium text-gray-700 dark:text-gray-600">
//           {value || 'N/A'}
//         </Text>
//       ),
//     },

//     {
//       title: (
//         <HeaderCell
//           title="Floor"
//           sortable
//           ascending={
//             sortConfig?.direction === 'asc' && sortConfig?.key === 'floor'
//           }
//         />
//       ),
//       onHeaderCell: () => onHeaderCellClick('floor'),
//       dataIndex: 'floor',
//       key: 'floor',
//       width: 400,
//       render: (value: string | undefined, record: any) => (
//         <>
//           <Text className="font-medium text-gray-700 dark:text-gray-600 uppercase">
//             {value || 'N/A'}
//           </Text>
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             Total Area: {record.size || 'N/A'} Sqft | Minimum
//           </p>
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             Floor Rate: {record.SqFtRate || 'N/A'} Rs Per Sqft
//           </p>
//         </>
//       ),
//     },
    

//     {
//       title: (
//         <HeaderCell
//           title="Total Units"
//           sortable
//           ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'total_units'}
//         />
//       ),
//       onHeaderCell: () => onHeaderCellClick('total_units'),
//       dataIndex: 'total_units', // Check this key
//       key: 'total_units',
//       width: 50,
//       render: (value: string | undefined) => (
        
//         <Text className="font-medium text-gray-700 dark:text-gray-600">
//           {value}
//         </Text>
//       ),
//     },
    
//     {
//       title: (
//         <HeaderCell
//           title="Sold Unit"
//           sortable
//           ascending={
//             sortConfig?.direction === 'asc' && sortConfig?.key === 'sold_units'
//           }
//         />
//       ),
//       onHeaderCell: () => onHeaderCellClick('sold_units'),
//       dataIndex: 'sold_units',
//       key: 'sold_units',
//       width: 100,
      
//       render: (value: string | undefined) => (
//         <Text className="font-medium text-gray-700 dark:text-gray-600">
//           {value}
//         </Text>
//       ),
//     },
//     {
//       title: (
//         <HeaderCell
//           title="Hold Units"
//           sortable
//           ascending={
//             sortConfig?.direction === 'asc' && sortConfig?.key === 'hold_units'
//           }
//         />
//       ),
//       onHeaderCell: () => onHeaderCellClick('hold_units'),
//       dataIndex: 'hold_units',
//       key: 'hold_units',
//       width: 100,
//       render: (value: string | undefined) => (
//         <Text className="font-medium text-gray-700 dark:text-gray-600">
//           {value}
//         </Text>
//       ),
//     },
//     {
//       title: (
//         <HeaderCell
//           title="Available Units"
//           sortable
//           ascending={
//             sortConfig?.direction === 'asc' && sortConfig?.key === 'available_units'
//           }
//         />
//       ),
//       onHeaderCell: () => onHeaderCellClick('available_units'),
//       dataIndex: 'available_units',
//       key: 'available_units',
//       width: 100,
//       render: (value: string | undefined) => (
//         <Text className="font-medium text-gray-700 dark:text-gray-600">
//           {value}
//         </Text>
//       ),
//     },
   
    
   
//     {
//       title: (
//         <HeaderCell
//           title="Status"
//           sortable
//           ascending={
//             sortConfig?.direction === 'asc' && sortConfig?.key === 'del'
//           }
//         />
//       ),
//       onHeaderCell: () => onHeaderCellClick('del'),
//       dataIndex: 'del',
//       key: 'del',
//       width: 100,
//       render: (value: string | undefined) => (
//         <div className="font-medium text-gray-700 dark:text-gray-600">
//           {value === 'Y' ? (
//             <span className="px-2 py-1 rounded bg-red-500 text-white">Inactive</span>
//           ) : (
//             <span className="px-2 py-1 rounded bg-green-500 text-white">Active</span>
//           ) || <span className="px-2 py-1 rounded bg-yellow-500 text-white">N/A</span>}
//         </div>
//       ),
      
//     },
    
//     {
//       title: <HeaderCell title="Action" />,
//       dataIndex: 'action',
//       key: 'action',
//       width: 200,
//       render: (_: string, row: any) => {
//         const editPermission = row.Edit_permission; // Implement a function to check user's permission level
        
//         return (
//           <div className="flex items-center justify-start gap-3 pe-3">
              
//             <Tooltip
//               size="sm"
//               content={() => 'View Details'}
//               placement="top"
//               color="invert"
//             >
//               <Link href={routes.project.floorunites(row.slug, encodeId(row.id))}>
//                 <ActionIcon
//                   tag="span"
//                   size="sm"
//                   variant="outline"
//                   className="hover:!border-gray-900 hover:text-gray-700 w-20"
//                 >
//                   <PiFolderLight className="h-4 w-4" /> View
//                 </ActionIcon>
//               </Link>
//             </Tooltip>
//             <Tooltip
//               size="sm"
//               content={() => 'Update Rates'}
//               placement="top"
//               color="invert"
//             >
              
//                 <ActionIcon
//                   tag="span"
//                   size="sm"
//                   variant="outline"
//                   className="hover:!border-gray-900 hover:text-gray-700"
//                 >
//                   <button onClick={() => handleViewInvoice(row.id)}>
//                 <BsRepeat className="h-4 w-4" />
//               </button>
                 
//                 </ActionIcon>
       
//             </Tooltip>
//             <Tooltip
//               size="sm"
//               content={() => 'Add New Unites to this floor'}
//               placement="top"
//               color="invert"
//             >
//               <Link href={routes.project.addnewunites(row.slug, encodeId(row.id))}>
//                 <ActionIcon
//                   tag="span"
//                   size="sm"
//                   variant="outline"
//                   className="hover:!border-gray-900 hover:text-gray-700 w-20"
//                 >
//                   <PiPlusBold className="h-4 w-4" /> Units
//                 </ActionIcon>
//               </Link>
//             </Tooltip>
//             <Tooltip
//               size="sm"
//               content={() => 'View Details'}
//               placement="top"
//               color="invert"
              
//             >
//               <Link href={routes.employee.members(row.manager_id)}>
//                 <ActionIcon
//                   tag="span"
//                   size="sm"
//                   variant="outline"
//                   className="hover:!border-gray-900 hover:text-gray-700 w-36"
//                 >
//                   Pyment plan
//                 </ActionIcon>
//               </Link>
//             </Tooltip>
//             <Tooltip
//               size="sm"
//               content={() => 'View Details'}
//               placement="top"
//               color="invert"
//             >
//               <Link href={routes.employee.members(row.manager_id)}>
//                 <ActionIcon
//                   tag="span"
//                   size="sm"
//                   variant="outline"
//                   className="hover:!border-gray-900 hover:text-gray-700"
//                 >
//                   <EyeIcon className="h-4 w-4" />
//                 </ActionIcon>
//               </Link>
//             </Tooltip>
//             <Tooltip
//               size="sm"
//               content={() => 'View Details'}
//               placement="top"
//               color="invert"
//             >
//               <Link href={routes.project.editFloor(row.slug, encodeId(row.id))}>
//                 <ActionIcon
//                   tag="span"
//                   size="sm"
//                   variant="outline"
//                   className="hover:!border-gray-900 hover:text-gray-700"
//                 >
                 
//                   <LiaEditSolid className="h-4 w-4" />
//                 </ActionIcon>
//               </Link>
//             </Tooltip>
//             <Tooltip
//               size="sm"
//               content={() => 'Duplicate this Floor'}
//               placement="top"
//               color="invert"
//             >
//               <Link href={routes.project.duplicatefloor(row.slug, encodeId(row.id))}>
//                 <ActionIcon
//                   tag="span"
//                   size="sm"
//                   variant="outline"
//                   className="hover:!border-gray-900 hover:text-gray-700"
//                 >
                 
//                   <PiCopyLight  className="h-4 w-4" />
//                 </ActionIcon>
//               </Link>
//             </Tooltip>
//               <Tooltip
//                 size="sm"
//                 content={() => 'Edit Details'}
//                 placement="top"
//                 color="invert"
//               >
//                 <ActionIcon
//                   tag="span"
//                   size="sm"
//                   variant="outline"
//                   className="hover:!border-gray-900 hover:text-gray-700"
//                 >
                  
              
//                 <DeletePopover
//               title={`Delete Project`}
//               description={`Are you sure you want to delete this #${row.id} Project?`}
//               onDelete={() => onDeleteItem(row.id)}
//               id={row.id}
//               table={`lead_projects`}
//               name={`Project`}
//               inactive="Yes"
//             /> 
//              </ActionIcon>
//               </Tooltip>
              
//           </div>
//         );
//       },

//     },
//   ];

//   return columns;
// };


