import { z } from 'zod';
// form zod validation schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
});

// generate form types from zod validation schema
export type LoginSchema = z.infer<typeof loginSchema>;

export const defaultValues = {
  email: undefined,
  password: undefined,
  rememberMe: false,

}




// const initialValues: LoginSchema = {
//   email: 'admin@admin.com',
//   password: 'admin',
//   rememberMe: true,
// };
