'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { PiArrowRightBold } from 'react-icons/pi';
import { Password } from '@/components/ui/password';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Form } from '@/components/ui/form';
import toast from 'react-hot-toast';
import apiService from '@/utils/apiService';
import { routes } from '@/config/routes';
import { defaultValues, SignUpSchemaType, signUpSchema } from '@/utils/validators/signup.schema';
const crypto = require('crypto');
import { logs,logsCreate } from '@/app/shared/account-settings/logs';
import { useRouter } from 'next/navigation';
export default function SignUpForm() {
  const [reset, setReset] = useState({});
  const router = useRouter();
  const onSubmit: SubmitHandler<SignUpSchemaType> = async (data) => {
    try {
      console.log("the data at submission time:", data);
      let { password, confirmPassword, name } = data;
  
      if (password === confirmPassword) {
        password = crypto.createHash('sha256').update(password).digest('hex');
        confirmPassword = crypto.createHash('sha256').update(confirmPassword).digest('hex');
        data.confirmPassword = confirmPassword;
        data.password = password;
        
        console.log("the updated data is:", data);
  
        const response = await apiService.post(`signup`, data);
  
        if (response.data.success) {
          toast.success(response.data.message);
          logsCreate({ user: name, desc: 'New Sign Up' });
          router.push(routes.signIn)
        } else {
          toast.error(response.data.message);
        }
      } else {
        console.log("Passwords do not match!!!");
        toast.error('Passwords do not match, please try again!');
      }
    } catch (error:any) {
      console.error('Error during sign up:', error);
      toast.error(error.response.data.message);
    }
  };
  

  return (
    <>
      <Form<SignUpSchemaType>
        validationSchema={signUpSchema}
        onSubmit={onSubmit}
        className="@container"
        useFormProps={{
          mode: 'onChange',
          defaultValues,
        }}
      >
        {({ register, formState: { errors } }) => (
          <div className="flex flex-col gap-x-4 gap-y-5 md:grid md:grid-cols-2 lg:gap-5">
            <Input
              type="text"
              size="lg"
              label="First Name"
              placeholder="Enter your first name"
              className="[&>label>span]:font-medium"
              color="info"
              inputClassName="text-sm focus:ring-custom-red focus:border-custom-red hover:border-custom-red [&.is-focus]:border-custom-red [&.is-focus]:ring-custom-red"
              {...register('first_name')}
              // error={errors.firstName?.message}
            />
            <Input
              type="text"
              size="lg"
              label="Last Name"
              placeholder="Enter your last name"
              className="[&>label>span]:font-medium"
              color="info"
              inputClassName="text-sm focus:ring-custom-red focus:border-custom-red hover:border-custom-red [&.is-focus]:border-custom-red [&.is-focus]:ring-custom-red"
              {...register('last_name')}
              // error={errors.lastName?.message}
            />
             <Input
              type="text"
              size="lg"
              label="UserName"
              className="col-span-2 [&>label>span]:font-medium"
              inputClassName="text-sm focus:ring-custom-red focus:border-custom-red hover:border-custom-red [&.is-focus]:border-custom-red [&.is-focus]:ring-custom-red"
              color="info"
              placeholder="Enter User Name"
              {...register('name')}
              // error={errors.name?.message}
            />
            <Input
              type="email"
              size="lg"
              label="Email"
              className="col-span-2 [&>label>span]:font-medium"
              inputClassName="text-sm focus:ring-custom-red focus:border-custom-red hover:border-custom-red [&.is-focus]:border-custom-red [&.is-focus]:ring-custom-red"
              color="info"
              placeholder="Enter your email"
              {...register('email')}
              // error={errors.email?.message}
            />
           
            <Password
              label="Password"
              placeholder="Enter your password"
              size="lg"
              className="[&>label>span]:font-medium"
              color="info"
              inputClassName="text-sm focus:ring-custom-red focus:border-custom-red hover:border-custom-red [&.is-focus]:border-custom-red [&.is-focus]:ring-custom-red"
              {...register('password')}
              error={errors.password?.message}
            />
            <Password
              label="Confirm Password"
              placeholder="Enter confirm password"
              size="lg"
              className="[&>label>span]:font-medium"
              color="info"
              inputClassName="text-sm focus:ring-custom-red focus:border-custom-red hover:border-custom-red [&.is-focus]:border-custom-red [&.is-focus]:ring-custom-red"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
            {/* <div className="col-span-2 flex items-start ">
              <Checkbox
                {...register('isAgreed')}
                className="[&>label>span]:font-medium [&>label]:items-start"
                label={
                  <>
                    By signing up you have agreed to our{' '}
                    <Link
                      href="/"
                      className="font-medium text-blue transition-colors hover:underline"
                    >
                      Terms
                    </Link>{' '}
                    &{' '}
                    <Link
                      href="/"
                      className="font-medium text-blue transition-colors hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </>
                }
              />
            </div> */}
            <Button
              size="lg"
              color="info"
              type="submit"
              className="col-span-2 mt-2"
              style={{ backgroundColor: '#c54e57' }}
            >
              <span>SIGN UP</span>{' '}
              <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
            </Button>
          </div>
        )}
      </Form>
      <Text className="mt-6 text-center leading-loose text-gray-500 lg:mt-8 lg:text-start">
        Don’t have an account?{' '}
        <Link
          href={routes.signIn}
          className="font-semibold text-gray-700 transition-colors hover:text-blue"
        >
          Sign In
        </Link>
      </Text>
    </>
  );
}
