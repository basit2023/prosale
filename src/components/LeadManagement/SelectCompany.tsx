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
import LeadsForCompany from './AfterSelection';
import Vaultinformation from './LeadManagCard'
import { changeCompanyFormTypes,
    changeCompanyFormSchema,
    defaultValues,
 } from '@/utils/validators/select-company.shcema';

 interface SelectOption {
  label: string;
  value: string;
}



 export default function ChangeCompany({ setCompany_id, closeModal }:any) {
  
  const comanpy_id = localStorage.getItem('company_id');
  const [reset, setReset] = useState<any>({});
  const [isLoading, setLoading] = useState(false);
  const { data: session } = useSession();
  const onSubmit: SubmitHandler<changeCompanyFormTypes> = async (data) => {
    const { company_id } = data;
    setCompany_id(company_id);
    closeModal();
  };

  return (
    <div className="m-auto p-6">
      <Title as="h3" className="mb-6 text-lg">
        Select Company
      </Title>
      <Form<changeCompanyFormTypes>
        validationSchema={changeCompanyFormSchema}
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
                Company
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
}


export function MemberForm({ register, control, errors }: any) {
  const [manager, setManager]=useState<any>();
  const { data: session } = useSession();
  const [value1, setValue1] = useState<any>();
  const [value, setValue] = useState<any>();
  useEffect(() => {
    const fetchData = async () => {
      
      try {
        const response = await apiService.get(`/select-company/?email=${session?.user?.email}`);
        
        const userData = response.data.data;
       
        setValue1(userData);
      } catch (error) {
        console.error('Error fetching Company Name :', error);
        toast.error('Error fetching Company Name. Please try again.');
      }
   
     
    };

    if (session) {
      fetchData();
    }
  }, [session]);
  
  return (
    <div className="flex flex-col gap-4 text-gray-700">
       <Controller
                  control={control}
                  name="company_id"
                  render={({ field: { value, onChange } }) => {
                    // Find the option that matches the current value to set as the SelectBox value
                    const selectedOption = value1?.find((item:any) => String(item.value) === value);

                    return (
                      <SelectBox
                        // value={value ? { label: value, value } : null}
                        value={selectedOption ? { label: selectedOption.name, value: String(selectedOption.value) } : null} 
                        placeholder="Select Company"   //{value}
                        options={value1?.map((item:any) => ({ label: item.name, value: String(item.value) }))}
                        // Update the form value on change
                        
                      onChange={(selectedOption: SelectOption | null) => {
                        onChange(selectedOption ? selectedOption.value : '');
                      }}
                        className="col-span-full"
                       
                        error={errors?.company_id?.message} // Ensure this matches the name used in `Controller`
                      />
                    );
                  }}
                />
    
    </div>
  );
}


