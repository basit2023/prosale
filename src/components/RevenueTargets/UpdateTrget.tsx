'use client';

import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { routes } from '@/config/routes';
import { useSession } from 'next-auth/react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import { useCallback, useEffect, useState } from 'react';
import apiService from '@/utils/apiService';
import {
  NewEmployeeInfoFormSchema,
  NewEmployeeInfoFormTypes,
  defaultValues,
} from '@/utils/validators/update-employee-schema';
import { useRouter } from 'next/navigation';
import { logsCreate } from '@/app/shared/account-settings/logs';

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

export default function UpdateTarget({ id }: { id: string }) {
  const { data: session } = useSession();
  const { back, push } = useRouter();

  const [designationOptions, setDesignationOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>();

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      try {
        const userResponse = await apiService.get(`/emp-personalinfo/${id}`);
        setUserData(userResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error fetching data. Please try again.');
      }
    };

    fetchData();
  }, [session, id]);

  const fetchDesignation = useCallback(async () => {
    try {
      const res = await apiService.get('/alldesignation');
      const opts =
        res?.data?.data?.map((d: any) => ({
          label: d?.name ?? d?.label ?? '',
          value: String(d?.value ?? d?.id ?? ''),
        })) ?? [];
      setDesignationOptions(opts);
    } catch (error) {
      console.error('Error fetching designation data:', error);
      toast.error('Error fetching designation data. Please try again.');
    }
  }, []);

  useEffect(() => {
    if (session) fetchDesignation();
  }, [session, fetchDesignation]);

  // Initialize form with user data if available
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<NewEmployeeInfoFormTypes>({

    defaultValues: {
      ...defaultValues,
      targetRevenue: userData?.targetRevenue ?? 0,
      achievedRevenue: userData?.achievedRevenue ?? 0,
      designation: userData?.designation ?? '', // Assuming userData contains designation info
    },
  });

  const onSubmit: SubmitHandler<NewEmployeeInfoFormTypes> = async (data, event) => {
    setIsLoading(true);
    try {
  

      // Handle default values for number fields
      if (Number.isNaN(data.targetRevenue)) data.targetRevenue = 0;

      const payload = {
        ...data,
        designation: data.designation, // map if needed
      };

      const result = await apiService.put(`/update-target-revenue/?id=${id}`, payload);

      toast.success(result?.data?.message || 'Saved');
      if (result?.data?.success) {
        logsCreate({ user: session?.user?.username, desc: 'Created Target' });
        (event?.target as HTMLFormElement | undefined)?.reset?.();
        push(routes.leads.management);
      }
    } catch (error: any) {
      console.error('Error saving target:', error);
      toast.error(error?.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) return <Spinner />; // Loading spinner while fetching user data

  return (
    <Form<NewEmployeeInfoFormTypes>
      onSubmit={handleSubmit(onSubmit)}
      className="@container"
    >
      {({ register, control, formState: { errors } }) => (
        <>
          <FormGroup
            title="Enter Targets"
            description="Add targets for each designation"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          />

          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
            {/* Target Revenue */}
            <FormGroup
              title="Target Revenue"
              description="Desired revenue target"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                 defaultValue={userData.user.targetRevenue}
                {...register('targetRevenue', { valueAsNumber: true })}
                error={errors.targetRevenue?.message}
                className="col-span-full"
              />
            </FormGroup>

            {/* Achieved Revenue */}
            <FormGroup
              title="Achieved Revenue"
              description="Revenue achieved (default 0)"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                 defaultValue={userData.user.achievedRevenue}

                {...register('achievedRevenue', { valueAsNumber: true })}
                error={errors.achievedRevenue?.message}
                className="col-span-full"
              />
            </FormGroup>

            {/* Designation */}
            {/* <FormGroup
              title="Designation"
              description="Select the designation this target applies to"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Controller
                control={control}
                name="designation"
                render={({ field: { value, onChange } }) => (
                  <SelectBox
                    placeholder="Select Designation"
                    options={designationOptions}
                    onChange={(opt: SelectOption | string) =>
                      onChange(typeof opt === 'string' ? opt : opt?.value)
                    }
                    value={value}
                    className="col-span-full"
                    getOptionValue={(o: SelectOption) => o.value}
                    displayValue={(selected: string) =>
                      designationOptions.find((r) => r.value === selected)?.label ?? ''
                    }
                    error={errors?.designation?.message as string}
                  />
                )}
              />
            </FormGroup> */}
          </div>

          <FormFooter
            altBtnText="Cancel"
            submitBtnText="Save"
            altBtnOnClick={() => back()}
            isLoading={isLoading}
          />
        </>
      )}
    </Form>
  );
}
