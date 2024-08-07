'use client';
import { logsCreate,logs } from '@/app/shared/account-settings/logs';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Controller, SubmitHandler } from 'react-hook-form';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { Text, Title } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import SelectBox from '@/components/ui/select';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';
import { decryptData } from '@/components/encriptdycriptdata';

import { useRouter } from 'next/navigation';
import {
  editTeamZoneFormTypes,
  editTeamZoneFormSchema,
  defaultValues,
} from '@/utils/validators/team-zones.schema';

export default function AddTeamMemberModalView({id}:any) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState<any>({});
  const [isLoading, setLoading] = useState(false);
  const [userValue, setUserData] = useState<any>();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const encryptedData = localStorage.getItem('uData');
        if (encryptedData) {
          const data = decryptData(encryptedData);
          setUserData(data);
        }
      } catch (error:any) {
        console.error('Error fetching user data:', error);
        toast.error(error.response.data.message);
      }
    };

    fetchUserData();
  }, [session]);

  const onSubmit: SubmitHandler<editTeamZoneFormTypes> = async (data) => {
    try {
      setLoading(true);
      const result = await apiService.put(`/add-team-member/${id}`, {
        ...data,
        user: userValue?.user?.name,
      });
      toast.success(result.data.message);

      if (result.data.success) {
        logs({ user: userValue?.user?.name, desc: `Created new Member` });
      }
    } catch (error) {
      console.error('Error Creating team:', error);
      toast.error('Error Creating Team. Please try again.');
    } finally {
      setLoading(false);
      router.refresh()
      closeModal();
    }

    setReset({
      first_name: '',
      last_name: '',
      email: '',
      manager: '',
      country: '',
    });
  };

  return (
    <div className="m-auto p-6">
      <div className="flex justify-between items-center">
        <Title as="h3" className="mb-6 text-lg">
          Add New Team Member
        </Title>
        <button onClick={() => closeModal()} className="text-xl font-bold">✕</button>
      </div>
      <Form<editTeamZoneFormTypes>
        validationSchema={editTeamZoneFormSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        className="@container"
        useFormProps={{
          mode: 'onChange',
          defaultValues,
        }}
      >
        {({ register, control, formState: { errors } }) => (
          <>
            <MemberForm control={control} register={register} errors={errors} />
            <div className="mt-8 flex justify-end gap-3">
              <Button
                className="w-auto"
                variant="outline"
                onClick={() => closeModal()}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} className="w-auto relative">
                {isLoading ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                ) : (
                  'Add Member'
                )}
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
}

interface SelectOption {
  label: string;
  value: string;
}

export function MemberForm({ register, control, errors }: any) {
  const [manager, setManager] = useState<any>();
  const { data: session } = useSession();
  const [value1, setValue1] = useState<any>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.get(`/all-members/?email=${session?.user?.email}`);
        const userData = response.data.data;
        setManager(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
      try {
        const response = await apiService.get(`/all-teams`);
        const userData = response.data.data;
        
        setValue1(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  return (
    <div className="flex flex-col gap-4 text-gray-700">
      <div className="flex flex-col gap-4 xs:flex-row xs:items-center">
        {/* <Input
          type="text"
          label="Title"
          placeholder="Zone"
          labelClassName="text-sm font-medium text-gray-900"
          {...register('title')}
          error={errors?.title?.message}
          className="flex-grow"
        /> */}
      </div>

      <Controller
        control={control}
        name="member"
        render={({ field: { value, onChange } }: any) => {
          const selectedOption: any = manager?.find((item: any) => String(item.value) === value);

          return (
            <SelectBox
              value={selectedOption ? { label: selectedOption.name, value: String(selectedOption.value) } : null}
              label="Select Member"
              labelClassName="text-sm font-medium text-gray-900"
              placeholder="Select Zone Manager"
              options={manager?.map((item: any) => ({ label: item.name, value: String(item.value) }))}
              onChange={(selectedOption: SelectOption | null) => {
                onChange(selectedOption ? selectedOption.value : '');
              }}
              className="col-span-full"
              error={errors?.zonal_manager?.message}
            />
          );
        }}
      />
    </div>
  );
}
