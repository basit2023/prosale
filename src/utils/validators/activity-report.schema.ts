import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema
export const ActivityReportInfoFormSchema = z.object({
  daily_office_visits: z.number().optional(),
  client_matured: z.number().optional(),
  daily_lead_follow_up: z.number().optional(), 
  lead_assigned: z.number().optional(),
  total_dialed_calls: z.number().optional(),
  total_connected_calls: z.number().optional(),
  dealers_meeting: z.number().optional(),       
  dealers_register: z.number().optional(),
  office_activity: z.string().optional(),       
  user: z.string().optional(),
  del: z.string().optional(),
});

// generate form types from zod validation schema
export type ActivityReportInfoFormTypes = z.infer<typeof ActivityReportInfoFormSchema>;

export const defaultValues = {
  daily_office_visits: undefined,
  client_matured: undefined,
  daily_lead_follow_up: undefined,
  lead_assigned: undefined,
  total_dialed_calls: undefined,
  total_connected_calls: undefined,
  dealers_meeting: undefined,
  dealers_register: undefined,
  office_activity: undefined,
  user:undefined,
  del: "N",
};