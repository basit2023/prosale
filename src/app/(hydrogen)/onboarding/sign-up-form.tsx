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


export default function SignUpForm() {
  const [reset, setReset] = useState({});
    const { data: session } = useSession();
  const onSubmit: SubmitHandler<OnBoardingSchemaType> = async (data) => {
    console.log("the data at submission time:",data)
   
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
              inputClassName="text-sm"
              color="info"
              placeholder="Enter your Title"
              {...register('title')}
              // error={errors?.email?.message}
            />
             <Input
              type="text"
              size="lg"
              label="Licence Type"
              className="col-span-2 [&>label>span]:font-medium"
              inputClassName="text-sm"
              color="info"
              placeholder="Enter User Name"
              {...register('licence_type')}
              // error={errors?.name?.message}
            />
            <Input
              type="text"
              size="lg"
              label="Address"
              className="col-span-2 [&>label>span]:font-medium"
              inputClassName="text-sm"
              color="info"
              placeholder="Enter your address"
              {...register('address')}
              // error={errors?.email?.message}
            />
             
            <Button
              size="lg"
              color="info"
              type="submit"
              className="col-span-2 mt-2"
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
