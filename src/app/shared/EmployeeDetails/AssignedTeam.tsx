// Import necessary dependencies and components
'use client'
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Form } from '@/components/ui/form';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import 'react-datepicker/dist/react-datepicker.css';
import apiService from '@/utils/apiService';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { decryptData } from '@/components/encriptdycriptdata';
import {
  defaultValues,
  teamAssinedSchema,
  teamAssinedSchemaFormTypes,
} from '@/utils/validators/assigned-team.schema';
import AssignedOffice from './Slector';
import { logs } from '../account-settings/logs';

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

export default function AssignedTeam({ id }:any) {
  const { data: session } = useSession();
  const [team, setTeam] = useState<any>();
  const { back } = useRouter();
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
        const result = await apiService.get('/emp-team');
        
        setTeam(result.data.data);
      } catch (error) {
        console.error('Error fetching days data:', error);
        toast.error('Error fetching days data. Please try again.');
      }
     
     
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const onSubmit: SubmitHandler<teamAssinedSchemaFormTypes> = async (data) => {
    
    

    try {
      
        const data1={...data, user:value?.user?.name}
        console.log("the data for the employee team is:",data1)
        const result = await apiService.put(`/update-employee-team/${id}`,data1);
        toast.success(result.data.message);

        if (result.data.success) {
          logs({ user: value?.user?.name, desc: 'Update Employee team' });
        }
      
      
    } catch (error) {
      console.error('Error updating Employee Team:', error);
      toast.error('Error updating Employee Team. Please try again.');
    }
  };

  

  return (
    <Form<teamAssinedSchemaFormTypes>
      validationSchema={teamAssinedSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues,
      }}
    >
      {({ register, control, setValue, getValues, formState: { errors } }) => {
   
        if(value?.user?.assigned_team==="m"){
          return (
            <FormGroup
              title="Assigned Team"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <p className="text-red-500">Managers cannot be assigned to any team.</p>
            </FormGroup>
          );
        }
        else{
        return (
          <>
            <FormGroup
              title="Assined to Team"
              description="Add Employee to team here"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
            




            <FormGroup
                title="Assigned Team"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="assigned_team"
                  render={({ field: { value, onChange } }:any) => {
                    // Find the option that matches the current value to set as the SelectBox value
                    const selectedOption = team?.find((item:any) => String(item.value) === value);

                    return (
                      <SelectBox
                       
                        value={selectedOption ? { label: selectedOption.name, value: String(selectedOption.value) } : null} 
                        placeholder="Select Manager"
                   
                        options={team?.map((item:any) => ({ label: item.name, value: String(item.value) }))}
                        // Update the form value on change
                        onChange={(selectedOption: SelectOption | null) => {
                          onChange(selectedOption ? selectedOption.value : '');
                        }}
                        className="col-span-full"
                       
                        // error={errors?.zonal_manager?.message} // Ensure this matches the name used in `Controller`
                      />
                    );
                  }}
                />
              </FormGroup>
              
            </div>
            <FormFooter altBtnText="Cancel" submitBtnText="Update team" altBtnOnClick={() => back()}/>
          </>
        );}
      }}
    </Form>
  );
}
