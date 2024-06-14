import { z } from 'zod';
import { messages } from '@/config/messages';
import { fileSchema, validateEmail } from '@/utils/validators/common-rules';

// form zod validation schema
export const editTeamZoneFormSchema = z.object({
  // first_name: z.string().min(1, { message: messages.firstNameRequired }),
  title: z.string().optional(),
  zonal_manager: z.string().optional(),
  manager_id: z.string().optional(),
  zone_id: z.string().optional(),
  del: z.string().optional(),
  user:z.string().optional(), //validateEmail,
  dt: z.string().optional(),
  member: z.string().optional(),
  
});

// generate form types from zod validation schema
export type editTeamZoneFormTypes = z.infer<typeof editTeamZoneFormSchema>;
const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();
export const defaultValues = {
  title: undefined,
  zonal_manager: undefined,
  del: "N",
  user: undefined,
  manager_id: undefined,
  zone_id:undefined,
  member:undefined,
  dt: getCurrentTimestamp(),
};
