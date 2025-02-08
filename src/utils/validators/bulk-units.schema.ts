import { z } from 'zod';
import { messages } from '@/config/messages';
import {
  validateEmail,
  validatePassword
} from '@/utils/validators/common-rules';
// form zod validation schema

export const BulkUnitsFormSchema = z.object({
 
  Type: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  status: z.string().optional(),
  SqFtRate: z.string().optional(),
  company_id:z.string().optional(), 
  user:z.string().optional(),
  id:z.string().optional(),
  slug:z.string().optional(),
});

// generate form types from zod validation schema
export type BulkUnitsFormTypes = z.infer<typeof BulkUnitsFormSchema>;

export const defaultValues = {
  user:undefined,
  SqFtRate: undefined,
  Type: undefined,
  start: undefined,
  end: undefined,
  status: undefined,
  
  company_id: undefined,
  id: undefined,
  slug: undefined,
};
