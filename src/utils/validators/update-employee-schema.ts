 import { z } from 'zod';
import { messages } from '@/config/messages';
import {
  validateEmail,
  validatePassword
} from '@/utils/validators/common-rules';
// form zod validation schema

export const NewEmployeeInfoFormSchema = z.object({
  designation: z.string().optional(),
  targetRevenue :z.number().optional(),
  achievedRevenue :z.number().optional(),
});

// generate form types from zod validation schema
export type NewEmployeeInfoFormTypes = z.infer<typeof NewEmployeeInfoFormSchema>;

export const defaultValues = {
  designation: undefined,
  targetRevenue: 0.00,
  achievedRevenue: 0.00,

};
