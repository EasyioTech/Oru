import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z
        .string()
        .min(12, 'Password must be at least 12 characters')
        .regex(/[A-Z]/, 'Password must contain uppercase letter')
        .regex(/[a-z]/, 'Password must contain lowercase letter')
        .regex(/[0-9]/, 'Password must contain number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    domain: z.string().optional(),
    totpCode: z.string().length(6).optional(),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const enable2FASchema = z.object({
    totpCode: z.string().length(6, 'TOTP code must be 6 digits'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type Enable2FAInput = z.infer<typeof enable2FASchema>;

export const agencyMetadataSchema = z.object({
    industry: z.string().min(2, 'Industry must be at least 2 characters').max(50, 'Industry must be under 50 characters').optional().default('Professional Services'),
    teamSize: z.enum(['solo', 'small', 'medium', 'large'], { errorMap: () => ({ message: 'Team size must be solo, small, medium, or large' }) }).optional().default('small'),
});

export const agencySignupSchema = z.object({
    agencyName: z.string().min(2, 'Agency name required').max(100, 'Agency name must be under 100 characters'),
    industry: z.string().min(2, 'Industry must be at least 2 characters').max(50, 'Industry must be under 50 characters').optional().default('Professional Services'),
    teamSize: z.enum(['solo', 'small', 'medium', 'large']).optional().default('small'),
    name: z.string().min(2, 'Your name required'),
    email: z.string().email(),
    password: z.string()
        .min(8, 'Min 8 characters')
        .regex(/[A-Z]/, 'Needs uppercase')
        .regex(/[0-9]/, 'Needs a number'),
});

export type AgencySignupInput = z.infer<typeof agencySignupSchema>;
