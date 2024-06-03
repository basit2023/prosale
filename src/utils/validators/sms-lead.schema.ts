import { z } from 'zod';
import { messages } from '@/config/messages';

export const LeadSmsFormSchema = z.object({
  sms: z.string().optional(),
  lead_status: z.string().optional(),
  dt:z.string().optional(),
  
});

// generate form types from zod validation schema
export type LeadSmsFormTypes = z.infer<typeof LeadSmsFormSchema>;
const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();
const timestamp: any= getCurrentTimestamp();
const date = new Date(timestamp * 1000); // Multiply by 1000 to convert from seconds to milliseconds
const formattedDateTime = date.toISOString().slice(0, 19).replace("T", " ");
export const defaultValues = {
  sms:undefined,
  lead_status:undefined,
  dt:formattedDateTime,
 
};
