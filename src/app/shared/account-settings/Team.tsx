// PersonalInfoView.js

'use client';

import {logs,logsCreate} from './logs';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { countries, roles, timezones,sim } from '@/data/forms/my-details';
import { useSession } from 'next-auth/react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { PiClock, PiEnvelopeSimple } from 'react-icons/pi';
import { Form } from '@/components/ui/form';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';
import ProfileSettingsView from './profile-settings';
import {
  defaultValues,
  personalInfoFormSchema,
  PersonalInfoFormTypes,
} from '@/utils/validators/personal-info.schema';
import AvatarUpload from '@/components/ui/file-upload/avatar-upload';
import { decryptData } from '@/components/encriptdycriptdata';
const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});
const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,


});


interface UserType {
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  mobile: string;
  isp: string;
  cnic: string;
  img: string;
  gender: string;
}

interface ValueType {
  user: UserType;
}


export default function PersonalInfoView() {
  const { data: session } = useSession();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  const [value, setUserData]=useState<any>();

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
 

  const onSubmit: SubmitHandler<PersonalInfoFormTypes> = async (data) => {
    
   
    try {
      
      const avatarImage = localStorage.getItem('img');
      if (avatarImage) {
        

   
    const result= await apiService.put(`/personalinfo/${session?.user?.email}`, {
                                    ...data,
                                    avatar: avatarImage, // Add the avatar property to the data object
                                    })
        toast.success(result.data.message);

        localStorage.removeItem('img');
        if(result.data.success){
         
          logs({ user: value?.user?.name, desc: 'Profile Details' });
          setIsEditing(true)
        }
        
      } else {
        
       const result= await apiService.put(`/personalinfo/${session?.user?.email}`, {
            ...data})
            
        toast.success(result.data.message);
        
        if(result.data.success){
          
          logs({ user: value?.user?.name, desc: 'Profile Details' });
          setIsEditing(true)
        }

      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile. Please try again.');
    }
  };
  const handleEditProfileClick = () => {
    setIsEditing((prev) => !prev);
  };

  const first = value?.user?.first_name;
  const last = value?.user?.last_name;
  const sim1:string = `${value?.user?.isp}`;
  const gender1:string = `${value?.user?.gender}`;

  const base64Image = value ? `${value.user.img}` : '';
  const parts = base64Image.split(';base64,');
  const mimeType = parts[0].split(':')[1];
  const imageData = parts[1];
  const imageBuffer = imageData ? Buffer.from(imageData, 'base64') : undefined;

 return isEditing ? (
    <ProfileSettingsView />
  ) : (
    <Form<PersonalInfoFormTypes>
      validationSchema={personalInfoFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        defaultValues,
      }}
     
    >
      {({ register, control, setValue, getValues, formState: { errors } }) => {
        return (
          <>
            <FormGroup
              title="Personal Info"
              description="Update your photo and personal details here"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
              <FormGroup
                title="Name"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                
              >
                
                 <Input

                  {...register('first_name')}
                  defaultValue={first}
                  placeholder="First Name"
                  error={errors.first_name?.message}
                  className="flex-grow"
                />
                
                <Input
                  
                  {...register('last_name')}
                  defaultValue={last}
                  placeholder="Last Name"
                  error={errors.last_name?.message}
                  className="flex-grow"
                />
              </FormGroup>

              <FormGroup
                title="Email Address"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <div className="col-span-full flex items-center border border-gray-300 bg-gray-200 p-2 rounded-md">
                  <PiEnvelopeSimple className="h-6 w-6 text-gray-500 mr-2" />
                  <span className="text-gray-700">{session?.user?.email}</span>
                </div>
              </FormGroup>
              <FormGroup
                title="Mobile Number"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  defaultValue={value?.user?.mobile as string}
                  placeholder="03XXXXXXXXX"
                  {...register('mobile')}
                  error={errors.mobile?.message}
                  className="flex-grow"
                />
                <Controller
                  control={control}
                  name="isp"
                  render={({ field: { value, onChange } }) => (
                    <SelectBox
                      // value={value?.user?.isp}
                      defaultValue={`${sim1}`}
                      placeholder={sim1 ? sim1 : "SIM Provider"}
                      options={sim}
                      onChange={onChange}
                      value={value}
                      className="flex-grow"
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        sim?.find((r) => r.value === selected)?.name ?? ''
                      }
                      // error={errors?.role?.message as string}
                    />
                  )}
                />
              </FormGroup>
              <FormGroup
                title="CNIC Number"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                defaultValue={value?.user?.cnic as string}
                  placeholder="XXXXX-XXXXXXX-X"
                  {...register('cnic')}
                  error={errors.cnic?.message}
                  className="flex-grow"
                />
              </FormGroup>

              <FormGroup
                title="Your Photo"
                description="This will be displayed on your profile."
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <div className="flex flex-col gap-6 @container @3xl:col-span-2">
                  <AvatarUpload
                    name="image"
                    // setValue={setValue}
                    // getValues={getValues}
                    defaultValue={imageBuffer ? `data:${mimeType};base64,${imageData}` : 'fallback_url'}
                    error={errors?.image?.message as string}
                  />
                  {/* <UploadPhoto/> */}
                </div>
              </FormGroup>

              <FormGroup
                title="Gender"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="gender"
                  render={({ field: { value, onChange } }) => (
                    <SelectBox
                    defaultValue={gender1}
                      placeholder={gender1? gender1: "Select Gender"}
                      options={roles}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        roles?.find((r) => r.value === selected)?.name ?? ''
                      }
                      // error={errors?.role?.message as string}
                    />
                  )}
                />
              </FormGroup>

            
            </div>
            <FormFooter altBtnText="Cancel" submitBtnText="Save" />
          </>
        );
      }}
    </Form>
  );
}
