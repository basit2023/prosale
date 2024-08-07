'use client';
import { Title, Text } from '@/components/ui/text';
import { ActionIcon } from '@/components/ui/action-icon';
import { Button } from '@/components/ui/button';
import { Popover } from '@/components/ui/popover';
import TrashIcon from '@/components/icons/trash';
import { PiTrashFill } from 'react-icons/pi';
import apiService from '@/utils/apiService';
import toast from 'react-hot-toast';
import { FaTrashRestore } from "react-icons/fa";
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
import { useEmployeeData } from '@/components/employee-data/employeeList';

type DeletePopoverProps = {
  id: string;
  title: string;
  description: string;
  onDelete: () => void;
  table: string;
  name: string;
  inactive:string;
};

export default function DeletePopover({
  id,
  title,
  description,
  onDelete,
  table,
  name,
  inactive

}: DeletePopoverProps) {
  const router = useRouter();
  const actionIconClassName = "rizzui-action-icon-root inline-flex items-center justify-center active:enabled:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-50 transition-colors duration-200 p-0.5 w-7 h-7 rounded-md bg-transparent border-0 focus-visible:ring-offset-2 border-gray-300 hover:enabled:border-0 focus-visible:enabled:border-0 focus-visible:ring-gray-900/30";

  const handleDelete = async (setOpen: Function) => {
    try {
      
    //   const res = await apiService.put(`/del/${id}/?table=${table}`);
      const res = await apiService.put(`/del/${id}/?table=${table}&name=${name}&inactive=${inactive}`);
      // const res = await apiService.put(`/del/${id}`);
      if (res.status === 200) {
        
        const { data } = res;
        toast.success(`The ${name} was deleted successfully`);
        setOpen(false);
      
        if (table === "lead_projects") {
          router.push(routes.project.projectlist);
        } 
        else {
          router.push(routes.employee.employeelist);
        }
      } else {
        toast.error("Failed to delete employee");
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error("Failed to delete employee");
    }
  };

  return (
    <Popover
      placement="left"
      className="z-50"
      content={({ setOpen }) => (
        <div className="w-56 pb-2 pt-1 text-left rtl:text-right">
          <Title
            as="h6"
            className="mb-0.5 flex items-start text-sm text-gray-700 sm:items-center"
          >
            <PiTrashFill className="me-1 h-[17px] w-[17px]" /> {title}
          </Title>
          <Text className="mb-2 leading-relaxed text-gray-500">
            {description}
          </Text>
          <div className="flex items-center justify-end">
            <Button size="sm" className="me-1.5 h-7" onClick={() => handleDelete(setOpen)}>
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
  );
}
