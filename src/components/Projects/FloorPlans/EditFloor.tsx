// PersonalInfoView.js

'use client';
import { logs, logsCreate } from '@/app/shared/account-settings/logs'; 
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { DatePicker } from '@/components/ui/datepicker';
import { useSession } from 'next-auth/react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';       
                  
import { EditFloorFormSchema,EditFloorFormTypes,defaultValues } from '@/utils/validators/edit-floor.schema';
import { useRouter } from 'next/navigation';
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


export default function EditFloor({id, slug}:any) {
  const { data: session } = useSession();
  const [department, setDepartment] = useState<any>([]);
  const [floors, setFloors] = useState<any[]>([]); 
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [company, setCompany] = useState<any>();
  const [isLoading, setIsLoading] = useState(false); 
  const { back } = useRouter();
  const [value, setUserData]=useState<any>();

  const formattedTitle = slug.replace(/_/g, ' ');
 
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
      try {
        const floorsResponse = await apiService.get(`/all-floors`);
     
        setFloors(Array.isArray(floorsResponse.data.floors) ? floorsResponse.data.floors : []);
      } catch (error) {
        console.error('Error fetching project data:', error);
        setFloors([]);
      }
    };
  
    fetchUserData();
  }, [session]);
  

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
        const response = await apiService.get(`/floorName?id=${id}&&slug=${slug}`);
        const userData = response.data;
        setDepartment(userData.data);
      } catch (error) {
        console.error('Error fetching department data:', error);
        toast.error('Error fetching deparments data. Please try again.');
      }
     
    };
    

    if (session) {
      fetchData();
    }
  }, [session]);

  const onSubmit: SubmitHandler<EditFloorFormTypes> = async (data) => {
    setIsLoading(true); 
    try {
      console.log("the edit floor data is:",data)
      if(company?.user_data?.number<=1){
        data.company_id=company?.user_data?.company_id;
     }
     
        const result = await apiService.put(`/update-project-floor`, {
          ...data,user: value?.user?.name, id:id, floor_slug:slug
        });
        toast.success(result.data.message);
        if (result.data.success) {
          logs({ user: value?.user?.name, desc: 'Updated floor' });
          back()
        } 
      
    } catch (error:any) {
      console.error('Error updating profile:', error);
      toast.error(error.response.data.message);
    }finally {
      setIsLoading(false);
    }
  };
  
 

  const status_value = [
    { name: "Active", value: "N" },
    { name: "Inactive", value: "Y" }
  ];
  


    
 return  (
    <Form<EditFloorFormTypes>
      // validationSchema={EditFloorFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues,
      }}
    >
      {({ register, control, setValue, getValues, formState: { errors } }:any) => {
        return (
          <>
            <FormGroup
              title="Projects"
              description="Add Projects here"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
              
            <FormGroup
                title="Project Name"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                defaultValue={formattedTitle}
                
               
                
                  className="col-span-full"
                  disabled
                />
              </FormGroup>
           
              <FormGroup
                title="Select Floor"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="floor_id"
                  render={({ field: { value, onChange } }:any) => (
                    <SelectBox
                      placeholder={department ? department : "Select Floor"}
                      options={floors}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option:any) => option.value}
                      displayValue={(selected:any) =>
                        floors?.find((r:any) => r.value === selected)?.name ?? ''
                      }
                      // error={errors?.department?.message as string}
                    />
                  )}
                />
              </FormGroup>
              <FormGroup
                title="Status"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="status"
                  render={({ field: { value, onChange } }:any) => (
                    <SelectBox
                   
                      placeholder="Select Status"
                      options={status_value}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option:any) => option.value}
                      displayValue={(selected:any) =>
                        status_value?.find((r:any) => r.value === selected)?.name ?? ''
                      }
                      // error={errors?.department?.message as string}
                    />
                  )}
                />
              </FormGroup>

              <FormGroup
                title="Date"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                    name="date"
                    control={control}
                    rules={{ required: 'Date of Birth is required' }}
                    render={({ field }) => (
                      <DatePicker
                        // className="h-6 w-6 text-gray-500"
                        selected={startDate}
                        onChange={(date: Date) => {
                          setStartDate(date);
                          setValue('date', date.toISOString().substring(0, 10), { shouldValidate: true });
                        }}
                        dateFormat="MM/dd/yyyy" // Adjust the format to match "09/21/1996"
                        placeholderText="Select Date"
                        popperPlacement="bottom-end"
                        // @ts-ignore
                        value={startDate}
                        className="form-control border-none" // Use Bootstrap utility classes
                        style={{ height: 'auto' }}
                      />
                    )}
                  />
              </FormGroup>

              <FormGroup
                title="Description"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, value } }) => (
                    <QuillEditor
                      value={value}
                      onChange={onChange}
                      className="@3xl:col-span-2 [&>.ql-container_.ql-editor]:min-h-[100px]"
                      labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
                    />
                  )}
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
            <FormFooter altBtnText="Cancel" altBtnOnClick={() => back()} submitBtnText="Save Floor" isLoading={isLoading}/>
          </>
        );
      }}
    </Form>
  );
}
