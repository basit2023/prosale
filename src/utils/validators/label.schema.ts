import { z } from 'zod';
import { messages } from '@/config/messages';
import { fileSchema, validateEmail } from '@/utils/validators/common-rules';

// form zod validation schema
export const LabelSchema = z.object({
  leads_label: z.string().optional(),
  dt: z.string().optional(),
  
});

// generate form types from zod validation schema
export type LabelSchemaFormTypes = z.infer<typeof LabelSchema>;
const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();

export const defaultValues = {
  
  leads_label: undefined,
  dt: getCurrentTimestamp(),
  
};
