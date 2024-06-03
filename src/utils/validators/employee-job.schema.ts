import { z } from 'zod';
import { messages } from '@/config/messages';
import { fileSchema, validateEmail } from '@/utils/validators/common-rules';

// form zod validation schema
export const employeeJobSchema = z.object({
  time_in: z.string().optional(), // Keep as string or update to z.date().optional()
  time_out: z.string().optional(), // Keep as string or update to z.date().optional()
  assigned_offices: z.array(z.string()).optional(),
  offices: z.string().optional(),
  dayoff: z.string().optional(),
  dt: z.string().optional(),
  del: z.string().optional(),
  user: z.string().optional(),
  // country: z.string().optional(),
  // timezone: z.string().optional(),
  // bio: z.string().optional(),
  // portfolios: z.array(fileSchema).optional(),
});

// generate form types from zod validation schema
export type employeeJobSchemaFormTypes = z.infer<typeof employeeJobSchema>;
const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();

export const defaultValues = {
  time_in: undefined, 
  time_out: undefined,
  assigned_offices: undefined,
  offices: undefined,
  dt: getCurrentTimestamp(),
  del: 'N',
  dayoff: undefined,
  user: undefined,
  // country: undefined,
  // timezone: undefined,
  // bio: undefined,
  // portfolios: undefined,
};
