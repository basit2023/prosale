import { useEffect } from 'react';
import { usePathname, redirect,useRouter } from 'next/navigation';
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
