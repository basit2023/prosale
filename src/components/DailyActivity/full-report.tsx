'use client';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { SubmitHandler, Controller } from 'react-hook-form';
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import { useMemo, useState } from 'react';
import apiService from '@/utils/apiService';
import { Textarea } from '@/components/ui/textarea';                                       
import { DatePicker } from '@/components/ui/datepicker';
import ReactDatePicker from '../ui/Timedatepicker'; 
import { useSession } from 'next-auth/react';
import { routes } from '@/config/routes';
import { z } from 'zod';

// form zod validation schema
export const ActivityReportInfoFormSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  user: z.string().optional()
});

// generate form types from zod validation schema
export type ActivityReportInfoFormTypes = z.infer<typeof ActivityReportInfoFormSchema>;

export const defaultValues = {
  to: '',
  from: '',
  user: ''
};

export default function ActivityReport() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); 
  const { data: session } = useSession();
  const memoizedSession = useMemo(() => session, [session]);
  
  // Initialize with current date by default
  const currentDate = new Date();
  const currentDateString = currentDate.toISOString().split('T')[0];
  
  const [fromDate, setFromDate] = useState<Date | null>(currentDate);
  const [toDate, setToDate] = useState<Date | null>(currentDate);

  const onSubmit: SubmitHandler<ActivityReportInfoFormTypes> = async (data) => {
    setIsLoading(true); 
    
    try {
      data.user = memoizedSession?.user?.username;
      
      // Format the dates, using current date if not selected
      const params = {
        ...data,
        from: fromDate ? fromDate.toISOString().split('T')[0] : currentDateString,
        to: toDate ? toDate.toISOString().split('T')[0] : currentDateString
      };

      // Create query string
      const serializedData = encodeURIComponent(JSON.stringify(params));

      // Redirect to the report page with query params
      router.push(routes.tamplets.FullReport(serializedData));
      
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while submitting the form');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form<ActivityReportInfoFormTypes>
      validationSchema={ActivityReportInfoFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues: {
          ...defaultValues,
          from: currentDateString,
          to: currentDateString
        },
      }}
    >
      {({ register, control, setValue, formState: { errors } }) => {
        return (
          <>
            <FormGroup
              title="Select Date Range"
              // description="Add Employee details here"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
              <FormGroup
                title="From"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <ReactDatePicker
                  selected={fromDate}
                  onChange={(date: Date | null) => {
                    setFromDate(date);
                    setValue('from', date ? date.toISOString().split('T')[0] : currentDateString);
                  }}
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select Date From"
                  showTimeSelect={false}
                />
                {errors.from && (
                  <p className="mt-1 text-sm text-red-500">{errors.from.message}</p>
                )}
              </FormGroup>
              <FormGroup
                title="To"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <ReactDatePicker
                  selected={toDate}
                  onChange={(date: Date | null) => {
                    setToDate(date);
                    setValue('to', date ? date.toISOString().split('T')[0] : currentDateString);
                  }}
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select Date To"
                  showTimeSelect={false}
                />
                {errors.to && (
                  <p className="mt-1 text-sm text-red-500">{errors.to.message}</p>
                )}
              </FormGroup>
            </div>
            <FormFooter 
              altBtnText="Cancel" 
              submitBtnText="Generate Report" 
              altBtnOnClick={() => router.back()} 
              isLoading={isLoading}
            />
          </>
        );
      }}
    </Form>
  );
}