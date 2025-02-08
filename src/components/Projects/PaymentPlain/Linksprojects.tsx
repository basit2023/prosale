import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';
import { logs } from '@/app/shared/account-settings/logs';                                        
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
import { decryptData } from '@/components/encriptdycriptdata';
const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});


import { z } from 'zod';
const LinkProjectFormSchema = z.object({
    projectid: z.string().optional()
 
  
});

type LinkProjectFormTypes = z.infer<typeof LinkProjectFormSchema>;
const defaultValues={
  projectid:undefined,
}
type DeletePopoverProps = {
  title: string;
  description: string;
  id: any;
};

type UserType = {
  user: {
    first_name: string;
    last_name: string;
    role: string;
    department: string;
    sms: string;
    lead_status: string;
    name: string;
  };
};

export default function LinkProjects({ id }: DeletePopoverProps) {
  const { data: session } = useSession();
  const { closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false); 
  const router = useRouter();
  const [value, setUserData]=useState<any>();
  const [project, setProject]=useState<any>();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const encryptedData = localStorage.getItem('uData');
        if (encryptedData) {
          const data = decryptData(encryptedData);
          setUserData(data);
        } 
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
      
    };

    fetchUserData();
  }, []);

  
  useEffect(() => {
    const fetchData = async () => {
      
      try {
        const response = await apiService.get(`/projects/?company_id=${value.user.company_id}`);
        
        setProject(response.data.data)
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    if (session) {
      fetchData();
    }
  }, [value]);

  
  const onSubmit: SubmitHandler<LinkProjectFormTypes> = async (data) => {
    try {
      console.log("the data is during the submission:",data)
      setIsLoading(true); 
      const response = await apiService.put(`/link-project`, {...data, id:id});

      if (response.data.success) {
        toast.success(response.data.message);
        
        closeModal(); 
        
      }
    } catch (error:any) {
      console.error('Error updating status:', error);
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Form<LinkProjectFormTypes>
      validationSchema={LinkProjectFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues,
      }}
    >
      {({ register, control, formState: { errors } }) => (
        <>
          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
       
          <table className="w-full  border-separate border-spacing-y-3">
          {/* <thead>
            <tr>
              <th className="border border-dashed border-slate-300 h-10 text-center">Current Rates</th>
              <th className="border border-dashed border-slate-300 h-10 text-center">New Rates</th>
            </tr>
          </thead> */}
          <tbody>
            <tr>
              <td className="text-center bg-transperent h-8">
                {/* Assuming currentRates is the variable that holds the current rate */}
                Select Project
              </td>
              <td className="text-center bg-transperent h-8">
              <Controller
                control={control}
                name="projectid"
                render={({ field: { onChange, value } }) => (
                  <SelectBox
                    placeholder="Select Status"
                    options={project}
                    onChange={(value) => {
                      onChange(value); // Update the field value
                    }}
                    value={value} // Set the selected value
                    className="col-span-full w-full"
                    getOptionValue={(option) => option.value}
                    displayValue={(selected) =>
                      project.find((r: any) => r.value === selected)?.name ?? ''
                    }
                    dropdownClassName="overflow-auto z-100 max-h-[120px]" // Add overflow and max height for scroll
                  />
                )}
              />


              </td>
            </tr>
          </tbody>
        
        </table>

          </div>
          <div className="mb-10 w-720px border border-dashed border-gray-200 pl-4 pr-4">
            <FormFooter 
              altBtnText="Cancel" 
              submitBtnText="Update" 
              className="border-t border-dashed border-gray-200 pt-2 pb-0" 
              onCancel={() => closeModal()} 
              isLoading={isLoading}
            />
          </div>
        </>
      )}
    </Form>
  );
}
