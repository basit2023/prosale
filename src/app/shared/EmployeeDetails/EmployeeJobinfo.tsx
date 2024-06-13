// Import necessary dependencies and components
'use client'
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import apiService from '@/utils/apiService';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  defaultValues,
  employeeJobSchema,
  employeeJobSchemaFormTypes,
} from '@/utils/validators/employee-job.schema';
import AssignedOffice from './Slector';
import { decryptData } from '@/components/encriptdycriptdata';

const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});

export default function EmployeeJobInfo({ id }:any) {
  const { data: session } = useSession();
  const { back } = useRouter();
  const [days, setDays] = useState<any>();
  const [startTimeIn, setStartTimeIn] = useState<Date>();
  const [startTimeOut, setStartTimeOut] = useState<Date>();
  const [jobInfo, setJobInfo] = useState<any>();
  const [dropDownOffice, setDropDownOffice] = useState<any>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [value, setUserData]=useState<any>();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const encryptedData = localStorage.getItem('uData');
        if (encryptedData) {
          const data = decryptData(encryptedData);
          setUserData(data);
        } 
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
    };

    fetchUserData();
  }, [session]);
  useEffect(() => {
    const fetchData = async () => {
     
      try {
        const result = await apiService.get('/alldays');
        setDays(result.data.alldays);
      } catch (error) {
        console.error('Error fetching days data:', error);
        toast.error('Error fetching days data. Please try again.');
      }
      try {
        const d_offices = await apiService.get('/drop-down-oficess');
        // console.log("the drop down offices is:",d_offices.data.alloffices)
        setDropDownOffice(d_offices.data.alloffices)
        // setDays(result.data.alldays);
      } catch (error) {
        console.error('Error fetching offices data:', error);
        toast.error('Error fetching days data. Please try again.');
      }
      try {
        const job_response = await apiService.get(`/employee-office/${id}`);
        const job_result = job_response.data.results;
        // console.log("the office is:",job_result[0])
        setJobInfo(job_result[0]);
      } catch (error) {
        console.error('Error fetching job data:', error);
        toast.error('Error fetching job data. Please try again.');
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const onSubmit: SubmitHandler<employeeJobSchemaFormTypes> = async (data) => {
    setIsLoading(true); 
    let result = '';
    if(data.assigned_offices){
     const options = data.assigned_offices
// Check for the presence of 'Elaan Head Office' and 'Elaan Corporate Office'
const hasHeadOffice = options.some((option:any) => option.value === 'Elaan Head Office');
const hasCorporateOffice = options.some((option:any) => option.value === 'Elaan Corporate Office');

if (hasHeadOffice && hasCorporateOffice) {
  result = '1,2';
} else if (hasCorporateOffice) {
  result = '2';
} else if (hasHeadOffice) {
  result = '1';
}
    }

// console.log("The result is:", result);


    let data1={...data,user: value.user.name,offices:result}
    

    try {
      if (jobInfo) {
        // console.log("the user id is#################:",jobInfo?.user_id)
        // console.log('Submitting form:', data1);
        const result = await apiService.put(`/update-employee-office-job/${id}`, data1);
        toast.success(result.data.message);

        if (result.data.success) {
          // logs({ user: value?.user?.name, desc: 'Profile Details' });
        }
      } else {
        const result = await apiService.post(`/create-employee-office-job/${id}`, data1);
        toast.success(result.data.message);

        if (result.data.success) {
          // logs({ user: value?.user?.name, desc: 'Profile Details' });
        }
      }
    } catch (error:any) {
      console.error('Error updating job information:', error);
      toast.error('Error updating jobinformation. Please try again.');
    }finally {
      setIsLoading(false);
    }
  };

  const officeValues = AssignedOffice(id);
  const AssignOffice = officeValues.map((item:any) => item.office);
  // console.log("the office name are1:",AssignOffice)
  

  const officeNamesArray =jobInfo?.office_names ? jobInfo?.office_names.split(',').map((name:any) => name.trim()) : [];
  // console.log("the office name are:",officeNamesArray)
  let roles = [];

  if (days && days.length > 0) {
    roles = days.map((day:any) => ({
      name: day.day,
      value: day.day.toLowerCase(),
    }));
  } else {
    setTimeout(() => {}, 1000);
  }

  return (
    <Form<employeeJobSchemaFormTypes>
      validationSchema={employeeJobSchema}
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
              title="Job Info"
              description="Update Employee Job details here"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
            <FormGroup
                  title="Time In"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  
                  <Controller
                    name="time_in"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        // className="h-6 w-6 text-gray-500"
                        selected={startTimeIn}
                        onChange={(date: any) => {
                          setStartTimeIn(date);
                          setValue('time_in', date, { shouldValidate: true });
                        }}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        dateFormat="h:mm aa" // Adjust the format to match "09/21/1996"
                        defaultValue={jobInfo?.time_in}
                        placeholderText={jobInfo?.time_in ? jobInfo?.time_in :"Select Time In"}
                        // @ts-ignore
                        value={startTimeIn}
                       
                        className="w-full mt-2 px-4 py-2 border rounded focus:border-gray-900 bg-transparent" // Use Bootstrap utility classes
                        style={{ height: 'auto' }}
                      />
                    )}
                  />
                </FormGroup>

            <FormGroup
                  title="Time Out"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  
                  <Controller
                    name="time_out"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        // className="h-6 w-6 text-gray-500"
                        selected={startTimeOut}
                        onChange={(date: any) => {
                          setStartTimeOut(date);
                          setValue('time_out', date, { shouldValidate: true });
                        }}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        dateFormat="h:mm aa" // Adjust the format to match "09/21/1996"
                        defaultValue={jobInfo?.time_out}
                        placeholderText={jobInfo?.time_out? jobInfo?.time_out :"Select Time Out"}
                        // @ts-ignore
                        value={startTimeOut}
                
                        className="w-full mt-2 px-4 py-2 border rounded focus:border-gray-900 bg-transparent" // Use Bootstrap utility classes
                        style={{ height: 'auto' }}
                      />
                    )}
                  />
                </FormGroup>



              {/* <FormGroup
                title="Time Out"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <DatePicker
                  name="time_out"
                  selected={startTime}
                  onChange={(date) => {
                    setStartTime(date);
                    setValue('time_out', date, { shouldValidate: true });
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  dateFormat="h:mm aa"
                  placeholderText="Select Time Out"
                  className="w-full mt-2 px-4 py-2 border rounded focus:border-gray-900"
                />
              </FormGroup> */}

              <FormGroup
                title="Assigned Office"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="assigned_offices"
                  render={({ field: { value, onChange } }) => (
                    <Select
                      isMulti
                      defaultValue={officeNamesArray.map((selectedIsp:any) => ({
                        value: selectedIsp,
                        label: selectedIsp,
                      }))}
                      placeholder='Enter Assigned Office'
                      options={(dropDownOffice || []).map((option:any) => ({
                        value: option.trim(),
                        label: option.trim(),
                      }))}
                      onChange={(selectedOptions:any) => {
                        onChange(
                          selectedOptions
                            ? selectedOptions.map((option:any) => option.value)
                            : []
                        );
                        setValue('assigned_offices', selectedOptions, { shouldValidate: true });
                      }}
                      className="col-span-full bg-transparent"
                      isSearchable
                    />
                  )}
                />
              </FormGroup>

              <FormGroup
                title="Day Off"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="dayoff"
                  render={({ field: { value, onChange } }) => (
                    <SelectBox
                      defaultValue={jobInfo?.day_off}
                      placeholder={jobInfo?.day_off ? jobInfo.day_off : 'Select Day Off'}
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

              
              
            </div>
            <FormFooter altBtnText="Cancel" submitBtnText="Update Job Info" altBtnOnClick={() => back()} isLoading={isLoading}/>
          </>
        );
      }}
    </Form>
  );
}
