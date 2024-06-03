
// import { usePathname, redirect,useRouter } from 'next/navigation'; // Corrected import
// import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
// import { getSession } from 'next-auth/react';

// export default async function RouteClinetProtect(Component: any) {
//     return async function RouteProtectWrapper(props: any) { // Fixed typo in parameter name
   
//         const session = await getSession();
//         if(!session){
//             redirect('/signin')
//         }
       
//         return <Component {...props} />;     }
// }


import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

const withClientSideProtection = (Component:any) => {
  return function ProtectedComponent(props:any) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return; // Do nothing while loading
      if (!session) router.push('/signin');
    }, [session, status, router]);

    if (status === 'loading' || !session) {
      return null; // Render nothing or a loading indicator while redirecting
    }

    return <Component {...props} />;
  };
};

export default withClientSideProtection;
