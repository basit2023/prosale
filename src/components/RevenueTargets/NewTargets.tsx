'use client';

import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { routes } from '@/config/routes';
import { useSession } from 'next-auth/react';
import { Controller, SubmitHandler } from 'react-hook-form';
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
import ReactDatePicker from '../ui/Timedatepicker';

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

export default function NewTargets() {
  const { data: session } = useSession();
  const { back, push } = useRouter();

  const [designationOptions, setDesignationOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
   const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0];
    
    const [date, setDate] = useState<Date | null>(currentDate);


  const fetchDesignation = useCallback(async () => {
    try {
      const res = await apiService.get('/alldesignation');
      console.log("the response is:",res)
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

  const onSubmit: SubmitHandler<NewEmployeeInfoFormTypes> = async (data, event) => {
    setIsLoading(true);
    try {
      // ensure required context
      (data as any).user = (session as any)?.user?.username;
      (data as any).company_id = (session as any)?.user?.company_id;

      // If your schema already coerces, you can skip this guard.
      if (Number.isNaN(data.targetRevenue)) data.targetRevenue = 0;
   

      // If backend expects designation_id instead of designation:
      const payload = {
        ...data,
        designation: (data as any).designation, // map if needed
      };
       console.log("the dat is:",payload)
      const result = await apiService.put(
        `/update-target-revenue/?user=${encodeURIComponent((session as any)?.user?.username || '')}`,
        payload
      );

      toast.success(result?.data?.message || 'Saved');
      if (result?.data?.success) {
        logsCreate({ user: (session as any)?.user?.username, desc: 'Created Target' });
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

  return (
    <Form<NewEmployeeInfoFormTypes>
      validationSchema={NewEmployeeInfoFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        // make sure numbers are numbers and not empty strings
        defaultValues: {
          ...defaultValues,
          targetRevenue: defaultValues.targetRevenue ?? 0,
      
        },
      }}
    >
      {({ register, control,setValue, formState: { errors } }) => (
        <>
          <FormGroup
            title="Enter Targets"
            description="Add targets for each designation"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          />

          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">

            <FormGroup
                            title="Select Month"
                            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                          >
                            <ReactDatePicker
                              selected={date}
                              onChange={(date: Date | null) => {
                                setDate(date);
                                setValue('date', date ? date.toISOString().split('T')[0] : currentDateString);
                              }}
                              dateFormat="MMMM d, yyyy"
                              placeholderText="Select Date"
                              showTimeSelect={false}
                            />
                            {errors.from && (
                              <p className="mt-1 text-sm text-red-500">{errors.from.message}</p>
                            )}
                          </FormGroup>
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
            {/* <FormGroup
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
            </FormGroup> */}

            {/* Designation */}
            <FormGroup
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
