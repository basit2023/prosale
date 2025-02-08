
import { z } from 'zod';
import { messages } from '@/config/messages';

export const PaymentFormSchema = z.object({
    paymentplanid: z.string().optional(),
    templateid: z.string().optional(),
 
  
});

// generate form types from zod validation schema
export type PaymentFormTypes = z.infer<typeof PaymentFormSchema>;
export const defaultValues = {
  
    paymentplanid:undefined,
    templateid:undefined
};
