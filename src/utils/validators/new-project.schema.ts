import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema

export const NewProjectInfoFormSchema = z.object({
  name: z.string().optional(),
  Csv_Label: z.string().optional(),
  Portal_Status: z.string().optional(),
  Location: z.string().optional(),
  Image: z.string().optional(),
  status: z.string().optional(),
  Whatsapp_Sort: z.string().optional(),
  Whatsapp_Status: z.string().optional(),
  description: z.string().optional(),
  company_id:z.string().optional(),
  date: z.string().optional(),
  del: z.string().optional(),
  dt: z.string().optional(),
 
});

// generate form types from zod validation schema
export type NewProjectInfoFormTypes = z.infer<typeof NewProjectInfoFormSchema>;
const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();
export const defaultValues = {
  name:undefined,
  Whatsapp_Status: undefined,
  Portal_Status: undefined,
  Location:undefined,
  Csv_Label:undefined,
  status: undefined,
  Image: undefined,
  Whatsapp_Sort: undefined,
  description:undefined,
  date:undefined,
  company_id:undefined,
  dt:getCurrentTimestamp(),
  del:"N",

  
};
