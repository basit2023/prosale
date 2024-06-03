// PersonalInfoView.js

'use client';
import { logs,logsCreate } from '../account-settings/logs';
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
import ProfileSettingsView from './../account-settings/personal-info';
import { Password } from '@/components/ui/password';                                            
import { NewEmployeeInfoFormSchema,NewEmployeeInfoFormTypes,defaultValues } from '@/utils/validators/new-employee-schema';
import AvatarUpload from '@/components/ui/file-upload/avatar-upload';
import { Avatar } from '@/components/ui/avatar';
const crypto = require('crypto');
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



interface SelectOption {
  label: string;
  value: string;
}

export default function CreateNewEmployee() {
  const { data: session } = useSession();

  const [department, setDepartment] = useState<any>([]);
  const [designation, setDesignation] = useState<any>([]);
  const [userType, setUserType] = useState<any>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [team, setTeam] = useState<any>();
  const [company, setCompany] = useState<any>();
  const encryptedData = localStorage.getItem('uData');
  const value: any =decryptData(encryptedData)
  useEffect(() => {
    const fetchData = async () => {
      
      try {
        const response = await apiService.get(`/supper-admin/${session?.user?.email}`);
        const userData = response.data;
        setCompany(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
      try {
        const response = await apiService.get(`/alldeprtment`);
        const userData = response.data;
        setDepartment(userData.data);
      } catch (error) {
        console.error('Error fetching department data:', error);
        toast.error('Error fetching deparments data. Please try again.');
      }
      try {
        const response = await apiService.get(`/alldesignation`);
        
        const userData = response.data;
        setDesignation(userData.data);
      } catch (error) {
        console.error('Error fetching degignation data:', error);
        toast.error('Error fetching designation data. Please try again.');
      }
      try {
        const response = await apiService.get(`/all-user-type`);
        
        const userData = response.data;
        setUserType(userData.data);
      } catch (error) {
        console.error('Error fetching degignation data:', error);
        toast.error('Error fetching designation data. Please try again.');
      }
      try {
        const result = await apiService.get('/emp-team');
        
        setTeam(result.data.data);
      } catch (error) {
        console.error('Error fetching days data:', error);
        toast.error('Error fetching days data. Please try again.');
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const onSubmit: SubmitHandler<NewEmployeeInfoFormTypes> = async (data) => {
    
    
    const {password}=data
    const currentP= crypto.createHash('sha256').update(password).digest('hex');
    data.password=currentP;
    try {
      const avatarImage = localStorage.getItem('img1');
      if(company?.user_data?.number<=1){
         data.company_id=company?.user_data?.company_id;
      }
      if (avatarImage) {
        
    const result= await apiService.post(`/create-new-user`, {
                                    ...data,
                                     // Add the avatar property to the data object
                                    })
        toast.success(result.data.message);

        localStorage.removeItem('img1');
        if(result.data.success){
          // < ProfileSettingsView />
          logsCreate({ user: value?.user?.name, desc: 'New User' });
          // setIsEditing(true)
        }
        
      } else {
        // Handle the case where avatarImage is not present
       const result= await apiService.post(`/create-new-user`, {
            ...data})
        toast.success(result.data.message);
        if(result.data.success){
          logsCreate({ user: value?.user?.name, desc: 'New user' });
        }

      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile. Please try again.');
    }
  };
  const handleEditProfileClick = () => {
    // Toggle the state when the button is clicked
    setIsEditing((prev) => !prev);
  }
  

//##################################### imag ######################
const base64Image = value ? `${value.user.img}` : '';
      // console.log('Base64 Image Data:', base64Image);

      const parts = base64Image.split(';base64,');
      const mimeType = parts[0].split(':')[1];
      const imageData = parts[1];
      // console.log("mimetype, imgdata:-->",mimeType +' by spacy '+ imageData)

      const imageBuffer = imageData ? Buffer.from(imageData, 'base64') : undefined;
      console.log("the company data is:--->",company?.user_data?.number)
 return isEditing ? (
    <ProfileSettingsView />
  ) : (
    <Form<NewEmployeeInfoFormTypes>
      validationSchema={NewEmployeeInfoFormSchema}
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
              title="Employee Info"
              description="Add Employee details here"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
              
            <FormGroup
                title="User Name"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                // defaultValue={value?.user?.name}
                  placeholder="example123"
                  {...register('name')}
                  error={errors.cnic?.message}
                  className="flex-grow"
                />
              </FormGroup>
              
              
              <FormGroup
                title="Full Name"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                
              >
                
                 <Input

                  {...register('first_name')}
                  // defaultValue={first}
                  placeholder="First Name"
                  error={errors.first_name?.message}
                  className="flex-grow"
                />
                
                <Input
                  
                  {...register('last_name')}
                  // defaultValue={last}
                  placeholder="Last Name"
                  error={errors.last_name?.message}
                  className="flex-grow"
                />
              </FormGroup>
              <FormGroup
                title="Password"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Password
                  // label="Password"
                  placeholder="Enter your password"
                  size="lg"
                  className="hover:border-black focus:border-black focus:ring-black"
                  color="info"
                  inputClassName="text-sm focus:ring-black focus:border-black hover:border-black [&.is-focus]:border-black [&.is-focus]:ring-black"
                  {...register('password')}
                  error={errors.password?.message}
                />
              </FormGroup>

              <FormGroup
                title="Email Address"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <div className="col-span-full flex items-center p-2 rounded-md">
                 <Input
                  type="email"
                  prefix={<PiEnvelopeSimple className="w-5" />}
                  {...register('email')}
                  // defaultValue={session?.user?.email}
                  placeholder="example@gmail.com"  
                  error={errors?.email?.message}
                  className="flex-grow"
                />  
                </div>
              </FormGroup>
              <FormGroup
                title="User Type"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="user_type"
                  render={({ field: { value, onChange } }) => (
                    <SelectBox
                    // defaultValue={value?.user?.gender}
                      placeholder="admin"//{gender1? gender1: "Select Gender"}
                      options={userType}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        userType?.find((r:any) => r.value === selected)?.name ?? ''
                      }
                      // error={errors?.userType?.message as string}
                    />
                  )}
                />
              </FormGroup>

              <FormGroup
                title="Mobile Number"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  // defaultValue={value?.user?.mobile}
                  placeholder="03XXXXXXXXX"
                  {...register('mobile')}
                  error={errors.mobile?.message}
                  className="flex-grow"
                />
                <Controller
                  control={control}
                  name="isp"
                  render={({ field: { value, onChange } }:any) => (
                    <SelectBox
                      // value={value?.user?.isp}
                      // defaultValue={`${value?.user?.isp}`}
                      placeholder="SIM Provider"//{sim1 ? sim1 : "SIM Provider"}
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
                // defaultValue={value?.user?.cnic}
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
                    // error={errors?.image?.message as string}
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
                    // defaultValue={value?.user?.gender}
                      placeholder="Select Gender"//{gender1? gender1: "Select Gender"}
                      options={roles}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        roles?.find((r:any) => r.value === selected)?.name ?? ''
                      }
                      // error={errors?.role?.message as string}
                    />
                  )}
                />
              </FormGroup>
              <FormGroup
                title="Designation"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="designation"
                  render={({ field: { value, onChange } }) => (
                    <SelectBox
                    // defaultValue={value?.user?.gender}
                      placeholder= "Manager Sales" //{gender1? gender1: "Select Gender"}
                      options={designation}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        designation?.find((r:any) => r.value === selected)?.name ?? ''
                      }
                      error={errors?.designation?.message as string}
                    />
                  )}
                />
              </FormGroup>
              <FormGroup
                title="Department"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="department"
                  render={({ field: { value, onChange } }) => (
                    <SelectBox
                    // defaultValue={value?.user?.gender}
                      placeholder= "Sales" //{gender1? gender1: "Select Gender"}
                      options={department}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        department?.find((r:any) => r.value === selected)?.name ?? ''
                      }
                      error={errors?.department?.message as string}
                    />
                  )}
                />
              </FormGroup>
              <FormGroup
                title="Assigned Team"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="assigned_team"
                  render={({ field: { value, onChange } }) => {
                    // Find the option that matches the current value to set as the SelectBox value
                    const selectedOption = team?.find((item:any) => String(item.value) === value);

                    return (
                      <SelectBox
                       
                        value={selectedOption ? { label: selectedOption.name, value: String(selectedOption.value) } : null} 
                        placeholder="Select Team"
                   
                        options={team?.map((item:any) => ({ label: item.name, value: String(item.value) }))}
                        // Update the form value on change
                        onChange={(selectedOption: SelectOption | null) => {
                          onChange(selectedOption ? selectedOption.value : '');
                        }}
                        className="col-span-full"
                       
                        error={errors?.assigned_team?.message} // Ensure this matches the name used in `Controller`
                      />
                    );
                  }}
                />
              </FormGroup>
              {company?.user_data?.number>1 && <FormGroup
                title="Assign Company"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="company_id"
                  render={({ field: { value, onChange } }) => {
                    // Find the option that matches the current value to set as the SelectBox value
                    const selectedOption = company?.company_data?.find((item:any) => String(item.value) === value);

                    return (
                      <SelectBox
                       
                        value={selectedOption ? { label: selectedOption.name, value: String(selectedOption.value) } : null} 
                        placeholder="Select Company"
                        options={company?.company_data?.map((item:any) => ({ label: item.name, value: String(item.value) }))}
                        // Update the form value on change
                        onChange={(selectedOption: SelectOption | null) => {
                          onChange(selectedOption ? selectedOption.value : '');
                        }}
                        className="col-span-full"
                       
                        error={errors?.company_id?.message} // Ensure this matches the name used in `Controller`
                      />
                    );
                  }}
                />
              </FormGroup>}
             
            </div>
            <FormFooter altBtnText="Cancel" submitBtnText="Save" />
          </>
        );
      }}
    </Form>
  );
}
