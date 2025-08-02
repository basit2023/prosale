import { z } from 'zod';

export const BookingFormSchema = z.object({
  registration_number: z.string().optional(),
  app_no: z.string().optional(),

  applicant_name: z.string().min(1, 'Name is required'),
  applicant_son_of: z.string().optional(),
  applicant_cnic: z.string().min(10, 'Invalid CNIC').max(20).optional(),
  applicant_mailing_address: z.string().optional(),
  applicant_permanent_address: z.string().optional(),
  applicant_phone_office: z.string().optional(),
  applicant_phone_res: z.string().optional(),
  applicant_phone_mobile: z.string().min(10, 'Invalid Mobile Number'),
  applicant_email: z.string().email('Invalid email').optional(),

  kin_relation: z.string().optional(),
  kin_name: z.string().optional(),
  kin_son_of: z.string().optional(),
  kin_cnic: z.string().optional(),
  kin_mobile: z.string().optional(),
  kin_address: z.string().optional(),

  project_name: z.string().optional(),
  unit_no: z.string().optional(),
  floor_no: z.string().optional(),
  size: z.string().optional(),
  property_type: z.enum([
    'Shop',
    'Studio',
    '1 Bed',
    '2 Bed',
    '3 Bed',
    '4 Bed',
  ]).optional(),

  total_sales_value: z.string().optional(),
  receipt_no: z.string().optional(),
  first_down_payment: z.string().optional(),
  second_down_payment: z.string().optional(),

  monthly_installment: z.string().optional(),
  monthly_start_date: z.string().optional(),

  quarterly_installment: z.string().optional(),
  quarterly_start_date: z.string().optional(),

  semi_annual_installment: z.string().optional(),
  semi_annual_start_date: z.string().optional(),

  possession_payment: z.string().optional(),
  transfer_payment: z.string().optional(),

  created_at: z.string().optional(),
});
export type BookingFormTypes = z.infer<typeof BookingFormSchema>;

const getCurrentTimestamp = () => new Date().toISOString();

export const defaultValues: BookingFormTypes = {
  registration_number: '',
  app_no: '',

  applicant_name: '',
  applicant_son_of: '',
  applicant_cnic: '',
  applicant_mailing_address: '',
  applicant_permanent_address: '',
  applicant_phone_office: '',
  applicant_phone_res: '',
  applicant_phone_mobile: '',
  applicant_email: '',

  kin_relation: '',
  kin_name: '',
  kin_son_of: '',
  kin_cnic: '',
  kin_mobile: '',
  kin_address: '',

  project_name: '',
  unit_no: '',
  floor_no: '',
  size: '',
  property_type: undefined,

  total_sales_value: '',
  receipt_no: '',
  first_down_payment: '',
  second_down_payment: '',

  monthly_installment: '',
  monthly_start_date: '',
  quarterly_installment: '',
  quarterly_start_date: '',
  semi_annual_installment: '',
  semi_annual_start_date: '',
  possession_payment: '',
  transfer_payment: '',

  created_at: getCurrentTimestamp(),
};
 