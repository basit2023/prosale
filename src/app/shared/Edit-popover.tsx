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
import { logs } from './account-settings/logs';                                           
import { LeadSmsFormSchema,LeadSmsFormTypes,defaultValues } from '@/utils/validators/sms-lead.schema';
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

export default function Vaultinformation({ id }: DeletePopoverProps) {
  const { data: session } = useSession();
  const [value, setValue1] = useState<UserType | null>(null);
  const { closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.get(`/employee-status-info/${id}`);
        const userData = response.data;
        setValue1(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const onSubmit: SubmitHandler<LeadSmsFormTypes> = async (data) => {
    try {
      setIsLoading(true); 
      const result = await apiService.put(`/update_employee-status-info/${id}`, { ...data });

      if (result.data.success) {
        toast.success(result.data.message);
        logs({ user: value?.user?.name, desc: 'Status update' });
        closeModal(); 
        router.push(routes.employee.employeelist);
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
    <Form<LeadSmsFormTypes>
      validationSchema={LeadSmsFormSchema}
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
            <table className="border-collapse border border-dashed border-slate-400">
              <thead>
                <tr>
                  <th className="border border-dashed border-slate-300 h-10">Name</th>
                  <th className="border border-dashed border-slate-300 h-10">Designation</th>
                  <th className="border border-dashed border-slate-300 h-10">Department</th>
                </tr>
              </thead>
              <tbody>
                <tr className='justify-center'>
                  <td className="border border-dashed border-slate-300 text-center bg-gray-200 h-8">{`${value?.user?.first_name} ${value?.user?.last_name}`}</td>
                  <td className="border border-dashed border-slate-300 text-center bg-gray-200 h-8">{value?.user?.role}</td>
                  <td className="border border-dashed border-slate-300 text-center bg-gray-200 h-8">{value?.user?.department}</td>
                </tr>
              </tbody>
            </table>

            <table className="border-collapse border border-dashed border-slate-400">
              <thead>
                <tr>
                  <th className="border border-dashed border-slate-300 h-10">Type</th>
                  <th className="border border-dashed border-slate-300 h-10">Status</th>
                  <th className="border border-dashed border-slate-300 h-10">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className='justify-center'>
                  <td className="border border-dashed border-slate-300 text-center bg-gray-200 h-8">Sms Status</td>
                  <td className="border border-dashed border-slate-300 text-center bg-gray-200 h-8">
                    <span>
                      <div style={{ display: 'inline-block', width: '15px', height: '15px', borderRadius: '50%', background: value?.user?.sms === 'Y' ? 'green' : 'red' }}></div>
                    </span>
                  </td>
                  <td className="border border-dashed border-slate-300 text-center bg-gray-200 h-8">
                    <Controller
                      control={control}
                      name="sms"
                      render={({ field: { value, onChange } }) => (
                        <SelectBox
                          placeholder="Enabled"
                          options={status}
                          onChange={onChange}
                          value={value}
                          className="p-0 m-1 bg-transparent text-sm max-w-xs"
                          getOptionValue={(option) => option.value}
                          displayValue={(selected) => status.find((r) => r.value === selected)?.name ?? ''}
                        />
                      )}
                    />
                  </td>
                </tr>               
                <tr className='justify-center'>
                  <td className="border border-dashed border-slate-300 text-center bg-gray-100 h-8">Lead Status</td>
                  <td className="border border-dashed border-slate-300 text-center bg-gray-100 h-8">
                    <span>
                      <div style={{ display: 'inline-block', width: '15px', height: '15px', borderRadius: '50%', background: value?.user?.lead_status === 'Y' ? 'green' : 'red' }}></div>
                    </span>
                  </td>
                  <td className="border border-dashed border-slate-300 text-center bg-gray-100 h-8">
                    <Controller
                      control={control}
                      name="lead_status"
                      render={({ field: { value, onChange } }) => (
                        <SelectBox
                          placeholder="Enabled"
                          options={status}
                          onChange={onChange}
                          value={value}
                          className="p-0 m-1 bg-transparent text-sm max-w-xs"
                          getOptionValue={(option) => option.value}
                          displayValue={(selected) => status.find((r) => r.value === selected)?.name ?? ''}
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
