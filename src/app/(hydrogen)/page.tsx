"use client"
import { useEffect } from 'react';
import { usePathname, redirect,useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import FileDashboard from '@/app/shared/file/dashboard';
import Spinner from '@/components/ui/spinner';
//  import { metaObject } from '@/config/site.config';

// export const metadata = {
//   ...metaObject(`Add new Units`),
// };
function FileDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!session) router.push('/signin');
  }, [session, status, router]);

  if (status === 'loading' || !session) {
    return <Spinner />; // Show spinner while loading or redirecting
  }

  return <FileDashboard />;
}

export default FileDashboardPage;