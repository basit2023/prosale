'use client';
import { logs } from '../account-settings/logs';
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
import { useEffect, useState, useMemo } from 'react';
import apiService from '@/utils/apiService';
import { decryptData } from '@/components/encriptdycriptdata';
import { Password } from '@/components/ui/password';
import { VaultInfoFormSchema, VaultInfoFormTypes, defaultValues } from '@/utils/validators/vault-info-shema';
import crypto from 'crypto';

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

export default function Vaultinformation({ id }: VaultInformationProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [userTypes, setUserTypes] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [initialData, setInitialData] = useState<any>(null);
const memoizedSession=useMemo(()=>session,[session])
  // Memoize the decrypted user data to avoid unnecessary decryption
  const decryptedUserData = useMemo(() => {
    try {
      const encryptedData = localStorage.getItem('uData');
      return encryptedData ? decryptData(encryptedData) : null;
    } catch (error) {
      console.error('Error decrypting user data:', error);
      return null;
    }
  }, [session]);

  // Fetch initial user data and user types in parallel
  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      try {
        const [userResponse, typesResponse] = await Promise.all([
          apiService.get(`/emp-personalinfo/${id}`),
          apiService.get('/all-user-type')
        ]);

        setUserData(userResponse.data);
        setInitialData(userResponse.data);
        setUserTypes(typesResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error fetching data. Please try again.');
      }
    };

    fetchData();
  }, [session, id]);

  // Set decrypted user data once on component mount
  useEffect(() => {
    if (decryptedUserData) {
      setUserData(prev => ({ ...prev, user: decryptedUserData.user }));
    }
  }, [decryptedUserData]);

  const onSubmit: SubmitHandler<VaultInfoFormTypes> = async (data) => {
    // Check if data has actually changed
    const hasChanged = JSON.stringify(data) !== JSON.stringify(initialData);
    if (!hasChanged) {
      toast('No changes detected', { icon: 'ℹ️' });
      return;
    }

    setIsLoading(true);
    
    try {
      const { password } = data;
      const currentP = crypto.createHash('sha256').update(password).digest('hex');
      data.password = currentP;

      const result = await apiService.put(`/update_employee-vault-info/${id}`, data);
      
      if (result.data.success) {
        toast.success(result.data.message);
        setInitialData(data); // Update initial data after successful submission
        logs({ user: memoizedSession?.user?.username, desc: 'Updated User Vault Info' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form<VaultInfoFormTypes>
      validationSchema={VaultInfoFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues: {
          ...defaultValues,
          name: memoizedSession?.user?.username || '',
          user_type: memoizedSession?.user?.user_type || ''
        },
      }}
    >
      {({ register, control, setValue, formState: { errors } }) => {
        // Set default values when userData is available
        // useEffect(() => {
        //   if (userData?.user) {
        //     setValue('name', userData.user.name);
        //     setValue('user_type', userData.user.user_type);
        //   }
        // }, [userData, setValue]);

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
                defaultValue={memoizedSession?.user?.username}
                  placeholder={`${memoizedSession?.user?.username}` || "example123"}
                  {...register('name')}
                  className="flex-grow"
                />
              </FormGroup>

              <FormGroup
                title="Password"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Password
                  placeholder="******"
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
                  render={({ field: { value, onChange } }) => (
                    <SelectBox
                      placeholder={memoizedSession?.user?.user_type || "Select User Type"}
                      options={userTypes}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        userTypes?.find((r) => r.value === selected)?.name || ''
                      }
                      error={errors?.user_type?.message}
                    />
                  )}
                />
              </FormGroup>
            </div>
            
            <FormFooter 
              altBtnText="Cancel" 
              submitBtnText="Update Vault Info" 
              isLoading={isLoading}
            />
          </>
        );
      }}
    </Form>
  );
}