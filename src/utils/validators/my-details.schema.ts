import { z } from 'zod';
import { messages } from '@/config/messages';
import { fileSchema, validateEmail } from '@/utils/validators/common-rules';

// form zod validation schema
export const personalInfoFormSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  dob:z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  dt: z.string().optional(), // Assuming dt is a string, update if it's supposed to be a date or timestamp
  del: z.string().optional(),
  user: z.string().optional(),
  
  // portfolios: z.array(fileSchema).optional(),
});

// generate form types from zod validation schema
export type PersonalInfoFormTypes = z.infer<typeof personalInfoFormSchema>;

// Function to get the current timestamp as a string
const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();

export const defaultValues: PersonalInfoFormTypes = {
  id: '',
  user_id: undefined,
  dob: undefined, 
  address: undefined,
  city: undefined,
  whatsapp: undefined,
  instagram: undefined,
  twitter: undefined,
  facebook: undefined,
  linkedin: undefined,
  dt: getCurrentTimestamp(), // Update based on your specific format or use a date library
  del: 'N',
  user: undefined,
};
