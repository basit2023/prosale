
// import { pagesOptions } from '@/app/api/auth/[...nextauth]/pages-options';
// import { withAuth } from 'next-auth/middleware';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from './app/api/auth/[...nextauth]/auth-options';
// import { useEffect } from 'react'; // Import useEffect

// export default withAuth({
//   pages: {
//     ...pagesOptions,
//   },
// });

// export const config = {
//   // restricted routes
//   matcher: [
//     '/',
//     '/activitylogs',
//     '/employee/:path*',
//     '/analytics',
//     '/logistics/:path*',
//     '/ecommerce/:path*',
//     '/support/:path*',
//     '/file/:path*',
//     '/file-manager',
//     '/invoice/:path*',
//     '/forms/profile-settings/:path*',
//   ],
// };

// useEffect(() => {
//   if (session) {
//     const fetchData = async () => {
//       try {
//         const response = await apiService.get(`/supperadmin/${session?.user?.email}`);
//         const userData = response?.data;
//         console.log("the supper admin is:", userData.user.user_type, userData.user.company_creator);
//         // Check if the user is an admin
//         if (userData.user.user_type === 'admin') {
//           // Allow access to all routes
//           config.matcher = [
//             '/',
//             '/activitylogs',
//             '/employee/:path*',
//             '/analytics',
//             '/logistics/:path*',
//             '/ecommerce/:path*',
//             '/support/:path*',
//             '/file/:path*',
//             '/file-manager',
//             '/invoice/:path*',
//             '/forms/profile-settings/:path*',
//           ];
//         } else {
//           // Restrict access to all routes
//           config.matcher = ['/']; // Example: Only allow access to the home page
//         }
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//       }
//     };
//     fetchData();
//   }
// }, [session]);












import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { pagesOptions } from '@/app/api/auth/[...nextauth]/pages-options';
import { withAuth } from 'next-auth/middleware';
// export { default } from "next-auth/middleware"

export default withAuth({
    
  pages: {
    ...pagesOptions,
  },
});

export const config = {
  matcher: [
    '/',
    '/activitylogs',
    '/employee/:path*',
    '/analytics',
    '/logistics/:path*',
    '/ecommerce/:path*',
    '/support/:path*',
    '/file/:path*',
    '/file-manager',
    '/invoice/:path*',
    '/forms/profile-settings/:path*',
  ],
};

export function middleware(request: NextRequest) {
  console.log('Request URL:', request.nextUrl);

  // Log the request headers
  console.log('Request Headers:', request.headers);

  // Log any other information you want
  // ...

  // Continue with the normal request flow
  return NextResponse.next();
}
