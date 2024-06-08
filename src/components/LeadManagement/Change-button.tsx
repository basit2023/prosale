// Import necessary dependencies and components
'use client'
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import Spinner from '@/components/ui/spinner';
import apiService from '@/utils/apiService';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import Vaultinformation from './LeadManagCard';
import { decryptData } from '@/components/encriptdycriptdata';
import { changeCompanyFormTypes,
  changeCompanyFormSchema,
  defaultValues,
} from '@/utils/validators/select-company.shcema';

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




export default function ChangeCompanyButton({ onCompanyIdChange, company }:any) {
  const { data: session } = useSession();
  const [labels, setLabels] = useState<any>();
  const [jobInfo, setJobInfo] = useState<any>();
  const [value, setValue] = useState<any>([]);
  const [company_id1, setCompany_id]=useState<any>()
  const [value1, setUserData]=useState<any>();
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
        const response = await apiService.get(`/select-company/?email=${session?.user?.email}`);
        const userData = response.data.data;
        setLabels(userData);
      } catch (error) {
        console.error('Error fetching labels data:', error);
        toast.error('Error fetching labels data. Please try again.');
      }
      
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {

          const response = await apiService.get(`/single-company/?id=${company}`);
          const userData = response?.data?.data[0]?.name;
         
           
          setValue(userData);
        }
      } catch (error:any) {
        console.error('Error fetching Company Name:', error);
        toast.error(error.response.data.message)
        
      }
    };

    fetchData();
  
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }, [company]);



  const onSubmit: SubmitHandler<changeCompanyFormTypes> = async (data) => {
    const { company_id } = data;
    
    onCompanyIdChange(company_id); // Lift the state up to the parent component
  };
  
  let placeholder:any=value;
  if (value1 === null || value1?.user?.company_id.length <= 1) {
  return null;
} else {
  return (
  <>
    <div className="flex flex-col-reverse sm:flex-row justify-end relative z-10" style={{ overflow: 'visible' }}>
      <Form<changeCompanyFormTypes>
        validationSchema={changeCompanyFormSchema}
        onSubmit={onSubmit}
        className="flex flex-col"
        useFormProps={{
          mode: 'onChange',
          defaultValues,
        }}
      >
        {({ register, control, setValue, getValues, formState: { errors } }:any) => (
          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11 relative z-50" style={{ overflow: 'visible'}}>
            <div className="flex items-center justify-between sm:justify-end gap-4"> 
              <label className="w-28"></label>
              <Controller
                 
                  control={control}
                  name="company_id"
                  render={({ field: { value, onChange } }) => {
                    // Find the option that matches the current value to set as the SelectBox value
                    const selectedOption = labels?.find((item:any) => String(item.value) === value);

                    return (
                      <SelectBox
                     
                        value={selectedOption ? { label: selectedOption.name, value: String(selectedOption.value) } : null} 
                        placeholder={placeholder}
                        options={labels?.map((item:any) => ({ label: item.name, value: String(item.value) }))}
                        // Update the form value on change
                        onChange={(selectedOption: SelectOption | null) => {
                          onChange(selectedOption ? selectedOption.value : '');
                        }}
                        className="col-span-full w-full min-w-[150px]" // Set a minimum width for the dropdown
                        style={{ zIndex: 40 }}
                       
                        error={errors?.company_id?.message} // Ensure this matches the name used in `Controller`
                      />
                    );
                  }}
                />
              <button
                type="submit"
                className={`bg-black hover:bg-deep-black text-white font-bold py-2 px-4 rounded relative z-20 w-full sm:w-auto${
                  window.innerWidth < 400 ? 'mx-auto' : window.innerWidth < 640 ? 'ml-0' : 'mr-3 sm:ml-auto'
                }`}
              >
                Change Company
              </button>
            </div>
          </div>
        )}
      </Form>
    </div>
    
    </>
  );
}

}
