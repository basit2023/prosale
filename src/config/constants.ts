import apiService from "@/utils/apiService";
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
export const CART_KEY = 'isomorphic-cart';
export const POS_CART_KEY = 'isomorphic-pos-cart';
export const DUMMY_ID = 'logs';
export const CHECKOUT = 'isomorphic-checkout';
export const CURRENCY_CODE = 'USD';
export const LOCALE = 'en';
// export const DUMMY_ID = 'FC6723757651DB74';
// export const idF=function idF({user}){
//   return user;
// }
// console.log("the idf is ",idF)
// export const DUMMY_ID = idF({user})
// const { data: session } = useSession();
//   const [value, setValue1] = useState();
//   const [userValue, setUserValue] = useState();
// useEffect(() => {
//   const fetchUserData = async () => {
//     try {
//       const response = await apiService.get(`/personalinfo/${session?.user?.email}`);
//       const userData = response.data;
//       setUserValue(userData);
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//       toast.error('Error fetching user data. Please try again.');
//     }
//   };

//   if (session) {
//     fetchUserData();
//   }
// }, [session]);

// export const DUMMY_ID = userValue?.id;

export const CURRENCY_OPTIONS = {
  formation: 'en-US',
  fractions: 2,
};

export const ROW_PER_PAGE_OPTIONS = [
  {
    value: 5,
    name: '5',
  },
  {
    value: 10,
    name: '10',
  },
  {
    value: 15,
    name: '15',
  },
  {
    value: 20,
    name: '20',
  },
];

export const ROLES = {
  Administrator: 'Administrator',
  Manager: 'Manager',
  Sales: 'Sales',
  Support: 'Support',
  Developer: 'Developer',
  HRD: 'HR Department',
  RestrictedUser: 'Restricted User',
  Customer: 'Customer',
} as const;
