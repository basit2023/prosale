// PersonalInfoView.js

'use client';
import { logs,logsCreate } from '../account-settings/logs';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';
import { decryptData } from '@/components/encriptdycriptdata';
import { Password } from '@/components/ui/password';                                            
// import { NewEmployeeInfoFormSchema,NewEmployeeInfoFormTypes,defaultValues } from '@/utils/validators/new-employee-schema';
import { VaultInfoFormSchema,VaultInfoFormTypes,defaultValues } from '@/utils/validators/vault-info-shema';
import crypto from 'crypto';;
const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});

interface VaultInformationProps {
  id: string;
}

// interface UserType {
//   name: string;
//   value: string;
// }

export default function Vaultinformation({id}:VaultInformationProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userType, setUserType] = useState<any[]>([]);

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
        const response = await apiService.get(`/all-user-type`);
        
        const userData = response.data;
        setUserType(userData.data);
      } catch (error) {
        console.error('Error fetching degignation data:', error);
        toast.error('Error fetching designation data. Please try again.');
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);
// console.log("the user data is:--->",value)
  const onSubmit: SubmitHandler<VaultInfoFormTypes> = async (data) => {
    
    setIsSubmitting(true)
    const {password}=data
    const currentP= crypto.createHash('sha256').update(password).digest('hex');
    data.password=currentP;
 
    try {
      // Get the base64 image data from local storage
     
    const result= await apiService.put(`/update_employee-vault-info/${id}`, {
                                    ...data,
                                     // Add the avatar property to the data object
                                    })
        toast.success(result.data.message);

        
        if(result.data.success){
          // < ProfileSettingsView />
          logs({ user: value?.user?.name, desc: 'New User' });
          // setIsEditing(true)
        }
    }
        
       catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile. Please try again.');
    }
    finally {
      setIsSubmitting(false);
    }
  };

  
  
 return (
    <Form<VaultInfoFormTypes>
      validationSchema={VaultInfoFormSchema}
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
              title="Vault Info"
              description="Update Employee vault details here"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
              
            <FormGroup
                title="User Name"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                defaultValue={value?.user?.name}
                  placeholder="example123"
                  {...register('name')}
                  // error={errors.cnic?.message}
                  className="flex-grow"
                />
              </FormGroup>
              
             
              <FormGroup
                title="Password"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Password
                  // label="Password"
                  placeholder="Enter your password"
                  size="lg"
                  className="hover:border-black focus:border-black focus:ring-black"
                  color="info"
                  inputClassName="text-sm focus:ring-black focus:border-black hover:border-black [&.is-focus]:border-black [&.is-focus]:ring-black"
                  {...register('password')}
                  error={errors.password?.message}
                />
              </FormGroup>

              <FormGroup
                title="User Type"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="user_type"
                  render={({ field: { value, onChange } }:any) => (
                    <SelectBox
                    defaultValue={value?.user?.gender}
                      placeholder="admin"//{gender1? gender1: "Select Gender"}
                      options={userType}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option:any) => option.value}
                      displayValue={(selected:any) =>
                        userType?.find((r:any) => r.value === selected)?.name ?? ''
                      }
                      error={errors?.userType?.message as string}
                    />
                  )}
                />
              </FormGroup>
              {isSubmitting && (
                  <div className="absolute top-0 left-10 w-full flex items-center justify-center z-50">
                    <Spinner />
                  </div>
                )}
             
            </div>
            <FormFooter altBtnText="Cancel" submitBtnText="Update Vault Info" />
          </>
        );
      }}
    </Form>
  );
}
