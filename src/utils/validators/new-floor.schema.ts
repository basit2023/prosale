import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema

export const NewFloorFormSchema = z.object({
  floor_name: z.string().optional(),
  status: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
  company_id: z.string().optional()

 
 
});

// generate form types from zod validation schema
export type NewFloorFormTypes = z.infer<typeof NewFloorFormSchema>;

export const defaultValues = {
  floor_name:undefined,
  status: undefined,
  date: undefined,
  description:undefined,
  company_id:undefined

  
  
};
