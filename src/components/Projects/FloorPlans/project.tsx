// import { useSession } from 'next-auth/react';
// import { useEffect, useState, useMemo, useCallback } from 'react';
// import toast from 'react-hot-toast';
// import apiService from '@/utils/apiService';

// export type Invoice = {
//   id: string;
//   name: string;
//   status: string;
//   Status: string;
//   slug: string;
//   Whatsapp_Sort: string;
//   Whatsapp_Status: string;
//   Portal_Status: string;
//   Location: string;
//   Image: string;
// };

// export const ProjectData = (slug: any) => {
//   const { data: session } = useSession();
//   const [value, setValue] = useState<any>([]);

//   // UseCallback to prevent recreating the fetch function on each render
//   const fetchData = useCallback(async () => {
//     try {
//       if (session) {
//         const response = await apiService.get(`/floors-data/?email=${session?.user?.email}&&slug=${slug}`);
//         const userData = response.data.floors;
//         console.log("the data from the floors is:", userData);

//         setValue(userData);
//       }
//     } catch (error) {
//       console.error('Error fetching Project information:', error);
//       toast.error('Error fetching Project information. Please try again.');
//     }
//   }, [session, slug]);

//   // useEffect to fetch data when session and slug change
//   useEffect(() => {
//     if (session && slug) {
//       fetchData();
//     }
//   }, [session, slug, fetchData]);

//   // Memoize productsData to prevent recalculating on every render
//   const productsData = useMemo(() => {
//     return (value || []).map((user: any) => ({
//       id: user.id,
//       total_units: user.unitsCounts.total_units,
//       sold_units: user.unitsCounts.sold_units,
//       slug: user.slug,
//       hold_units: user.unitsCounts.hold_units,
//       available_units: user.unitsCounts.available_units,
//       status: user.status,
//       floor: user.floor_name,
//       unitsCounts: user.unitsCounts,
//       SqFtRate: user.unitsCounts.SqFtRate,
//       size: user.unitsCounts.size,
//       Category: user.Category,
//       Label: user.Label,
//       project_floor_id: user.unitsCounts.project_floor_id,
//     }));
//   }, [value]); // Recalculate productsData only when `value` changes

//   return productsData;
// };


import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiService from '@/utils/apiService';

export type Invoice = {
  id: string;
  name: string;
  status: string;
  Status: string;
  slug: string;
  Whatsapp_Sort: string;
  Whatsapp_Status: string;
  Portal_Status: string;
  Location: string;
  Image: string;
};

export const ProjectData = (slug: any) => {
  const { data: session, status } = useSession(); // Access status for better handling
  const [value, setValue] = useState<any>([]);
 
  // Memoize fetchData function
  const fetchData = useCallback(async () => {
    try {
      if (session) {
       
        const response = await apiService.get(`/floors-data/?email=${session?.user?.email}&&slug=${slug}`);
        const userData = response.data.floors;
        console.log("Data from floors:", userData);
        setValue(userData);
      }
    } catch (error) {
      console.error('Error fetching Project information:', error);
      toast.error('Error fetching Project information. Please try again.');
    }
  }, [session, slug]);

  // Effect to fetch data once session and slug are available and stable
  useEffect(() => {
    // Fetch only when the session is valid (authenticated) and slug is not undefined
    if (status === 'authenticated' && session && slug) {
      fetchData();
    }
  }, [status, session, slug, fetchData]);

  // Memoize productsData to avoid recalculation on each render
  const productsData = useMemo(() => {
    return (value || []).map((user: any) => ({
      id: user.id,
      total_units: user.unitsCounts.total_units,
      sold_units: user.unitsCounts.sold_units,
      slug: user.slug,
      hold_units: user.unitsCounts.hold_units,
      available_units: user.unitsCounts.available_units,
      status: user.status,
      floor: user.floor_name,
      unitsCounts: user.unitsCounts,
      SqFtRate: user.unitsCounts.SqFtRate,
      size: user.unitsCounts.size,
      Category: user.Category,
      Label: user.Label,
      project_floor_id: user.unitsCounts.project_floor_id,
    }));
  }, [value]);

  return productsData;
};
