// TableFooter.tsx

'use client';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';
import FormGroup from '@/app/shared/form-group';
import toast from 'react-hot-toast';
import { SubmitHandler, Controller, useForm } from 'react-hook-form'; // Import useForm
import { Form } from '@/components/ui/form'; 
import { defaultValues, footAssinedFormSchema,editTeamZoneFormTypes } from '@/utils/validators/footer-assign.schema';

const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});
interface SelectOption {
  label: string;
  value: string;
}


interface TableFooterProps {
  checkedItems: string[];
  handleDelete: (ids: string[]) => void;
  
}
export default function TableFooter({
  checkedItems,
  handleDelete,
  children,
  
}: React.PropsWithChildren<TableFooterProps>) {
  const { data: session } = useSession<any>();
  const [country, setCountry] = useState<any>([]);

  useEffect(() => {
    if (checkedItems.length === 0 || !session) {
      return; // Early return if no items are checked or session is not available
    }
    
    const fetchData = async () => {
      try {
        const response = await apiService.get(`/all-members/?email=${session?.user?.email}&table=footer`);
        const userData = response.data.data;
        setCountry(userData);
      } catch (error:any) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
    };

    fetchData(); // Call fetchData when session is available and items are checked
  }, [checkedItems, session]);

  const onSubmit: SubmitHandler<editTeamZoneFormTypes> = async (data) => {
    try {
      const result = await apiService.put(`/update-assined-lead`, {
        ...data,
        assigned_through: session?.user?.email,
        ids: checkedItems
      });
      toast.success(result.data.message);
      if (result.data.success) {
        // logs({ user: value?.user?.name, desc: 'Edit Project' });
      }
    } catch (error:any) {
      console.error('Error Re-Assigning Leads:', error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <Form<editTeamZoneFormTypes>
      validationSchema={footAssinedFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues,
      }}
    >
      {({ register, control, setValue, getValues, formState: { errors }, handleSubmit }) => (
        <div className="sticky bottom-0 right-0 z-10 mt-2.5 flex items-center justify-between rounded-md border border-gray-300 bg-gray-0 px-5 py-3.5 text-gray-900 shadow-sm dark:border-gray-300 dark:bg-gray-100 dark:text-white dark:active:bg-gray-100">
          <div className="flex-grow">
            <Text as="strong">{checkedItems.length}</Text> selected{' '}
            <div className="flex items-center justify-between">
              <div className="mr-4 flex-grow text-left">
                <Controller
                  control={control}
                  name="assigned_to"
                  render={({ field: { value, onChange } }) => {
                    const selectedOption = country.find((item: { value: any; }):any => String(item.value) === value);

                    return (
                      <div className="relative">
                        <SelectBox
                          value={selectedOption ? { label: selectedOption.name, value: String(selectedOption.value) } : null} 
                          placeholder="Select One"
                          options={country.map((item: { name: any; value: any; }) => ({ label: item.name, value: String(item.value) }))}
                          onChange={(selectedOption: SelectOption | null) => {
                            onChange(selectedOption ? selectedOption.value : '');
                          }}
                          error={errors?.assigned_to?.message}
                        />
                      </div>
                    );
                  }}
                />
              </div>

              <Button
                size="sm" className="dark:bg-gray-300 dark:text-gray-800"
                type="submit"
              >
                Assign Them
              </Button>
            </div>
          </div>
          {children}
        </div>
      )}
    </Form>
  );
}
