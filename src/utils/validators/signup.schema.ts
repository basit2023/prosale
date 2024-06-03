import { z } from 'zod';
import { messages } from '@/config/messages';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '@/utils/validators/common-rules';

// form zod validation schema
export const signUpSchema = z.object({
  first_name: z.string().min(1, { message: messages.firstNameRequired }),
  last_name: z.string().optional(),
  name: z.string().min(1, { message: messages.userName }),
  email: validateEmail,
  password: validatePassword,
  confirmPassword: validateConfirmPassword,
  del: z.string().optional(),
  user_type: z.string().optional(),
  sms: z.string().optional(),
  lead_status: z.string().optional(),
  // isAgreed: z.boolean(),




  // title: z.string().min(1, { message: messages.title }),
  // licence_type: z.string().min(1, { message: messages.licenseType }),
  // address: z.string().optional(),
});

// generate form types from zod validation schema
export type SignUpSchemaType = z.infer<typeof signUpSchema>;
export const defaultValues = {
  first_name: undefined,
  last_name: undefined,
  del: "N",
  name: undefined,
  email: undefined,
  password:undefined,
  confirmPassword:undefined,
 
  user_type: "super_admin",
  sms: "N",
  lead_status: "N",

};