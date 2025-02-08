// PersonalInfoView.js

'use client';
import { logsCreate } from '@/app/shared/account-settings/logs';
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
import apiService from '@/utils/apiService';
                                           
import { BulkUnitsFormSchema,BulkUnitsFormTypes, defaultValues } from '@/utils/validators/bulk-units.schema';

const crypto = require('crypto');
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

export default function BulkUnits({id,slug}:any) {
  const { data: session } = useSession();
  const { back } = useRouter();

  const [designation, setDesignation] = useState<any>([]);


  const [value, setUserData]=useState<any>();
  const [floorcount, setFloorCount] = useState<any>();
  const [isLoading, setIsLoading] = useState(false); 
  const [company, setCompany] = useState<any>();
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
        const response = await apiService.get(`/supper-admin/${session?.user?.email}`);
        const userData = response.data;
        setCompany(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
      
     
      
      try {
        const response = await apiService.get(`/allresource/?company_id=${value?.user?.company_id}`);
        const userData = response.data;
        setDesignation(userData.data1);
        
      } catch (error) {
        console.error('Error fetching Resource and inventory type data:', error);
        toast.error('Error fetching Resource and inventory type data. Please try again.');
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);
  useEffect(() => {
    const fetchData = async () => {
      
      try {
        const response = await apiService.get(`/units-count/?slug=${slug}&&id=${id}`);
        const userData = response.data;
        console.log("the data from the backend for the count:",userData)
        setFloorCount(userData);
        
      } catch (error) {
        console.error('Error fetching Resource and inventory type data:', error);
        toast.error('Error fetching Resource and inventory type data. Please try again.');
      }
    };

  
      fetchData();
   
  }, []);

  const onSubmit: SubmitHandler<BulkUnitsFormTypes> = async (data) => {
    setIsLoading(true); 
    
    
    try {
  
      if(company?.user_data?.number<=1){
         data.company_id=company?.user_data?.company_id;
      }
     if(!data?.start){
      data.start=floorcount?.count
     }
   
       const result= await apiService.post(`/floor-units`, {
            ...data,user: value?.user?.name,company_id: value?.user?.company_id,
            id: id,            
            slug: slug})
        toast.success(result.data.message);
        if(result.data.success){
          logsCreate({ user: value?.user?.name, desc: 'New user' });
        }

      
    } catch (error:any) {
      console.error('Error updating profile:', error);
      toast.error(error.response.data.message);
    }finally {
      setIsLoading(false);
    }
  };
 
  const selectstatus=[{name:"Available", value:"Available"},{name:"Sold", value:"Sold"}, {name:"On Hold", value:"On Hold"}]



  
 return (
    <Form<BulkUnitsFormTypes>
      validationSchema={BulkUnitsFormSchema}
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
              title="Add Bulk Units"
              description="Add Muiltiple units here"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
              
           
              
              
              
             
             
              <FormGroup
                title="User Type"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="Type"
                  render={({ field: { value, onChange } }) => (
                    <SelectBox
                    // defaultValue={value?.user?.gender}
                      placeholder="Select Unit Type"//{gender1? gender1: "Select Gender"}
                      options={designation}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        designation?.find((r:any) => r.value === selected)?.name ?? ''
                      }
                      // error={errors?.userType?.message as string}
                    />
                  )}
                />
              </FormGroup>

              
              <FormGroup
                title="Units Starting From"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  defaultValue={floorcount?.count}
                  placeholder="Starting Numbre e.g 1"
                  {...register('start')}
                  error={errors?.start?.message}
                  className="flex-grow"
                />
              </FormGroup>

              <FormGroup
                title="Units Till End"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                // defaultValue={value?.user?.cnic}
                  placeholder="Ending Number e.g 5"
                  {...register('end')}
                  error={errors?.end?.message}
                  className="flex-grow"
                />
              </FormGroup>
              <FormGroup
                title="Base Sqft Rate"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                // defaultValue={value?.user?.cnic}
                  placeholder="Sqft Rate"
                  {...register('SqFtRate')}
                  error={errors?.SqFtRate?.message}
                  className="flex-grow"
                />
              </FormGroup>
              <FormGroup
                title="Status"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="status"
                  render={({ field: { value, onChange } }) => (
                    <SelectBox
                    // defaultValue={value?.user?.gender}
                      placeholder="Select Status"
                      options={selectstatus}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        selectstatus?.find((r:any) => r.value === selected)?.name ?? ''
                      }
                      // error={errors?.userType?.message as string}
                    />
                  )}
                />
              </FormGroup>

            
              {company?.user_data?.number>1 && <FormGroup
                title="Assign Company"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="company_id"
                  render={({ field: { value, onChange } }) => {
                    // Find the option that matches the current value to set as the SelectBox value
                    const selectedOption = company?.company_data?.find((item:any) => String(item.value) === value);

                    return (
                      <SelectBox
                       
                        value={selectedOption ? { label: selectedOption.name, value: String(selectedOption.value) } : null} 
                        placeholder="Select Company"
                        options={company?.company_data?.map((item:any) => ({ label: item.name, value: String(item.value) }))}
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
              </FormGroup>}
             
            </div>
            <FormFooter altBtnText="Cancel" submitBtnText="Save" altBtnOnClick={() => back()} isLoading={isLoading}/>
          </>
        );
      }}
    </Form>
  );
}
