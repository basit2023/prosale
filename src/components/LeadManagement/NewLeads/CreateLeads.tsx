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
import { useCallback, useEffect, useMemo, useState } from 'react';
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

  // Memoize session data to prevent unnecessary re-renders
  const memoizedSession = useMemo(() => session, [session]);
  
  // Memoize form methods
  const formMethods = useForm<NewLeadInfoFormTypes>({
    mode: 'onChange',
    defaultValues,
  });

  const { register, control, reset, formState: { errors }, handleSubmit } = formMethods;

  // Memoize type options to prevent recreation on every render
  const typeOptions = useMemo(() => [
    { name: "Local", value: "Local" }, 
    { name: "OverSeas", value: "International" }
  ], []);

  // Fetch all data in a single optimized function
  const fetchData = useCallback(async () => {
    try {
      const [resourceResponse, userTypeResponse, teamResponse] = await Promise.all([
        apiService.get(`/allresource/?company_id=${memoizedSession?.user?.company_id}`),
        apiService.get(`/all-user-type`),
        apiService.get('/emp-team')
      ]);

      setDepartment(resourceResponse.data.data);
      setDesignation(resourceResponse.data.data1);
      setProjects(resourceResponse.data.data2);
      setUserType(userTypeResponse.data.data);
      setTeam(teamResponse.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching data. Please try again.');
    }
  }, [memoizedSession?.user?.company_id]);

  useEffect(() => {
    if (memoizedSession) {
      fetchData();
    }
  }, [memoizedSession, fetchData]);

  // Memoize the onSubmit handler to prevent recreation
  const onSubmit: SubmitHandler<NewLeadInfoFormTypes> = useCallback(async (data, event) => {
    setIsLoading(true);

    try {
      data.company_id = memoizedSession?.user?.company_id;
      data.user = memoizedSession?.user?.username;
      console.log("the data before submission:",data)
      const result = await apiService.post(`/create-new-lead`, {
        ...data,
      });

      toast.success(result.data.message);

      if (result.data.success) {
        logsCreate({ user: value?.user?.name, desc: 'New Lead' });
        event?.target?.reset();
        reset();
        push(routes.leads.management);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [memoizedSession, push, reset, value?.user?.name]);

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
                    options={typeOptions}
                    onChange={onChange}
                    value={value}
                    className="col-span-full"
                    getOptionValue={(option) => option.value}
                    displayValue={(selected) =>
                      typeOptions.find((r: any) => r.value === selected)?.name ?? ''
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
                      department?.find((r: any) => r.value === selected)?.name ?? ''
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
                      designation?.find((r: any) => r.value === selected)?.name ?? ''
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
                      projects?.find((r: any) => r.value === selected)?.name ?? ''
                    }
                    error={errors?.interested_in?.message as string}
                  />
                )}
              />
            </FormGroup>
          </div>
          <FormFooter 
            altBtnText="Cancel" 
            submitBtnText="Save" 
            altBtnOnClick={() => back()} 
            isLoading={isLoading}
          />
        </>
      )}
    </Form>
  );
}