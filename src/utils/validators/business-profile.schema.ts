
import { z } from 'zod';

// simple validators
const isoDate = /^\d{4}-\d{2}-\d{2}$/;                    // YYYY-MM-DD
const cnicRegex = /^\d{5}-\d{7}-\d$/;                     // 82401-5282826-7
const phoneRegex = /^[0-9+\-\s]{6,20}$/;                  // loose intl
const ibanRegex = /^[A-Z]{2}[0-9A-Z]{13,32}$/i;

export const BusinessProfileSchema = z.object({
  // REQUIRED (must NOT be optional; no .default() here)
  full_name: z.string().min(2, 'Full name is required'),
  dob: z.string().regex(isoDate, 'Date must be YYYY-MM-DD'),
  cnic: z.string().regex(cnicRegex, 'CNIC must be like 82401-5282826-7'),
  mobile: z.string().regex(phoneRegex, 'Phone looks invalid'),
  nationality: z.string().min(1, 'Nationality is required'),
  filer_status: z.enum(['Active Filer', 'Non-Filer']),
  dt: z.string(), // required string (set the value in defaultValues or server-side)

  // OPTIONAL (ok to be empty)
  relation_type: z.string().optional(),          // 'S/O' | 'D/O' | 'W/O'
  guardian_name: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  email: z.string().email('Invalid email').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  ntn: z.string().optional(),
  reference: z.string().optional(),
  authorized_partner: z.string().optional(),
  partner_cnic: z.string().regex(cnicRegex).optional(),

  // Registered office
  office_name: z.string().optional(),
  office_mobile: z.string().regex(phoneRegex).optional(),
  office_landline: z.string().regex(phoneRegex).optional(),
  office_address: z.string().optional(),
  office_city: z.string().optional(),

  // Bank
  account_title: z.string().optional(),
  account_number: z.string().optional(),
  iban_number: z.string().regex(ibanRegex, 'IBAN looks invalid').optional(),
  branch_code: z.string().optional(),
  branch_name: z.string().optional(),
  bank_name: z.string().optional(),

  // Meta
  company_id: z.string().optional(),
  del: z.enum(['N','Y']).optional(),
});

export type BusinessProfileFromType = z.infer<typeof BusinessProfileSchema>;

export const businessProfileDefaultValues: BusinessProfileFromType = {
  full_name: '',
  relation_type: 'S/O',
  guardian_name: '',
  gender: 'Male',
  dob: new Date().toISOString().substring(0, 10),
  cnic: '',
  mobile: '',
  email: '',
  address: '',
  city: '',
  nationality: 'Pakistani',     // <- default provided here
  ntn: '',
  filer_status: 'Active Filer',
  reference: '',
  authorized_partner: '',
  partner_cnic: '',

  office_name: '',
  office_mobile: '',
  office_landline: '',
  office_address: '',
  office_city: '',

  account_title: '',
  account_number: '',
  iban_number: '',
  branch_code: '',
  branch_name: '',
  bank_name: '',

  company_id: '',
  del: 'N',
  dt: Math.floor(Date.now() / 1000).toString(), // <- default provided here
};
