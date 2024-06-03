import { z } from 'zod';
import { messages } from '@/config/messages';
import {
  validateEmail,
  validatePassword
} from '@/utils/validators/common-rules';
// form zod validation schema

export const VaultInfoFormSchema = z.object({
  name: z.string().optional(),
  password: z
    .string()
    .min(6, { message: messages.passwordLengthMin })
    .regex(new RegExp('.*[a-z].*'), { message: messages.passwordOneLowercase })
    .regex(new RegExp('.*\\d.*'), { message: messages.passwordOneNumeric }),
  
  user_type: z.string().optional(),
  dt:z.string().optional(),
  
});

// generate form types from zod validation schema
export type VaultInfoFormTypes = z.infer<typeof VaultInfoFormSchema>;
const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();
const timestamp: any= getCurrentTimestamp();
const date = new Date(timestamp * 1000); // Multiply by 1000 to convert from seconds to milliseconds
const formattedDateTime = date.toISOString().slice(0, 19).replace("T", " ");
export const defaultValues = {
  name:undefined,
  password:undefined,
  user_type:"admin",
  dt:formattedDateTime,
 
};
