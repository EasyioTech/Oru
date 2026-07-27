import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users, profiles, userRoles, userSessions } from './schema.js';
import { registerSchema, loginSchema, refreshTokenSchema, enable2FASchema } from './schemas.js';
import { z } from 'zod';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Profile = InferSelectModel<typeof profiles>;
export type NewProfile = InferInsertModel<typeof profiles>;
export type UserRole = InferSelectModel<typeof userRoles>;
export type UserSession = InferSelectModel<typeof userSessions>;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type Enable2FAInput = z.infer<typeof enable2FASchema>;
