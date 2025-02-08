'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { SubmitHandler } from 'react-hook-form';
import { PiArrowRightBold } from 'react-icons/pi';
import { Checkbox } from '@/components/ui/checkbox';
import { Password } from '@/components/ui/password';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { routes } from '@/config/routes';
import { loginSchema, LoginSchema, defaultValues } from '@/utils/validators/login.schema';
import { AES } from 'crypto-js';
import toast from 'react-hot-toast';
import apiService from '@/utils/apiService';
import { useRouter } from 'next/navigation';
import { setCookie } from 'nookies';
import { Text } from '@/components/ui/text';
import { useSession } from 'next-auth/react';
import Spinner from '@/components/ui/spinner'; 
import { handleRememberMe } from './authUtils';

const initialValues: LoginSchema = {
  email: 'admin@admin.com',
  password: 'admin',
};

export default function SignInForm() {
  const [reset, setReset] = useState({});
  const router = useRouter();
  const { data: session } = useSession();
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    const { rememberMe: rememberMeValue, ...user } = data;
    setLoading(true);

    try {
      const response = await apiService.post('/login', {
        body: JSON.stringify(user),
        headers: { "Content-Type": "application/json" },
      });

      if (response.status !== 200) {
        throw new Error(`Server returned an error: ${response.status} ${response.statusText}`);
      }

      const result = response.data;

      if (!result || typeof result.success === 'undefined') {
        throw new Error('Unexpected server response');
      }

      if (result.success) {
        toast.success(result.message);
        // handleRememberMe(rememberMeValue, session);
        if (rememberMeValue) {
          // Set cookie for 30 days
          setCookie(null, 'rememberMe', 'true', { maxAge: 1 * 24 * 60 * 60, path: '/' });
          // session?.maxAge = 30 * 24 * 60 * 60; // 30 days
        } else {
          // Set cookie to expire on tab close
          setCookie(null, 'rememberMe', 'false', { maxAge: -1, path: '/' });
          // session?.maxAge = undefined; // Session will expire on tab close
        }

        const encryptedData = AES.encrypt(JSON.stringify(result), 'encryptionSecret').toString();
        localStorage.setItem('userData', encryptedData);

        const signInResponse = await signIn('credentials', {
          redirect: false,
          ...user,
        });

        if (signInResponse?.ok) {
          const lastVisited = localStorage.getItem('lastVisited');
          if (lastVisited) {
            localStorage.removeItem('lastVisited');
            router.push(lastVisited);
          } else {
            if (result.user.user_type === 'super_admin' && result.user.company_creator === null) {
              router.push(routes.auth.onboarding);
            } else {
              router.push('/');
            }
          }
        } else {
          toast.error(signInResponse?.error || 'Authentication failed');
        }
      } else {
        throw new Error('Login failed');
      }
    } catch (error:any) {
      console.error('Error during login:', error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form<LoginSchema>
        validationSchema={loginSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        useFormProps={{
          defaultValues,
        }}
      >
        {({ register, formState: { errors } }) => (
          <div className="space-y-5">
            <Input
              type="email"
              size="lg"
              label="Email"
              placeholder="Enter your email"
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
            <div className="flex items-center justify-between pb-2">
              <Checkbox
                {...register('rememberMe')}
                label="Remember Me"
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
                Forget Password?
              </Link>
            </div>
            <Button className="w-full flex justify-center items-center" type="submit" size="lg" color="info" style={{ backgroundColor: '#c54e57' }} disabled={loading}>
              {loading ? (
                // <Spinner className="ms-2 mt-0.5 h-5 w-5" />
                <div className="flex items-center justify-center">
                  <Spinner className="ms-2 mt-0.5 h-5 w-5" />
                </div>
              ) : (
                <>
                  <span>Sign in</span>{' '}
                  <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}
      </Form>
      <Text className="mt-6 text-center leading-loose text-gray-500 lg:mt-8 lg:text-start">
        Don’t have an account?{' '}
        <Link
          href={routes.auth.signUp1}
          className="font-semibold text-gray-700 transition-colors hover:text-blue"
        >
          Sign Up
        </Link>
      </Text>
    </>
  );
}






// 'use client';

// import Link from 'next/link';
// import { useState } from 'react';
// import { signIn } from 'next-auth/react';
// import { SubmitHandler } from 'react-hook-form';
// import { PiArrowRightBold } from 'react-icons/pi';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Password } from '@/components/ui/password';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Form } from '@/components/ui/form';
// import { routes } from '@/config/routes';
// import { loginSchema, LoginSchema,defaultValues } from '@/utils/validators/login.schema';
// import { AES } from 'crypto-js';
// import toast from 'react-hot-toast';
// import apiService from '@/utils/apiService';
// import { usePathname, useRouter } from 'next/navigation';
// import { setCookie } from 'nookies'; // Import setCookie from 'nookies'
// import Cookies from 'js-cookie';
// import { useSession } from 'next-auth/react';
// import { Text } from '@/components/ui/text';
// const initialValues: LoginSchema = {
//   email: 'admin@admin.com',
//   password: 'admin',
// };

// export default function SignInForm() {
//   const [reset, setReset] = useState({});
//   const router = useRouter();
  

//   const [rememberMe, setRememberMe] = useState(false);

//   const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
//     // Remove rememberMe from the data submitted
//     const { rememberMe: rememberMeValue, ...user } = data;
//     try {
//       const response = await apiService.post('/login', {
//         body: JSON.stringify(user),
//       });
  
//       // console.log("the response is at login:", response);
  
//       if (response.status !== 200) {
//         throw new Error(`Server returned an error: ${response.status} ${response.statusText}`);
//       }
  
//       const result = response.data;
  
//       if (!result || typeof result.success === 'undefined') {
//         throw new Error('Unexpected server response');
//       }
  
//       if (result.success) {
//         toast.success(result.message);
//         // window.alert(result.message);
  
//         // Store rememberMe value in a cookie
//         if (rememberMeValue) {
//           setCookie(null, 'rememberMe', 'true', { maxAge: 30 * 24 * 60 * 60, path: '/' });
//         } else {
//           // If rememberMe is false, remove the cookie
//           setCookie(null, 'rememberMe', 'false', { maxAge: -1, path: '/' });
//         }
  
        
//         const encryptedData = AES.encrypt(JSON.stringify(result), 'encryptionSecret').toString();
//         localStorage.setItem('userData', encryptedData);
  
//         console.log("User Type:", response.data.user.user_type);
//         console.log("Company Creator:", response.data.user.company_creator);
//         if (response.data.user.user_type === 'super_admin' && response.data.user.company_creator === null) {
//           console.log("Condition met. Redirecting to onboarding...");
//           const num= await signIn('credentials', {...user});
//           console.log("the result of the sign in is:",num)
//           router.push(routes.auth.onboarding);

//           return;
//         }
        
  
//         try {
//           const signInResponse:any = signIn('credentials', {...user});
//           if (signInResponse) {
//             console.log("Authentication successful. Returning user data.");
//             // return signInResponse.user;
//             router.push('/')
//           } else {
//             console.log("Authentication failed. Returning null.");
//             return null;
//           }
//         } catch (error) {
//           console.error("Error during signIn catch:", error);
//           // window.alert("Error during signIn");
//           return null;
//         }
//       } else {
//         throw new Error('Login failed');
//       }
//     } catch (error) {
//       console.error('Error during login:', error);
      
//       toast.error('Error during login');
//     }
//   };
  


//   return (
//     <>
//       <Form<LoginSchema>
//         validationSchema={loginSchema}
//         resetValues={reset}
//         onSubmit={onSubmit}
//         useFormProps={{
//           defaultValues,
//         }}
//       >
//         {({ register, formState: { errors } }) => (
//           <div className="space-y-5">
//             <Input
//               type="email"
//               size="lg"
//               label="Email"
//               placeholder="Enter your email"
//               color="info"
//               className="[&>label>span]:font-medium"
              
//               inputClassName="text-sm focus:ring-custom-red focus:border-custom-red hover:border-custom-red [&.is-focus]:border-custom-red [&.is-focus]:ring-custom-red"
              
//               {...register('email')}
//               error={errors.email?.message}
             
//             />

//             <Password
//               label="Password"
//               placeholder="Enter your password"
//               size="lg"
//               className="[&>label>span]:font-medium"
//               // className="hover:border-black focus:border-black focus:ring-black"
//               color="info"
//               inputClassName="text-sm focus:ring-custom-red focus:border-custom-red hover:border-custom-red [&.is-focus]:border-custom-red [&.is-focus]:ring-custom-red"
//               {...register('password')}
//               error={errors.password?.message}
//             />
//             <div className="flex items-center justify-between pb-2">
//               <Checkbox
//                 {...register('rememberMe')}
//                 label="Remember Me"
//                 color="info"
//                 variant="flat"
//                 className="[&>label>span]:font-medium"
//                 style={{ backgroundColor: '#c54e57' }}
//               />
//               <Link
//                 href={routes.auth.forgotPassword1}
//                 className="h-auto p-0 text-sm font-semibold underline transition-colors hover:text-gray-900 hover:no-underline" style={{ color: '#c54e57' }}
//               >
//                 Forget Password?
//               </Link>
//             </div>
//             <Button className="w-full" type="submit" size="lg" color="info" style={{ backgroundColor: '#c54e57' }}>
//               <span>Sign in</span>{' '}
//               <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
//             </Button>
//           </div>
//         )}
//       </Form>
//       <Text className="mt-6 text-center leading-loose text-gray-500 lg:mt-8 lg:text-start">
//         Don’t have an account?{' '}
//         <Link
//           href={routes.auth.signUp1}
//           className="font-semibold text-gray-700 transition-colors hover:text-blue"
//         >
//           Sign Up
//         </Link>
//       </Text>
//     </>
//   );
// }










// 'use client';

// import Link from 'next/link';
// import { useState } from 'react';
// import { signIn } from 'next-auth/react';
// import { SubmitHandler } from 'react-hook-form';
// import { PiArrowRightBold } from 'react-icons/pi';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Password } from '@/components/ui/password';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Form } from '@/components/ui/form';
// import { Text } from '@/components/ui/text';
// import { routes } from '@/config/routes';
// import { loginSchema, LoginSchema } from '@/utils/validators/login.schema';

// const initialValues: LoginSchema = {
//   email: 'admin@admin.com',
//   password: 'admin',
//   rememberMe: true,
// };

// export default function SignInForm() {
//   //TODO: why we need to reset it here
//   const [reset, setReset] = useState({});

//   const onSubmit: SubmitHandler<LoginSchema> = (data) => {
//     console.log("the data is:",data);
//     signIn('credentials', {
//       ...data,
//     });
//     // setReset({ email: "", password: "", isRememberMe: false });
//   };

//   return (
//     <>
//       <Form<LoginSchema>
//         validationSchema={loginSchema}
//         resetValues={reset}
//         onSubmit={onSubmit}
//         useFormProps={{
//           defaultValues: initialValues,
//         }}
//       >
//         {({ register, formState: { errors } }) => (
//           <div className="space-y-5">
//             <Input
//               type="email"
//               size="lg"
//               label="Email"
//               placeholder="Enter your email"
//               color="info"
//               className="[&>label>span]:font-medium"
//               inputClassName="text-sm"
//               {...register('email')}
//               error={errors.email?.message}
//             />
//             <Password
//               label="Password"
//               placeholder="Enter your password"
//               size="lg"
//               className="[&>label>span]:font-medium"
//               inputClassName="text-sm"
//               color="info"
//               {...register('password')}
//               error={errors.password?.message}
//             />
//             <div className="flex items-center justify-between pb-2">
//               <Checkbox
//                 {...register('rememberMe')}
//                 label="Remember Me"
//                 color="info"
//                 variant="flat"
//                 className="[&>label>span]:font-medium"
//               />
//               <Link
//                 href={routes.auth.forgotPassword1}
//                 className="h-auto p-0 text-sm font-semibold text-blue underline transition-colors hover:text-gray-900 hover:no-underline"
//               >
//                 Forget Password?
//               </Link>
//             </div>
//             <Button className="w-full" type="submit" size="lg" color="info">
//               <span>Sign in</span>{' '}
//               <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
//             </Button>
//           </div>
//         )}
//       </Form>
//       <Text className="mt-6 text-center leading-loose text-gray-500 lg:mt-8 lg:text-start">
//         Don’t have an account?{' '}
//         <Link
//           href={routes.auth.signUp1}
//           className="font-semibold text-gray-700 transition-colors hover:text-blue"
//         >
//           Sign Up
//         </Link>
//       </Text>
//     </>
//   );
// }