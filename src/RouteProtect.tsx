'use client'
import { usePathname, redirect,useRouter } from 'next/navigation'; // Corrected import
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { encryptData, decryptData } from '@/components/encriptdycriptdata';
export default function RouteProtect(Component: any) {
    return function RouteProtectWrapper(props: any) { // Fixed typo in parameter name
        const pathname:any = usePathname();
        const { data: session } = useSession();
        const router = useRouter();
        if(!session){
            router.push('/signin')
        }
        const checkPermission = (pathname: string) => {
            const transformedItemsString = localStorage.getItem('sidebar');
            const decr:any=decryptData(transformedItemsString)
            const transformedItems: any = transformedItemsString ? decr : [];
            
            const matchedRoute = transformedItems?.find((route: any) => {
                if (route.href && typeof route.href === 'string') {
                    const hrefWords = route.href.split('/');
                    // Check if the first word of the route href matches the pathname
                    return hrefWords[1] === pathname.split('/')[1];
                }
                return false;
            });

            if (pathname === '/') {
                console.log('Handle root pathname');
                router.push('/')
            } else {
                if (matchedRoute) {
                    
                    if (matchedRoute.permission <= Permissions) { // Define or pass permission as a parameter
                        console.log('Permission granted for route:', matchedRoute.name);
                        // Do something if permission is granted
                        router.push(pathname);
                    } else {
                        console.log('Permission denied for route:', matchedRoute.name);
                        // Redirect to notFound route if permission is denied
                        return router.push("/no-permission");
                    }
                } else {
                    console.log('Route not found for pathname:', pathname);
                    // Redirect to notFound route if the route is not found
                    return router.push("/no-permission");
                }
            }
        };

        useEffect(() => {
            checkPermission(pathname);
        }, [pathname]);

        return <Component {...props} />; // Corrected typo in component props
    }
}
