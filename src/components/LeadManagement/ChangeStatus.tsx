import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
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

type CallOutcome = 'CONNECTED' | 'NO_ANSWER' | 'BUSY' | 'REJECTED' | 'FAILED' | 'CANCELLED';

type PendingWebCall = {
  logId: number;
  startedAt: number;
};

type PendingWebCallResult = {
  logId: number;
  endTime: string;
  durationSeconds: number;
};

export default function ChangeStatus({ id }: any) {
  const { data: session } = useSession();
  const router = useRouter(); // Initialize the router
  const [labels, setLabels] = useState<any>();
  const [jobInfo, setJobInfo] = useState<any>();
  const [value, setValue] = useState<any>([]);
  const [value1, setUserData] = useState<any>();
  const [phone, setPhone] = useState<any>('N');
  const pendingCallRef = useRef<PendingWebCall | null>(null);
  const [pendingCallResult, setPendingCallResult] = useState<PendingWebCallResult | null>(null);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const previousPathname = useRef<string | null>(null); // Ref to store previous pathname
  const memoizedSession = useMemo(() => session, [session])
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
  }, [memoizedSession]);

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
        if (memoizedSession) {
          const response = await apiService.get(`/get-highlyinterest-by-id/${id}`);
          const userData = response.data.leads;
          setValue(userData);
        }
      } catch (error) {
        console.error('Error fetching Customer data:', error);
      }
    };

    if (memoizedSession) {
      fetchData();
    }
  }, [memoizedSession]);

  useEffect(() => {
    let startTime: any;

    function startTimer() {
      startTime = new Date();
    }

    async function stopTimer() {
      const endTime = new Date();
      const duration = (endTime - startTime) / 1000;
      if (value1?.user?.name) {
        try {
          await apiService.post('/page-time', {
            leadsId: id,
            whatsapp: 'N',
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

  const [isCalling, setIsCalling] = useState(false);

  const loadCallLogs = useCallback(async () => {
    try {
      const response = await apiService.get(`/call-log/lead/${id}`);
      setCallLogs(response?.data?.data || []);
    } catch (error) {
      console.error('Error loading call logs:', error);
    }
  }, [id]);

  useEffect(() => {
    loadCallLogs();
  }, [loadCallLogs]);

  const finalizePendingCall = useCallback(() => {
    const pending = pendingCallRef.current;
    if (!pending || Date.now() - pending.startedAt < 2000) return;

    setPendingCallResult({
      logId: pending.logId,
      endTime: new Date().toISOString(),
      durationSeconds: Math.max(0, Math.round((Date.now() - pending.startedAt) / 1000)),
    });
    pendingCallRef.current = null;
    setIsCalling(false);
  }, []);

  useEffect(() => {
    const handleReturn = () => {
      if (document.visibilityState === 'visible') finalizePendingCall();
    };
    window.addEventListener('focus', handleReturn);
    document.addEventListener('visibilitychange', handleReturn);
    return () => {
      window.removeEventListener('focus', handleReturn);
      document.removeEventListener('visibilitychange', handleReturn);
    };
  }, [finalizePendingCall]);

  const saveCallOutcome = async (outcome: CallOutcome) => {
    if (!pendingCallResult) return;
    try {
      await apiService.put(`/call-log/${pendingCallResult.logId}`, {
        end_time: pendingCallResult.endTime,
        duration_seconds: pendingCallResult.durationSeconds,
        disposition: outcome,
        disposition_source: 'user_confirmed',
      });
      toast.success(`Call result saved: ${outcome.replace('_', ' ')}`);
      setPendingCallResult(null);
      await loadCallLogs();
    } catch (error) {
      console.error('Error saving call outcome:', error);
      toast.error('Failed to save call result. Please try again.');
    }
  };

  const handleButtonClick = async () => {
    if (isCalling) return;

    let phoneNumber = value[0]?.mobile;

    if (!phoneNumber) {
      toast.error('No phone number available');
      return;
    }

    // 🔹 Add '+' if the number starts with '92'
    if (phoneNumber.startsWith('92') && !phoneNumber.startsWith('+')) {
      phoneNumber = `+${phoneNumber}`;
    }

    setIsCalling(true);
    try {
      setPhone('Y');
      const getCurrentTimestamp = () =>
        Math.floor(new Date().getTime() / 1000).toString();
      await apiService.put(`/lead-open/${id}`, {
        dt: getCurrentTimestamp(),
        email: memoizedSession?.user?.email,
      });

      const startedAt = Date.now();
      try {
        const callLogResponse = await apiService.post('/call-log', {
          lead_id: id,
          user_email: memoizedSession?.user?.email || value1?.user?.email,
          phone: phoneNumber,
          start_time: new Date(startedAt).toISOString(),
        });
        const callLogId = Number(callLogResponse?.data?.id);
        if (callLogId) {
          pendingCallRef.current = { logId: callLogId, startedAt };
          window.setTimeout(finalizePendingCall, 3000);
        }
      } catch (callLogError) {
        console.error('Failed to create call log:', callLogError);
        toast.error('The call will open, but its result may not be logged.');
      }

      // Trigger phone call using window.location.href for better iOS Safari support
      window.location.href = `tel:${phoneNumber}`;
    } catch (error) {
      console.error('Error while updating lead status:', error);
      toast.error('Failed to initiate call');
    } finally {
      setIsCalling(false);
    }
  };

  const onWhatsApp = async () => {
    let phoneNumber = value[0]?.mobile;
    if (!phoneNumber) {
      toast.error('No phone number available');
      return;
    }

    if (phoneNumber.startsWith('92') && !phoneNumber.startsWith('+')) {
      phoneNumber = `+${phoneNumber}`;
    }

    try {
      const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();
      await apiService.put(`/lead-open/${id}`, {
        dt: getCurrentTimestamp(),
        email: memoizedSession?.user?.email,
      });

      // Activity tracking
      await apiService.post('/page-time', {
        leadsId: id,
        whatsapp: 'Y',
        user: value1?.user?.name,
        phone: 'N',
        opentime: new Date(),
        totaltime: 0,
      });

      const url = `https://wa.me/${phoneNumber.replace('+', '')}`;
      window.location.href = url;
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      toast.error('Failed to open WhatsApp');
    }
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
                  className="bg-black hover:bg-deep-black text-white text-xs sm:text-sm font-bold py-2 px-4 rounded relative z-20"
                >
                  Update Category
                </button>
              </div>
            </div>
          )}
        </Form>
      )}

      <div className="flex flex-col mb-10 sm:flex-row sm:items-center gap-3">
        {value[0]?.status === 'open' && (
          <button
            className="bg-black hover:bg-deep-black text-white font-bold py-2 px-4 rounded relative z-20 mt-0.5"
            onClick={() => handleViewInvoice(id)}
          >
            Close Lead
          </button>
        )}
        <button
          className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-2 px-4 rounded relative z-20 mt-0.5"
          onClick={onWhatsApp}
        >
          WhatsApp
        </button>
        <button
          className={`bg-black hover:bg-deep-black text-white font-bold py-2 px-4 rounded relative z-20 mt-0.5 ${isCalling ? 'opacity-75' : ''}`}
          onClick={handleButtonClick}
          disabled={isCalling}
        >
          {isCalling ? 'Calling...' : 'Call'}
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="font-bold text-gray-900 dark:text-white">Recent Call Results</h3>
        <div className="mt-3 space-y-2">
          {callLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex flex-col justify-between gap-1 rounded-lg bg-white px-3 py-2 text-sm sm:flex-row dark:bg-gray-800">
              <span>
                <span className={log.is_connected ? 'font-bold text-emerald-600' : 'font-bold text-rose-600'}>
                  {String(log.call_outcome || 'PENDING').replace(/_/g, ' ')}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  {log.duration_seconds || 0}s | {log.disposition_source || 'pending confirmation'}
                </span>
              </span>
              <span className="text-xs text-gray-500">
                {log.start_time ? new Date(log.start_time).toLocaleString() : '-'}
              </span>
            </div>
          ))}
          {!callLogs.length ? <div className="text-sm text-gray-500">No calls logged for this lead.</div> : null}
        </div>
      </div>

      {pendingCallResult ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">What happened with the call?</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select the actual result. Dialer time: {pendingCallResult.durationSeconds}s.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {([
                ['CONNECTED', 'Connected'],
                ['NO_ANSWER', 'No Answer'],
                ['BUSY', 'Busy'],
                ['REJECTED', 'Rejected'],
                ['FAILED', 'Failed'],
                ['CANCELLED', 'Cancelled'],
              ] as Array<[CallOutcome, string]>).map(([outcome, label]) => (
                <button
                  key={outcome}
                  type="button"
                  onClick={() => saveCallOutcome(outcome)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
