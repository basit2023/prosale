// PersonalInfoView.js (updated to match the screenshot)

'use client';
import { logsCreate } from '@/app/shared/account-settings/logs';
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
import { businessProfileDefaultValues, BusinessProfileSchema,BusinessProfileFromType } from '@/utils/validators/business-profile.schema'; // <- update this schema to include the new fields
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

interface SelectOption {
  label: string;
  value: string;
}

export default function NewRealtorsForm() {
  const { data: session } = useSession();
  const [statusOptions, setStatusOptions] = useState<any[]>([]);
  const [company, setCompany] = useState<any>();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { back } = useRouter();
  const [value, setUserData] = useState<any>();

  // --- Local default values (align to all visible fields) ---


  // Static option sets
  const relationOptions = [
    { name: 'S/O', value: 'S/O' },
    { name: 'D/O', value: 'D/O' },
    { name: 'W/O', value: 'W/O' },
  ];
  const genderOptions = [
    { name: 'Male', value: 'Male' },
    { name: 'Female', value: 'Female' },
    { name: 'Other', value: 'Other' },
  ];
  const filerStatusOptions = [
    { name: 'Active Filer', value: 'Active Filer' },
    { name: 'Non-Filer', value: 'Non-Filer' },
  ];
  const nationalityOptions = [
    { name: 'Pakistani', value: 'Pakistani' },
    { name: 'Other', value: 'Other' },
  ];

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
        const response = await apiService.get(`/project-status`);
        const userData = response.data;
        setStatusOptions(userData.data || []);
      } catch (error) {
        console.error('Error fetching departments data:', error);
        toast.error('Error fetching statuses. Please try again.');
      }
    };

    if (session) fetchData();
  }, [session]);

  const onSubmit: SubmitHandler<BusinessProfileFromType> = async (data) => {
    setIsLoading(true);
    try {
    
     

      const res = await apiService.post(`/business-profiles`, {
        ...data,
        user: session?.user?.username,
      });

      toast.success(res.data?.message || 'Saved');
      if (res.data?.success) {
        logsCreate({ user: session?.user?.username, desc: 'Business profile updated' });
        back();
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error?.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form<BusinessProfileFromType>
      validationSchema={BusinessProfileSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues:businessProfileDefaultValues,
      }}
    >
      {({ register, control, setValue, formState: { errors } }: any) => (
        <>
          <FormGroup
            title="BUSINESS INFORMATION"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          />

          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
            {/* Row: Full Name, Relation Type, Guardian, Gender */}
            <FormGroup className="pt-7 @2xl:pt-9 @3xl:grid-cols-12">
              <Input
                label="Full Name (Required)"
                placeholder="Enter full name"
                {...register('full_name')}
                error={errors.full_name?.message}
                className="@3xl:col-span-1"
              />

              <Controller
                control={control}
                name="relation_type"
                render={({ field: { value, onChange } }) => (
                  <SelectBox
                    label="S/O, D/O, W/O"
                    placeholder="Select"
                    options={relationOptions}
                    onChange={onChange}
                    value={value}
                    style={{margineTop:"15px !important"}}
                    className="@3xl:col-span-1 pt-[-10]"
                    getOptionValue={(o: any) => o.value}
                    displayValue={(selected: string) =>
                      relationOptions.find((r) => r.value === selected)?.name ?? ''
                    }
                  />
                )}
              />

              <Input
                label="Guardian Name"
                placeholder="Enter guardian name"
                {...register('guardian_name')}
                error={errors.guardian_name?.message}
                className="@3xl:col-span-1"
              />

              <Controller
                control={control}
                name="gender"
                render={({ field: { value, onChange } }) => (
                  <SelectBox
                    label="Gender"
                    placeholder="Select"
                    options={genderOptions}
                    onChange={onChange}
                    value={value}
                    className="@3xl:col-span-1"
                    getOptionValue={(o: any) => o.value}
                    displayValue={(selected: string) =>
                      genderOptions.find((r) => r.value === selected)?.name ?? ''
                    }
                  />
                )}
              />
            </FormGroup>

            {/* Row: DOB, CNIC, Mobile, Email */}
            <FormGroup className="pt-7 @2xl:pt-9 @3xl:grid-cols-12">
              <Controller
                name="dob"
                label="Date of Birth (Required)"
                control={control}
                render={({ field: { value } }) => (
                  <DatePicker
                    placeholderText="Date of Birth (Required)"
                    selected={startDate || (value ? new Date(value) : null)}
                    onChange={(date: Date | null) => {
                      setStartDate(date);
                      setValue('dob', date ? date.toISOString().substring(0, 10) : '', {
                        shouldValidate: true,
                      });
                    }}
                    dateFormat="MM/dd/yyyy"
                    
                    popperPlacement="bottom-end"
                    className="@3xl:col-span-1"
                  />
                )}
              />

              <Input
                label="CNIC (Required)"
                placeholder="XXXXX-XXXXXXX-X"
                {...register('cnic')}
                error={errors.cnic?.message}
                className="@3xl:col-span-1"
              />

              <Input
                label="Mobile Number (Required)"
                placeholder="e.g. 0334-5822707"
                {...register('mobile')}
                error={errors.mobile?.message}
                className="@3xl:col-span-1"
              />

              <Input
                label="E-mail (Optional)"
                placeholder="mail@example.com"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                className="@3xl:col-span-1"
              />
            </FormGroup>

            {/* Row: Address, City, Nationality */}
            <FormGroup className="pt-7 @2xl:pt-9 @3xl:grid-cols-12">
              <Input
                label="Address"
                placeholder="Enter address"
                {...register('address')}
                error={errors.address?.message}
                className="@3xl:col-span-6"
              />

              <Input
                label="City"
                placeholder="Enter city"
                {...register('city')}
                error={errors.city?.message}
                className="@3xl:col-span-3"
              />

              <Controller
                control={control}
                name="nationality"
                render={({ field: { value, onChange } }) => (
                  <SelectBox
                    label="Nationality (Optional)"
                    placeholder="Select nationality"
                    options={nationalityOptions}
                    onChange={onChange}
                    value={value}
                    className="@3xl:col-span-3"
                    getOptionValue={(o: any) => o.value}
                    displayValue={(selected: string) =>
                      nationalityOptions.find((r) => r.value === selected)?.name ?? ''
                    }
                  />
                )}
              />
            </FormGroup>

            {/* Row: NTN, Filer Status, Reference, Authorized Partner, Partner CNIC */}
            <FormGroup className="pt-7 @2xl:pt-9 @3xl:grid-cols-12">
              <Input
                label="NTN Number"
                placeholder="Enter NTN Number"
                {...register('ntn')}
                error={errors.ntn?.message}
                className="@3xl:col-span-1"
              />

              <Controller
                control={control}
                name="filer_status"
                render={({ field: { value, onChange } }) => (
                  <SelectBox
                    label="Filer Status"
                    placeholder="Select Filer Status"
                    options={filerStatusOptions}
                    onChange={onChange}
                    value={value}
                    className="@3xl:col-span-1"
                    getOptionValue={(o: any) => o.value}
                    displayValue={(selected: string) =>
                      filerStatusOptions.find((r) => r.value === selected)?.name ?? ''
                    }
                  />
                )}
              />

              <Input
                label="Reference (If Any)"
                placeholder="Reference"
                {...register('reference')}
                error={errors.reference?.message}
                className="@3xl:col-span-3"
              />

              <Input
                label="Authorized Partner (If Any)"
                placeholder="Partner"
                {...register('authorized_partner')}
                error={errors.authorized_partner?.message}
                className="@3xl:col-span-2"
              />

              <Input
                label="Partner CNIC"
                placeholder="XXXXX-XXXXXXX-X"
                {...register('partner_cnic')}
                error={errors.partner_cnic?.message}
                className="@3xl:col-span-1"
              />
            </FormGroup>

            {/* REGISTERED OFFICE DETAILS */}
            <FormGroup
              title="REGISTERED OFFICE DETAILS"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <FormGroup className="pt-7 @2xl:pt-9 @3xl:grid-cols-12">
              <Input
                label="Office Name"
                placeholder="Enter office name"
                {...register('office_name')}
                error={errors.office_name?.message}
                className="@3xl:col-span-1"
              />

              <Input
                label="Office Mobile Number"
                placeholder="e.g. 0334-5822707"
                {...register('office_mobile')}
                error={errors.office_mobile?.message}
                className="@3xl:col-span-1"
              />

              <Input
                label="Office Landline Number"
                placeholder="e.g. 051-1234567"
                {...register('office_landline')}
                error={errors.office_landline?.message}
                className="@3xl:col-span-1"
              />
              <Input
                label="City"
                placeholder="Islamabad"
                {...register('office_city')}
                error={errors.office_city?.message}
                className="@3xl:col-span-1"
              />
              <Input
                label="Office Address"
                placeholder="Enter office address"
                {...register('office_address')}
                error={errors.office_address?.message}
                className="@3xl:col-span-4"
              />

              
            </FormGroup>

            <FormGroup className="pt-7 @2xl:pt-9 @3xl:grid-cols-12">
              
            </FormGroup>

            {/* BANK DETAILS */}
            <FormGroup
              title="BANK DETAILS"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <FormGroup className="pt-7 @2xl:pt-9 @3xl:grid-cols-12">
              <Input
                label="Account Title"
                placeholder="Enter account title"
                {...register('account_title')}
                error={errors.account_title?.message}
                className="@3xl:col-span-1"
              />

              <Input
                label="Account Number"
                placeholder="Enter account number"
                {...register('account_number')}
                error={errors.account_number?.message}
                className="@3xl:col-span-2"
              />

              <Input
                label="IBAN Number"
                placeholder="e.g. PK20ALFH5697005001279743"
                {...register('iban_number')}
                error={errors.iban_number?.message}
                className="@3xl:col-span-2"
              />
               <Input
                label="Branch Code"
                placeholder="e.g. 5697"
                {...register('branch_code')}
                error={errors.branch_code?.message}
                className="@3xl:col-span-2"
              />
               <Input
                label="Bank Name"
                placeholder="Alfalah"
                {...register('bank_name')}
                error={errors.bank_name?.message}
                className="@3xl:col-span-2"
              />
              <Input
                label="Branch Name"
                placeholder="Gulberg Greens Islamabad"
                {...register('branch_name')}
                error={errors.branch_name?.message}
                className="@3xl:col-span-4"
              />

              
            </FormGroup>

            {/* <FormGroup className="pt-7 @2xl:pt-9 @3xl:grid-cols-12">
             
            </FormGroup> */}

          
          </div>

          <FormFooter
            altBtnText="Cancel"
            altBtnOnClick={() => back()}
            submitBtnText="Update"
            isLoading={isLoading}
          />
        </>
      )}
    </Form>
  );
}
