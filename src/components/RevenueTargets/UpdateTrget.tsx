'use client';

import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import { useEffect, useState, useCallback } from 'react';
import apiService from '@/utils/apiService';
import {
  NewEmployeeInfoFormTypes,
  defaultValues,
} from '@/utils/validators/update-employee-schema';
import { useRouter } from 'next/navigation';
import { logsCreate } from '@/app/shared/account-settings/logs';
import ReactDatePicker from '../ui/Timedatepicker';

type MonthlyTarget = {
  id?: number;
  user: number;
  name: string | null;
  designation: string | null;
  period_year: number;
  period_month: number;
  targetRevenue: number;
  achievedRevenue: number;
  exists: boolean;
};

export default function UpdateTarget({ id }: { id: string }) {
  const { data: session } = useSession();
  const { back } = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [record, setRecord] = useState<MonthlyTarget | null>(null);

  const currentDate = new Date();
  const [date, setDate] = useState<Date | null>(currentDate);

  // helper to YYYY-MM-DD
  const toYmd = (d: Date | null) => (d ? d.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

  // RHF
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<NewEmployeeInfoFormTypes>({
    defaultValues: {
      ...defaultValues,
      targetRevenue: 0,
      achievedRevenue: 0,
      designation: '',
      date: toYmd(currentDate),
    },
  });

  const fetchRecord = useCallback(async () => {
    if (!session || !id) return;
    try {
      setIsFetching(true);
      const d = toYmd(date);
      // set hidden date field for submit
      setValue('date', d, { shouldDirty: true, shouldValidate: false });

      const resp = await apiService.get(`/revenue-targets/${id}?date=${encodeURIComponent(d)}`);
      const payload = resp?.data?.data;
      setRecord(payload ?? null);

      reset({
        targetRevenue: Number(payload?.targetRevenue ?? 0),
        achievedRevenue: Number(payload?.achievedRevenue ?? 0),
        // optional: show designation in UI if you need it
        designation: payload?.designation ?? '',
        date: d,
      });
    } catch (e) {
      console.error('Error fetching record:', e);
      toast.error('Error fetching monthly target');
    } finally {
      setIsFetching(false);
    }
  }, [session, id, date, reset, setValue]);

  // Initial + when date changes
  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const onSubmit: SubmitHandler<NewEmployeeInfoFormTypes> = async (form) => {
    setIsLoading(true);
    try {
      const d = toYmd(date);

      // You said: incoming "user" string becomes the stored "name".
      // We'll use session?.user?.username (or email) as that "user" string.
      const incomingUserString =
        (session as any)?.user?.username ||
        (session as any)?.user?.name ||
        (session as any)?.user?.email ||
        'unknown';

      const payload: any = {
        // backend expects: date to get (year, month)
        date: d,
        // store FE "user" into name:
        user: incomingUserString, // so controller reads as "name"
        name: incomingUserString, // keep both in case you allow `name` too
        targetRevenue: Number.isFinite(form.targetRevenue) ? form.targetRevenue : 0,
        achievedRevenue: Number.isFinite(form.achievedRevenue) ? form.achievedRevenue : 0,
      };

      // Optional: if you actually edit designation in this screen, pass it; else remove:
      if (form.designation) payload.designation = form.designation;

      const result = await apiService.put(`/update-target-revenue/?id=${id}`, payload);
      toast.success(result?.data?.message || 'Saved');

      if (result?.data?.success) {
        logsCreate({ user: (session as any)?.user?.username, desc: 'Updated Monthly Target' });
        // refetch to reflect latest
        await fetchRecord();
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
            title="Enter Monthly Targets"
            description="Add targets for a specific month"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          />

          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">

            {/* Month picker */}
            <FormGroup title="Select Month" className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11">
              <ReactDatePicker
                selected={date}
                onChange={(d: Date | null) => {
                  setDate(d);
                  const ymd = toYmd(d);
                  setValue('date', ymd, { shouldDirty: true });
                  // refetch for that month
                  // (debounce if you prefer; here it’ll refetch via useEffect on date)
                }}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select Date"
                showTimeSelect={false}
              />
              {/* hidden date field for submission */}
              <input type="hidden" {...register('date')} />
              {errors.date && (
                <p className="mt-1 text-sm text-red-500">{errors.date.message as any}</p>
              )}
            </FormGroup>

            {/* Target Revenue */}
            <FormGroup
              title="Target Revenue"
              description="Desired monthly revenue target"
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
