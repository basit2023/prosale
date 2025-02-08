
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiService from '@/utils/apiService';

export type Invoice = {
  id: string;
  project_floor_id: string;
  total_units: string;
  sold_units: string;
  slug: string;
  hold_units: string;
  available_units: string;
  status: string;
  Size: string;
  Type: string;
  Unit: string;
  SqFtRate: string;
  Category: string;
  Label: string;
  Extra: string;
};

export const useManageUnits = (slug: any, id: any) => {
  const { data: session } = useSession();
  const [value, setValue] = useState<any>([]); // This stores the fetched data
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state
  const [error, setError] = useState<any>(null); // Add error state

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          setIsLoading(true); // Set loading true at the start
          const response = await apiService.get(
            `/floors-units/?email=${session?.user?.email}&&floor_slug=${slug}&&floor_id=${id}`
          );
          
          const userData = response.data.floors;
          setValue(userData); // Set fetched data
        }
      } catch (error) {
        console.error('Error fetching Project information:', error);
        toast.error('Error fetching Project information. Please try again.');
        setError(error); // Set error state
      } finally {
        setIsLoading(false); // Set loading false after fetching is complete
      }
    };

    fetchData();
  }, [session, id, slug]); // Dependency array includes slug, session, and id

  const data = (value || []).map((user: any) => ({
    id: user.id,
    total_units: user.total_units,
    sold_units: user.sold_units,
    slug: user.slug,
    hold_units: user.hold_units,
    available_units: user.available_units,
    status: user.status,
    Type: user.Type,
    Unit: user.Unit,
    company_title: user.company_title,
    Size: user.Size,
    SqFtRate: user.SqFtRate,
    Category: user.Category,
    Label: user.Label,
    Extra: user.Extra,
  }));

  return data; // Return data, loading state, and error state
};