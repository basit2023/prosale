'use client';

import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';
import {
  NewEmployeeInfoFormTypes,
  defaultValues,
} from '@/utils/validators/update-employee-schema';
import { useRouter } from 'next/navigation';
import { logsCreate } from '@/app/shared/account-settings/logs';

export default function UpdateTarget({ id }: { id: string }) {
  const { data: session } = useSession();
  const { back } = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);

  // RHF setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewEmployeeInfoFormTypes>({
    // initial safe defaults for first paint
    defaultValues: {
      ...defaultValues,
      targetRevenue: 0,
      achievedRevenue: 0,
      designation: '',
    },
  });

  // Fetch current user data
  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      try {
        setIsFetching(true);
        const userResponse = await apiService.get(`/emp-personalinfo/${id}`);
        setUserData(userResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error fetching data. Please try again.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [session, id]);

  // When userData arrives, push values into the form
  useEffect(() => {
    if (!userData?.user) return;
    reset({
      targetRevenue: Number(userData.user.targetRevenue ?? 0),
      achievedRevenue: Number(userData.user.achievedRevenue ?? 0),
      // keep designation if you actually use it in your schema/UI; otherwise leave empty
      designation: userData.user.designation ?? '',
    });
  }, [userData, reset]);

  const onSubmit: SubmitHandler<NewEmployeeInfoFormTypes> = async (data) => {
    setIsLoading(true);
    try {
      // Coerce NaNs (from empty fields) to 0
      const payload: any = {
        ...data,
        targetRevenue: Number.isFinite(data.targetRevenue) ? data.targetRevenue : 0,
        achievedRevenue: Number.isFinite(data.achievedRevenue) ? data.achievedRevenue : 0,
      };

      // If designation isn't used here, don't send empty string
      if (!payload.designation) delete payload.designation;

      console.log('Submitting payload:', payload);

      const result = await apiService.put(`/update-target-revenue/?id=${id}`, payload);

      toast.success(result?.data?.message || 'Saved');
      if (result?.data?.success) {
        logsCreate({ user: session?.user?.username, desc: 'Created Target' });
      }
    } catch (error: any) {
      console.error('Error saving target:', error);
      toast.error(error?.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <Spinner />;

  return (
    <Form<NewEmployeeInfoFormTypes> onSubmit={handleSubmit(onSubmit)} className="@container">
      {() => (
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
                {...register('achievedRevenue', { valueAsNumber: true })}
                error={errors.achievedRevenue?.message}
                className="col-span-full"
              />
            </FormGroup>
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
