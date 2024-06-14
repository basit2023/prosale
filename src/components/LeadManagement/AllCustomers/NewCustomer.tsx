// PersonalInfoView.js

'use client';
import { logs,logsCreate } from '@/app/shared/account-settings/logs'
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
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
import { decryptData } from '@/components/encriptdycriptdata';
import { defaultValues, customerInfoFormSchema,customerInfoFormTypes } from '@/utils/validators/editCustomer.shecma';
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


export default function NewLeadCustomer() {
  const { data: session } = useSession();
  const { back } = useRouter();
  const [country, setCountry] = useState<any>([]);
  const [company, setCompany] = useState<any>();
  const [userValue, setUserData]=useState<any>();
  const [isLoading, setIsLoading] = useState(false); 
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
        const response = await apiService.get(`/all-contrycode`);
        
        const userData = response.data.data;
        setCountry(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
      try {
        const response = await apiService.get(`/supper-admin/${session?.user?.email}`);
        const userData = response.data;
        setCompany(userData);
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
  const onSubmit: SubmitHandler<customerInfoFormTypes> = async (data) => {
    setIsLoading(true); 
    try {
      if(company?.user_data?.number<=1){
        data.company_id=company?.user_data?.company_id;
     }
       const result= await apiService.post(`/new-lead-customer`, {
            ...data})
            // console.log("the result is--->:",result)
        toast.success(result.data.message);
        
        if(result.data.success){
          
          logsCreate({ user: userValue?.user?.name, desc: `Create New Customer` });
          // router.push(routes.leads.customers)
          back()
        }

    } catch (error:any) {
      console.error('Error updating Customer details:', error);
      toast.error(error.response.data.message);
    }
    finally {
      setIsLoading(false);
    }
  };
 

  
 return(
    <Form<customerInfoFormTypes>
      validationSchema={customerInfoFormSchema}
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
              title="Edit Customer Info"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
              <FormGroup
                title="Full Name"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                
              >
                
                 <Input

                  {...register('full_name')}
                  placeholder="Full Name"
                  error={errors.full_name?.message}
                  className="col-span-full"
                />
                
                
              </FormGroup>

              <FormGroup
                title="Email Address"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                type="email"
                  placeholder="example@gmail.com"
                  {...register('email')}
                  error={errors.email?.message}
                  className="col-span-full"
                />
              </FormGroup>
              <FormGroup
                title="Mobile Number"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="country"
                  render={({ field: { value, onChange } }) => (
                    <SelectBox
                      value={country.find((country:any) => country.value === value) || null} // Find the country object matching the value
                      placeholder="Select Country"
                      options={country.map((country:any) => ({ label: country.name, value: country.value }))}
                      onChange={(selectedOption: SelectOption | null) => {
                        onChange(selectedOption ? selectedOption.value : '');
                      }}
                      className="flex-grow"
                      error={errors?.country?.message}
                    />
                  )}
                />
                <Input
                  
                  placeholder="3XXXXXXXXX"
                  {...register('mobile')}
                  error={errors.mobile?.message}
                  className="flex-grow"
                />
               
              </FormGroup>
              <FormGroup
                title="Whatsapp Number"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  placeholder="03XXXXXXXXX"
                  {...register('whatsapp')}
                  error={errors.mobile?.message}
                  className="flex-grow"
                />
               
              </FormGroup>
              <FormGroup
                title="Job Title"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  placeholder="Associate Professor"
                  {...register('job_title')}
                  error={errors.job_title?.message}
                  className="col-span-full"
                />
              </FormGroup>
              <FormGroup
                title="City"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  placeholder="Islamabad"
                  {...register('city')}
                  error={errors.mobile?.message}
                  className="col-span-full"
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
                       
                        // error={errors?.company_id?.message} // Ensure this matches the name used in `Controller`
                      />
                    );
                  }}
                />
              </FormGroup>}
             
            </div>
            <FormFooter altBtnText="Cancel" altBtnOnClick={() => back()} submitBtnText="Add New Customer" isLoading={isLoading}/>
          </>
        );
      }}
    </Form>
  );
}
