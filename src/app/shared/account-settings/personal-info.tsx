'use client';
import { useSession } from 'next-auth/react';
import { useEffect,useState } from 'react';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { SubmitHandler, Controller } from 'react-hook-form';
import { PiEnvelopeSimple, PiSealCheckFill } from 'react-icons/pi';
import { Form } from '@/components/ui/form';
import { Title, Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import SelectBox from '@/components/ui/select';
import { routes } from '@/config/routes';
import toast from 'react-hot-toast';
import AvatarUpload from '@/components/ui/file-upload/avatar-upload';
import {
  defaultValues,
  profileFormSchema,
  ProfileFormTypes,
} from '@/utils/validators/profile-settings.schema';
import { roles } from '@/data/forms/my-details';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import cn from '@/utils/class-names';
import { useLayout } from '@/hooks/use-layout';
import { useBerylliumSidebars } from '@/layouts/beryllium/beryllium-utils';
import { LAYOUT_OPTIONS } from '@/config/enums';
import apiService from '@/utils/apiService';
import PersonalInfoView from './profile-edit';
import Mydetails from './Mydetails';
const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,

});


export default function ProfileSettingsView() {
  const { data: session } = useSession();
  const [value, setValue] = useState<any>();
  const [isEditing, setIsEditing] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const response = await apiService.get(`/user-details/${session?.user?.email}`);
        const userData = response.data.results[0]
        ;
        
        setValue(userData);
       
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
    };

    if (session) {
      fetchData();
      
    }
  }, [session]);

  const onSubmit: SubmitHandler<ProfileFormTypes> = (data) => {
    toast.success(<Text as="b">Profile successfully updated!</Text>);
   
   
  }
 
  
  const handleEditProfileClick = () => {
    
    setIsEditing((prev) => !prev);
  }
  return (
    <>
      {isEditing ? (
    <>
      <Form<ProfileFormTypes>
        validationSchema={profileFormSchema}
        onSubmit={onSubmit}
        className="@container"
        useFormProps={{
          mode: 'onChange',
          defaultValues,
        }}
      >
        {({
          register,
          control,
          getValues,
          setValue,
          formState: { errors },
        }) => {
          return (
            <>
                <div className="flex justify-end w-full sm:w-auto md:ms-auto mt-4">
                   
                    <Button
                        tag="span"
                        className="dark:bg-gray-100 dark:text-white dark:focus:bg-gray-100"
                        onClick={handleEditProfileClick}
                        style={{ cursor: 'pointer' }}
                    >
                        Edit My Details
                    </Button>
                    
                    </div>
              

              <div className="mx-auto mb-10 grid w-full max-w-screen-2xl gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
                <FormGroup
                  title="Address"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <div className="col-span-full">
                    <Text as="b">{value?.address}</Text>
                  </div>
                </FormGroup>
                <FormGroup
                  title="City"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <div className="col-span-full">
                    <Text as="b">{value?.city}</Text>
                  </div>
                </FormGroup>
                <FormGroup
                  title="WhatsApp Number"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <div className="col-span-full">
                    <Text as="b">{value?.whatsapp}</Text>
                  </div>
                </FormGroup>
                
                <FormGroup
                  title="Facebook"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <div className="col-span-full">
                    <Text as="b">{value?.facebook}</Text>
                  </div>
                </FormGroup>
                <FormGroup
                  title="Instagram"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <div className="col-span-full">
                    <Text as="b">{value?.instagram}</Text>
                  </div>
                </FormGroup>
                <FormGroup
                  title="linkedin"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <div className="col-span-full">
                    <Text as="b">{value?.linkedin}</Text>
                  </div>
                </FormGroup>
                <FormGroup
                  title="Twitter"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <div className="col-span-full">
                    <Text as="b">{value?.twitter}</Text>
                  </div>
                </FormGroup>

                
              </div>
              {/* <FormFooter
                // isLoading={isLoading}
                altBtnText="Cancel"
                submitBtnText="Save"
              /> */}
            </>
          );
        }}
      </Form>
    </>
     ) : (
      < Mydetails/>
      
      )}
      </>
  );
}











