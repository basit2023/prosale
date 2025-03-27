
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
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl;

        // Define publicly accessible paths
        const publicPaths = ['/signin', '/signup', '/login'];
        const isPublicPath = publicPaths.includes(pathname);

        // Get session token from request
        const session = await getToken({ req: request });

        // Debugging: Log and send session details as a response header
        console.error("🔍 Middleware: Checking session:", session);
        const response = NextResponse.next();
        response.headers.set("X-Debug-Session", JSON.stringify(session || "No Session"));

        // Check if user is authenticated
        const isAuthenticated = !!session;

        // Redirect authenticated users away from public pages (e.g., login, signup)
        if (isPublicPath && isAuthenticated) {
            console.error("🔄 Redirecting authenticated user away from:", pathname);
            return NextResponse.redirect(new URL('/', request.nextUrl));
        }

        // Redirect unauthenticated users to login when accessing protected pages
        if (!isPublicPath && !isAuthenticated) {
            console.error("🔄 Redirecting unauthenticated user to login:", pathname);
            return NextResponse.redirect(new URL('/login', request.nextUrl));
        }

        // Return the response with debugging headers
        return response;
    } catch (error) {
        console.error("❌ Middleware Error:", error);
        return NextResponse.error();
    }
}

// ✅ Configure which paths should trigger this middleware
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

// export function middleware(request: NextRequest) {
//   console.log('Request URL:', request.nextUrl);

//   // Log the request headers
//   console.log('Request Headers:', request.headers);

//   // Log any other information you want
//   // ...

//   // Continue with the normal request flow
//   return NextResponse.next();
// }
