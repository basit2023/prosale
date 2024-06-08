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
import toast from 'react-hot-toast';
import {
  defaultValues,
  profileFormSchema,
  ProfileFormTypes,
} from '@/utils/validators/profile-settings.schema';
import FormGroup from '@/app/shared/form-group';
import cn from '@/utils/class-names';
import { useLayout } from '@/hooks/use-layout';
import { useBerylliumSidebars } from '@/layouts/beryllium/beryllium-utils';
import { LAYOUT_OPTIONS } from '@/config/enums';
import apiService from '@/utils/apiService';
import { decryptData } from '@/components/encriptdycriptdata';
import PersonalInfoView from './profile-edit';
const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,

});


export default function ProfileSettingsView() {
  const { data: session } = useSession();
  // const [value, setValue] = useState<any>();
  const [isEditing, setIsEditing] = useState(true);
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



  const onSubmit: SubmitHandler<ProfileFormTypes> = (data) => {
    toast.success(<b>Profile successfully updated!</b>);
    // Your logic for submitting the form
  };

  const displayName = value ? `${value.user.first_name} ${value.user.last_name}` : 'User';

  const handleEditProfileClick = () => {
    setIsEditing((prev) => !prev);
  };

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
              <ProfileHeader
                title={displayName}
                description="press edit profile to update profile"
              >
                <div className="w-full sm:w-auto md:ms-auto">
                  {/* <Link href={routes.profile}> */}
                    <Button
                      tag="span"
                      className="dark:bg-gray-100 dark:text-white dark:focus:bg-gray-100"
                      onClick={handleEditProfileClick}
                      style={{ cursor: 'pointer' }}
                    >
                      Edit Profile
                    </Button>
                  {/* </Link> */}
                </div>
              </ProfileHeader>

              <div className="mx-auto mb-10 grid w-full max-w-screen-2xl gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
                <FormGroup
                  title="Username"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <div className="col-span-full">
                    <Text as="b">{value?.user?.name}</Text>
                  </div>
                </FormGroup>
                <FormGroup
                  title="First Name"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <div className="col-span-full">
                    <Text as="b">{value?.user?.first_name}</Text>
                  </div>
                </FormGroup>
                <FormGroup
                  title="Last Name"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <div className="col-span-full">
                    <Text as="b">{value?.user?.last_name}</Text>
                  </div>
                </FormGroup>
                
                <FormGroup
                  title="Designation"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <div className="col-span-full">
                    <Text as="b">{value?.user?.role}</Text>
                  </div>
                </FormGroup>
                <FormGroup
                  title="Department"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <div className="col-span-full">
                    <Text as="b">{value?.user?.department}</Text>
                  </div>
                </FormGroup>
                <FormGroup
                  title="Mobile Number"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <div className="col-span-full">
                    <Text as="b">{value?.user?.mobile}</Text>
                  </div>
                </FormGroup>
                <FormGroup
                  title="CNIC Number"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <div className="col-span-full">
                    <Text as="b">{value?.user?.cnic}</Text>
                  </div>
                </FormGroup>

                
              </div>
              
            </>
          );
        }}
      </Form>
    </>
     ) : (
      < PersonalInfoView/>
      
      )}
      </>
  );
}


interface ProfileHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function ProfileHeader({ title, description, children }: ProfileHeaderProps) {
  const { layout } = useLayout();
  const { expandedLeft } = useBerylliumSidebars();
  const { data: session } = useSession();
  const encryptedData = localStorage.getItem('uData');
  const value: any =decryptData(encryptedData)

  const base64Image = value ? `${value.user.img}` : '';
  const parts = base64Image.split(';base64,');
  const mimeType = parts[0].split(':')[1];
  const imageData = parts[1];
  const imageBuffer = imageData ? Buffer.from(imageData, 'base64') : undefined;

  return (
    <div
      className={cn(
        'relative z-0 -mx-4 px-4 pt-28 before:absolute before:start-0 before:top-0 before:h-40 before:w-full before:bg-gradient-to-r before:from-[#F8E1AF] before:to-[#F6CFCF] @3xl:pt-[190px] @3xl:before:h-[calc(100%-120px)] dark:before:from-[#bca981] dark:before:to-[#cbb4b4] md:-mx-5 md:px-5 lg:-mx-8 lg:px-8 xl:-mx-6 xl:px-6 3xl:-mx-[33px] 3xl:px-[33px] 4xl:-mx-10 4xl:px-10',
        layout === LAYOUT_OPTIONS.BERYLLIUM && expandedLeft
          ? 'before:start-5 3xl:before:start-[25px]'
          : 'xl:before:w-[calc(100%_+_10px)]'
      )}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-screen-2xl flex-wrap items-end justify-start gap-6 border-b border-dashed border-gray-300 pb-10">
        <div className="relative -top-1/3 aspect-square w-[110px] overflow-hidden rounded-full border-[6px] border-white bg-gray-100 shadow-profilePic @2xl:w-[130px] @5xl:-top-2/3 @5xl:w-[150px] dark:border-gray-50 3xl:w-[200px]">
          <Image
            src={imageBuffer ? `data:${mimeType};base64,${imageData}` : 'https://isomorphic-furyroad.s3.amazonaws.com/public/avatars-blur/avatar-01.webp'}
            alt="profile-pic"
            fill
            sizes="(max-width: 768px) 100vw"
            className="aspect-auto"
          />
        </div>
        <div>
          <Title
            as="h2"
            className="mb-2 inline-flex items-center gap-3 text-xl font-bold text-gray-900"
          >
            {title}
            <PiSealCheckFill className="h-5 w-5 text-primary md:h-6 md:w-6" />
          </Title>
          {description ? (
            <Text className="text-sm text-gray-500">{description}</Text>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
