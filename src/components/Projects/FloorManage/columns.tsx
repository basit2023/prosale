'use client';
import React, { useState } from 'react';
import { Title, Text } from '@/components/ui/text';
import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { ActionIcon } from '@/components/ui/action-icon';
import apiService from '@/utils/apiService';
import { LiaEditSolid } from "react-icons/lia";
import { Input } from "rizzui";
import { Button } from '@/components/ui/button';
import { Popover } from '@/components/ui/popover';
import TrashIcon from '@/components/icons/trash';
import { PiTrashFill } from 'react-icons/pi';
import toast from 'react-hot-toast';
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
  const [editableRow, setEditableRow] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  console.log("the data at the columns is:",data)

  const handleEditClick = (row: any) => {
    setEditableRow(row.id);
    setFormData({
      ...formData,
      [row.id]: row,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string, id: string) => {
    setFormData({
      ...formData,
      [id]: {
        ...formData[id],
        [key]: e.target.value,
      },
    });
  };

  const handleSave = async (id: string) => {
    try {
      
      console.log("the data is:",id, formData[id]);
      const obj=formData[id]
      const response=await apiService.put("/floor-status-update",{id:id, ...obj}); 
      toast.success(response.data.message)
      setEditableRow(null);
    } catch (error) {
      console.error('Failed to update the project', error);
    }
  };
  //handle delete
  const actionIconClassName = "rizzui-action-icon-root inline-flex items-center justify-center active:enabled:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-50 transition-colors duration-200 p-0.5 w-7 h-7 rounded-md bg-transparent border-0 focus-visible:ring-offset-2 border-gray-300 hover:enabled:border-0 focus-visible:enabled:border-0 focus-visible:ring-gray-900/30";
  const handleDelete = async (id: any, setOpen: (value: boolean) => void) => {
    const data = { id, single_unit: "single_unit" };
    console.log("the data is:",data)
    try {
      const response = await apiService.delete('/delete-floor', { data });
      if (response.data.success) {
       
       
        toast.success(response.data.message);
        setOpen(false);  // Close the popover
      } else {
        toast.error("There was an issue while deleting the floor");
      }
    } catch (error: any) {
      console.log("the error is:"+error)
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
          title="Type"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'Type'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('Type'),
      dataIndex: 'Type',
      key: 'Type',
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
          title="Label"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'Label'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('Label'),
      dataIndex: 'Label',
      key: 'Label',
      width: 100,
      render: (value: string | undefined, row: any) =>
        <Input
          type="text"
          defaultValue={value || 'N/A'}
       
          onChange={(e) => handleInputChange(e, 'Label', row.id)}
          className="input-class w-100"
        />
    },
    {
      title: (
        <HeaderCell
          title="Unit #"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'Unit'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('Unit'),
      dataIndex: 'Unit',
      key: 'Unit',
      width: 100,
      render: (value: string | undefined, row: any) =>
        <Input
          type="number"
          defaultValue={value || 'N/A'}
          onChange={(e) => handleInputChange(e, 'Unit', row.id)}
          className="input-class w-100"
        />
    },
    {
      title: (
        <HeaderCell
          title="Size"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'Size'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('Size'),
      dataIndex: 'Size',
      key: 'Size',
      width: 100,
      render: (value: string | undefined, row: any) =>
        <Input
          type="number"
          defaultValue={value || 'N/A'}
          onChange={(e) => handleInputChange(e, 'Size', row.id)}
          className="input-class w-100"
        />
    },
    {
      title: (
        <HeaderCell
          title="SqFt Rate"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'SqFtRate'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('SqFtRate'),
      dataIndex: 'SqFtRate',
      key: 'SqFtRate',
      width: 100,
      render: (value: string | undefined, row: any) =>
        <Input
          type="number"
          defaultValue={value || 'N/A'}
          onChange={(e) => handleInputChange(e, 'SqFtRate', row.id)}
          className="input-class w-100"
        />
    },
    {
      title: (
        <HeaderCell
          title="Extra %"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'Extra'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('Extra'),
      dataIndex: 'Extra',
      key: 'Extra',
      width: 100,
      render: (value: string | undefined, row: any) =>
        <Input
          type="number"
          defaultValue={value || 'N/A'}
          onChange={(e) => handleInputChange(e, 'Extra', row.id)}
          className="input-class w-100"
        />
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
      onHeaderCell: () => onHeaderCellClick('del'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value: string | undefined) => (
        <div className="font-medium text-gray-700 dark:text-gray-600">
          {value === 'available' ? (
            <span className="px-2 py-1 rounded bg-green-500 text-white">Active</span>
          ) : value === 'hold' ? (
            <span className="px-2 py-1 rounded bg-yellow-500 text-white">Hold</span>
          ) : value === 'sold' ? (
            <span className="px-2 py-1 rounded bg-red-500 text-white">Sold</span>
          ) : (
            <span className="px-2 py-1 rounded bg-gray-500 text-white">Unknown</span> 
            // Optional: Handles cases where the value is none of the above
          )}
        </div>
      )
      
    },
    {
      title: (
        <HeaderCell
          title="Category"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'Category'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('Category'),
      dataIndex: 'Category',
      key: 'Category',
      width: 100,
      render: (value: string | undefined, row: any) =>
        <Input
          type="text"
          defaultValue={value || 'N/A'}
          onChange={(e) => handleInputChange(e, 'Category', row.id)}
          className="input-class w-100"
        />
    },
    {
      title: <HeaderCell title="Action" />,
      dataIndex: 'action',
      key: 'action',
      width: 200,
      render: (_: string, row: any) => (
        <div className="flex items-center justify-start gap-3 pe-3">
          <Tooltip
            size="sm"
            content={() => 'Edit Details'}
            placement="top"
            color="invert"
          >
            <ActionIcon
              tag="span"
              size="sm"
              variant="outline"
              className="hover:!border-gray-900 hover:text-gray-700"
              onClick={() => handleSave(row.id)}
            >
              <LiaEditSolid className="h-4 w-4" />
            </ActionIcon>
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
                        <PiTrashFill className="me-1 h-[17px] w-[17px]" /> Delete this Unit
                      </Title>
                      <Text className="mb-2 leading-relaxed text-gray-500">
                        {`Are you sure you want to delete this Unit?`}
                      </Text>
                      <div className="flex items-center justify-end">
                        <Button size="sm" className="me-1.5 h-7" onClick={() => handleDelete(row.id, setOpen)}>
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
      ),
    },
  ];

  return columns;
};
