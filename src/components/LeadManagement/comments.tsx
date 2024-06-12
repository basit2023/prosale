'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import apiService from '@/utils/apiService';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { SubmitHandler } from 'react-hook-form';
import { CommentsFormTypes, CommentsFormSchema, defaultValues } from '@/utils/validators/comments.schema';
import FormFooter from '@/components/form1-footer';
import { Form } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import Spinner from '@/components/ui/spinner';
import { logs } from '@/app/shared/account-settings/logs';
import { decryptData } from '@/components/encriptdycriptdata';


export default function CustomerComments({ onComment, id }:any) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [userData, setUserData]=useState<any>();
  const [isLoading, setIsLoading] = useState(false); 
  const [commentValue, setCommentValue] = useState('');
  const router = useRouter();
 
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
  const onSubmit: SubmitHandler<CommentsFormTypes> = async (data) => {
    try {
      setIsLoading(true); 
      const result = await apiService.post(`/comments/${id}`, {
        ...data,
        user: userData?.user?.name,
      });
      onComment(result)
      if (result.data.success) {
        toast.success(result.data.message);
        
        setComments([...comments, data.comments]); // Update comments state with the new comment
        logs({ user: userData?.user?.name, desc: 'add comments' });
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
      {({ register, formState: { errors } }) => (
        <>
          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11 mt-6">
            <Textarea
              // name="comments"
              label="Add Comments"
              placeholder="Add comments about leads"
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