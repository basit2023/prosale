'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { PiArrowRightBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Form } from '@/components/ui/form';
import toast from 'react-hot-toast';
import apiService from '@/utils/apiService';
import { routes } from '@/config/routes';
import { defaultValues, OnBoardingSchemaType, OnBoardingSchema } from '@/utils/validators/onboarding.schema';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { logs,logsCreate } from '@/app/shared/account-settings/logs';

export default function SignUpForm() {
  const [reset, setReset] = useState<any>({});
    const { data: session } = useSession<any>();
    const router = useRouter();
  const onSubmit: SubmitHandler<OnBoardingSchemaType> = async (data) => {
    try {
      console.log("the data at submission time:", data,session?.user?.email);
      
  
        const response = await apiService.post(`onboarding/${session?.user?.email}`, data);
  
        if (response.data.success) {
          toast.success(response.data.message);
          logsCreate({ user: session?.user?.email, desc: 'Company add' });
          router.push('/')
        } else {
          toast.error(response.data.message);
        }
     
    } catch (error:any) {
      console.error('Error during sign up:', error);
      toast.error(error.response.data.message);
    }
   
};


  return (
    <>
      <Form<OnBoardingSchemaType>
        validationSchema={OnBoardingSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        useFormProps={{
          defaultValues,
        }}
      >
        {({ register, formState: { errors } }) => (
          <div className="flex flex-col gap-x-4 gap-y-5 md:grid md:grid-cols-2 lg:gap-5">
            
            <Input
              type="text"
              size="lg"
              label="Title"
              className="col-span-2 [&>label>span]:font-medium"
              inputClassName="text-sm focus:ring-custom-red focus:border-custom-red hover:border-custom-red [&.is-focus]:border-custom-red [&.is-focus]:ring-custom-red"
              color="info"
              placeholder="Enter your Title"
              {...register('title')}
              // error={errors.email?.message}
            />
             <Input
              type="text"
              size="lg"
              label="Licence Type"
              className="col-span-2 [&>label>span]:font-medium"
              inputClassName="text-sm focus:ring-custom-red focus:border-custom-red hover:border-custom-red [&.is-focus]:border-custom-red [&.is-focus]:ring-custom-red"
              color="info"
              placeholder="Enter User Name"
              {...register('licence_type')}
              // error={errors.name?.message}
            />
            <Input
              type="text"
              size="lg"
              label="Address"
              className="col-span-2 [&>label>span]:font-medium"
              inputClassName="text-sm focus:ring-custom-red focus:border-custom-red hover:border-custom-red [&.is-focus]:border-custom-red [&.is-focus]:ring-custom-red"
              color="info"
              placeholder="Enter your address"
              {...register('address')}
              // error={errors.email?.message}
            />
             
            <Button
              size="lg"
              color="info"
              type="submit"
              className="col-span-2 mt-2"
              style={{ backgroundColor: '#c54e57' }}
            >
              <span>OnBoarding</span>{' '}
              <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
            </Button>
          </div>
        )}
      </Form>
      {/* <Text className="mt-6 text-center leading-loose text-gray-500 lg:mt-8 lg:text-start">
        Don’t have an account?{' '}
        <Link
          href={routes.signIn}
          className="font-semibold text-gray-700 transition-colors hover:text-blue"
        >
          Sign In
        </Link>
      </Text> */}
    </>
  );
}
