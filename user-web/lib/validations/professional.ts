import { z } from "zod";

/**
 * Professional signup form validation schema
 */
export const professionalFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  industryId: z.string().min(1, "Please select your industry"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .regex(/^[0-9+\-\s]+$/, "Invalid phone number format"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type ProfessionalFormData = z.infer<typeof professionalFormSchema>;
