// PersonalInfoView.js

'use client';
// import { logs,logsCreate } from '../account-settings/logs';
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
import { Password } from '@/components/ui/password';
import { CloseLeadFormSchema,CloseLeadFormTypes, defaultValues } from '@/utils/validators/close-lead.schema';
import { DatePicker } from '@/components/ui/datepicker';
import UploadButton from './FileUpladButton';
import FileUpload from './file-upload';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { PiXBold } from 'react-icons/pi'; 
import { ActionIcon } from '@/components/ui/action-icon';
const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});

export default function StChangeButton({ id }:any) {
  const { data: session } = useSession();
  const [value, setValue1] = useState();
  const [userType, setUserType] = useState([]);
  const [userValue, setUserValue] = useState<any>();
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [meeting, setMeeting] = useState(false);
  const [meetingInitiated, setMeetingInitiated] = useState(false);
  const [offerLetterValue, setOfferLetterValue] = useState('No'); // Step 1
  const { closeModal } = useModal();
  const [isFileInputOpen, setIsFileInputOpen] = useState(false);
  const handlechange = () => {
    // Step 3
    const updatedValue = offerLetterValue == 'No' ? 'Yes' : 'No';
   
    setOfferLetterValue(updatedValue);
  };
 

  useEffect(() => {
    const fetchData = async () => {
      // try {
      //   const response = await apiService.get(`/employee-status-info/${id}`);
      //   const userData = response.data;
      //   console.log("the user is:", userData)
      //   setValue1(userData);
      //   setDatePickerOpen(false)
      // } catch (error) {
      //   console.error('Error fetching user data:', error);
      //   toast.error('Error fetching user data. Please try again.');
      // }
      try {
        const response = await apiService.get(`/all-user-type`);

        const userData = response.data;
        setUserType(userData.data);
      } catch (error) {
        console.error('Error fetching degignation data:', error);
        toast.error('Error fetching designation data. Please try again.');
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const onSubmit: SubmitHandler<CloseLeadFormTypes> = async (data) => {
   
    try {
      const result = await apiService.post(`/close-lead/${id}`, {
        ...data,
      });
      
      toast.success(result.data.message);
    } catch (error) {
      console.error('Error closing Leads:', error);
      toast.error('Error Closing Leads. Please try again.');
    }
  };

  const status:any = [{ name: "Meeting Initiated", value: "Y" }, { name: "Matured", value: "N" }];

  return (
    <Form<CloseLeadFormTypes>
      validationSchema={CloseLeadFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues,
      }}
    >
      {({ register, control, setValue, getValues, formState: { errors } }):any => (
        <>
        <div className="m-auto @2xl:px-7">
            <div className="flex items-center justify-end mt-2">
              <ActionIcon
                size="sm"
                variant="text"
                onClick={() => closeModal()}
                className="p-0 text-gray-500 hover:!text-gray-900"
              >
                <PiXBold className="h-[18px] w-[18px]" />
              </ActionIcon>
            </div>
          </div>
    
          <div className="mb-3 grid gap-7 divide-y divide-gray-200 @2xl:gap-9 @3xl:gap-11 relative overflow-auto">
            <table className="border-collapse border border-dashed border-slate-400 ...">
            <caption className="text-xl font-semibold mb-2">Lead Close</caption>
              <tbody>
                <tr className="justify-center">
                  <td className="border border-dashed border-slate-300 text-center bg-transparent h-8 ...">
                    Lead Change
                  </td>
                  <td className="border border-dashed border-slate-300 text-center z-100 bg-transparent h-8 ...">
                    <Controller
                      control={control}
                      name="closing_type"
                      render={({ field: { value, onChange } }):any => (
                        <>
                          <SelectBox
                            placeholder="Select Option"
                            options={status}
                            onChange={onChange}
                            value={value}
                            className="border border-gray-300 p-0 m-1 bg-transparent text-sm max-w-xs"
                            style={{zIndex: 1000}}
                            getOptionValue={(option:any) => option.value}
                            displayValue={(selected) =>
                              status?.find((r:any) => r.value === selected)?.name ?? ''
                            }
                            // error={errors?.status?.message as string}
                            onFocus={() => setDatePickerOpen(true)}
                            onBlur={() => setDatePickerOpen(false)}
                          />
                          {value === 'Y' && (
                            <>
                              {setMeeting(true)}
                              {setMeetingInitiated(false)}
                            </>
                          )}
                          {value === 'N' && (
                            <>
                              {setMeeting(false)}
                              {setMeetingInitiated(true)}
                            </>
                          )}
                        </>
                      )}
                    />
                  </td>
                </tr>
                {meeting && (
                  <>
                    <tr className="justify-center">
                      <td className="border border-dashed border-slate-300 text-center bg-transparent h-8 ...">
                        Meeting Location
                      </td>
                      <td className="border border-dashed border-slate-300 text-center bg-transparent h-8 ...">
                        <Input
                          className="w-full bg-transparent"
                          defaultValue={userValue?.results[0]?.travel_value}
                          placeholder="Meeting Location"
                          {...register('meeting_location')}
                          // error={errors.city?.message}
                        />
                      </td>
                    </tr>
                    <tr className="justify-center">
                      <td className="border border-dashed border-slate-300 text-center bg-transparent h-8 ...">
                        Meeting Time
                      </td>
                      <td className="border border-dashed border-slate-300 text-center bg-transparent h-8 ...">
                        <Controller
                          name="meeting_time"
                          control={control}
                          rules={{ required: 'Date of Birth is required' }}
                          render={({ field }:any) => (
                            <DatePicker
                              className="bg-transparent"
                              selected={startDate}
                              onChange={(date: Date) => {
                                setStartDate(date);
                                setValue('meeting_time', date.toISOString(), { shouldValidate: true });
                              }}
                              dateFormat="MM/dd/yyyy h:mm aa"
                              placeholderText="Select Date and Time"
                              popperPlacement="bottom-end"
                              // @ts-ignore
                              value={startDate}
                              showTimeSelect
                              timeFormat="HH:mm"
                              onFocus={() => setDatePickerOpen(true)}
                              onBlur={() => setDatePickerOpen(false)}
                            />
                          )}
                        />
                        
                      </td>
                    </tr>
                    {/* {datePickerOpen && (
                                <>
                                 
                                  <Input
                                    className="w-full invisible bg-white"
                                    defaultValue={userValue?.results[0]?.travel_value}
                                    placeholder="Travel Charges"
                                    {...register('travel_value')}
                                    error={errors.city?.message}
                                  />
                                  <Input
                                    className="w-full invisible bg-white"
                                    defaultValue={userValue?.results[0]?.second_value}
                                    placeholder="Second Placeholder"
                                    {...register('second_value')}
                                    error={errors.second?.message}
                                  />
                                  <Input
                                    className="w-full invisible bg-white"
                                    defaultValue={userValue?.results[0]?.third_value}
                                    placeholder="Third Placeholder"
                                    {...register('third_value')}
                                    error={errors.third?.message}
                                  />
                                  <Input
                                    className="w-full invisible bg-white"
                                    defaultValue={userValue?.results[0]?.third_value}
                                    placeholder="Third Placeholder"
                                    {...register('third_value')}
                                    error={errors.third?.message}
                                  />
                                  <Input
                                    className="w-full invisible bg-white"
                                    defaultValue={userValue?.results[0]?.third_value}
                                    placeholder="Third Placeholder"
                                    {...register('third_value')}
                                    error={errors.third?.message}
                                  />
                                  <Input
                                    className="w-full invisible bg-white"
                                    defaultValue={userValue?.results[0]?.third_value}
                                    placeholder="Third Placeholder"
                                    {...register('third_value')}
                                    error={errors.third?.message}
                                  />
                                </>
                              )} */}
                  </>
                )}
                {meetingInitiated && (
                  <>
                   <tr className="justify-center">
                      <td className="border border-dashed border-slate-300 text-center bg-transparent h-8 ...">
                        Customer Name
                      </td>
                      <td className="border border-dashed border-slate-300 text-center bg-transparent h-8 ...">
                        <Input
                          className="w-full bg-transparent"
                          defaultValue={userValue?.results[0]?.travel_value}
                          placeholder="Customer Name"
                          {...register('cutomer')}
                          // error={errors.city?.message}
                        />
                      </td>
                    </tr>
                    <tr className="justify-center">
                    {/* // @ts-ignore                 */}
  <td colSpan={2} className="p-4">
    <div className="w-full flex justify-center mt-4">
      {/* Render the FileUpload component */}
      <FileUpload
        label="Upload Files" // Customize label as needed
        btnLabel="Upload" // Customize button label as needed
        fieldLabel="Additional Information" // Customize field label as needed
        name="booking_file" // Pass the name attribute
        // @ts-ignore
        setValue={setValue} // Pass the setValue function
        // getValues={getValues} // Pass the getValues function
        id={id}
      />
    </div>
  </td>
</tr>

                  </>
                )}
              </tbody>
            </table>
            <button
              type="submit"
              className="bg-black hover:bg-deep-black text-white font-bold py-3 px-4 rounded relative mt-4"
              onClick={() => closeModal()}
            >
              Close
            </button>
          </div>
          
        </>
      )}
    </Form>
  );
}
