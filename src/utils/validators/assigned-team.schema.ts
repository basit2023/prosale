import { z } from 'zod';

// form zod validation schema
export const teamAssinedSchema = z.object({
  assigned_team: z.string().optional(), 
  dt: z.string().optional(),
  user: z.string().optional(),
  
});

// generate form types from zod validation schema
export type teamAssinedSchemaFormTypes = z.infer<typeof teamAssinedSchema>;
const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();
const timestamp: any= getCurrentTimestamp();
const date = new Date(timestamp * 1000); // Multiply by 1000 to convert from seconds to milliseconds
const formattedDateTime = date.toISOString().slice(0, 19).replace("T", " ");
export const defaultValues = {
  assigned_team: undefined,
  dt: formattedDateTime,
  user: undefined,
  
};
