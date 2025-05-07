'use client';
import React, { useState, useEffect, useMemo} from 'react';
import { useSession} from 'next-auth/react';
import apiService from '@/utils/apiService';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { SubmitHandler, Controller, useForm } from 'react-hook-form';
import { CommentsFormTypes, CommentsFormSchema, defaultValues } from '@/utils/validators/comments.schema';
import FormFooter from '@/components/form1-footer';
import { Form } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import Spinner from '@/components/ui/spinner';
import { logs, logsCreate} from '@/app/shared/account-settings/logs';
import { decryptData } from '@/components/encriptdycriptdata';
import { DatePicker, DatePickerProps } from '@/components/ui/datepicker';
import ReactDatePicker from '../ui/Timedatepicker'; 
import FormGroup from '@/app/shared/form-group';
import dynamic from 'next/dynamic';
const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});

export default function CustomerComments({ onComment, id, onClear,
  placeholderText = 'Select date',
  inputProps,
  ...props}:any) {
  const { data: session } = useSession();
  const memoizedSession=useMemo(()=>session,[session])
  const [comments, setComments] = useState<any[]>([]);
  const [userData, setUserData]=useState<any>(memoizedSession);
  const [isLoading, setIsLoading] = useState(false); 
  const [commentValue, setCommentValue] = useState('');
  const [startDate, setStartDate] = React.useState<Date | null>();
  const router = useRouter();
  const typeOptions = useMemo(() => [
      { name: "Meeting", value: "Meeting" }, 
      { name: "Dialing", value: "Dialing" }, 
      { name: "Visiting", value: "Visiting" }
    ], []);
 
  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       const encryptedData = localStorage.getItem('uData');
  //       if (encryptedData) {
  //         const data = decryptData(encryptedData);
  //         setUserData(data);
  //       } 
  //     } catch (error) {
  //       console.error('Error fetching user data:', error);
  //       toast.error('Error fetching user data. Please try again.');
  //     }
  //   };

  //   fetchUserData();
  // }, [session]);
  const onSubmit: SubmitHandler<CommentsFormTypes> = async (data) => {
   
    try {
      setIsLoading(true); 
      const result = await apiService.post(`/comments/${id}`, {
        ...data,
        user: userData?.user?.username,
      });
      onComment(result)
      if (result.data.success) {
        toast.success(result.data.message);
        
        setComments([...comments, data.comments]); // Update comments state with the new comment
        logsCreate({ user: userData?.user?.username, desc: 'added comments' });
        router.refresh()
        setCommentValue('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error adding comment. Please try again.');
    }finally {
      setIsLoading(false); // Stop loading
    }
  };
  
  const onCancel = () => {
    
    setCommentValue('');
  };
  if (!userData) {
    return <Spinner />;
  }

  return (
    <Form<CommentsFormTypes>
      validationSchema={CommentsFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues,
      }}

    >
      {({ register, control, reset, setValue, getValues, formState: { errors } }) => (
        <>
          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11 mt-6">
          <FormGroup
                    title="Select Time and Date"
                    className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                  >
          
          <ReactDatePicker
            selected={startDate}
            {...register('followupdate')}
            onChange={(date: Date | null) => {
              console.log('Selected date:', date);
              console.log('ISO String:', date?.toISOString());
              setStartDate(date);
              setValue('followupdate', date?.toISOString() || '');
              console.log('Current form value:', getValues('followupdate'));
            }}
            dateFormat="d MMMM yyyy, h:mm aa"
            placeholderText="Select Date & Time"
            showTimeSelect
          />
         </FormGroup>
        <FormGroup
                    title="Select Follow Up"
                    className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                  >
                    <Controller
                      control={control}
                      name="followup"
                      render={({ field: { value, onChange } }) => (
                        <SelectBox
                          placeholder="Select Time and Date"
                          options={typeOptions}
                          onChange={onChange}
                          value={value}
                          className="col-span"
                          getOptionValue={(option):any => option.value}
                          displayValue={(selected) =>
                            typeOptions.find((r: any) => r.value === selected)?.name ?? ''
                          }
                          error={errors?.type?.message as string}
                        />
                      )}
                    />
                  </FormGroup>
                 
            <Textarea
              // name="comments"
              label="Add Comment"
              placeholder="Add comment about leads"
              {...register('comments')}
              // error={errors.comments?.message as string}
              textareaClassName="h-20"
            />
           
          </div>
          <FormFooter className="sxm:mb-0 mb-3 sxm:mt-0"  submitBtnText="Save Comments" 
          
          isLoading={isLoading}/>
        </>
      )}
    </Form>
  );
}