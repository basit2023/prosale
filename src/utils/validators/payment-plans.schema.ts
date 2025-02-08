import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema

export const PaymentplanFormSchema = z.object({
  preset_name: z.string().optional(),
  preset_year: z.string().optional(),
  final: z.string().optional(),
  Category: z.string().optional(),
  Unit: z.string().optional(),
  Size: z.string().optional(),
  Add_Booking: z.boolean().optional(),
  Price_Sqft: z.string().optional(),
  booking_pr: z.string().optional(),
  add_confirmation: z.boolean().optional(),
  confirmation_Pr:z.string().optional(),
  add_allocation: z.boolean().optional(),
  allocation_pr: z.string().optional(),
  monthly: z.boolean().optional(),
  monthly_Installments: z.string().optional(),
  monthly_Installmentspr: z.string().optional(),
  halfyearly: z.boolean().optional(),
  half_yearly_Installments: z.string().optional(),
  half_yearly_Installmentspr: z.string().optional(),
  yearly: z.boolean().optional(),
  yearly_Installments: z.string().optional(),
  yearly_Installmentspr: z.string().optional(),
  possession:z.boolean().optional(),
  possessionpr: z.string().optional(),
  transfer: z.boolean().optional(),
  Transferpr: z.string().optional(),
  company_id:z.string().optional(),
  extrapr1: z.string().optional(),
  extrapr2: z.boolean().optional(),
  extrapr3: z.string().optional(),
  extrapr4:z.string().optional(),
  extrapr5:z.string().optional(),
});

// generate form types from zod validation schema
export type PaymentplanFormTypes = z.infer<typeof PaymentplanFormSchema>;

export const defaultValues = {
    preset_name: undefined,
    final: undefined,
    preset_year: undefined,
    Category: undefined,
    Unit: undefined,
    Size: undefined,
    Add_Booking: false,
    Price_Sqft: undefined,
    booking_pr: undefined,
    add_confirmation: false,
    confirmation_Pr:undefined,
    add_allocation: false,
    allocation_pr: undefined,
    monthly: false,
    monthly_Installments: undefined,
    monthly_Installmentspr: undefined,
    halfyearly: false,
    half_yearly_Installments: undefined,
    half_yearly_Installmentspr: undefined,
    yearly: false,
    yearly_Installments: undefined,
    yearly_Installmentspr: undefined,
    possession:false,
    possessionpr: undefined,
    transfer: false,
    Transferpr: undefined,
    company_id:undefined,

    extrapr1: undefined,
    extrapr2: undefined,
    extrapr3: undefined,
    extrapr4:undefined,
    extrapr5:undefined,

  
};
