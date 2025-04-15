'use client';
import UploadZone from '@/components/ui/file-upload/upload-zone';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Select from 'react-select';
import { useSession } from 'next-auth/react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { PiClock, PiEnvelopeSimple } from 'react-icons/pi';
import { Form } from '@/components/ui/form';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import { useEffect, useState, useCallback, useMemo } from 'react';
import apiService from '@/utils/apiService';
import { DatePicker } from '@/components/ui/datepicker';
import { logs, logsCreate } from '../account-settings/logs';
import { EmployeeContectInfoFormSchema, EmployeeContectInfoFormTypes, defaultValues } from '@/utils/validators/Employee-contectInfo.schema';
import FileUpload from '@/app/shared/EmployeeDetails/file-upload';
import UploadButton from './upload-button';
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

type User = {
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  sms: string;
  lead_status: string;
  name: string;
  id: string;
};

type UserType = {
  user: User;
  results: Array<{
    user_id: string;
    contract_type: string;
    contract_duration: string;
    allocated_leaves: string;
    probation_status: string;
    probation_duration: string;
    doj?: string;
  }>;
};

type FileUploadProps = {
  name: any;
  setValue: any;
  getValues: any;
  id: string;
};

export default function EmployeeContectInfo({ id }: any) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [userValue, setUserValue] = useState<UserType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [days, setDays] = useState<any>([]);
  const [offerLetterValue, setOfferLetterValue] = useState('No');
  const { back } = useRouter();

  // Memoized default date (today or from userValue if available)
  const defaultDate = useMemo(() => {
    if (userValue?.results[0]?.doj) {
      return new Date(userValue.results[0].doj);
    }
    return new Date();
  }, [userValue]);

  const [startDate, setStartDate] = useState<Date>(defaultDate);

  // Handle offer letter toggle
  const handleChange = useCallback(() => {
    setOfferLetterValue(prev => prev === 'No' ? 'Yes' : 'No');
  }, []);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      const [userResponse, contractResponse] = await Promise.all([
        apiService.get(`/employee-contect-info/${id}`),
        apiService.get('/allcontract')
      ]);
      
      setUserValue(userResponse.data);
      setDays(contractResponse.data.contracts);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching data. Please try again.');
    }
  }, [id]);

  // Initial data fetch
  useEffect(() => {
    if (session) {
      fetchUserData();
    }
  }, [session, fetchUserData]);

  // Update startDate when userValue changes
  useEffect(() => {
    if (userValue?.results[0]?.doj) {
      setStartDate(new Date(userValue.results[0].doj));
    }
  }, [userValue]);

  // Memoized contract types
  const contractTypes = useMemo(() => {
    return days.map((day: any) => ({
      name: day,
      value: day.toLowerCase(),
    }));
  }, [days]);

  // Memoized probation status options
  const probationStatusOptions = useMemo(() => [
    { name: "Yes", value: "Y" },
    { name: "No", value: "N" }
  ], []);

  // Form submission handler
  const onSubmit: SubmitHandler<EmployeeContectInfoFormTypes> = useCallback(async (data) => {
    setIsLoading(true);

    try {
      const formattedDate = format(startDate, 'MM/dd/yyyy');
      const endpoint = userValue?.results[0]?.user_id 
        ? `/update_employee-contect-info/${id}`
        : `/create-employee-contect-info/${id}`;

      const payload = {
        ...data,
        doj: formattedDate,
        offer_letter: offerLetterValue,
        ...(!userValue?.results[0]?.user_id && {
          user_id: session?.user?.id,
          user: session?.user?.username
        })
      };

      const result = userValue?.results[0]?.user_id
        ? await apiService.put(endpoint, payload)
        : await apiService.post(endpoint, payload);

      toast.success(result.data.message);
      setOfferLetterValue('No');
      
      if (result.data.success) {
        const logAction = userValue?.results[0]?.user_id ? logs : logsCreate;
        logAction({ user: session?.user?.username, desc: 'Employee Contact Info' });
        fetchUserData(); // Refresh data after successful submission
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [startDate, offerLetterValue, userValue, id, session, fetchUserData]);

  // Get default values for the form
  const getDefaultValues = useCallback(() => {
    if (userValue?.results[0]) {
      return {
        contract_type: userValue.results[0].contract_type || '',
        contract_duration: userValue.results[0].contract_duration || '',
        allocated_leaves: userValue.results[0].allocated_leaves || '',
        probation_status: userValue.results[0].probation_status || '',
        probation_duration: userValue.results[0].probation_duration || '',
        doj: userValue.results[0].doj || format(new Date(), 'MM/dd/yyyy'),
      };
    }
    return defaultValues;
  }, [userValue]);

  return (
    <Form<EmployeeContectInfoFormTypes>
      validationSchema={EmployeeContectInfoFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues: getDefaultValues(),
      }}
    >
      {({ register, control, setValue, getValues, formState: { errors } }) => {
        return (
          <>
            <FormGroup
              title="Contact Information"
              description="Update Employee Contact Info here"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
              <FormGroup
                title="Date Of Joining"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  name="doj"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      className="w-full text-gray-500 form-control border-none"
                      selected={startDate}
                      onChange={(date: Date) => {
                        setStartDate(date);
                        setValue('doj', date.toISOString().substring(0, 10), { shouldValidate: true });
                      }}
                      dateFormat="MM/dd/yyyy"
                      placeholderText="Select Date"
                      popperPlacement="bottom-end"
                      value={startDate}
                      style={{ height: 'auto' }}
                    />
                  )}
                />
              </FormGroup>

              <FormGroup
                title="Contract Type"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="contract_type"
                  render={({ field: { value, onChange } }: any) => (
                    <SelectBox
                      defaultValue={userValue?.results[0]?.contract_type}
                      placeholder={`${userValue?.results[0]?.contract_type}` || 'Select Contract Type'}
                      options={contractTypes}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        contractTypes?.find((r: any) => r.value === selected)?.name ?? ''
                      }
                    />
                  )}
                />
              </FormGroup>

              <FormGroup
                title="Contact Duration"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  className="col-span-full"
                  defaultValue={userValue?.results[0]?.contract_duration}
                  placeholder="Contract Duration"
                  {...register('contract_duration')}
                />
              </FormGroup>

              <FormGroup
                title="Allocated Leaves"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  className="col-span-full"
                  defaultValue={userValue?.results[0]?.allocated_leaves}
                  placeholder="Allocated Leaves"
                  {...register('allocated_leaves')}
                />
              </FormGroup>

              <FormGroup
                title="Probation Status"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="probation_status"
                  render={({ field: { value, onChange } }: any) => (
                    <SelectBox
                      defaultValue={userValue?.results[0]?.probation_status}
                      placeholder={`${userValue?.results[0]?.probation_status}` ||'Probation Status'}
                      options={probationStatusOptions}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        probationStatusOptions?.find((r: any) => r.value === selected)?.name ?? ''
                      }
                    />
                  )}
                />
              </FormGroup>

              <FormGroup
                title="Probation Duration"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  className="col-span-full"
                  defaultValue={userValue?.results[0]?.probation_duration}
                  placeholder="Probation Duration"
                  {...register('probation_duration')}
                />
              </FormGroup>

              <FormGroup title="Offer Letter" className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11">
                <UploadButton
                  modalView={<FileUpload id={id} />}
                  name="offer_letter"
                  onClick={handleChange}
                  value={offerLetterValue}
                />
              </FormGroup>
            </div>

            <FormFooter 
              altBtnText="Cancel" 
              submitBtnText="Update Contact Info" 
              altBtnOnClick={() => back()} 
              isLoading={isLoading}
            />
          </>
        );
      }}
    </Form>
  );
}