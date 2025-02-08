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
import { UnitsFormSchema,UnitsFormTypes,defaultValues } from '@/utils/validators/update-rates.schema';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});

type DeletePopoverProps = {
  title: string;
  description: string;
  id: any;
  slug:any;
  SqFtRate:any;
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

export default function UpdateRates({ id, slug, SqFtRate }: DeletePopoverProps) {
  const { data: session } = useSession();
  const [value, setValue1] = useState<UserType | null>(null);
  const { closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false); 
  const router = useRouter();

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await apiService.get(`/employee-status-info/${id}`);
  //       const userData = response.data;
  //       setValue1(userData);
  //     } catch (error) {
  //       console.error('Error fetching user data:', error);
  //       toast.error('Error fetching user data. Please try again.');
  //     }
  //   };

  //   if (session) {
  //     fetchData();
  //   }
  // }, [session]);

  const onSubmit: SubmitHandler<UnitsFormTypes> = async (data) => {
    try {
      console.log("the data is during the submission:",data)
      setIsLoading(true); 
      const result = await apiService.put(`/floor-rates-update`, { SqFtRate:data.updated_rates,id:id, slug:slug });

      if (result.data.success) {
        toast.success(result.data.message);
        
        closeModal(); 
        
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const status = [{ name: "Enabled", value: "Y" }, { name: "Disabled", value: "N" }];

  return (
    <Form<UnitsFormTypes>
      validationSchema={UnitsFormSchema}
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
          Apartment
          <table className="border-collapse border border-dashed border-slate-400 w-full">
          <thead>
            <tr>
              <th className="border border-dashed border-slate-300 h-10 text-center">Current Rates</th>
              <th className="border border-dashed border-slate-300 h-10 text-center">New Rates</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-dashed border-slate-300 text-center bg-gray-200 h-8">
                {/* Assuming currentRates is the variable that holds the current rate */}
                {SqFtRate}
              </td>
              <td className="border border-dashed border-slate-300 text-center bg-gray-100 h-8">
              <Input
                  placeholder='Enter New Rate'
               
                  {...register('updated_rates')}
                  error={errors?.updated_rates?.message}
                  className="col-span-full"
                
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
