'use client';
import { logsCreate } from '@/app/shared/account-settings/logs';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { routes } from '@/config/routes';
import { useSession } from 'next-auth/react';
import { SubmitHandler, Controller, useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';
import { NewLeadInfoFormSchema, NewLeadInfoFormTypes, defaultValues } from '@/utils/validators/new-lead-schema';
import { decryptData } from '@/components/encriptdycriptdata';
import { useRouter } from 'next/navigation';

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
  const { back, push } = useRouter();
  const [department, setDepartment] = useState<any>([]);
  const [designation, setDesignation] = useState<any>([]);
  const [userType, setUserType] = useState<any>([]);
  const [value, setUserData] = useState<any>();
  const [team, setTeam] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [company, setCompany] = useState<any>();
  const [projects, setProjects] = useState<any[]>([]);


  const {
    register,
    control,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm<NewLeadInfoFormTypes>({
    mode: 'onChange',
    defaultValues,
  });

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
        const response = await apiService.get(`/allresource`);
        const userData = response.data;
        setDepartment(userData.data);
        setDesignation(userData.data1);
      } catch (error) {
        console.error('Error fetching Resource and inventory type data:', error);
        toast.error('Error fetching Resource and inventory type data. Please try again.');
      }

      try {
        const response = await apiService.get(`/all-user-type`);
        const userData = response.data;
        setUserType(userData.data);
      } catch (error) {
        console.error('Error fetching designation data:', error);
        toast.error('Error fetching designation data. Please try again.');
      }

      try {
        const result = await apiService.get('/emp-team');
        setTeam(result.data.data);
      } catch (error) {
        console.error('Error fetching team data:', error);
        toast.error('Error fetching team data. Please try again.');
      }

      try {
        const response = await apiService.get(`/projects/?company_id=${value?.user?.company_id}`);
        setProjects(response.data.data);
      } catch (error) {
        console.error('Error fetching project data:', error);
        toast.error('Error fetching project data. Please try again.');
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const type = [{ name: "Local", value: "Local" }, { name: "OverSeas", value: "International" }];

  const onSubmit: SubmitHandler<NewLeadInfoFormTypes> = async (data, event) => {

    setIsLoading(true);

    try {
      if (company?.user_data?.number <= 1) {
        data.company_id = company?.user_data?.company_id;
        data.user = value?.user?.name;
      }

      const result = await apiService.post(`/create-new-lead`, {
        ...data,
      });

      toast.success(result.data.message);

      if (result.data.success) {
        logsCreate({ user: value?.user?.name, desc: 'New User' });

        event?.target?.reset();
        reset(); // Reset the form fields
        push(routes.leads.management)
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Form<NewLeadInfoFormTypes>
      validationSchema={NewLeadInfoFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues,
      }}
    >
      {({ register, control, setValue, getValues, formState: { errors }, handleSubmit }) => (
        <>
          <FormGroup
            title="Employee Info"
            description="Add Employee details here"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          />

          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
            <FormGroup
              title="Full Name"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Input
                placeholder="ABC XYZ"
                {...register('full_name')}
                error={errors.full_name?.message}
                className="col-span-full"
              />
            </FormGroup>

            <FormGroup
              title="Mobile Number"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Input
                placeholder="03XXXXXXXXX"
                {...register('mobile')}
                error={errors.mobile?.message}
                className="col-span-full"
                required
              />
            </FormGroup>

            <FormGroup
              title="E-mail (Optional)"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Input
                placeholder="example@gamil.com"
                {...register('email')}
                error={errors?.email?.message}
                className="col-span-full"
              />
            </FormGroup>

            <FormGroup
              title="Budget (Optional)"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Input
                placeholder="Budget"
                {...register('investment_budget')}
                error={errors?.investment_budget?.message}
                className="col-span-full"
              />
            </FormGroup>

            <FormGroup
              title="Lead Type"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Controller
                control={control}
                name="type"
                render={({ field: { value, onChange } }) => (
                  <SelectBox
                    placeholder="Lead Type"
                    options={type}
                    onChange={onChange}
                    value={value}
                    className="col-span-full"
                    getOptionValue={(option) => option.value}
                    displayValue={(selected) =>
                      type?.find((r:any) => r.value === selected)?.name ?? ''
                    }
                    error={errors?.type?.message as string}
                  />
                )}
              />
            </FormGroup>

            <FormGroup
              title="Lead Source"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Controller
                control={control}
                name="source"
                render={({ field: { value, onChange } }) => (
                  <SelectBox
                    placeholder="Select Source"
                    options={department}
                    onChange={onChange}
                    value={value}
                    className="col-span-full"
                    getOptionValue={(option) => option.value}
                    displayValue={(selected) =>
                      department?.find((r:any) => r.value === selected)?.name ?? ''
                    }
                    error={errors?.source?.message as string}
                  />
                )}
              />
            </FormGroup>

            <FormGroup
              title="Interested In"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Controller
                control={control}
                name="interested_in"
                render={({ field: { value, onChange } }) => (
                  <SelectBox
                    placeholder="Shop"
                    options={designation}
                    onChange={onChange}
                    value={value}
                    className="col-span-full"
                    getOptionValue={(option) => option.value}
                    displayValue={(selected) =>
                      designation?.find((r:any) => r.value === selected)?.name ?? ''
                    }
                    error={errors?.interested_in?.message as string}
                  />
                )}
              />
            </FormGroup>

            <FormGroup
              title="Projects"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Controller
                control={control}
                name="project"
                render={({ field: { value, onChange } }) => (
                  <SelectBox
                    placeholder="Projects"
                    options={projects}
                    onChange={onChange}
                    value={value}
                    className="col-span-full"
                    getOptionValue={(option) => option.value}
                    displayValue={(selected) =>
                      projects?.find((r:any) => r.value === selected)?.name ?? ''
                    }
                    error={errors?.interested_in?.message as string}
                  />
                )}
              />
            </FormGroup>

            {company?.user_data?.number > 1 && (
              <FormGroup
                title="Assign Company"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Controller
                  control={control}
                  name="company_id"
                  render={({ field: { value, onChange } }) => {
                    const selectedOption = company?.company_data?.find((item:any) => String(item.value) === value);

                    return (
                      <SelectBox
                        value={selectedOption ? { label: selectedOption.name, value: String(selectedOption.value) } : null}
                        placeholder="Select Company"
                        options={company?.company_data?.map((item:any) => ({ label: item.name, value: String(item.value) }))}
                        onChange={(selectedOption: SelectOption | null) => {
                          onChange(selectedOption ? selectedOption.value : '');
                        }}
                        className="col-span-full"
                        error={errors?.company_id?.message}
                      />
                    );
                  }}
                />
              </FormGroup>
            )}

          </div>
          <FormFooter altBtnText="Cancel" submitBtnText="Save" altBtnOnClick={() => back()} isLoading={isLoading}/>
        </>
      )}
    </Form>
  );
}
