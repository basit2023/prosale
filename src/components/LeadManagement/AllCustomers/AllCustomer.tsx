// useEmployeeData.js

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiService from '@/utils/apiService';

// export type ProductType = {
//   id:string;
//   name: string;
//   first_name: string;
//   last_name: string;
//   email: string;
//   designation: string;
//   department: string;
//   mobile: number;
//   cnic: number;
// };

export type Invoice = {
  id: string;
  name: string;
  mobile: number;
  project_name: string;
  project_status: string;
  interested_in: string;
  status:string;
  view_dt:any;
  email:any;
  job_title:string;
  city:string;
  country:any;
     
};
export const useEmployeeData = (email:any) => {
  const { data: session } = useSession();
  const [value, setValue] = useState<any>([]);
  const [value1, setValue1] = useState<any>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const response = await apiService.get(`/all-customers/${email}`);
          const userData = response.data.leads;
          
          setValue(userData);
        }
      } catch (error) {
        console.error('Error fetching label leads:', error);
        toast.error('Error fetching label leads. Please try again.');
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }, [session]);

  const productsData = (value || []).map((user:any) => ({
    id:user.id,
    name: user.customer_name,
   
    mobile: user.mobile,
    project_name: user.project_name,
    project_status: user.project_status,
    interested_in: user.interested_in,
    view_dt: user.view_dt,
    status:user.status,
    email:user.email,
    job_title:user.job_title,
    city:user.city,
    country:user.country,
    company_title:user.company_title,
   

    
  }));

  return productsData;
};


// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react'; // Assuming you're using next-auth
// import { toast } from 'react-toastify'; // Assuming you're using react-toastify for notifications
// import apiService from '@/utils/apiService'; // Ensure you have this service setup for API calls

// export const useEmployeeData = () => {
//   const { data: session } = useSession();
//   const [data, setData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         if (session) {
//           const response = await apiService.get(`/all-customers`);
//           const userData = response.data.leads;
//           setData(userData);
//         }
//       } catch (error) {
//         console.error('Error fetching customer data:', error);
//         toast.error('Error fetching customer data. Please try again.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [session]);

//   return { data, isLoading };
// };
