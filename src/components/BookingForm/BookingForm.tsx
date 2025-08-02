'use client';
import { logsCreate } from '@/app/shared/account-settings/logs';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { routes } from '@/config/routes';
import { useSession } from 'next-auth/react';
import { SubmitHandler, Controller, useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import apiService from '@/utils/apiService';
import { BookingFormSchema, BookingFormTypes, defaultValues } from '@/utils/validators/booking-form.schema';
import { decryptData } from '@/components/encriptdycriptdata';
import { useRouter } from 'next/navigation';

const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});

const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,
});

interface SelectOption {
  label: string;
  value: string;
}

export default function BookingForm() {
  const { data: session } = useSession();
  const { back, push } = useRouter();
  const [department, setDepartment] = useState<any>([]);
  const [designation, setDesignation] = useState<any>([]);
  const [userType, setUserType] = useState<any>([]);
  const [value, setUserData] = useState<any>();
  const [team, setTeam] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [company, setCompany] = useState<any>();
  const [projects, setProjects] = useState<any[]>([]);

  // Memoize session data to prevent unnecessary re-renders
  const memoizedSession = useMemo(() => session, [session]);
  
  // Memoize form methods
  const formMethods = useForm<BookingFormTypes>({
    mode: 'onChange',
    defaultValues,
  });

  const { register, control, reset, formState: { errors }, handleSubmit } = formMethods;

  // Memoize type options to prevent recreation on every render
  const typeOptions = useMemo(() => [
    { name: "Local", value: "Local" }, 
    { name: "OverSeas", value: "International" }
  ], []);

  // Fetch all data in a single optimized function
  const fetchData = useCallback(async () => {
    try {
      const [resourceResponse, userTypeResponse, teamResponse] = await Promise.all([
        apiService.get(`/allresource/?company_id=${memoizedSession?.user?.company_id}`),
        apiService.get(`/all-user-type`),
        apiService.get('/emp-team')
      ]);

      setDepartment(resourceResponse.data.data);
      setDesignation(resourceResponse.data.data1);
      setProjects(resourceResponse.data.data2);
      setUserType(userTypeResponse.data.data);
      setTeam(teamResponse.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching data. Please try again.');
    }
  }, [memoizedSession?.user?.company_id]);

  useEffect(() => {
    if (memoizedSession) {
      fetchData();
    }
  }, [memoizedSession, fetchData]);

  // Memoize the onSubmit handler to prevent recreation
  const onSubmit: SubmitHandler<BookingFormTypes> = useCallback(async (data, event) => {
    setIsLoading(true);

    try {
      data.company_id = memoizedSession?.user?.company_id;
      data.user = memoizedSession?.user?.username;
      console.log("the data before submission:",data)
      const result = await apiService.post(`/create-new-lead`, {
        ...data,
      });

      toast.success(result.data.message);

      if (result.data.success) {
        logsCreate({ user: value?.user?.name, desc: 'New Lead' });
        event?.target?.reset();
        reset();
        push(routes.leads.management);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [memoizedSession, push, reset, value?.user?.name]);

  return (
    <Form<BookingFormTypes>
  validationSchema={BookingFormSchema}
  onSubmit={onSubmit}
  className="@container"
  useFormProps={{
    mode: 'onChange',
    defaultValues,
  }}
>
  {({ register, control, setValue, getValues, watch, formState: { errors }, handleSubmit }) => (
    <>
      {/* Registration Details */}
      <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
      <FormGroup title="Registration Details">
        <Input placeholder="Registration Number" {...register('registration_number')} />
        <Input placeholder="APP No" {...register('app_no')} />
      </FormGroup>

      {/* Customer Information */}
      <FormGroup title="Customer Information" className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11">
        <Input placeholder="Applicant Name" {...register('applicant_name')} />
        <Input placeholder="S/O, D/O, W/O" {...register('applicant_son_of')} />
        <Input placeholder="CNIC" {...register('applicant_cnic')} />
        <Input placeholder="Mailing Address" {...register('applicant_mailing_address')} />
        <Input placeholder="Permanent Address" {...register('applicant_permanent_address')} />
        <Input placeholder="Phone (Office)" {...register('applicant_phone_office')} />
        <Input placeholder="Phone (Res)" {...register('applicant_phone_res')} />
        <Input placeholder="Mobile" {...register('applicant_phone_mobile')} />
        <Input placeholder="Email" {...register('applicant_email')} />
      </FormGroup>

      {/* Next of Kin */}
      <FormGroup title="Next of Kin" className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11">
        <Input placeholder="Relation" {...register('kin_relation')} />
        <Input placeholder="Name" {...register('kin_name')} />
        <Input placeholder="S/O, D/O, W/O" {...register('kin_son_of')} />
        <Input placeholder="CNIC" {...register('kin_cnic')} />
        <Input placeholder="Mobile" {...register('kin_mobile')} />
        <Input placeholder="Address" {...register('kin_address')} />
      </FormGroup>

      {/* Property Info with dropdown */}
      <FormGroup title="Property Information" className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11">
        <Input placeholder="Project Name" {...register('project_name')} />
        <Input placeholder="Unit No" {...register('unit_no')} />
        <Input placeholder="Floor No" {...register('floor_no')} />
        <Input placeholder="Size" {...register('size')} />

        <Controller
          control={control}
          name="property_type"
          render={({ field: { onChange } }) => (
            <SelectBox
              placeholder="Select Property Type"
              options={[
                { label: 'Shop', value: 'Shop' },
                { label: 'Studio Apartment', value: 'Studio' },
                { label: '1 Bed', value: '1 Bed' },
                { label: '2 Bed', value: '2 Bed' },
                { label: '3 Bed', value: '3 Bed' },
                { label: '4 Bed', value: '4 Bed' },
              ]}
              value={watch('property_type')}
              onChange={(val) => setValue('property_type', val)}
              error={errors?.property_type?.message}
              className="col-span-full"
            />
          )}
        />
      </FormGroup>

      {/* Payment Schedule */}
      <FormGroup title="Payment Schedule" className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11">
        <Input placeholder="Total Sales Value" {...register('total_sales_value')} />
        <Input placeholder="Receipt No" {...register('receipt_no')}/>
        <Input placeholder="First Down Payment" {...register('first_down_payment')} />
        <Input placeholder="Second Down Payment" {...register('second_down_payment')} />
        <Input placeholder="Monthly Installment" {...register('monthly_installment')} />
        <Input placeholder="Monthly Start Date" type="date" {...register('monthly_start_date')} />
        <Input placeholder="Quarterly Installment" {...register('quarterly_installment')} />
        <Input placeholder="Quarterly Start Date" type="date" {...register('quarterly_start_date')} />
        <Input placeholder="Semi Annual Installment" {...register('semi_annual_installment')} />
        <Input placeholder="Semi Annual Start Date" type="date" {...register('semi_annual_start_date')} />
        <Input placeholder="Possession Payment" {...register('possession_payment')} />
        <Input placeholder="Transfer Payment" {...register('transfer_payment')} />
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