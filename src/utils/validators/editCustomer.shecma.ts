import { z } from 'zod';
import { messages } from '@/config/messages';
import { fileSchema, validateEmail } from '@/utils/validators/common-rules';

// form zod validation schema
export const customerInfoFormSchema = z.object({
  // first_name: z.string().min(1, { message: messages.firstNameRequired }),
  full_name: z.string().optional(),
  mobile: z.string().optional(),
  whatsapp: z.string().optional(),
  email:z.string().optional(), //validateEmail,
  job_title: z.string().optional(),
  city: z.string().optional(),
  type: z.string().optional(),
  country: z.string().optional(),
  dt: z.string().optional(),
  company_id:z.string().optional(),
  
});

// generate form types from zod validation schema
export type customerInfoFormTypes = z.infer<typeof customerInfoFormSchema>;
const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();
export const defaultValues = {
  full_name: undefined,
  mobile: undefined,
  whatsapp: undefined,
  email: undefined,
  job_title: undefined,
  city: undefined,
  type: undefined,
  country: undefined,
  company_id:undefined,
  dt: getCurrentTimestamp(),
};
