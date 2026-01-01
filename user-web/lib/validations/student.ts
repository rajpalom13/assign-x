import { z } from "zod";

/**
 * Student signup form validation schema
 * Split into steps for multi-step form
 */

// Step 1: Personal Information
export const studentStep1Schema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  dateOfBirth: z
    .string()
    .refine((date) => {
      const dob = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      return age >= 16;
    }, "You must be at least 16 years old"),
});

// Step 2: Academic Information
export const studentStep2Schema = z.object({
  universityId: z.string().min(1, "Please select your university"),
  courseId: z.string().min(1, "Please select your course"),
  semester: z
    .number()
    .min(1, "Semester must be at least 1")
    .max(12, "Semester must be 12 or less"),
});

// Step 3: Contact Information
export const studentStep3Schema = z.object({
  collegeEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .regex(/^[0-9+\-\s]+$/, "Invalid phone number format"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

// Complete student form schema
export const studentFormSchema = studentStep1Schema
  .merge(studentStep2Schema)
  .merge(studentStep3Schema);

export type StudentStep1Data = z.infer<typeof studentStep1Schema>;
export type StudentStep2Data = z.infer<typeof studentStep2Schema>;
export type StudentStep3Data = z.infer<typeof studentStep3Schema>;
export type StudentFormData = z.infer<typeof studentFormSchema>;
