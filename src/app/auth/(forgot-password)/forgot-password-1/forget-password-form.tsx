'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Password } from '@/components/ui/password';
import { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Text } from '@/components/ui/text';
import { routes } from '@/config/routes';
import toast from 'react-hot-toast';
import apiService from '@/utils/apiService';
import { logs } from '@/app/shared/account-settings/logs';
import Spinner from '@/components/ui/spinner';
import crypto from 'crypto';
import {
  resetPasswordSchema,
  ResetPasswordSchema,
} from '@/utils/validators/reset-password.schema';
import { usePathname, useRouter } from 'next/navigation';
const initialValues = {
  email: '',
  password: '',
  confirmPassword: '',
};

export default function ForgetPasswordForm() {
  const [reset, setReset] = useState({});
  const router = useRouter();
  const [loading, setLoading] = useState(false);

    const onSubmit: SubmitHandler<ResetPasswordSchema> = async (data) => {
      // Extract password from data
      setLoading(true);
      const { password,confirmPassword, ...otherData } = data;
      
      // Hash the password using SHA-256
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      const conformhashedPassword = crypto.createHash('sha256').update(confirmPassword).digest('hex');
      console.log("the hased paword is:",hashedPassword)
      // Prepare the data to be sent to the backend with the hashed password
      const requestData = {
        ...otherData,
        password: hashedPassword,
        confirmPassword:conformhashedPassword,
      };

      try {
        // Send the data with the hashed password to the backend
        const result = await apiService.put(`/reset-password/`, requestData);
    
        toast.success(result.data.message);
        if(result.data.success){
          router.push(routes.signIn)
        }
      } catch (error) {
        toast.error('Error during forgetting password. Please try again.');
        console.error('Error during forget password:', error);
        
      }finally {
        setLoading(false);
      }
      
      // Reset the form fields
      setReset(initialValues);
    };


  return (
    <>
      <Form<ResetPasswordSchema>
        validationSchema={resetPasswordSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        useFormProps={{
          mode: 'onChange',
          defaultValues: initialValues,
        }}
        className="pt-1.5"
      >
        {({ register, formState: { errors } }) => (
          <div className="space-y-6">
            <Input
              type="email"
              size="lg"
              label="Email"
              placeholder="Enter your email"
              className="[&>label>span]:font-medium"
              color="info"
              inputClassName="text-sm focus:ring-custom-red focus:border-custom-red hover:border-custom-red [&.is-focus]:border-custom-red [&.is-focus]:ring-custom-red"
              {...register('email')}
              error={errors.email?.message}
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
            <Button
              className="mt-2 w-full"
              type="submit"
              size="lg"
              color="info"
              style={{ backgroundColor: '#c54e57' }}
            >
              
              {loading ? (
                // <Spinner className="ms-2 mt-0.5 h-5 w-5" />
                <div className="flex items-center justify-center">
                  <Spinner className="ms-2 mt-0.5 h-5 w-5" />
                </div>
              ) : (
                <>
                  <span>Reset Password</span>{' '}
                 
                </>
              )}
            </Button>
          </div>
        )}
      </Form>
      <Text className="mt-6 text-center text-[15px] leading-loose text-gray-500 lg:mt-8 lg:text-start xl:text-base">
        Don’t want to reset your password?{' '}
        <Link
          href={routes.auth.signIn1}
          className="font-bold text-gray-700 transition-colors hover:text-blue"
        >
          Sign In
        </Link>
      </Text>
    </>
  );
}
