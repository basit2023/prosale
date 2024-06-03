import { z } from 'zod';
import { messages } from '@/config/messages';

export const CloseLeadFormSchema = z.object({
  meeting_location: z.string().optional(),
  meeting_time: z.string().optional(),
  cutomer: z.string().optional(),
  booking_file: z.string().optional(),
  closing_type: z.string().optional(),
  dt:z.string().optional(),
  
});

// generate form types from zod validation schema
export type CloseLeadFormTypes = z.infer<typeof CloseLeadFormSchema>;
const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();

// const date = new Date(timestamp * 1000); // Multiply by 1000 to convert from seconds to milliseconds
// const formattedDateTime = date.toISOString().slice(0, 19).replace("T", " ");
export const defaultValues = {
    meeting_location: undefined,
    meeting_time: undefined,
    cutomer: undefined,
    booking_file: undefined,
    closing_type: undefined,
    dt: getCurrentTimestamp(), // Call the function to get the current timestamp
  };
  
