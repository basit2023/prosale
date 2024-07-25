import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/router
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import Spinner from '@/components/ui/spinner';
import apiService from '@/utils/apiService';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { defaultValues, LabelSchema, LabelSchemaFormTypes } from '@/utils/validators/label.schema';
import { useModal } from '@/app/shared/modal-views/use-modal';
import StChangeButton from './StChangeButton';
import { decryptData } from '@/components/encriptdycriptdata';

const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});

export default function ChangeStatus({ id }: any) {
  const { data: session } = useSession();
  const router = useRouter(); // Initialize the router
  const [labels, setLabels] = useState<any>();
  const [jobInfo, setJobInfo] = useState<any>();
  const [value, setValue] = useState<any>([]);
  const [value1, setUserData] = useState<any>();
  const [phone, setPhone] = useState<any>('N');
  const previousPathname = useRef<string | null>(null); // Ref to store previous pathname

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
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiService.get('/all-labels');
        setLabels(result.data.show_labels);
      } catch (error) {
        console.error('Error fetching labels data:', error);
        toast.error('Error fetching labels data. Please try again.');
      }
      try {
        const response = await apiService.get(`/label/${id}`);
        const job_result = response.data.label;
        setJobInfo(job_result[0]);
      } catch (error) {
        console.error('Error fetching job data:', error);
        toast.error('Error fetching job data. Please try again.');
      }
      try {
        if (session) {
          const response = await apiService.get(`/get-highlyinterest-by-id/${id}`);
          const userData = response.data.leads;
          setValue(userData);
        }
      } catch (error) {
        console.error('Error fetching Customer data:', error);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  useEffect(() => {
    let startTime: any;

    function startTimer() {
      startTime = new Date();
    }

    async function stopTimer() {
      const endTime = new Date();
      const duration = (endTime - startTime) / 1000; // duration in seconds
      if (value1?.user?.name) {
        try {
          await apiService.post('/page-time', {
            leadsId: id,
            user: value1?.user?.name,
            phone: phone,
            opentime: startTime,
            totaltime: duration,
          });
        } catch (error) {
          console.error('Error saving page time:', error);
          toast.error('Error saving page time. Please try again.');
        }
      }
    }

    // Start the timer when the component mounts
    startTimer();

    // Compare previous and current pathname to stop timer and send data
    if (previousPathname.current && previousPathname.current !== router.pathname) {
      stopTimer();
    }

    // Update the previous pathname ref
    previousPathname.current = router.pathname;

    return () => {
      // Clean up on unmount
      stopTimer();
    };
  }, [value1?.user?.name, router.pathname, phone]);

  const onSubmit: SubmitHandler<LabelSchemaFormTypes> = async (data) => {
    try {
      const result = await apiService.put(`/lead-label/${id}`, data);
      toast.success(result.data.message);
      if (result.data.success) {
        // logs({ user: value1?.user?.name, desc: 'lead label' });
      }
    } catch (error) {
      console.error('Error updating Lead Status:', error);
      toast.error('Error updating Lead Status. Please try again.');
    }
  };

  const { openModal } = useModal();

  const handleViewInvoice = (id: string) => {
    openModal({
      view: <StChangeButton id={id} />,
    });
  };

  const handleButtonClick = async () => {
    const phoneNumber = value[0]?.mobile;
    setPhone('Y');

    // Wait for the state update to be processed
    setTimeout(() => {
      const telLink = `tel:${phoneNumber}`;
      window.location.href = telLink;
    }, 0);
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row justify-end relative">
      {value[0]?.status === 'open' && (
        <Form<LabelSchemaFormTypes>
          validationSchema={LabelSchema}
          onSubmit={onSubmit}
          className="flex flex-col"
          useFormProps={{
            mode: 'onChange',
            defaultValues,
          }}
        >
          {({ register, control, setValue, getValues, formState: { errors } }) => (
            <div className="mb-1">
              <div className="flex items-center justify-between gap-4 w-full pr-3">
                <Controller
                  control={control}
                  name="leads_label"
                  render={({ field: { value, onChange } }) => (
                    <SelectBox
                      defaultValue={jobInfo}
                      placeholder={jobInfo ? jobInfo : 'Select label'}
                      options={labels || []}
                      onChange={onChange}
                      value={value}
                      className="w-48" // Adjust width for smaller screens
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        labels?.find((r: any) => r.value === selected)?.name ?? ''
                      }
                      style={{
                        control: (base: any) => ({
                          ...base,
                          minHeight: '35px',
                        }),
                        menu: (base: any) => ({
                          ...base,
                          zIndex: 9999, // Ensure the dropdown is above other elements
                        }),
                        menuList: (base: any) => ({
                          ...base,
                          maxHeight: '150px', // Limit the height of the dropdown list
                          overflowY: 'auto', // Enable scrolling
                        }),
                      }}
                    />
                  )}
                />

                <button
                  type="submit"
                  className="bg-black hover:bg-deep-black text-white font-bold py-2 px-4 rounded relative z-20"
                >
                  Change Category
                </button>
              </div>
            </div>
          )}
        </Form>
      )}

      <div className="flex flex-col mb-10 sm:flex-row sm:items-center">
        {value[0]?.status === 'open' && (
          <button
            className="bg-black hover:bg-deep-black text-white font-bold py-2 px-4 rounded relative z-20 mb-3 mt-0.5 sm:mb-0 sm:mr-3 sm:ml-0"
            onClick={() => handleViewInvoice(id)}
          >
            Close Lead
          </button>
        )}
        <button
          className="bg-black hover:bg-deep-black text-white font-bold py-2 px-4 rounded relative z-20 ml-0 mt-0.5"
          onClick={handleButtonClick}
        >
          Call
        </button>
      </div>
    </div>
  );
}
