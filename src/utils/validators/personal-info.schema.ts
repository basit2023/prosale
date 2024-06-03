import { z } from 'zod';
import { messages } from '@/config/messages';
import { fileSchema, validateEmail } from '@/utils/validators/common-rules';

// form zod validation schema
export const personalInfoFormSchema = z.object({
  // first_name: z.string().min(1, { message: messages.firstNameRequired }),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email:z.string().optional(), //validateEmail,
  image: z.string().optional(),
  gender: z.string().optional(),
  mobile: z.string().optional(),
  isp: z.string().optional(),
  cnic: z.string().optional(),
  // country: z.string().optional(),
  // timezone: z.string().optional(),
  // bio: z.string().optional(),
  // portfolios: z.array(fileSchema).optional(),
});

// generate form types from zod validation schema
export type PersonalInfoFormTypes = z.infer<typeof personalInfoFormSchema>;

export const defaultValues = {
  first_name: '',
  last_name: undefined,
  email: '',
  avatar: undefined,
  role: undefined,
  mobile: undefined,
  isp: undefined,
  cnic: undefined,
  // country: undefined,
  // timezone: undefined,
  // bio: undefined,
  // portfolios: undefined,
};