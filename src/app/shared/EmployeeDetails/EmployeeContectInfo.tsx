// 'use client';
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
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';
import { DatePicker } from '@/components/ui/datepicker';
import { logs,logsCreate } from '../account-settings/logs';
import { EmployeeContectInfoFormSchema,EmployeeContectInfoFormTypes,defaultValues } from '@/utils/validators/Employee-contectInfo.schema';
// import { defaultValues,PersonalInfoFormTypes,personalInfoFormSchema } from '@/utils/validators/my-details.schema';
import FileUpload from '@/app/shared/EmployeeDetails/file-upload';
import UploadButton from './upload-button';
// import UploadButton from '@/app/shared/upload-button';
import { decryptData } from '@/components/encriptdycriptdata';


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
    }>;
  };
 
  
  type FileUploadProps = {
    name: any
    setValue: any;
    getValues: any;
    id: string;
  };

export default function EmployeeContectInfo({id}:any) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userValue, setUserValue] = useState<UserType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [days, setDays] = useState<any>();
  // const [startDate, setStartDate] = useState(new Date());
  
  const [offerLetterValue, setOfferLetterValue] = useState('No'); // Step 1

  const handlechange = () => {
    // Step 3
    const updatedValue = offerLetterValue == 'No' ? 'Yes' : 'No';
    console.log("i'm pressed")
    setOfferLetterValue(updatedValue);
  };
  const encryptedData = localStorage.getItem('uData');
  const value: any =decryptData(encryptedData)
  


  //useEffect for the user
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiService.get(`/employee-contect-info/${id}`);
     
        const userData = response.data;
        setUserValue(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
      try {
        const result = await apiService.get('/allcontract');
        // console.log("the contrat type is:",result)
        setDays(result.data.contracts);
      } catch (error) {
        console.error('Error fetching days data:', error);
        toast.error('Error fetching days data. Please try again.');
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);
// console.log("the user data is:--->",userValue)
const onSubmit: SubmitHandler<EmployeeContectInfoFormTypes> = async (data) => {
  setIsSubmitting(true)

  try {
    // console.log("created data user_id is:", value?.user_id);

    // Format the date to match "MM/dd/yyyy"
    const formattedDate = format(startDate, 'MM/dd/yyyy');
   console.log("the formated data is:",formattedDate)
  console.log("the value of the preesed at sumbit time:",offerLetterValue)

    if (userValue?.results[0]?.user_id) {
          const result = await apiService.put(`/update_employee-contect-info/${id}`, {
            ...data,
            doj: formattedDate, // Update the date field with the formatted date
            offer_letter:offerLetterValue,
          });
          toast.success(result.data.message);
          setOfferLetterValue('No');
          // console.log("the success message is:", result.data.success);
          if (result.data.success) {
            logs({ user: value?.user?.name, desc: 'Employee Contect Info' });
            
          }
    } else {
          const result = await apiService.post(`/create-employee-contect-info/${id}`, {
            ...data,
            doj: formattedDate, // Update the date field with the formatted date
            user_id: value?.user?.id,
            user: value?.user?.name,
            offer_letter:offerLetterValue,
          });

          toast.success(result.data.message);
          setOfferLetterValue('No');
          if (result.data.success) {
            logsCreate({ user: value?.user?.name, desc: 'Employee Contect info' });
            
          }
        }
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error('Error updating profile. Please try again.');
  }finally {
    setIsSubmitting(false);
  }
};
  const handleEditProfileClick = () => {
    // Toggle the state when the button is clicked
    setIsEditing((prev) => !prev);
  }
  let roles:any = [];

  if (days && days.length > 0) {
    roles = days.map((day:any) => ({
      name: day,
      value: day.toLowerCase(),
    }));
  } else {
    setTimeout(() => {}, 1000);
  }
  
  const status=[{name:"Yes",value:"Y"},{name:"No",value:"N"}]

 return (
    <Form<EmployeeContectInfoFormTypes>
      validationSchema={EmployeeContectInfoFormSchema}
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
              title="Contect Information"
              description="Update Employee Contect Info here"
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
                        dateFormat="MM/dd/yyyy" // Adjust the format to match "09/21/1996"
                        placeholderText="Select Date"
                        popperPlacement="bottom-end"
                        // @ts-ignore
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
                  render={({ field: { value, onChange } }:any) => (
                    <SelectBox
                      defaultValue={userValue?.results[0]?.contract_type}
                      placeholder='Select Contract Type'
                      options={roles || []}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        roles?.find((r:any) => r.value === selected)?.name ?? ''
                      }
                      // error={errors?.role?.message as string}
                    />
                  )}
                />
                </FormGroup>
                <FormGroup
                  title="Contact Duration"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                //   description="Enter an alternative email if you’d like to be contacted via a different email."
                >
                  <Input
                    // prefix={
                    //   <PiBuildingsThin  className="h-6 w-6 text-gray-500" />
                    // }
 
                    className="col-span-full"
                    defaultValue={userValue?.results[0]?.contract_duration}
                    placeholder="Your City Name"
                    {...register('contract_duration')}
                    // error={errors.city?.message}
                  />
                </FormGroup>
                <FormGroup
                  title="Allocated Leaves" 
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                //   description="Enter an alternative email if you’d like to be contacted via a different email."
                >
                  <Input
                    // prefix={
                    //   <PiBuildingsThin  className="h-6 w-6 text-gray-500" />
                    // }
 
                    className="col-span-full"
                    defaultValue={userValue?.results[0]?.allocated_leaves}
                    placeholder="Your City Name"
                    {...register('allocated_leaves')}
                    // error={errors.city?.message}
                  />
                </FormGroup>
                <FormGroup
                title="Probation Status"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="probation_status"
                  render={({ field: { value, onChange } }:any) => (
                    <SelectBox
                      // defaultValue={jobInfo?.day_off}
                      placeholder={'Probation Status'}
                      options={status || []}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        status?.find((r:any) => r.value === selected)?.name ?? ''
                      }
                      // error={errors?.status?.message as string}
                    />
                  )}
                />
                </FormGroup>
                <FormGroup
                  title="Probation Duration" 
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                //   description="Enter an alternative email if you’d like to be contacted via a different email."
                >
                  <Input
                    // prefix={
                    //   <PiBuildingsThin  className="h-6 w-6 text-gray-500" />
                    // }
 
                    className="col-span-full"
                    defaultValue={userValue?.results[0]?.probation_duration}
                    placeholder="Your City Name"
                    {...register('probation_duration')}
                    // error={errors.city?.message}
                  />
                </FormGroup>
                {/* <FormGroup
                title="Offer Letter"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <UploadButton modalView={<FileUpload 
                name="offer_letter"
                setValue={setValue}
                getValues={getValues}
                />} />
              </FormGroup> */}
               <FormGroup title="Offer Letter" className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11">
              <UploadButton
                modalView={<FileUpload 
                  // name="offer_letter" 
                  // setValue={setValue} 
                  // getValues={getValues} 
                  id={id}
                  />}
                name="offer_letter"
                onClick={handlechange} // Fix: Correct the attribute name to "onClick"
                value={offerLetterValue}
              />
            </FormGroup>
            {isSubmitting && (
                  <div className="absolute top-0 left-10 w-full flex items-center justify-center z-50">
                    <Spinner />
                  </div>
                )}
              
            </div>
            <FormFooter altBtnText="Cancel" submitBtnText="Update Contect Info" />
          </>
        );
      }}
    </Form>
  );
}