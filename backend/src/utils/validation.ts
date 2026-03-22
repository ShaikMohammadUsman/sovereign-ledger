import { z } from 'zod';

export const requestSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20),
  amount: z.number().positive(),
  department: z.string().min(2),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  vendorId: z.string().uuid().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const approvalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().max(500).optional(),
});
