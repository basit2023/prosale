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
import { NewFloorFormSchema,NewFloorFormTypes,defaultValues } from '@/utils/validators/new-floor.schema';
import { useRouter } from 'next/navigation';
import { decryptData } from '@/components/encriptdycriptdata';
import { PiPlusBold } from 'react-icons/pi';
import { Modal, Button, Text, ActionIcon } from "rizzui";
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


export default function AddDuplicateProjectfloor({id, slug}:any) {
  const { data: session } = useSession();
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [company, setCompany] = useState<any>();
  const [isLoading, setIsLoading] = useState(false); 
  const [floors, setFloors] = useState<any[]>([]);
  const { back } = useRouter();
  const [value, setUserData]=useState<any>();
  const [modalState, setModalState] = useState(false);
  const [floorName, setFloorName] = useState('');
  const [isadd, setIsadd]=useState(false)
 console.log("the id and the slug is:",id, slug)
  const closeModal = () => {
    setModalState(false);
  };
  const openModal = () => {
    setModalState(true);
  };
 
  const handlesubmit = async () => {
    if (floorName.trim()) {
    
      try {
        
      const data={floor_name:floorName,company_id: value?.user?.company_id,slug:slug}
        const response = await apiService.post(`/new-floor`,data);
        if (response.data.success) {
            setIsadd(true)
          closeModal();
        } else {
      
          toast.error('Failed to save the floor');
        }
      } catch (error:any) {
        toast.error('Error submitting floor:', error);
      }
    } else {
      // Handle empty input case, e.g., show validation error
      toast.error('Floor name is required');
    }
  };
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
        const response = await apiService.get(`/projects/?company_id=${value.user.company_id}`);
        const floors = await apiService.get(`/all-floors`);
        setFloors(floors.data.floors)
        
     
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session,isadd,id, slug,value?.user]);

  const onSubmit: SubmitHandler<NewFloorFormTypes> = async (data) => {
    setIsLoading(true); 
    console.log("the newfloor data is:",data)
    try {
     
      if(company?.user_data?.number<=1){
        data.company_id=company?.user_data?.company_id;
     }
     
        const result = await apiService.post(`/create-duplicate-floor`, {
          ...data,user: value?.user?.name, slug:slug, floor_id:id
        });
        console.log("the result duplicating floor:",result)
        toast.success(result.data.message);
        if (result.data.success) {
          logsCreate({ user: value?.user?.name, desc: 'Add new project' });
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
    <Form<NewFloorFormTypes>
      // validationSchema={NewFloorFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues,
      }}
    >
      {({ register, control, setValue, getValues, formState: { errors } }:any) => {
         const formattedTitle = slug.replace(/_/g, ' ');
        return (
          <>
            <FormGroup
              title="Projects"
              description="Add Projects here"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
            <FormGroup
                title="Coping to"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                   defaultValue={formattedTitle}
               
                  {...register('name')}
                  error={errors.name?.message}
                  className="col-span-full"
                  disabled
                />
              </FormGroup>
              <FormGroup
              title="Floor Name"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <div className="flex items-center">
                <Controller
                  control={control}
                  name="floor_name"
                  
                  render={({ field: { value, onChange } }) => (
                    <SelectBox
                      placeholder="Select Floor"
                      options={floors}
                      onChange={onChange}
                      value={value}
                      className="col-span-full w-full"
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        floors?.find((r: any) => r.value === selected)?.name ?? ''
                      }
                    />
                  )}
                />
                <PiPlusBold className="ms-2 h-4 w-4 cursor-pointer" onClick={openModal} />
              </div>
            </FormGroup>

              
              
              
              <FormGroup
                title="Status"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  {...register('status')}
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
                    render={({ field }) => (
                      <DatePicker
                        // className="h-6 w-6 text-gray-500"
                        selected={startDate}
                        onChange={(date: Date) => {
                          setStartDate(date);
                          setValue('date', date.toISOString().substring(0, 10));
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
              <Modal isOpen={modalState} onClose={closeModal}>
              <div className="m-auto px-7 pt-6 pb-8">
                <div className="mb-7 flex items-center justify-between">
                  
                  <Text as="strong">Add New Floor</Text>
                  
                  <ActionIcon
                    size="sm"
                    variant="text"
                    className="text-xl font-bold"
                    onClick={closeModal}
                  >
                    X
                  </ActionIcon>
                </div>

                <Input
                  label="Floor Name"
                  inputClassName="border-2"
                  size="lg"
                  value={floorName}
                  onChange={(e) => setFloorName(e.target.value)}
                />

                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    size="lg"
                    className="mr-3"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    onClick={handlesubmit}
                  >
                    Save Floor
                  </Button>
                </div>
              </div>
            </Modal>
            
              
             
            </div>
            <FormFooter altBtnText="Cancel" altBtnOnClick={() => back()} submitBtnText="Save Floor" isLoading={isLoading}/>
          </>
        );
      }}
    </Form>
  );
}



// interface SelectOption {
//     label: string;
//     value: string;
//   }
  
// function AddButton() {
//   const [isLoading, setIsLoading]=useState(false)
  
//     const onSubmit: SubmitHandler<NewProjectInfoFormTypes> = async (data) => {
//       setIsLoading(true); 
//       try {
        
        
//       }catch (error: any) {
//         console.error('Error updating profile:', error);
//         toast.error(error.response.data.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };
  
  
  
   
  
//     return (
//       <Form<NewProjectInfoFormTypes>
//         validationSchema={NewProjectInfoFormSchema}
//         onSubmit={onSubmit}
//         className="@container"
//         useFormProps={{
//           mode: 'onChange',
//           defaultValues,
//         }}
//       >
//         {({ register, control, setValue, getValues, formState: { errors } }: any) => {
//           return (
//             <>
              
//           <Modal isOpen={modalState} onClose={() => setModalState(false)}>
//             <div className="m-auto px-7 pt-6 pb-8">
//               <div className="mb-7 flex items-center justify-between">
//                 <Text as="h3">Add New Floor? </Text>
//                 <ActionIcon
//                   size="sm"
//                   variant="text"
//                   className="text-xl font-bold"
//                   onClick={() => setModalState(false)}
//                 >
//                X
//                 </ActionIcon>
//               </div>
              
//               <Input label="Status" inputClassName="border-2" size="lg" />
//               <Input label="Remarks / Note" inputClassName="border-2" size="lg" />
//               <Button
//                 type="submit"
//                 size="lg"
//                 className="col-span-2 mt-2 mr-3"
//                 onClick={() => setModalState(false)}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 size="lg"
//                 className="col-span-2 mt-2 ml-3"
//                 onClick={() => setModalState(false)}
//               >
//                 Confirm Changes
//               </Button>
//             </div>
//           </Modal>
        
//             </>
//           )
//         }}
//       </Form>
//     );
//   }
  