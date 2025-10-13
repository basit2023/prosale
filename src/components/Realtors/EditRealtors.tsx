// PersonalInfoView.js (Edit mode: load defaults from backend and update)

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
import { useEffect, useMemo, useState } from 'react';
import apiService from '@/utils/apiService';
import {
  businessProfileDefaultValues,
  BusinessProfileSchema,
  BusinessProfileFromType, // assuming this is your exported type
} from '@/utils/validators/business-profile.schema';
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

export default function EditRealtorsForm({ id }: { id: string }) {
  const { data: session } = useSession();
  const { back } = useRouter();

  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Static options
  const relationOptions = useMemo(
    () => [
      { name: 'S/O', value: 'S/O' },
      { name: 'D/O', value: 'D/O' },
      { name: 'W/O', value: 'W/O' },
    ],
    []
  );
  const genderOptions = useMemo(
    () => [
      { name: 'Male', value: 'Male' },
      { name: 'Female', value: 'Female' },
      { name: 'Other', value: 'Other' },
    ],
    []
  );
  const filerStatusOptions = useMemo(
    () => [
      { name: 'Active Filer', value: 'Active Filer' },
      { name: 'Non-Filer', value: 'Non-Filer' },
    ],
    []
  );
  const nationalityOptions = useMemo(
    () => [
      { name: 'Pakistani', value: 'Pakistani' },
      { name: 'Other', value: 'Other' },
    ],
    []
  );

  // Load local user info (for logs)
  useEffect(() => {
    try {
      const encrypted = localStorage.getItem('uData');
      if (encrypted) setUserData(decryptData(encrypted));
    } catch (e) {
      console.error(e);
      toast.error('Error reading local user data.');
    }
  }, [session]);

  // Fetch record by ID then reset the form with values
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setInitialLoading(true);
        const res = await apiService.get(`/business-profiles/${id}`);
        const rec = res?.data?.data ?? res?.data; // support either shape

        // Normalize API → form fields (ensure every key exists)
        const normalized: BusinessProfileFromType = {
          full_name: rec?.full_name ?? '',
          relation_type: rec?.relation_type ?? 'S/O',
          guardian_name: rec?.guardian_name ?? '',
          gender: rec?.gender ?? 'Male',
          dob: rec?.dob ?? businessProfileDefaultValues.dob,
          cnic: rec?.cnic ?? '',
          mobile: rec?.mobile ?? '',
          email: rec?.email ?? '',
          address: rec?.address ?? '',
          city: rec?.city ?? '',
          nationality: rec?.nationality ?? 'Pakistani',
          ntn: rec?.ntn ?? '',
          filer_status: rec?.filer_status ?? 'Active Filer',
          reference: rec?.reference ?? '',
          authorized_partner: rec?.authorized_partner ?? '',
          partner_cnic: rec?.partner_cnic ?? '',

          office_name: rec?.office_name ?? '',
          office_mobile: rec?.office_mobile ?? '',
          office_landline: rec?.office_landline ?? '',
          office_address: rec?.office_address ?? '',
          office_city: rec?.office_city ?? '',

          account_title: rec?.account_title ?? '',
          account_number: rec?.account_number ?? '',
          iban_number: rec?.iban_number ?? '',
          branch_code: rec?.branch_code ?? '',
          branch_name: rec?.branch_name ?? '',
          bank_name: rec?.bank_name ?? '',

          company_id: rec?.company_id ? String(rec.company_id) : '',
          del: rec?.del ?? 'N',
          dt: rec?.dt ?? businessProfileDefaultValues.dt,
        };

        // Reset the form with fetched values
        // We get `reset` from the render props of <Form>
        setFormSeed(normalized);
      } catch (e: any) {
        console.error(e);
        toast.error(e?.response?.data?.message || 'Could not load profile.');
      } finally {
        if (mounted) setInitialLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // We need a small state to push values into <Form>'s reset once render props are available
  const [formSeed, setFormSeed] = useState<BusinessProfileFromType | null>(null);

  const onSubmit: SubmitHandler<BusinessProfileFromType> = async (data) => {
    setIsSaving(true);
    try {
      // PUT for update
      const res = await apiService.put(`/business-profiles/${id}`, {
        ...data,
        user: userData?.user?.name,
      });

      toast.success(res.data?.message || 'Updated successfully');
      if (res.data?.success) {
        logsCreate({ user: userData?.user?.name, desc: `Business profile #${id} updated` });
        back();
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error?.response?.data?.message || 'Failed to update. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (initialLoading) return <Spinner />;

  return (
    <Form<BusinessProfileFromType>
      validationSchema={BusinessProfileSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues: businessProfileDefaultValues, // temporary; we'll reset when formSeed arrives
      }}
    >
      {({ register, control, setValue, reset, formState: { errors } }: any) => {
        // When the fetched data (formSeed) arrives, reset once
        useEffect(() => {
          if (formSeed) {
            reset(formSeed);
          }
        }, [formSeed, reset]);

        return (
          <>
            <FormGroup title="BUSINESS INFORMATION" className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11" />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
              {/* Full Name / Relation / Guardian / Gender */}
              <FormGroup className="pt-7 @2xl:pt-9 @3xl:grid-cols-12">
                <Input
                  label="Full Name (Required)"
                  placeholder="Enter full name"
                  {...register('full_name')}
                  error={errors.full_name?.message}
                  className="@3xl:col-span-3"
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
                      className="@3xl:col-span-3"
                      getOptionValue={(o: any) => o.value}
                      displayValue={(selected: string) => relationOptions.find((r) => r.value === selected)?.name ?? ''}
                    />
                  )}
                />

                <Input
                  label="Guardian Name"
                  placeholder="Enter guardian name"
                  {...register('guardian_name')}
                  error={errors.guardian_name?.message}
                  className="@3xl:col-span-4"
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
                      className="@3xl:col-span-2"
                      getOptionValue={(o: any) => o.value}
                      displayValue={(selected: string) => genderOptions.find((r) => r.value === selected)?.name ?? ''}
                    />
                  )}
                />
              </FormGroup>

              {/* DOB / CNIC / Mobile / Email */}
              <FormGroup className="pt-7 @2xl:pt-9 @3xl:grid-cols-12">
                <Controller
                  name="dob"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      label="Date of Birth (Required)"
                      selected={value ? new Date(value) : null}
                      onChange={(date: Date | null) => {
                        const iso = date ? date.toISOString().substring(0, 10) : '';
                        onChange(iso);
                      }}
                      dateFormat="MM/dd/yyyy"
                      placeholderText="Select Date"
                      popperPlacement="bottom-end"
                      className="@3xl:col-span-3"
                    />
                  )}
                />

                <Input
                  label="CNIC (Required)"
                  placeholder="XXXXX-XXXXXXX-X"
                  {...register('cnic')}
                  error={errors.cnic?.message}
                  className="@3xl:col-span-3"
                />

                <Input
                  label="Mobile Number (Required)"
                  placeholder="e.g. 0334-5822707"
                  {...register('mobile')}
                  error={errors.mobile?.message}
                  className="@3xl:col-span-3"
                />

                <Input
                  label="E-mail (Optional)"
                  placeholder="mail@example.com"
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                  className="@3xl:col-span-3"
                />
              </FormGroup>

              {/* Address / City / Nationality */}
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
                      displayValue={(selected: string) => nationalityOptions.find((r) => r.value === selected)?.name ?? ''}
                    />
                  )}
                />
              </FormGroup>

              {/* NTN / Filer Status / Reference / Authorized Partner / Partner CNIC */}
              <FormGroup className="pt-7 @2xl:pt-9 @3xl:grid-cols-12">
                <Input
                  label="NTN Number"
                  placeholder="Enter NTN Number"
                  {...register('ntn')}
                  error={errors.ntn?.message}
                  className="@3xl:col-span-3"
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
                      className="@3xl:col-span-3"
                      getOptionValue={(o: any) => o.value}
                      displayValue={(selected: string) => filerStatusOptions.find((r) => r.value === selected)?.name ?? ''}
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
              <FormGroup title="REGISTERED OFFICE DETAILS" className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11" />
              <FormGroup className="pt-7 @2xl:pt-9 @3xl:grid-cols-12">
                <Input
                  label="Office Name"
                  placeholder="Enter office name"
                  {...register('office_name')}
                  error={errors.office_name?.message}
                  className="@3xl:col-span-4"
                />
                <Input
                  label="Office Mobile Number"
                  placeholder="e.g. 0334-5822707"
                  {...register('office_mobile')}
                  error={errors.office_mobile?.message}
                  className="@3xl:col-span-4"
                />
                <Input
                  label="Office Landline Number"
                  placeholder="e.g. 051-1234567"
                  {...register('office_landline')}
                  error={errors.office_landline?.message}
                  className="@3xl:col-span-4"
                />
              </FormGroup>

              <FormGroup className="pt-7 @2xl:pt-9 @3xl:grid-cols-12">
                <Input
                  label="Office Address"
                  placeholder="Enter office address"
                  {...register('office_address')}
                  error={errors.office_address?.message}
                  className="@3xl:col-span-9"
                />
                <Input
                  label="City"
                  placeholder="Islamabad"
                  {...register('office_city')}
                  error={errors.office_city?.message}
                  className="@3xl:col-span-3"
                />
              </FormGroup>

              {/* BANK DETAILS */}
              <FormGroup title="BANK DETAILS" className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11" />
              <FormGroup className="pt-7 @2xl:pt-9 @3xl:grid-cols-12">
                <Input
                  label="Account Title"
                  placeholder="Enter account title"
                  {...register('account_title')}
                  error={errors.account_title?.message}
                  className="@3xl:col-span-4"
                />

                <Input
                  label="Account Number"
                  placeholder="Enter account number"
                  {...register('account_number')}
                  error={errors.account_number?.message}
                  className="@3xl:col-span-4"
                />

                <Input
                  label="IBAN Number"
                  placeholder="e.g. PK20ALFH5697005001279743"
                  {...register('iban_number')}
                  error={errors.iban_number?.message}
                  className="@3xl:col-span-4"
                />
              </FormGroup>

              <FormGroup className="pt-7 @2xl:pt-9 @3xl:grid-cols-12">
                <Input
                  label="Branch Code"
                  placeholder="e.g. 5697"
                  {...register('branch_code')}
                  error={errors.branch_code?.message}
                  className="@3xl:col-span-4"
                />
                <Input
                  label="Branch Name"
                  placeholder="Gulberg Greens Islamabad"
                  {...register('branch_name')}
                  error={errors.branch_name?.message}
                  className="@3xl:col-span-4"
                />
                <Input
                  label="Bank Name"
                  placeholder="Alfalah"
                  {...register('bank_name')}
                  error={errors.bank_name?.message}
                  className="@3xl:col-span-4"
                />
              </FormGroup>
            </div>

            <FormFooter
              altBtnText="Cancel"
              altBtnOnClick={() => back()}
              submitBtnText="Update"
              isLoading={isSaving}
            />
          </>
        );
      }}
    </Form>
  );
}
