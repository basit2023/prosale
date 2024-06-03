import { z } from 'zod';
import { messages } from '@/config/messages';
import { fileSchema, validateEmail } from '@/utils/validators/common-rules';

// form zod validation schema
export const changeCompanyFormSchema = z.object({
  company_id: z.string().optional(),
  
  
});

// generate form types from zod validation schema
export type changeCompanyFormTypes = z.infer<typeof changeCompanyFormSchema>;
export const defaultValues = {
  company_id: undefined,
  
};
