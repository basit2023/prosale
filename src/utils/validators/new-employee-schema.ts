import { z } from 'zod';
import { messages } from '@/config/messages';
import {
  validateEmail,
  validatePassword
} from '@/utils/validators/common-rules';
// form zod validation schema

export const NewEmployeeInfoFormSchema = z.object({
  name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  password: z
    .string()
    .min(1, { message: messages.passwordRequired })
    .min(6, { message: messages.passwordLengthMin })
    .regex(new RegExp('.*[a-z].*'), { message: messages.passwordOneLowercase })
    .regex(new RegExp('.*\\d.*'), { message: messages.passwordOneNumeric }),
  email: z
    .string()
    .min(1, { message: messages.emailIsRequired })
    .email({ message: messages.invalidEmail }),
  user_type: z.string().optional(),
  image: z.string().optional(),
  gender: z.string().optional(),
  mobile: z.string().optional(),
  isp: z.string().optional(),
  cnic: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  dt:z.string().optional(),
  sms:z.string().optional(),
  del:z.string().optional(),
  lead_status:z.string().optional(),
  assigned_team:z.string().optional(),
  company_id:z.string().optional(),
});

// generate form types from zod validation schema
export type NewEmployeeInfoFormTypes = z.infer<typeof NewEmployeeInfoFormSchema>;
const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();
const timestamp: any= getCurrentTimestamp();
const date = new Date(timestamp * 1000); // Multiply by 1000 to convert from seconds to milliseconds
const formattedDateTime = date.toISOString().slice(0, 19).replace("T", " ");
export const defaultValues = {
  name:undefined,
  first_name: '',
  last_name: undefined,
  password:undefined,
  email: '',
  user_type:"admin",
  avatar: undefined,
  role: undefined,
  mobile: undefined,
  isp: undefined,
  cnic: undefined,
  assigned_team: undefined,
  gender: "male",
  designation: "Manager Sales",
  department: "Sale",
  dt:formattedDateTime,
  sms:"Y",
  del:"N",
  lead_status:"N",
  company_id: undefined,
  // portfolios: undefined,
};
