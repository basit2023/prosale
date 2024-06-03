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
  Csv_Label: string;
  Whatsapp_Sort: string;
  Whatsapp_Status: string;
  Portal_Status: string;
  Location: string;
  Image: string;
};

export const ProjectData = () => {
  const { data: session } = useSession();
  const [value, setValue] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const response = await apiService.get(`/project-data/?email=${session?.user?.email}`);
          const userData = response.data.projects;
        
          setValue(userData);
        }
      } catch (error) {
        console.error('Error fetching Project information:', error);
        toast.error('Error fetching Project information. Please try again.');
      }
    };

    fetchData();
  }, [session]); // Added missing closing bracket



  const productsData = (value || []).map((user:any) => ({
    id: user.id,
    name: user.name,
    status: user.status,
    Csv_Label: user.Csv_Label,
    Whatsapp_Sort: user.Whatsapp_Sort,
    Whatsapp_Status: user.Whatsapp_Status,
    Portal_Status: user.Portal_Status,
    Status: user.status1, // Corrected the property name
    Location: user.Location,
    Image: user.Image,
    company_title:user.company_title,
  }));

  return productsData;
};
