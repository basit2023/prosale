import { z } from 'zod';
import { messages } from '@/config/messages';

export const UnitsFormSchema = z.object({
    updated_rates: z.string().optional()
 
  
});

// generate form types from zod validation schema
export type UnitsFormTypes = z.infer<typeof UnitsFormSchema>;

export const defaultValues = {
    updated_rates:undefined
};
