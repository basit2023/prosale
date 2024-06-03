import { z } from 'zod';
import { messages } from '@/config/messages';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '@/utils/validators/common-rules';

// form zod validation schema
export const OnBoardingSchema = z.object({
  
  title: z.string().min(1, { message: messages.title }),
  licence_type: z.string().min(1, { message: messages.licenseType }),
  address: z.string().optional(),
});

// generate form types from zod validation schema
export type OnBoardingSchemaType = z.infer<typeof OnBoardingSchema>;
export const defaultValues = {
 
    title: undefined,
    licence_type: undefined,
    address: undefined,

};