import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['PATIENT', 'DOCTOR']),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  // Patient specific
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  // Doctor specific
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
}).refine((data) => {
  if (data.role === 'PATIENT') {
    return !!data.dateOfBirth && !!data.gender;
  }
  if (data.role === 'DOCTOR') {
    return !!data.specialization && !!data.licenseNumber;
  }
  return true;
}, {
  message: "Missing required fields for the selected role",
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const appointmentSchema = z.object({
  doctorId: z.string().uuid(),
  dateTime: z.string().datetime(),
  reason: z.string().optional(),
});

export const noteSchema = z.object({
  content: z.string().min(1),
});
