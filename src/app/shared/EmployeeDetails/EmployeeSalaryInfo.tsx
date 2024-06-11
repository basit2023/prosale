// 'use client';
'use client';
import UploadZone from '@/components/ui/file-upload/upload-zone';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
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
import { decryptData } from '@/components/encriptdycriptdata';
// import { EmployeeContectInfoFormSchema,EmployeeContectInfoFormTypes,defaultValues } from '@/utils/validators/Employee-contectInfo.schema';
import { EmployeeSalaryInfoFormSchema,EmployeeSalaryInfoFormTypes,defaultValues } from '@/utils/validators/Employee-salaryinfo.schema';
import { Checkbox } from '@/components/ui/checkbox';
import Select from 'react-select'
import { useRouter } from 'next/navigation';
// import { Select } from '@/components/ui/selectbox';
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from "@chakra-ui/react";

const SelectBox = dynamic(() => import('@/components/ui/select'), {
    ssr: false,
    loading: () => (
      <div className="grid h-10 place-content-center">
        <Spinner />
      </div>
    ),
  });


  const customStyles = {
    control: (provided:any) => ({
      ...provided,
      borderColor: 'black', // Set default border color to black
      '&:hover': {
        borderColor: 'black', // Set hover color to black
      },
      '&:focus': {
        ...provided['&:focus'], // Preserve default focus styles
        outline: 'none',
        borderColor: 'black', // Set focus border color to black
        boxShadow: '0 0 0 1px black', // Simulate focus ring with box-shadow
      },
    }),
  };

export default function EmployeeSalaryInfo({id}:any) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userValue, setUserValue] = useState<any>();
  const [days, setDays] = useState<any>();
  const [sign, setSign] = useState<any>();
  const [insurance, setInsurance]=useState<any>('N')
  const { back } = useRouter();
  const [travelAllowanceStatus, setTravelAllowanceStatus] = useState(false);
  const [selectedSign, setSelectedSign] = useState(sign && sign.length > 0 ? sign[0].value : '');
  const [totalSalary, setTotalSalary]=useState<any>()
  const [value, setUserData]=useState<any>();
  const insHandler= () => {
    // Step 3
    const updatedValue = insurance == 'N' ? 'Y' : 'N';
    // console.log("i'm pressed")
    setInsurance(updatedValue);
  };
  // const [startDate, setStartDate] = useState(new Date());

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


  //useEffect for the user
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiService.get(`/employee-salary-info/${id}`);
    
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
      try {
        const result = await apiService.get('/rs-pr');
       
        setSign(result.data.data)
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
const onSubmit: SubmitHandler<EmployeeSalaryInfoFormTypes> = async (data) => {
  setIsSubmitting(true)
  //############################### Caculation##########################################

  let {basic_salary, health_check, health_type, health_value,
    travel_check, travel_type, travel_value,
    food_check, food_type, food_value,
    overtime_check, overtime_type, overtime_value, overtime_per,
    commission_check, commission_type, commission_value
  }:any = data;
  //health calculation
  let total_s = parseFloat(basic_salary);
  
  
  // Health calculation
  if (health_check === 'Y') {
    health_check = 'On';
    if (health_type === "Rs") {
      console.log("the health type is and --->",health_type,health_value)
      total_s = total_s - parseFloat(health_value);
    } else if (health_type === "%") { // Corrected variable name
      let pr = parseFloat(health_value)*100 ; // Changed 100 to divide instead of multiply
      total_s = total_s - pr;
    }
    
  }else{
    health_check = 'Off';
    health_type="N/A";
    health_value=0;
  }
  
  // Travel calculation
  if (travel_check === 'Y') {
    travel_check = 'On';
    if (travel_type === 'Rs') {
      total_s = total_s + parseFloat(travel_value);
    } else if (travel_type === "%") { // Corrected variable name
      let pr_t = parseFloat(travel_value)* 100; // Changed 100 to divide instead of multiply
      total_s = total_s + pr_t;
    }
  } else {
    travel_check = 'Off';
    travel_type="N/A"
    travel_value=0;
  }
  
  // Food calculation
  if (food_check === 'Y') {
    food_check = 'On';
    if (food_type === 'Rs') {
      total_s = total_s + parseFloat(food_value);
    } else if (food_type === "%") { // Corrected variable name
      let pr_f = parseFloat(food_value)* 100; // Changed 100 to divide instead of multiply
      total_s = total_s + pr_f;
    }
  } else {
    food_check = 'Off';
    food_type="N/A";
    food_value=0;
  }
  
  // Overtime calculation
  if (overtime_check === 'Y') {
    overtime_check = 'On';
    if (overtime_type === 'Rs') {
      total_s = total_s + parseFloat(overtime_value);
    } else if (overtime_type === "%") { // Corrected variable name
      let pr_o = parseFloat(overtime_value) *100; // Changed 100 to divide instead of multiply
      total_s = total_s + pr_o;
    }
  } else {
    overtime_check = 'Off';
    overtime_type="N/A";
    overtime_type=0;
  }
  
  // Commission calculation
  if (commission_check === 'Y') {
    commission_check = 'On';
    if (commission_type === 'Rs') {
      total_s = total_s + parseFloat(commission_value);
    } else if (commission_type === "%") { // Corrected variable name
      let pr_c = parseFloat(commission_value) *100; // Changed 100 to divide instead of multiply
      total_s = total_s + pr_c;
    }
  } else {
    commission_check = 'Off';
    commission_type="N/A";
    commission_value=0;

  }
  
 

  setTotalSalary(total_s)

  //*******************************Updating data for back-end**************************************** */
    data.commission_check=commission_check;
    data.commission_type=commission_type;
    data.commission_value=commission_value;
    data.overtime_check=overtime_check;
    // data.overtime_type=overtime_type;
    data.overtime_value=overtime_value;
    data.food_check=food_check;
    data.food_type=food_type;
    data.food_value=food_value;
    data.travel_check=travel_check;
    data.travel_type=travel_type;
    data.travel_value=travel_value;
    data.health_check=health_check;
    data.health_type=health_type;
    data.health_value=health_value;
    data.user_id=value?.user?.id
    data.user=value?.user?.name
   
//****************************************************************************************** */
  try {
   
   

    if (userValue?.results[0]?.user_id) {
          const result = await apiService.put(`/update_employee-salary-info/${id}`, {
            ...data,
            
          });
          toast.success(result.data.message);
          
          // console.log("the success message is:", result.data.success);
          if (result.data.success) {
            logs({ user: value?.user?.name, desc: 'Employee Salary Info' });
            
          }
    } else {
          const result = await apiService.post(`/create-employee-salary-info/${id}`, {
            ...data,
            
          });
          toast.success(result.data.message);
          if (result.data.success) {
            logsCreate({ user: value?.user?.name, desc: 'Employee Salary info' });
            
          }
        }
  } catch (error) {
    console.error('Error updating Salary:', error);
    toast.error('Error updating Salary. Please try again.');
  }
  finally {
    setIsSubmitting(false);
  }
};
  



 
  
  useEffect(() => {
    // If selectedSign is not set, set it to the default value (first option in the sign array)
    if (!selectedSign && sign && sign.length > 0) {
    
      setSelectedSign(sign[0].value);
    }
  
    // console.log('Current selectedSign:', selectedSign);
  }, [sign, selectedSign]);


  const Overtime_p=[{name:"Hour",value:"h"},{name:"Day",value:"day"}]
//  console.log("the allocated period is: ", value?.user?.name)
 return (
    <Form<EmployeeSalaryInfoFormTypes>
      validationSchema={EmployeeSalaryInfoFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues,
      }}
     
    >
      {({ register, control, setValue, getValues, formState: { errors } }:any) => {
        return (
          <>
            <FormGroup
              title="Salary Information"
              description="Update Employee salary Info here"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
            
            
            
            
            <FormGroup
                  title="Basic Salary" 
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <NumberInput
                    
                    min={0}
                    
                    onChange={(valueString, valueNumber) => setValue('basic_salary', valueNumber)}
                    className="col-span-full border-gray-400 focus:outline-none focus:border-black"
                  >
                    <NumberInputField
                    className="col-span-full focus:outline-black border-gray-200 hover:border-gray-600 rounded focus:border-black focus:ring-1 focus:ring-gray-1000 bg-transparent"
                      // className="col-span-full"
                      defaultValue={userValue?.results[0]?.salary}
                      placeholder="Total Salary"
                      {...register('basic_salary')}
                      // error={errors.city?.message}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormGroup>
           

                <FormGroup
                  title="Health Insurance"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  {/* Code for checkbox */}
                  <Controller
                    control={control}
                    name="health_check"
                    render={({ field: { value, onChange } }) => (
                      <div className="flex items-center space-x-8 bg-transparent">
                        <Checkbox
                          checked={value === 'Y'}
                          onChange={(e) => {
                            onChange(e.target.checked ? 'Y' : 'N');
                            if (!e.target.checked) {
                              setValue("health_type", "N/A");
                            }
                          }}
                        />
                        <>
                          {/* Code for the select box */}
                          <Select
                            // styles={customStyles} 
                            name="health_type"
                            className="border flex-shrink-0 rounded focus:border-black focus:ring-0 hover:border-black bg-transparent w-250px"
                            options={sign || []}
                            onChange={(selected) => {
                              setSelectedSign(selected?.value || '');
                              // Set the selected value in health_type
                              setValue("health_type", selected?.name || 'Rs');
                            }}
                            defaultValue={sign?.find((r:any) => r.value === selectedSign) || null}
                           
                            styles={{  control: (provided, state) => ({
                              ...provided,
                              backgroundColor: 'transparent',
                              color: 'black',
                              '&:hover': {
                                borderColor: '#4b5563',
                              },
                              '&:focus': {
                                borderColor: '#6b7280',
                                outline: 'none',
                                boxShadow: state.isFocused ? '#6b7280' : 'none', // Apply focus ring only if focused and visible
                              },
                              '&:focus-visible': {
                                borderColor: '#6b7280', // Change to your desired focus border color
                                outline: '#6b7280',
                                boxShadow: '#6b7280', // Change to your desired focus ring
                              }
                            }),   }}
                            getOptionValue={(option:any) => option.value}
                            getOptionLabel={(option:any) => option.name}
                            isSearchable={false}
                            placeholder="Rs"
                          />
                        </>
                        {value === 'Y' && (
                          <>
                            {/* Code for the input money */}
                            <Input
                              className="col-span-full flex-grow"
                              style={{ width: '495px' }}
                              defaultValue={userValue?.results[0]?.health_value}
                              placeholder="Health Charges"
                              {...register('health_value')}
                              // error={errors.city?.message}
                            />
                          </>
                        )}
                      </div>
                    )}
                  />
                </FormGroup>



            
                <FormGroup
                  title="Travel Allowance"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  
                  <Controller
                    control={control}
                    name="travel_check"
                    render={({ field: { value, onChange } }) => (
                      <div className="flex items-center space-x-8">
                        <Checkbox
                          checked={value === 'Y'}
                          onChange={(e) => {
                            onChange(e.target.checked ? 'Y' : 'N');
                            setTravelAllowanceStatus(e.target.checked);
                            
                          }}
                        />
                        {
                          <>
                            
                            <Select
                            // styles={customStyles}
                            className="border flex-shrink-0 border-black hover:border-black bg-transparent w-250px"
                              options={sign || []}
                              onChange={(selected) => {
                                console.log('Selected value:', selected);
                                setSelectedSign(selected?.value || '');
                                setValue("travel_type", selected ? selected.name : 'Rs');
                              }}
                              defaultValue={
                                sign && sign.length > 0
                                  ? sign.find((r:any) => r.value === selectedSign) || null
                                  : null
                              }
                              
                              styles={{  control: (provided, state) => ({
                                ...provided,
                                backgroundColor: 'transparent',
                                color: 'black',
                                '&:hover': {
                                  borderColor: '#4b5563',
                                },
                                '&:focus': {
                                  borderColor: '#6b7280',
                                  outline: 'none',
                                  boxShadow: state.isFocused ? '#6b7280' : 'none', // Apply focus ring only if focused and visible
                                },
                                '&:focus-visible': {
                                  borderColor: '#6b7280', // Change to your desired focus border color
                                  outline: '#6b7280',
                                  boxShadow: '#6b7280', // Change to your desired focus ring
                                }
                              }),   }}
                              getOptionValue={(option) => option.value}
                              getOptionLabel={(option) => option.name}
                              isSearchable={false} // remove if you want a searchable dropdown
                              placeholder="Rs"
                            />
                          </>
                        }
                        {value === 'Y' && (
                          <>
                            
                            <Input
                              className="col-span-full flex-grow"
                              style={{ width: '495px' }}
                              defaultValue={userValue?.results[0]?.travel_value}
                              placeholder="Travel Charges"
                              {...register('travel_value')}
                              // error={errors.city?.message}
                            />
                          </>
                        )}
                      </div>
                    )}
                  />
                </FormGroup>


                <FormGroup
                  title="Food Allowance"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  
                  <Controller
                    control={control}
                    name="food_check"
                    render={({ field: { value, onChange } }) => (
                      <div className="flex items-center space-x-8">
                        <Checkbox
                          checked={value === 'Y'}
                          onChange={(e:any) => {
                            onChange(e.target.checked ? 'Y' : 'N');
                            setTravelAllowanceStatus(e.target.checked);
                          }}
                        />
                        {
                          <>
                           
                            <Select
                            // styles={customStyles}
                            className="border flex-shrink-0 border-black hover:border-black bg-transparent w-250px"
                              options={sign || []}
                              onChange={(selected) => {
                                console.log('Selected value:', selected);
                                setSelectedSign(selected?.value || '');
                                setValue("food_type", selected ? selected.name : 'Rs');
                              }}
                              defaultValue={
                                sign && sign.length > 0
                                  ? sign.find((r:any) => r.value === selectedSign) || null
                                  : null
                              }
                              
                              styles={{  control: (provided, state) => ({
                                ...provided,
                                backgroundColor: 'transparent',
                                color: 'black',
                                '&:hover': {
                                  borderColor: '#4b5563',
                                },
                                '&:focus': {
                                  borderColor: '#6b7280',
                                  outline: 'none',
                                  boxShadow: state.isFocused ? '#6b7280' : 'none', 
                                },
                                '&:focus-visible': {
                                  borderColor: '#6b7280', 
                                  outline: '#6b7280',
                                  boxShadow: '#6b7280', 
                                }
                              }),  }}
                              getOptionValue={(option) => option.value}
                              getOptionLabel={(option) => option.name}
                              isSearchable={false} // remove if you want a searchable dropdown
                              placeholder="Rs"
                            />
                          </>
                        }
                        {value === 'Y' && (
                          <>
                         
                            <Input
                              className="col-span-full flex-grow"
                              style={{ width: '495px' }}
                              defaultValue={userValue?.results[0]?.food_value}
                              placeholder="Food Charges"
                              {...register('food_value')}
                              // error={errors.city?.message}
                            />
                          </>
                        )}
                      </div>
                    )}
                  />
                </FormGroup>

                <FormGroup
                  title="Overtime"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                 
                  <Controller
                    control={control}
                    name="overtime_check"
                    render={({ field: { value, onChange } }) => (
                      <div className="flex items-center space-x-8">
                        <Checkbox
                          checked={value === 'Y'}
                          onChange={(e:any) => {
                            onChange(e.target.checked ? 'Y' : 'N');
                            setTravelAllowanceStatus(e.target.checked);
                          }}
                        />
                        {
                          <>
                            
                            <Select
                            // styles={customStyles}
                            className="border flex-shrink-0 border-black hover:border-black bg-transparent w-250px"
                            styles={{  control: (provided, state) => ({
                                ...provided,
                                backgroundColor: 'transparent',
                                color: 'black',
                                '&:hover': {
                                  borderColor: '#4b5563',
                                },
                                '&:focus': {
                                  borderColor: '#6b7280',
                                  outline: 'none',
                                  boxShadow: state.isFocused ? '#6b7280' : 'none', 
                                },
                                '&:focus-visible': {
                                  borderColor: '#6b7280', 
                                  outline: '#6b7280',
                                  boxShadow: '#6b7280', 
                                }
                              }),  }}
                              options={sign || []}
                              onChange={(selected) => {
                                console.log('Selected value:', selected);
                                setSelectedSign(selected?.value || '');
                                setValue("overtime_type", selected ? selected.name : 'Rs');
                              }}
                              defaultValue={
                                sign && sign.length > 0
                                  ? sign.find((r:any) => r.value === selectedSign) || null
                                  : null
                              }
                             
                              
                              getOptionValue={(option:any) => option.value}
                              getOptionLabel={(option:any) => option.name}
                              isSearchable={false} // remove if you want a searchable dropdown
                              placeholder="RS"
                            />
                          </>
                        }
                        {value === 'Y' && (
                          <>
                            
                            <Input
                              className="col-span-full flex-grow"
                              style={{ width: '350px' }}
                              defaultValue={userValue?.results[0]?.overtime_value}
                              placeholder="Overtime Charges"
                              {...register('overtime_value')}
                              error={errors.city?.message}
                            />
                            <Select
                            // styles={customStyles}
                            className="border flex-shrink-0 border-black hover:border-black bg-transparent w-250px"
                             styles={{  control: (provided, state) => ({
                                ...provided,
                                backgroundColor: 'transparent',
                                color: 'black',
                                '&:hover': {
                                  borderColor: '#4b5563',
                                },
                                '&:focus': {
                                  borderColor: '#6b7280',
                                  outline: 'none',
                                  boxShadow: state.isFocused ? '#6b7280' : 'none', 
                                },
                                '&:focus-visible': {
                                  borderColor: '#6b7280', 
                                  outline: '#6b7280',
                                  boxShadow: '#6b7280', 
                                }
                              }),   }}
                              options={Overtime_p || []}
                              onChange={(selected) => {
                                console.log('Selected value:', selected);
                                setSelectedSign(selected?.value || '');
                                setValue("overtime_per", selected ? selected.name : 'Rs');

                              }}
                              defaultValue={
                                Overtime_p && Overtime_p.length > 0
                                  ? Overtime_p.find((r) => r.value === selectedSign) || null
                                  : null
                              }
                              
                              // styles={{  }} // adjust width as needed
                              getOptionValue={(option) => option.value}
                              getOptionLabel={(option) => option.name}
                              isSearchable={false} // remove if you want a searchable dropdown
                              placeholder="hour"
                            />
                          </>
                        )}
                      </div>
                    )}
                  />
                </FormGroup>

                <FormGroup
                  title="Commission"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
               
                  <Controller
                    control={control}
                    name="commission_check"
                    render={({ field: { value, onChange } }) => (
                      <div className="flex items-center space-x-8">
                        <Checkbox
                          checked={value === 'Y'}
                          onChange={(e) => {
                            onChange(e.target.checked ? 'Y' : 'N');
                            setTravelAllowanceStatus(e.target.checked);
                          }}
                        />
                        {
                          <>
                            
                            <Select
                            // styles={customStyles}
                            className="border border-black hover:border-black bg-transparent flex-shrink-0 w-250px"
                              options={sign || []}
                              onChange={(selected) => {
                                console.log('Selected value:', selected);
                                setSelectedSign(selected?.value || '');
                                setValue("commission_type", selected ? selected.name : 'Rs');
                              }}
                              defaultValue={
                                sign && sign.length > 0
                                  ? sign.find((r:any) => r.value === selectedSign) || null
                                  : null
                              }
                            
                               styles={{  control: (provided, state) => ({
                                ...provided,
                                backgroundColor: 'transparent',
                                color: 'black',
                                '&:hover': {
                                  borderColor: '#4b5563',
                                },
                                '&:focus': {
                                  borderColor: '#6b7280',
                                  outline: 'none',
                                  boxShadow: state.isFocused ? '#6b7280' : 'none', 
                                },
                                '&:focus-visible': {
                                  borderColor: '#6b7280', 
                                  outline: '#6b7280',
                                  boxShadow: '#6b7280', 
                                }
                              }),}}
                              getOptionValue={(option) => option.value}
                              getOptionLabel={(option) => option.name}
                              isSearchable={false} // remove if you want a searchable dropdown
                              placeholder="Rs"
                            />
                          </>
                        }
                        {value === 'Y' && (
                          <>
                            
                            <Input
                              className="col-span-full flex-grow"
                              style={{ width: '495px' }}
                              defaultValue={userValue?.results[0]?.commission_value}
                              placeholder="Commission Charges"
                              {...register('commission_value')}
                              error={errors.city?.message}
                            />
                          </>
                        )}
                      </div>
                    )}
                  />
                </FormGroup>
               

                <FormGroup
                title="Total Salary"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <div className="col-span-full flex items-center border border-gray-300 bg-gray-200 p-3 rounded-md">
                  {/* <PiEnvelopeSimple className="h-6 w-6 text-gray-500 mr-2" /> */}
                  <span className="text-gray-700">{totalSalary}</span>
                </div>
              </FormGroup>
                
                
              {isSubmitting && (
                  <div className="absolute top-0 left-10 w-full flex items-center justify-center z-50">
                    <Spinner />
                  </div>
                )}

              
            </div>
            <FormFooter altBtnText="Cancel" submitBtnText="Update Salary Info" altBtnOnClick={() => back()}/>
          </>
        );
      }}
    </Form>
  );
}