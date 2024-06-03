// PersonalInfoView.js

'use client';
import { logs } from '@/app/shared/account-settings/logs'
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/utils/apiService';
import { decryptData } from '@/components/encriptdycriptdata';
import { defaultValues, editTeamZoneFormTypes,editTeamZoneFormSchema } from '@/utils/validators/team-zones.schema';
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


export default function EditTeam({id}:any) {
  const { data: session } = useSession();
  const [value1, setValue1] = useState<any>();
 
  const [country, setCountry] = useState<any>([]);
  const { back } = useRouter();
  const encryptedData = localStorage.getItem('uData');
const userValue: any =decryptData(encryptedData)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.get(`/all-members/?email=${session?.user?.email}`);
        
        const userData = response.data.data;
        setCountry(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
      //all zones for team
      try {
        const response = await apiService.get(`/all-teams`);
        
        const userData = response.data.data;
       
        setValue1(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
   
     
    };

    if (session) {
      fetchData();
    }
  }, [session]);
// console.log("the user data is:--->",value)
  const onSubmit: SubmitHandler<editTeamZoneFormTypes> = async (data) => {
    
    try {
       
       const result= await apiService.put(`/zones-teams/${id}?table=users_teams`, {
            ...data,user:userValue?.user?.name})
        toast.success(result.data.message);
        
        if(result.data.success){
          
          logs({ user: userValue?.user?.name, desc: `Update team with id ${id}` });
         back()
        }

    } catch (error) {
      console.error('Error updating Customer details:', error);
      toast.error('Error updating Customer details. Please try again.');
    }
  };
 

  
 return(
    <Form<editTeamZoneFormTypes>
      validationSchema={editTeamZoneFormSchema}
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
              title="Edit Team Info"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
              

              
              <FormGroup
                title="Title"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
              
                  placeholder="Enter Title"
                  {...register('title')}
                  error={errors.title?.message}
                  className="col-span-full"
                />
              </FormGroup>
              
              <FormGroup
                title="Manager"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="manager_id"
                  render={({ field: { value, onChange } }) => {
                    // Find the option that matches the current value to set as the SelectBox value
                    const selectedOption = country.find((item:any) => String(item.value) === value);

                    return (
                      <SelectBox
                       
                        value={selectedOption ? { label: selectedOption.name, value: String(selectedOption.value) } : null} 
                        placeholder="Select Manager"
                   
                        options={country.map((item:any) => ({ label: item.name, value: String(item.value) }))}
                        // Update the form value on change
                        onChange={(selectedOption: SelectOption | null) => {
                          onChange(selectedOption ? selectedOption.value : '');
                        }}
                        className="col-span-full"
                       
                        error={errors?.zonal_manager?.message} // Ensure this matches the name used in `Controller`
                      />
                    );
                  }}
                />
              </FormGroup>
              
              <FormGroup
                title="Zone"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="zone_id"
                  render={({ field: { value, onChange } }) => {
                    // Find the option that matches the current value to set as the SelectBox value
                    const selectedOption = value1?.find((item:any) => String(item.value) === value);

                    return (
                      <SelectBox
                       
                        value={selectedOption ? { label: selectedOption.name, value: String(selectedOption.value) } : null} 
                        placeholder="Select Zone"
                   
                        options={value1?.map((item:any) => ({ label: item.name, value: String(item.value) }))}
                        // Update the form value on change
                        onChange={(selectedOption: SelectOption | null) => {
                          onChange(selectedOption ? selectedOption.value : '');
                        }}
                        className="col-span-full"
                       
                        error={errors?.zonal_manager?.message} // Ensure this matches the name used in `Controller`
                      />
                    );
                  }}
                />
              </FormGroup>



             
            </div>
            <FormFooter altBtnText="Cancel" submitBtnText="Update Team Info" />
          </>
        );
      }}
    </Form>
  );
}
