import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema

export const FloorFormSchema = z.object({
  unit_type: z.string().optional(),
  unit: z.string().optional(),
  size: z.string().optional(),
  price: z.string().optional(),
  status: z.string().optional(),
  descp: z.string().optional(),
 
 
});

// generate form types from zod validation schema
export type FloorFormTypes = z.infer<typeof FloorFormSchema>;

export const defaultValues = {
  unit_type:undefined,
  unit: undefined,
  size: undefined,
  price:undefined,
  status:undefined,
  descp: undefined
  
  
};
