// useEmployeeData.js

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
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

export const PaymentPlain = (slug:any) => {
  const { data: session } = useSession();
  const [value, setValue] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
       
       
          const response = await apiService.get(`/payment-data/?email=${session?.user?.email}&&slug=${slug}`);
          const userData = response.data.projects;
          console.log("the data is at payment data:",response)
          setValue(userData);
        
      } catch (error) {
        console.error('Error fetching Project information:', error);
        toast.error('Error fetching Project information. Please try again.');
      }
    };

    fetchData();
  }, []);



  const productsData = (value || []).map((user:any) => ({
    id: user.ppid, 
    preset_name: user.preset_name,
    preset_year: user.preset_year,
    Category : user.Category,
    Unit : user.Unit,
    Size : user.Size,
    Price_Sqft : user.Price_Sqft,
    Add_Booking: user.Add_Booking,
    booking_pr: user.booking_pr,
    add_confirmation: user.add_confirmation,

    confirmation_Pr: user.confirmation_Pr,
    add_allocation: user.add_allocation,
    allocation_pr : user.allocation_pr,
    monthly : user.monthly,
    monthly_Installments : user.monthly_Installments,
    monthly_Installmentspr : user.monthly_Installmentspr,
    halfyearly: user.halfyearly,
    half_yearly_Installments: user.half_yearly_Installments,
    half_yearly_Installmentspr: user.half_yearly_Installmentspr,

    yearly: user.yearly,
    yearly_Installments: user.yearly_Installments,
    yearly_Installmentspr : user.yearly_Installmentspr,
    possession : user.possession,
    possessionpr : user.possessionpr,
    transfer : user.transfer,
    transferpr: user.transferpr,
    project_names:user.project_names,
   
  }));

  return productsData;
};
