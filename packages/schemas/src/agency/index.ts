import { z } from 'zod';

// Agency select schema - represents a full agency record
export const AgencySelectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  domain: z.string(),
  ownerUserId: z.string().uuid().nullable(),
  subscriptionPlan: z.enum(['trial', 'starter', 'professional', 'enterprise']),
  status: z.enum(['pending', 'active', 'suspended', 'cancelled']),
  maxUsers: z.number(),
  maxStorageGB: z.number(),
  features: z.array(z.any()).default(() => []),
  settings: z.record(z.any()).default(() => ({})),
  contactEmail: z.string().email().nullable(),
  contactPhone: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Agency settings select schema - represents detailed agency settings
export const AgencySettingsSelectSchema = z.object({
  id: z.string().uuid(),
  agencyId: z.string().uuid(),
  agencyName: z.string(),
  logoUrl: z.string().nullable(),
  domain: z.string().nullable(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Agency profile schema - minimal subset for frontend display
export const AgencyProfileSchema = AgencySettingsSelectSchema.pick({
  agencyId: true,
  agencyName: true,
  logoUrl: true,
  timezone: true,
});

// Export types
export type Agency = z.infer<typeof AgencySelectSchema>;
export type AgencySettings = z.infer<typeof AgencySettingsSelectSchema>;
export type AgencyProfile = z.infer<typeof AgencyProfileSchema>;
