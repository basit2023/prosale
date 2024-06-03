import { z } from 'zod';
import { messages } from '@/config/messages';


// form zod validation schema
export const CommentsFormSchema = z.object({
   id: z.string().optional(),
   lead_id: z.string().optional(),
   comments: z.string().optional(),
   user: z.string().optional(),
   status: z.string().optional(),
   dt: z.string().optional(),
 
});

// generate form types from zod validation schema
export type CommentsFormTypes = z.infer<typeof CommentsFormSchema>;
const getCurrentTimestamp = () => Math.floor(new Date().getTime() / 1000).toString();

export const defaultValues = {
   id: '',
   lead_id: undefined,
   comments: undefined,
   dt: getCurrentTimestamp(),
   status:"N",
   user: undefined,
  
};
