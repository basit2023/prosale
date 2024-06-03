'use client';
import { Title, Text } from '@/components/ui/text';
import { ActionIcon } from '@/components/ui/action-icon';
import { Button } from '@/components/ui/button';
import { Popover } from '@/components/ui/popover';
import TrashIcon from '@/components/icons/trash';
import { PiTrashFill } from 'react-icons/pi';
import apiService from '@/utils/apiService';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';

type DeletePopoverProps = {
  id: string;
  title: string;
  description: string;
  onDelete: () => void;
};

export default function DeletePopover({
  id,
  title,
  description,
  onDelete,
}: DeletePopoverProps) {
  const router = useRouter();
  
  const handleDelete = async (setOpen: Function) => {
    try {
      const table="lead_projects"
      const res = await apiService.put(`/del/${id}/?table=${table}`);
      // const res = await apiService.put(`/del/${id}/?table=${table}&name=${name}`);
      // const res = await apiService.put(`/del/${id}`);
      if (res.status === 200) {
        const { data } = res;
        toast.success(`The ${name} was deleted successfully`);
        window.location.reload();
        setOpen(false);
        if (table === "lead_projects") {
          router.push(routes.project.projectlist);
        } else {
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
        aria-label={'Delete Item'}
        className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
      >
        <TrashIcon className="h-4 w-4" />
      </ActionIcon>
    </Popover>
  );
}
