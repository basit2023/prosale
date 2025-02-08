import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema

export const EditFloorFormSchema = z.object({
  floor_id: z.string().optional(),
  status: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
  company_id: z.string().optional(),
  project_name: z.string().optional(),
  slug: z.string().optional(),
  id: z.string().optional(),
  
 
});

// generate form types from zod validation schema
export type EditFloorFormTypes = z.infer<typeof EditFloorFormSchema>;

export const defaultValues = {
  floor_id:undefined,
  status: undefined,
  date:undefined,
  description:undefined,
  company_id: undefined,
  project_name:undefined,
  slug:undefined,
  id:undefined,

  
};
