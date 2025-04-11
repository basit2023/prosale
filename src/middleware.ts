
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

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { pagesOptions } from '@/app/api/auth/[...nextauth]/pages-options';
import { withAuth } from 'next-auth/middleware';

// Main middleware function
async function middleware(request: NextRequest) {
  // Development-only logging
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware processing:', request.nextUrl.pathname);
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  
  // Security headers (recommended)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

// Wrap with NextAuth authentication
export default withAuth(
  // Use the middleware function as the onSuccess callback
  async function onSuccess(req) {
    return middleware(req);
  },
  {
    pages: {
      ...pagesOptions,
    },
    callbacks: {
      // Ensure only authenticated users can access matched routes
      authorized: ({ token }) => !!token,
    },
  }
);

// Matcher configuration
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
    '/((?!api|_next/static|_next/image|favicon.ico|signin|multi-step).*)',
  ],
};