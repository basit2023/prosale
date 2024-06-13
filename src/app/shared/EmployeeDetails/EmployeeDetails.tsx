// 'use client';
'use client';

import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FaXTwitter } from "react-icons/fa6";
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
import { DatePicker } from '@/components/ui/datepicker';
import { PiBuildingsThin,PiLinkedinLogoBold,PiFacebookLogoBold,PiHouseLineThin  } from "react-icons/pi";
import { FaFacebook,FaFacebookF, FaWhatsapp, FaInstagram, FaTwitter, FaLinkedin,FaHome,  } from 'react-icons/fa';
import { logs, logsCreate} from '../account-settings/logs';
import { defaultValues,PersonalInfoFormTypes,personalInfoFormSchema } from '@/utils/validators/my-details.schema';
import { useRouter } from 'next/navigation';
interface EmployeeDetailsProps {
  id: any;
}

interface User {
  user_id: string;
  address: string;
  city: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
}

interface UserValue {
  user: {
    id: string;
    name: string;
  };
}


export default function EmployeeDetails({id}:any) {
  const { data: session } = useSession();
  const [value, setValue1] = useState<any>();
  const [userValue, setUserValue] = useState<any>();
  const [isEditing, setIsEditing] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false); 
  // const [startDate, setStartDate] = useState(new Date());
  const { back } = useRouter();
  
// for the user_details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.get(`/get-employee-details/${id}`);
        const userData = response.data.results[0]
      
        // console.log("user details is::", userData);
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


  //useEffect for the user
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiService.get(`/emp-personalinfo/${id}}`);
        const userData = response.data;
        setUserValue(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);
// console.log("the user data is:--->",userValue)
const onSubmit: SubmitHandler<PersonalInfoFormTypes> = async (data) => {
  // console.log("onSubmit function is called with data:", data);
  setIsLoading(true); 
  try {
    // console.log("created data user_id is:", value?.user_id);

    // Format the date to match "MM/dd/yyyy"
    const formattedDate = format(startDate, 'MM/dd/yyyy');

    if (value?.user_id) {
          const result = await apiService.put(`/update-employye-details/${id}`, {
            ...data,
            dob: formattedDate, // Update the date field with the formatted date
          });
          toast.success(result.data.message);
          // console.log("the success message is:", result.data.success);
          if (result.data.success) {
            logs({ user: userValue?.user?.name, desc: 'Employee details' });
            setIsEditing(true);
          }
    } else {
          const result = await apiService.post(`/create-employee-details`, {
            ...data,
            dob: formattedDate, // Update the date field with the formatted date
            user_id: userValue?.user?.id,
            user: userValue?.user?.name,
          });

          toast.success(result.data.message);
          // console.log("the success message is:", result.data.success);
          if (result.data.success) {
            logsCreate({ user: userValue?.user?.name, desc: 'Employee details' });
            setIsEditing(true);
          }
        }
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error('Error updating profile. Please try again.');
  }
  finally {
    setIsLoading(false);
  }
};
  const handleEditProfileClick = () => {
    // Toggle the state when the button is clicked
    setIsEditing((prev) => !prev);
  }
  const address = value?.address;
  const city = value?.city;
  
 return (
    <Form<PersonalInfoFormTypes>
      validationSchema={personalInfoFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues,
      }}
     
    >
      {({ register, control, setValue, getValues, formState: { errors } }) => {
        return (
          <>
            <FormGroup
              title="Personal Details"
              description="Update your personal details here"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              // style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
            />
            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
             
              <FormGroup
                  title="Address"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                //   description="Enter an alternative email if you’d like to be contacted via a different email."
                >
                  <Input
                    prefix={
                      <PiHouseLineThin  className="h-6 w-6 text-gray-500" />
                    }
                    defaultValue={value?.address}
                    className="col-span-full"
                    placeholder="Your home address"
                    {...register('address')}
                    // error={errors.address?.message}
                  />
                </FormGroup>
                <FormGroup
                  title="City"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                //   description="Enter an alternative email if you’d like to be contacted via a different email."
                >
                  <Input
                    prefix={
                      <PiBuildingsThin  className="h-6 w-6 text-gray-500" />
                    }
 
                    className="col-span-full"
                    defaultValue={value?.city}
                    placeholder="Your City Name"
                    {...register('city')}
                    // error={errors.city?.message}
                  />
                </FormGroup>
                
                <FormGroup
                  title="Date of Birth"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  
                  <Controller
                    name="dob"
                    control={control}
                    rules={{ required: 'Date of Birth is required' }}
                    render={({ field }) => (
                      <DatePicker
                        className="w-full text-gray-500 form-control"
                        selected={startDate}
                        onChange={(date: Date) => {
                          setStartDate(date);
                          setValue('dob', date.toISOString().substring(0, 10), { shouldValidate: true });
                        }}
                        dateFormat="MM/dd/yyyy" // Adjust the format to match "09/21/1996"
                        placeholderText="Select Date"
                        popperPlacement="bottom-end"
                        // @ts-ignore
                        value={startDate}
                        style={{ height: 'auto' }}
                      />
                    )}
                  />
                </FormGroup>



              
              <FormGroup
                  title="WhatsApp Number"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                //   description="Enter an alternative email if you’d like to be contacted via a different email."
                >
                  <Input
                    prefix={
                      <FaWhatsapp className="h-6 w-6 text-gray-500" />
                    }
                    defaultValue={value?.whatsapp}
                    className="col-span-full"
                    placeholder="03XXXXXXXXX"
                    {...register('whatsapp')}
                    // error={errors.facebook?.message}
                  />
                </FormGroup>
              <FormGroup
                  title="Facebook"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                //   description="Enter an alternative email if you’d like to be contacted via a different email."
                >
                  <Input
                    prefix={
                      <PiFacebookLogoBold className="h-6 w-6 text-gray-500" />
                    }
                    defaultValue={value?.facebook}
                    className="col-span-full"
                    placeholder="www.facebook.com"
                    {...register('facebook')}
                    // error={errors.facebook?.message}
                  />
                </FormGroup>
                <FormGroup
                  title="Instagram"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                //   description="Enter an alternative email if you’d like to be contacted via a different email."
                >
                  <Input
                    prefix={
                      <FaInstagram className="h-6 w-6 text-gray-500" />
                    }
                    
                    className="col-span-full"
                    defaultValue={value?.instagram}
                    placeholder="www.instagram.com"
                    {...register('instagram')}
                    // error={errors.instagram?.message}
                  />
                </FormGroup>
                <FormGroup
                  title="Twitter"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                //   description="Enter an alternative email if you’d like to be contacted via a different email."
                >
                  <Input
                    prefix={
                      <FaXTwitter className="h-6 w-6 text-gray-500" />
                    }
                    
                    className="col-span-full"
                    defaultValue={value?.twitter}
                    placeholder="www.twitter.com"
                    {...register('twitter')}
                    // error={errors.twitter?.message}
                  />
                </FormGroup>
                <FormGroup
                  title="LinkedIn"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                //   description="Enter an alternative email if you’d like to be contacted via a different email."
                >
                  <Input
                    prefix={
                      <PiLinkedinLogoBold  className="h-6 w-6 text-gray-500" />
                    }
                    
                    className="col-span-full"
                    defaultValue={value?.linkedin}
                    placeholder="www.linkedin.com"
                    {...register('linkedin')}
                    // error={errors.linkedin?.message}
                  />
                </FormGroup>
                
              
            </div>
            <FormFooter altBtnText="Cancel" submitBtnText="Update Personal Info" altBtnOnClick={() => back()} isLoading={isLoading}/>
          </>
        );
      }}
    </Form>
  );
}