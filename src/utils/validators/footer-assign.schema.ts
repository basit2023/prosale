import { z } from 'zod';

// form zod validation schema
export const footAssinedFormSchema = z.object({
  ids: z.string().optional(),
  assigned_to: z.string().optional(),
  view_dt: z.string().optional(),
  assigned_on: z.string().optional(),
  
});

// generate form types from zod validation schema
export type editTeamZoneFormTypes = z.infer<typeof footAssinedFormSchema>;
const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();
export const defaultValues = {
  ids: undefined,
  assigned_to: undefined,
  view_dt:"new_lead",
  assigned_on: getCurrentTimestamp(),
};
