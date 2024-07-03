import { z } from 'zod';
import { messages } from '@/config/messages';


export const NewLeadInfoFormSchema = z.object({
  full_name: z.string().optional(),
  mobile: z.string()
  .min(10,{ message: messages.mobileNumber }),
  email: z.string().optional(),
  investment_budget: z.string().optional(),
  type: z.string().optional(),
  user: z.string().optional(),
  interested_in: z.string().optional(),
  project: z.string().optional(),
  source: z.string().optional(),
  dt: z.string().optional(),
  company_id: z.string().optional(),
  
});

// generate form types from zod validation schema
export type NewLeadInfoFormTypes = z.infer<typeof NewLeadInfoFormSchema>;
const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();
const timestamp: any= getCurrentTimestamp();

export const defaultValues = {
  name:undefined,
  mobile:undefined,
  email: '',
  investment_budget: undefined,
  type: undefined,
  interested_in: undefined,
  project: undefined,
  source: undefined,
  dt:timestamp,
  company_id: undefined,
  user: undefined,
};
