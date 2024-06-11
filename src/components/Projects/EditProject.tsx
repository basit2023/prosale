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
import { NewProjectInfoFormSchema, NewProjectInfoFormTypes, defaultValues } from '@/utils/validators/new-project.schema';
import AvatarUpload from '@/components/ui/file-upload/avatar-project';
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

export default function EditProject({ id }: any) {
  const { data: session } = useSession();
  const [project, setProject] = useState<any>();
  const [department, setDepartment] = useState<any>([]);
  // const [startDate, setStartDate] = useState<Date>(new Date());
  const { back } = useRouter();
  const [value, setUserData] = useState<any>();

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
        const response = await apiService.get(`/project-status`);
        const userData = response.data;
        setDepartment(userData.data);
      } catch (error) {
        console.error('Error fetching department data:', error);
        toast.error('Error fetching departments data. Please try again.');
      }
      try {
        const response = await apiService.get(`/get-project/${id}`);
        const userData = response.data;
        setProject(userData);
      } catch (error) {
        console.error('Error fetching project data:', error);
        toast.error('Error fetching project data. Please try again.');
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const onSubmit: SubmitHandler<NewProjectInfoFormTypes> = async (data) => {
    try {
      const avatarImage = localStorage.getItem('img');
      console.log("the data is at the new project:", { ...data, Image: avatarImage, user: value?.user?.name });
      if (avatarImage) {
        const result = await apiService.put(`/update-project/${id}`, {
          ...data, user: value?.user?.name
        });
        toast.success(result.data.message);
        if (result.data.success) {
          localStorage.removeItem('img');
          logs({ user: value?.user?.name, desc: 'Edit Project' });
          back();
        }
      } else {
        const result = await apiService.put(`/update-project/${id}`, {
          ...data, user: value?.user?.name
        });
        toast.success(result.data.message);
        if (result.data.success) {
          logs({ user: value?.user?.name, desc: 'Edit Project' });
          back();
        }
      }
    } catch (error: any) {
      console.error('Error updating Project:', error);
      toast.error(error.response.data.message);
    }
  };

  const status_value = [
    { name: "Active", value: "N" },
    { name: "Inactive", value: "Y" }
  ];

  return (
    <Form<NewProjectInfoFormTypes>
      validationSchema={NewProjectInfoFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues,
      }}
    >
      {({ register, control, setValue, getValues, formState: { errors } }: any) => {
        return (
          <>
            <FormGroup
              title="Projects"
              description="Update Projects Details here"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
              <FormGroup
                title="Project Name"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  defaultValue={project?.user?.name}
                  placeholder="Enter Project name"
                  {...register('name')}
                  error={errors.name?.message}
                  className="col-span-full"
                />
              </FormGroup>

              <FormGroup
                title="WhatsApp Status"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="Whatsapp_Status"
                  render={({ field: { value, onChange } }) => (
                    <SelectBox
                      defaultValue={project?.user?.Whatsapp_Status ?? ''}
                      placeholder="Select Status"
                      options={status_value}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        status_value?.find((r: any) => r.value === selected)?.name ?? ''
                      }
                      // error={errors?.status_value?.message as string}
                    />
                  )}
                />
              </FormGroup>

              <FormGroup
                title="Portal Status"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="Portal_Status"
                  render={({ field: { value, onChange } }) => (
                    <SelectBox
                      defaultValue={project?.user?.Portal_Status ?? ''}
                      placeholder="Select Status"
                      options={status_value}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        status_value?.find((r: any) => r.value === selected)?.name ?? ''
                      }
                      // error={errors?.status_value?.message as string}
                    />
                  )}
                />
              </FormGroup>

              <FormGroup
                title="Location"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  {...register('Location')}
                  defaultValue={project?.user?.Location}
                  placeholder="Add Location"
                  error={errors.Location?.message}
                  className="col-span-full"
                />
              </FormGroup>

              <FormGroup
                title="Status"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="status"
                  render={({ field: { value, onChange } }) => (
                    <SelectBox
                      defaultValue={project?.user?.status ?? ''}
                      placeholder="Select Status"
                      options={department}
                      onChange={onChange}
                      value={value}
                      className="col-span-full"
                      getOptionValue={(option: any) => option.value}
                      displayValue={(selected: any) =>
                        department?.find((r: any) => r.value === selected)?.name ?? ''
                      }
                      // error={errors?.department?.message as string}
                    />
                  )}
                />
              </FormGroup>

              <FormGroup
                title="Select Photo"
                description="This will be displayed on your profile."
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <div className="flex flex-col gap-6 @container @3xl:col-span-2">
                  <AvatarUpload
                    name="Image"
                    setValue={setValue}
                    error={errors?.Image?.message as string}
                  />
                </div>
              </FormGroup>

              <FormGroup
                title="Description"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="description"
                  defaultValue={project?.user?.description}
                  render={({ field: { onChange, value } }: any) => (
                    <QuillEditor
                      value={value}
                      onChange={onChange}
                      className="@3xl:col-span-2 [&>.ql-container_.ql-editor]:min-h-[100px]"
                      labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
                    />
                  )}
                />
              </FormGroup>
            </div>
          
            <FormFooter altBtnText="Cancel" submitBtnText="Save" altBtnOnClick={() => back()} />
          </>
        );
      }}
    </Form>
  );
}
