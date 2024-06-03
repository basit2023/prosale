import { z } from 'zod';
import { messages } from '@/config/messages';
import { fileSchema, validateEmail } from '@/utils/validators/common-rules';

// form zod validation schema
export const profileFormSchema = z.object({
  first_name: z.string().min(1, { message: messages.firstNameRequired }),
  last_name: z.string().optional(),
  email: validateEmail,
  img: fileSchema.optional(),
  role: z.string().optional(),
  mobile: z.number().optional(),
  cnic: z.number().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  bio: z.string().optional(),
  portfolios: z.array(fileSchema).optional(),
});

// generate form types from zod validation schema
export type ProfileFormTypes = z.infer<typeof profileFormSchema>;

export const defaultValues = {
  username: 'Giselle',
  website: undefined,
  email: undefined,
  gender: undefined,
  mobile: undefined,
  cnic: undefined,
  img: undefined,
  description: '<p>Similique cupidatat .</p>',
  portfolios: undefined,
};
