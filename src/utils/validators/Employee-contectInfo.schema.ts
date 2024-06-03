import { z } from 'zod';
import { messages } from '@/config/messages';
import { fileSchema, validateEmail } from '@/utils/validators/common-rules';

// form zod validation schema
export const EmployeeContectInfoFormSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  doj:z.string().optional(),
  contract_type: z.string().optional(),
  contract_duration: z.string().optional(),
  allocated_leaves: z.string().optional(),
  probation_status: z.string().optional(),
  probation_duration: z.string().optional(),
  offer_letter: z.string().optional(),
//   facebook: z.string().optional(),
//   linkedin: z.string().optional(),
  dt: z.string().optional(), // Assuming dt is a string, update if it's supposed to be a date or timestamp
  del: z.string().optional(),
  user: z.string().optional(),
  
  // portfolios: z.array(fileSchema).optional(),
});

// generate form types from zod validation schema
export type EmployeeContectInfoFormTypes = z.infer<typeof EmployeeContectInfoFormSchema>;

// Function to get the current timestamp as a string
const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();

export const defaultValues: EmployeeContectInfoFormTypes = {
  id: '',
  user_id: undefined,
  doj: undefined, 
  contract_type: undefined,
  contract_duration: undefined,
  allocated_leaves: undefined,
  probation_status: undefined,
  probation_duration: undefined,
//   facebook: undefined,
//   linkedin: undefined,
  dt: getCurrentTimestamp(), // Update based on your specific format or use a date library
  del: 'N',
  user: undefined,
  offer_letter: undefined,
};
