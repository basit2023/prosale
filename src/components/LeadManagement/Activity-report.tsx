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
import { ActivityReportInfoFormSchema, ActivityReportInfoFormTypes, defaultValues } from '@/utils/validators/activity-report.schema';
import { useSession} from 'next-auth/react';
const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});

export default function ActivityReport() {
  const { back } = useRouter();
  const [isLoading, setIsLoading] = useState(false); 
    const { data: session } = useSession();
    const memoizedSession=useMemo(()=>session,[session])

  const onSubmit: SubmitHandler<ActivityReportInfoFormTypes> = async (data) => {
    setIsLoading(true); 
    
    try {
      console.log("Form submission data:", data);
      data.user=memoizedSession?.user?.username
      const result = await apiService.post(`/activity-reports`, data);
      toast.success(result.data.message);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || 'An error occurred');
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
        defaultValues,
      }}
    >
      {({ register, control, setValue, getValues, formState: { errors } }) => {
        return (
          <>
            <FormGroup
              title="Employee Info"
              description="Add Employee details here"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
              <FormGroup
                title="Daily Office Visits"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="number"
                  min={0}
                  step={1}
                  {...register('daily_office_visits', { valueAsNumber: true })}
                  suffix={
                    <div className="-mr-3.5 grid gap-[2px] p-0.5 rtl:-ml-3.5 rtl:-mr-0">
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => {
                          const current = getValues('daily_office_visits') || 0;
                          setValue('daily_office_visits', current + 1);
                        }}
                      >
                        <ChevronUpIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => {
                          const current = getValues('daily_office_visits') || 0;
                          setValue('daily_office_visits', Math.max(0, current - 1));
                        }}
                      >
                        <ChevronDownIcon className="h-3 w-3" />
                      </button>
                    </div>
                  }
                />
              </FormGroup>
              
              <FormGroup
                title="Clients Matured"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="number"
                  min={0}
                  step={1}
                  {...register('client_matured', { valueAsNumber: true })}
                  suffix={
                    <div className="-mr-3.5 grid gap-[2px] p-0.5 rtl:-ml-3.5 rtl:-mr-0">
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => {
                          const current = getValues('client_matured') || 0;
                          setValue('client_matured', current + 1);
                        }}
                      >
                        <ChevronUpIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => {
                          const current = getValues('client_matured') || 0;
                          setValue('client_matured', Math.max(0, current - 1));
                        }}
                      >
                        <ChevronDownIcon className="h-3 w-3" />
                      </button>
                    </div>
                  }
                />
              </FormGroup>

              <FormGroup
                title="Daily Leads Follow Ups"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="number"
                  min={0}
                  step={1}
                  {...register('daily_lead_follow_up', { valueAsNumber: true })}
                  suffix={
                    <div className="-mr-3.5 grid gap-[2px] p-0.5 rtl:-ml-3.5 rtl:-mr-0">
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => {
                          const current = getValues('daily_lead_follow_up') || 0;
                          setValue('daily_lead_follow_up', current + 1);
                        }}
                      >
                        <ChevronUpIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => {
                          const current = getValues('daily_lead_follow_up') || 0;
                          setValue('daily_lead_follow_up', Math.max(0, current - 1));
                        }}
                      >
                        <ChevronDownIcon className="h-3 w-3" />
                      </button>
                    </div>
                  }
                />
              </FormGroup>

              <FormGroup
                title="Leads Assigned (Currently)"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="number"
                  min={0}
                  step={1}
                  {...register('lead_assigned', { valueAsNumber: true })}
                  suffix={
                    <div className="-mr-3.5 grid gap-[2px] p-0.5 rtl:-ml-3.5 rtl:-mr-0">
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => {
                          const current = getValues('lead_assigned') || 0;
                          setValue('lead_assigned', current + 1);
                        }}
                      >
                        <ChevronUpIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => {
                          const current = getValues('lead_assigned') || 0;
                          setValue('lead_assigned', Math.max(0, current - 1));
                        }}
                      >
                        <ChevronDownIcon className="h-3 w-3" />
                      </button>
                    </div>
                  }
                />
              </FormGroup>

              <FormGroup
                title="Meetings With Dealers"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="number"
                  min={0}
                  step={1}
                  {...register('dealers_meeting', { valueAsNumber: true })}
                  suffix={
                    <div className="-mr-3.5 grid gap-[2px] p-0.5 rtl:-ml-3.5 rtl:-mr-0">
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => {
                          const current = getValues('dealers_meeting') || 0;
                          setValue('dealers_meeting', current + 1);
                        }}
                      >
                        <ChevronUpIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => {
                          const current = getValues('dealers_meeting') || 0;
                          setValue('dealers_meeting', Math.max(0, current - 1));
                        }}
                      >
                        <ChevronDownIcon className="h-3 w-3" />
                      </button>
                    </div>
                  }
                />
              </FormGroup>

              <FormGroup
                title="Dealers Registered"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="number"
                  min={0}
                  step={1}
                  {...register('dealers_register', { valueAsNumber: true })}
                  suffix={
                    <div className="-mr-3.5 grid gap-[2px] p-0.5 rtl:-ml-3.5 rtl:-mr-0">
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => {
                          const current = getValues('dealers_register') || 0;
                          setValue('dealers_register', current + 1);
                        }}
                      >
                        <ChevronUpIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => {
                          const current = getValues('dealers_register') || 0;
                          setValue('dealers_register', Math.max(0, current - 1));
                        }}
                      >
                        <ChevronDownIcon className="h-3 w-3" />
                      </button>
                    </div>
                  }
                />
              </FormGroup>

              <FormGroup
                title="Other Office Activity"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Textarea
                  placeholder="Enter your Comments"
                  {...register('office_activity')}
                  error={errors.office_activity?.message}
                  textareaClassName="h-20"
                  className="col-span"
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
        );
      }}
    </Form>
  );
}