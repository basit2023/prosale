
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { env } from '@/env.mjs';
import { pagesOptions } from './pages-options';
import apiService from '@/utils/apiService';

export const authOptions: NextAuthOptions = {
  pages: {
    ...pagesOptions,
  },
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 1 * 24 * 60 * 60, // 1 day
  },
  callbacks: {
    async session({ session, token }) {
      console.log("Session callback - session:", session);
      console.log("Session callback - token:", token);
      
      // Optionally remove image if not needed
      // delete session?.user?.image;
  
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id, // Ensure token.id is correctly set
        },
      };
    },
  
    async jwt({ token, user }) {
      console.log("JWT callback - token before:", token);
      console.log("JWT callback - user:", user);
    
      if (user) {
        // If a user is signing in, add their ID to the token as a string
        token.id = user.id.toString(); // Ensure `user.id` exists and is converted to string
    
        // Optionally delete unnecessary fields
        // delete token.picture;
      }
    
      return token;
    },
    
  
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback - baseUrl:", baseUrl);
      console.log("Redirect callback - url:", url);
  
      try {
        const parsedUrl = new URL(url, baseUrl);
        console.log("Parsed URL:", parsedUrl);
  
        if (parsedUrl.origin === baseUrl) {
          return url;
        }
        if (parsedUrl.searchParams.has('callbackUrl')) {
          const callbackUrl = parsedUrl.searchParams.get('callbackUrl');
          return `${baseUrl}${callbackUrl}`;
        }
        return baseUrl;
      } catch (error) {
        console.error("Error in redirect callback:", error);
        return baseUrl;
      }
    },
  },
  

   /*   
   callbacks: {
    async session({ session, token }) {
      console.log("Session callback - session:", session);
      console.log("Session callback - token:", token);
      delete session?.user?.image;
      return {
        ...session,
        user: {
          ...session?.user,
          id: token.id as string,
        },
      };
    },
    async jwt({ token, user }) {
    
      // console.log("JWT callback - token before:", token);
      // console.log("JWT callback - user:", user);
      if (user) {
        delete token.picture;
         token.id = token.sub //user.id;
      }
      
      return token;
    },
    async redirect({ url, baseUrl }) {
      // console.log("Redirect callback - baseUrl:", baseUrl);
      // console.log("Redirect callback - url:", url);

      try {
        const parsedUrl = new URL(url, baseUrl);
        console.log("Parsed URL:", parsedUrl);
        if (parsedUrl.origin === baseUrl) {
          return url;
        }
        if (parsedUrl.searchParams.has('callbackUrl')) {
          const callbackUrl = parsedUrl.searchParams.get('callbackUrl');
          return `${baseUrl}${callbackUrl}`;
        }
        return baseUrl;
      } catch (error) {
        console.error("Error in redirect callback:", error);
        return baseUrl;
      }
    },
  },
  */
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {},
      async authorize(credentials: any) {
        console.log("Authorize function - received credentials:", credentials);
        try {
          const response = await apiService.post('/login-a', {
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          });

          if (response.status !== 200) {
            console.error(`Error fetching user: ${response.status} ${response.statusText}`);
            throw new Error(`Error fetching user: ${response.status} ${response.statusText}`);
          }

          const user = response.data.user
          console.log("Authorize function - user from API response:", user);
          // const user1 = await response.data.user;
          if (user.email === credentials.email && user.password === credentials.password) {
            // console.log("Authorize function - Authorized user:", user);
            return user;
          } else {
            console.log("Authorize function - Authentication failed. Returning null.");
            return null;
          }
        } catch (error: any) {
          console.error('Error during authorization:', error.message);
          return null;
        }
      },
    }),
  ],
};






// import type { NextAuthOptions } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import GoogleProvider from 'next-auth/providers/google';
// import { env } from '@/env.mjs';
// import isEqual from 'lodash/isEqual';
// import { pagesOptions } from './pages-options';
// import apiService from '@/utils/apiService';
// import clientCookies  from 'js-cookie';
// import { parseCookies } from 'nookies';
// import { useSession } from 'next-auth/react';
// import middleware from '@/middleware';
// export const authOptions: NextAuthOptions = {
  
  
//   pages: {
//     ...pagesOptions,
//   },
//   secret: env.NEXTAUTH_SECRET,
//   session: {
//     strategy: 'jwt',
//     // maxAge: 30 * 24 * 60 * 60, // 30 days
//     maxAge: 1 * 24 * 60 * 60,
   
//   },
//   callbacks: {
    
//     async session({ session, token }) {
//       // await middleware();
//       delete session?.user.image;
//       // console.log("the session is now:",session)
//       // console.log("the session is tokwn ia :",token)
//       return {
//               ...session,
//               user: {
//                 ...session?.user,
//                  id: token.id as string,
                
//               },
//             };

//     },
//     async jwt({ token, user }) {
//       if (user) {
//         // return user as JWT
//        // token.image=token.picture;
//         delete token.picture
//         token.id=token.sub;
//         delete token.sub;
//         // console.log("the token is:",token)
//         token.id = user.id;
//       }
//       return token;
//     },
//     async redirect({ url, baseUrl }) {
//       console.log("the baseUrl is:",baseUrl)
//       console.log("the url is:",url)
      
//       const parsedUrl = new URL(url, baseUrl);
//       console.log("the new url is:",parsedUrl)
//       if (parsedUrl.searchParams.has('callbackUrl')) {
//         console.log("the url is----->:")
//         return `${baseUrl}${parsedUrl.searchParams.get('callbackUrl')}`;
//       }
//       if (parsedUrl.origin === baseUrl) {
//         // return url;
//          return baseUrl;
//       }
//       return baseUrl;
//     },
//   },
//   providers: [
//     CredentialsProvider({
//       id: 'credentials',
//       name: 'Credentials',
//       credentials: {},
//       // async authorize(credentials: any) {
//       //   try {
//       //     const response = await apiService.post('/login-a', {
//       //       body: JSON.stringify(credentials),
//       //       headers: { "Content-Type": "application/json" }
//       //     });
//       //     console.log("the response is at auth options:",response)
//       //     if (response.status !== 200) {
//       //       throw new Error(`Error fetching user: ${response.status} ${response.statusText}`);
//       //     }

//       //     const user = response.data.user;

//       //     // const user = {
//       //     //   email: user1.email,
//       //     //   password: user1.password,
//       //     // };
//       //    console.log("the user1 is:",user)
//       //    console.log("the cridentials is:",credentials)
//       //     if (isEqual(user, {
//       //       email: credentials?.email,
//       //       password: credentials?.password,
//       //     })) {
            
//       //       console.log("Authorized user:", user);
//       //       return user;
//       //       // return '/'
//       //     }
//       //     console.log("Authentication failed. Returning null.");
//       //     return null;
//       //   } catch (error: any) {
//       //     console.error('Error during authorization:', error.message);
//       //     return null;
//       //   }
//       // }
//       async authorize(credentials: any, req: any) {
//         try {
//           console.log("Received credentials:", credentials);
          
//           const response = await apiService.post('/login-a', {
//             body: JSON.stringify(credentials),
//             headers: { "Content-Type": "application/json" }
//           });
      
//           if (response.status !== 200) {
//             console.error(`Error fetching user: ${response.status} ${response.statusText}`);
//             throw new Error(`Error fetching user: ${response.status} ${response.statusText}`);
//           }
      
//           const user = response.data.user;
//           console.log("User from API response:", user);
      
//           // Ensure the user object contains email and password fields
//           if (!user.email || !user.password) {
//             console.error("User object does not contain email or password fields");
//             return null;
//           }
      
//           if (user.email === credentials.email && user.password === credentials.password) {
//             console.log("Authorized user:", user);
//             return user;
//           } else {
//             console.log("Authentication failed. Returning null.");
//             return null;
//           }
//         } catch (error: any) {
//           console.error('Error during authorization:', error.message);
//           return null;
//         }
//       }
      
      
//     }),
//     // GoogleProvider({
//     //   clientId: env.GOOGLE_CLIENT_ID || '',
//     //   clientSecret: env.GOOGLE_CLIENT_SECRET || '',
//     //   allowDangerousEmailAccountLinking: true,
//     // }),
//   ],
// };
