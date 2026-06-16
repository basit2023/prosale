'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import { AES } from 'crypto-js';
import { PiArrowRightBold, PiChartLineUpDuotone, PiClockCountdownDuotone, PiUsersThreeDuotone } from 'react-icons/pi';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Password } from '@/components/ui/password';
import Spinner from '@/components/ui/spinner';
import { routes } from '@/config/routes';
import apiService from '@/utils/apiService';
import { defaultValues, loginSchema, LoginSchema } from '@/utils/validators/login.schema';

const salesHighlights = [
  {
    title: 'Lead queue',
    text: 'Prioritize unread and today-assigned leads.',
    icon: PiUsersThreeDuotone,
  },
  {
    title: 'Follow-up rhythm',
    text: 'Keep pending callbacks visible before they slip.',
    icon: PiClockCountdownDuotone,
  },
  {
    title: 'Revenue focus',
    text: 'Track targets, achieved value, and team movement.',
    icon: PiChartLineUpDuotone,
  },
];

export default function SignInForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    const { rememberMe: rememberMeValue, ...user } = data;
    setLoading(true);

    try {
      const response = await apiService.post('/login', user);
      const result = response.data;

      if (!result?.success) {
        throw new Error(result?.message || 'Login failed');
      }

      localStorage.setItem('rememberMe', rememberMeValue ? 'true' : 'false');
      const encryptedData = AES.encrypt(JSON.stringify(result), 'encryptionSecret').toString();
      localStorage.setItem('userData', encryptedData);

      const signInResponse = await signIn('credentials', {
        redirect: false,
        ...user,
      });

      if (!signInResponse?.ok) {
        throw new Error(signInResponse?.error || 'Authentication failed');
      }

      toast.success(result.message || 'Signed in successfully');
      const lastVisited = localStorage.getItem('lastVisited');

      if (lastVisited) {
        localStorage.removeItem('lastVisited');
        router.push(lastVisited);
        return;
      }

      if (result.user.user_type === 'super_admin' && result.user.company_creator === null) {
        router.push(routes.auth.onboarding);
        return;
      }

      router.push('/');
    } catch (error: any) {
      console.error('Error during login:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Error during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
      <div className="mb-5 grid gap-3">
        {salesHighlights.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                <p className="text-xs leading-5 text-gray-500">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Form<LoginSchema>
        validationSchema={loginSchema}
        onSubmit={onSubmit}
        useFormProps={{ defaultValues }}
      >
        {({ register, formState: { errors } }) => (
          <div className="space-y-5">
            <Input
              type="email"
              size="lg"
              label="Email"
              placeholder="you@example.com"
              color="info"
              className="[&>label>span]:font-medium"
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

            <div className="flex items-center justify-between gap-4 pb-2">
              <Checkbox
                {...register('rememberMe')}
                label="Remember me"
                color="info"
                variant="flat"
                className="[&>label>span]:font-medium"
                style={{ backgroundColor: '#c54e57' }}
              />
              <Link
                href={routes.auth.forgotPassword1}
                className="h-auto p-0 text-sm font-semibold underline transition-colors hover:text-gray-900 hover:no-underline"
                style={{ color: '#c54e57' }}
              >
                Forgot password?
              </Link>
            </div>

            <Button
              className="flex w-full items-center justify-center"
              type="submit"
              size="lg"
              color="info"
              style={{ backgroundColor: '#c54e57' }}
              disabled={loading}
            >
              {loading ? (
                <Spinner className="ms-2 mt-0.5 h-5 w-5" />
              ) : (
                <>
                  <span>Sign in</span>
                  <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
}
