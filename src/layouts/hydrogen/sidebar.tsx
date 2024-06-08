'use client';
import logoImg from '@public/logo/prosale-favicon.png';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Title } from '@/components/ui/text';
import { Collapse } from '@/components/ui/collapse';
import cn from '@/utils/class-names';
import { PiCaretDownBold } from 'react-icons/pi';
import SimpleBar from '@/components/ui/simplebar';
import { getMenuItems } from '@/layouts/hydrogen/menu-items';
import Logo from '@/components/logo';
import StatusBadge from '@/components/get-status-badge';
import { routes } from '@/config/routes';
import { useSession } from 'next-auth/react';
import apiService from '@/utils/apiService';
import Spinner from '@/components/ui/spinner';
import { encryptData, decryptData } from '@/components/encriptdycriptdata';

export default function Sidebar({ className }: { className?: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [transformedItems, setTransformedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Retrieve and decrypt data from local storage
  const encryptedSuperAdmin = localStorage.getItem('superadmin');
  const userData = encryptedSuperAdmin ? decryptData(encryptedSuperAdmin) : null;

  const encryptedPermission = localStorage.getItem('permission');
  const permissionData = encryptedPermission ? decryptData(encryptedPermission) : null;

  const [supper, setSupper] = useState<any>(userData);
  const [perm_d, setPerm_d] = useState<any>(permissionData);

  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        try {
          if (!userData) {
            const response = await apiService.get(`/supperadmin/${session.user.email}`);
            const fetchedUserData = response.data;
            const encryptedUserData = encryptData(fetchedUserData);
            localStorage.setItem('superadmin', encryptedUserData);
            setSupper(fetchedUserData);
          } else {
            setSupper(userData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
        setIsLoading(false);
      };
      fetchData();
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      const fetchPermissionData = async () => {
        try {
          if (!permissionData) {
            const response = await apiService.get(`/permission/${session.user.email}`);
            const fetchedPermissionData = response.data.results;
            const encryptedPermissionData = encryptData(fetchedPermissionData);
            localStorage.setItem('permission', encryptedPermissionData);
            setPerm_d(fetchedPermissionData);
          } else {
            setPerm_d(permissionData);
          }
        } catch (error) {
          console.error('Error fetching permission data:', error);
        }
        setIsLoading(false);
      };
      fetchPermissionData();
    }
  }, [session]);

  useEffect(() => {
    if (!session) {
      router.push(routes.signIn);
    } else if (supper?.user?.user_type === 'super_admin' && supper?.user?.company_creator === null) {
      router.push(routes.auth.onboarding);
    }
  }, [session, supper, router]);

  useEffect(() => {
    const fetchDataAndLog = async () => {
      try {
        if (perm_d?.length > 0) {
          const items = await getMenuItems();
          const userPermissions = perm_d[0].permission_level;
          const transformedItems = items.reduce((acc: any, item: any) => {
            if (item.dropdownItems) {
              const allowedDropdownItems = item.dropdownItems.filter((dropdownItem: any) => dropdownItem.permission_level <= userPermissions);
              if (allowedDropdownItems.length > 0) {
                acc.push({
                  ...item,
                  dropdownItems: allowedDropdownItems,
                });
              }
            } else {
              if (item.permission <= userPermissions) {
                acc.push(item);
              }
            }
            return acc;
          }, []);
          localStorage.setItem('sidebar', JSON.stringify(transformedItems));
          setTransformedItems(transformedItems);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
      setIsLoading(false);
    };
    fetchDataAndLog();
  }, [perm_d]);

  return (
    <aside className={cn('fixed bottom-0 start-0 z-50 h-full w-[270px] border-e-2 border-gray-100 bg-white dark:bg-gray-100/50 2xl:w-72', className)}>
      <div className="sticky top-0 z-40 bg-gray-0/10 px-6 pb-5 pt-5 dark:bg-gray-100/5 2xl:px-8 2xl:pt-6">
        <Link href={'/'} aria-label="Site Logo">
          <Logo className="max-w-[155px] w-auto max-w-full h-auto" />
        </Link>
      </div>
      <SimpleBar className="h-[calc(100%-80px)]">
        <div className="mt-4 pb-3 3xl:mt-6">
          {isLoading && <Spinner />}
          {!isLoading && transformedItems.map((item, index) => {
            const isActive = pathname === item?.href;
            const pathnameExistInDropdowns = item?.dropdownItems?.filter((dropdownItem: any) => dropdownItem.href === pathname);
            const isDropdownOpen = Boolean(pathnameExistInDropdowns?.length);

            return (
              <Fragment key={item.name + '-' + index}>
                {item?.href ? (
                  <>
                    {item?.dropdownItems ? (
                      <Collapse defaultOpen={isDropdownOpen} header={({ open, toggle }) => (
                        <div onClick={toggle} className={cn('group relative mx-3 flex cursor-pointer items-center justify-between rounded-md px-3 py-2 font-medium lg:my-1 2xl:mx-5 2xl:my-2', isDropdownOpen ? 'before:top-2/5 text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5' : 'text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-700/90 dark:hover:text-gray-700')}>
                          <span className="flex items-center">
                            {item?.icon && <span className={cn('me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[20px] [&>svg]:w-[20px]', isDropdownOpen ? 'text-primary' : 'text-gray-800 dark:text-gray-500 dark:group-hover:text-gray-700')}>{item?.icon}</span>}
                            {item.name}
                          </span>
                          <PiCaretDownBold strokeWidth={3} className={cn('h-3.5 w-3.5 -rotate-90 text-gray-500 transition-transform duration-200 rtl:rotate-90', open && 'rotate-0 rtl:rotate-0')} />
                        </div>
                      )}>
                        {item?.dropdownItems?.map((dropdownItem: any, index: any) => {
                          const isChildActive = pathname === dropdownItem?.href;
                          return (
                            <Link href={dropdownItem?.href} key={dropdownItem?.name + index} className={cn('mx-3.5 mb-0.5 flex items-center justify-between rounded-md px-3.5 py-2 font-medium capitalize last-of-type:mb-1 lg:last-of-type:mb-2 2xl:mx-5', isChildActive ? 'text-primary' : 'text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900')}>
                              <div className='flex items-center truncate'>
                                <span className={cn('me-[18px] ms-1 inline-flex h-1 w-1 rounded-full bg-current transition-all duration-200', isChildActive ? 'bg-primary ring-[1px] ring-primary' : 'opacity-40')} />
                                <span className='truncate'>{dropdownItem?.name}</span>
                              </div>
                              {dropdownItem?.badge?.length ? <StatusBadge status={dropdownItem?.badge} /> : null}
                            </Link>
                          );
                        })}
                      </Collapse>
                    ) : (
                      <Link href={item?.href} className={cn('group relative mx-3 my-0.5 flex items-center justify-between rounded-md px-3 py-2 font-medium capitalize lg:my-1 2xl:mx-5 2xl:my-2', isActive ? 'before:top-2/5 text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5' : 'text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-700/90 dark:hover:text-gray-700')}>
                        <span className='flex items-center'>
                          {item?.icon && <span className={cn('me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[20px] [&>svg]:w-[20px]', isActive ? 'text-primary' : 'text-gray-800 dark:text-gray-500 dark:group-hover:text-gray-700')}>{item?.icon}</span>}
                          {item.name}
                        </span>
                      </Link>
                    )}
                  </>
                ) : (
                  <Title variant='small' className='my-6 mx-5 first:mt-0'>
                    {item.name}
                  </Title>
                )}
              </Fragment>
            );
          })}
        </div>
      </SimpleBar>
    </aside>
  );
}
