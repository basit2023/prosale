import { z } from 'zod';
import { messages } from '@/config/messages';
import { fileSchema, validateEmail } from '@/utils/validators/common-rules';

// form zod validation schema
export const EmployeeSalaryInfoFormSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  basic_salary:z.string().optional(),
  user:z.string().optional(),
  health_check: z.string().optional(),
  health_type: z.string().optional(),
  health_value: z.string().optional(),
  travel_check: z.string().optional(),
  travel_type: z.string().optional(),
  travel_value: z.string().optional(),
  food_check: z.string().optional(),
  food_type: z.string().optional(),
  food_value: z.string().optional(),

  overtime_check: z.string().optional(),
  overtime_type: z.string().optional(),
  overtime_value: z.string().optional(),
  overtime_per: z.string().optional(),

  commission_check: z.string().optional(),
  commission_type: z.string().optional(),
  commission_value: z.string().optional(),
  dt: z.string().optional(), // Assuming dt is a string, update if it's supposed to be a date or timestamp
  del: z.string().optional(),
  
  
  // portfolios: z.array(fileSchema).optional(),
})

// generate form types from zod validation schema
export type EmployeeSalaryInfoFormTypes = z.infer<typeof EmployeeSalaryInfoFormSchema>;

// Function to get the current timestamp as a string
const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();

export const defaultValues: EmployeeSalaryInfoFormTypes = {
  id: '',
  user_id: undefined,
  user:undefined,
  basic_salary:undefined,
  health_check: undefined,
  health_type: "Rs",
  health_value: undefined,
  travel_check: undefined,
  travel_type: "Rs",
  travel_value: undefined,
  food_check: undefined,
  food_type: "Rs",
  food_value: undefined,

  overtime_check: undefined,
  overtime_type: "Rs",
  overtime_value: undefined,
  overtime_per: "h",

  commission_check: undefined,
  commission_type: "Rs",
  commission_value: undefined,
  dt: getCurrentTimestamp(), // Update based on your specific format or use a date library
  del: 'N',
  
};
