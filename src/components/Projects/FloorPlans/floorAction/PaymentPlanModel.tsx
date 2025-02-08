import { useModal } from '@/app/shared/modal-views/use-modal';
import { decryptData } from '@/components/encriptdycriptdata';
import { Title } from '@/components/ui/text';
import { ActionIcon } from '@/components/ui/action-icon';
import { PiXBold } from 'react-icons/pi';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';

import Spinner from '@/components/ui/spinner';
import FormFooter from '@/components/form-footer';
import { useEffect, useState,useCallback, useMemo } from 'react';
import apiService from '@/utils/apiService';
import { logs } from '@/app/shared/account-settings/logs';                                        
import { PaymentFormSchema,PaymentFormTypes,defaultValues } from '@/utils/validators/paymentplansid.schema';
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


const useModalHook1 = () => {
  const { openModal } = useModal();

  const handlePaymentplan = (slug:string,rowId: string, floor:string, SqFtRate:any) => {
    openModal({
      view: <VaultInformationModalView slug={slug} id={rowId} floor={floor} SqFtRate={SqFtRate}/>, // Pass rowId to the modal
      customSize: '520px',
    });
  };

  return { handlePaymentplan };
};


// VaultInformationModalView.js




function VaultInformationModalView({slug, id,floor,SqFtRate}:any) {

  const formattedTitle = slug.replace(/_/g, ' ');
  const { closeModal } = useModal();

  return (
    <div className="m-auto px-5 pb-8 pt-5 @lg:pt-6 @2xl:px-7">
      <div className="mb-7 flex items-center justify-between">
        <Title as="h4" className="font-semibold">
        Select Project and Payment Plan
        </Title>
        <ActionIcon size="sm" variant="text" onClick={() => closeModal()}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>
      <UpdateRates slug={slug} id={id} floor={floor} title={''} description={''} floor_id={undefined} />
    </div>
  );
}
export {useModalHook1,VaultInformationModalView}

type PaymentPlan1 = {
  title?: string;
  description?: string;
  id?: any;
  slug?:any;
  templateid?:any;
  floor_id?:any;
  floor?:any;
  paymentplanid?:any;
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
export default function UpdateRates({ id, slug, floor }: PaymentPlan1) {
  const { data: session } = useSession();
const { closeModal } = useModal();
const [isLoading, setIsLoading] = useState(false);
const router = useRouter();
const [userData, setUserData] = useState<any>(null);
const [project, setProject] = useState<any>([]);
const [loading, setLoading] = useState(true);

// Define the PaymentPlan type
type PaymentPlan = {
  name: string;
  value: number;
};

// Memoize the payment plan template since it doesn't change
const template: PaymentPlan[] = useMemo(
  () => [
    { name: "Detailed Plan", value: 1 },
    { name: "Portrait Plan", value: 2 },
    { name: "Colored Portrait Plan", value: 3 },
    { name: "Project Colors Plan", value: 4 }
  ],
  []
);

const [paymentplan, setPaymentPlan] = useState<PaymentPlan[]>(template);

// Use useCallback to memoize the fetchUserData function
const fetchUserData = useCallback(async () => {
  try {
    const encryptedData = localStorage.getItem('uData');
    if (encryptedData) {
      const data = decryptData(encryptedData);
      setUserData(data);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    toast.error('Error fetching user data. Please try again.');
  } finally {
    setLoading(false);
  }
}, []); // This function will never be recreated

// Fetch user data from localStorage only once
useEffect(() => {
  fetchUserData();
}, [fetchUserData]);

// Memoize the project fetch function using useCallback
const fetchProjectData = useCallback(async () => {
  try {
    if (!userData?.user?.company_id) return;

    const projectResponse = await apiService.get(
      `/PaymentPlanid/?company_id=${userData.user.company_id}&&slug=${slug}`
    );
    setProject((prevProject):any => 
      prevProject !== projectResponse.data.data ? projectResponse.data.data : prevProject
    );
    
  } catch (error) {
    console.error('Error fetching project or payment template data:', error);
  }
}, [userData, slug]); // Only re-create the function if userData or slug changes

// Fetch project data when userData changes
useEffect(() => {
  if (userData) {
    fetchProjectData();
  }
}, [userData, fetchProjectData]); // Ensure the effect only runs when necessary

  // Check for loading state and render spinner
  if (loading) {
    return <Spinner />;
  }

  const onSubmit: SubmitHandler<PaymentFormTypes> = async (data) => {
    try {
      // setIsLoading(true);
    
      data={...data, floor_id:id, slug:slug, floor:floor}
      
      const serializedData = encodeURIComponent(JSON.stringify(data));
       router.push(routes.tamplets.detailPlained(serializedData))
       closeModal();
       setIsLoading(true);
    } catch (error) {
      console.error('Error updating rates:', error);
      toast.error('Error updating rates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form<PaymentFormTypes>
      // validationSchema={PaymentFormSchema}
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
              <tbody>
                <tr>
                  <td className="bg-transperent text-center h-8">Select Payment Plan</td>
                  <td className="text-start bg-transperent h-8">
                    <Controller
                      control={control}
                      name="paymentplanid"
                      render={({ field: { onChange, value } }) => (
                        <SelectBox
                          placeholder="Select Project"
                          options={project}
                          onChange={onChange}
                          value={value}
                          className="col-span-full w-full"
                          getOptionValue={(option) => option.value}
                          displayValue={(selected) => project.find((r: any) => r.value === selected)?.name ?? ''}
                          dropdownClassName="overflow-auto z-100 max-h-[120px]"
                        />
                      )}
                    />
                  </td>
                </tr>
              </tbody>
              <tbody>
                <tr>
                  <td className="bg-transperent text-center h-8">Select Template</td>
                  <td className="text-center bg-transperent h-8">
                    <Controller
                      control={control}
                      name="templateid" // Changed from "projectid" to "templateid" for unique naming
                      render={({ field: { onChange, value } }) => (
                        <SelectBox
                          placeholder="Select Template"
                          options={paymentplan}
                          onChange={onChange}
                          value={value}
                          className="col-span-full w-full"
                          getOptionValue={(option) => option.value}
                          displayValue={(selected) => paymentplan.find((r: any) => r.value === selected)?.name ?? ''}
                          dropdownClassName="overflow-auto z-100 max-h-[120px]"
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