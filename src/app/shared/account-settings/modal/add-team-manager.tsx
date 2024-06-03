'use client';
import { logsCreate } from '@/app/shared/account-settings/logs'
import { useState,useEffect } from 'react';
import toast from 'react-hot-toast';
import { Controller, SubmitHandler } from 'react-hook-form';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { Text, Title } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import SelectBox from '@/components/ui/select';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';
interface SelectOption {
  label: string;
  value: string;
}
import {
  editTeamZoneFormTypes,
  editTeamZoneFormSchema,
  defaultValues,

} from '@/utils/validators/team-zones.schema';
import { decryptData } from '@/components/encriptdycriptdata';
export default function AddTeamMemberModalView() {
  const { closeModal } = useModal();
  const [reset, setReset] = useState<any>({});
  const [isLoading, setLoading] = useState(false);
  
  const { data: session } = useSession();
  
  const encryptedData = localStorage.getItem('uData');
const userValue: any =decryptData(encryptedData)


  const onSubmit: SubmitHandler<editTeamZoneFormTypes> = async (data) => {
    
    try {
       
      const result= await apiService.post(`/create-zone-team/?table=users_teams`, {
           ...data,user:userValue?.user?.name})
       toast.success(result.data.message);
       
       if(result.data.success){
         
        logsCreate({ user: userValue?.user?.name, desc: `Creat new Team` });
       
       }

   } catch (error) {
     console.error('Error Creating team:', error);
     toast.error('Error Creating Team. Please try again.');
   }
   
    // set timeout ony required to display loading state of the create product button
    setLoading(true);
    closeModal();
    setTimeout(() => {
      setLoading(false);
      console.log(' data ->', data);
      setReset({
        first_name: '',
        last_name: '',
        email: '',
        manager: '',
        country: '',
      });
    }, 600);
  };

  return (
    <div className="m-auto p-6">
      <Title as="h3" className="mb-6 text-lg">
        Add New Team
      </Title>
      <Form<editTeamZoneFormTypes>
        validationSchema={editTeamZoneFormSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        className="@container"
        useFormProps={{
          mode: 'onChange',
          defaultValues,
        }}
      >
        {({ register, control, formState: { errors } }) => (
          <>
            <MemberForm control={control} register={register} errors={errors} />
            <div className="mt-8 flex justify-end gap-3">
              <Button
                className="w-auto"
                variant="outline"
                onClick={() => closeModal()}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} className="w-auto">
                Add Manager
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
}


interface MemberFormProps {
  register: any;
  control: any;
  errors: any;
}



export function MemberForm({ register, control, errors }: MemberFormProps) {
  const [manager, setManager]=useState<any>();
  const { data: session } = useSession();
  const [value1, setValue1] = useState<any>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.get(`/all-members/?email=${session?.user?.email}`);
        
        const userData = response.data.data;
        setManager(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
      try {
        const response = await apiService.get(`/all-teams`);
        
        const userData = response.data.data;
        console.log("all the team is:",userData)
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

  return (
    <div className="flex flex-col gap-4 text-gray-700">
      <div className="flex flex-col gap-4 xs:flex-row xs:items-center">
         <Input
          type="text"
          label="Title"
          placeholder="Team"
          labelClassName="text-sm font-medium text-gray-900"
          {...register('title')}
          // error={errors?.title?.message}
          className="flex-grow"
        />
      
      </div>
     
      <Controller
                  control={control}
                  name="manager_id"
                  render={({ field: { value, onChange } }) => {
                    // Find the option that matches the current value to set as the SelectBox value
                    const selectedOption = manager?.find((item:any) => String(item.value) === value);

                    return (
                      <SelectBox
                       
                        value={selectedOption ? { label: selectedOption.name, value: String(selectedOption.value) } : null} 
                        label="Select Manager"
                        labelClassName="text-sm font-medium text-gray-900"
                        placeholder="Select Team Manager"
                   
                        options={manager?.map((item:any) => ({ label: item.name, value: String(item.value) }))}
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
       <Controller
                  control={control}
                  name="zone_id"
                  render={({ field: { value, onChange } }) => {
                    // Find the option that matches the current value to set as the SelectBox value
                    const selectedOption = value1?.find((item:any) => String(item.value) === value);

                    return (
                      <SelectBox
                       
                        value={selectedOption ? { label: selectedOption.name, value: String(selectedOption.value) } : null} 
                        label="Select Zone"
                        labelClassName="text-sm font-medium text-gray-900"
                        placeholder="Zone 1"
                   
                        options={value1?.map((item:any) => ({ label: item.name, value: String(item.value) }))}
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
    
    </div>
  );
}
