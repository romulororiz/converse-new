import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(120),
});

export const chatMessageSchema = z.object({
  content: z.string().min(1).max(4000),
  sessionId: z.string().uuid().optional(),
  bookId: z.string().uuid(),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2).max(120).optional(),
  bio: z.string().max(500).optional(),
  favorite_genres: z.string().max(500).optional(),
  reading_goals: z.string().max(500).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
